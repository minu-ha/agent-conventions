#!/usr/bin/env python3
"""Measure progressive convention contexts with a strict, reproducible schema."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import json
import platform
import statistics
import subprocess
import sys
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONTEXTS_PATH = "docs/evaluations/2026-07-21-progressive-loading-contexts.json"
EXPECTED_SCHEMA_VERSION = 2
EXPECTED_TOKENIZER = {
    "library": "tiktoken",
    "version": "0.11.0",
    "encoding": "o200k_base",
}
DOMAIN_ORDER = ("react", "typescript", "css")
ARM_ORDER = ("oracle", "progressive")
BASE_PHASE_ORDER = ("implementation", "audit", "reviewer")
DRIFT_PHASE_ORDER = ("implementation", "drift", "audit", "reviewer")
ALLOWED_PHASES = frozenset(DRIFT_PHASE_ORDER)
REQUIRED_PHASES = frozenset(BASE_PHASE_ORDER)
CRITICAL_IMPACT_MARKER = "**Impact: CRITICAL**"
ROUTING_EVAL_PATHS = tuple(
    f"skill/{domain}/routing-evals.json" for domain in DOMAIN_ORDER
)
AUDIT_PHASE_FILES: tuple[str, ...] = ()
EXPECTED_BASELINE_FILES = tuple(
    path
    for domain in DOMAIN_ORDER
    for path in (f"skill/{domain}/SKILL.md", f"skill/{domain}/HANDBOOK.md")
)
EXPECTED_SCENARIOS = (
    ("RTE10-derived-selection-state", True, False, ()),
    ("derive-existing-contract-with-docs", False, False, ()),
    ("css-repeated-values-and-optional-token", False, False, ()),
    ("css-domain-state-class-contract", False, False, ()),
    ("RTE12-query-shaping", False, False, ()),
    ("RTE02-owner-placement-css-drift", False, False, ()),
    (
        "RTE03-route-support-extraction",
        False,
        False,
        (
            (
                "implementation",
                "react",
                "screen-extract-utilities-selectively",
            ),
            ("audit", "react", "screen-extract-utilities-selectively"),
            ("reviewer", "react", "screen-extract-utilities-selectively"),
        ),
    ),
    ("css-one-off-structural-modifier", False, False, ()),
)
GENERATED_CHECK_COMMAND = (
    "npm",
    "--prefix",
    "package",
    "run",
    "check:measurement-artifacts",
)
GATE_DEFINITIONS = (
    (
        "implementation-progressive-median-tokens",
        "implementationProgressiveMedianTokens",
        "<=",
        10_000,
    ),
    (
        "implementation-progressive-max-tokens",
        "implementationProgressiveMaxTokens",
        "<=",
        12_000,
    ),
    (
        "one-load-reduction-median-percent",
        "oneLoadReductionMedianPercent",
        ">=",
        70,
    ),
    (
        "cumulative-reduction-median-percent",
        "cumulativeReductionMedianPercent",
        ">=",
        60,
    ),
)


class ContextValidationError(ValueError):
    """Raised when the checked-in context snapshot is unsafe or malformed."""


class MeasurementGateError(ValueError):
    """Raised after emitting a failed measurement gate result."""


def require_mapping(value: Any, location: str) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ContextValidationError(f"{location} must be an object.")
    if any(not isinstance(key, str) for key in value):
        raise ContextValidationError(f"{location} keys must be strings.")
    return value


def require_exact_keys(
    value: Any,
    expected_keys: frozenset[str],
    location: str,
) -> Mapping[str, Any]:
    mapping = require_mapping(value, location)
    actual_keys = frozenset(mapping)
    unknown_keys = sorted(actual_keys - expected_keys)
    missing_keys = sorted(expected_keys - actual_keys)
    if unknown_keys:
        raise ContextValidationError(
            f"{location} has unknown schema keys: {', '.join(unknown_keys)}."
        )
    if missing_keys:
        raise ContextValidationError(
            f"{location} is missing schema keys: {', '.join(missing_keys)}."
        )
    return mapping


def require_non_empty_string(value: Any, location: str) -> str:
    if not isinstance(value, str) or not value:
        raise ContextValidationError(f"{location} must be a non-empty string.")
    return value


def require_boolean(value: Any, location: str) -> bool:
    if not isinstance(value, bool):
        raise ContextValidationError(f"{location} must be a boolean.")
    return value


def resolve_repo_file(repo_root: Path, raw_path: Any, location: str) -> Path:
    relative_path = require_non_empty_string(raw_path, location)
    path = Path(relative_path)
    if path.is_absolute():
        raise ContextValidationError(f"{location} must be repository-relative: {relative_path}.")

    if (
        relative_path != path.as_posix()
        or any(part in {".", ".."} for part in path.parts)
    ):
        raise ContextValidationError(
            f"{location} must be a canonical repository-relative path: {relative_path}."
        )

    resolved_root = repo_root.resolve()
    lexical_path = resolved_root
    for part in path.parts:
        lexical_path /= part
        if lexical_path.is_symlink():
            raise ContextValidationError(
                f"{location} must not traverse a symbolic link: {relative_path}."
            )

    resolved_path = lexical_path.resolve()
    try:
        resolved_path.relative_to(resolved_root)
    except ValueError as error:
        raise ContextValidationError(
            f"{location} escapes repository root: {relative_path}."
        ) from error

    if not resolved_path.exists():
        raise ContextValidationError(f"{location} does not exist: {relative_path}.")
    if not resolved_path.is_file():
        raise ContextValidationError(f"{location} is not a file: {relative_path}.")
    return resolved_path


def validate_file_list(
    value: Any,
    repo_root: Path,
    location: str,
) -> list[Path]:
    if not isinstance(value, list) or not value:
        raise ContextValidationError(f"{location} must be a non-empty array of paths.")

    resolved_paths: list[Path] = []
    seen_paths: set[Path] = set()
    for index, raw_path in enumerate(value):
        resolved_path = resolve_repo_file(
            repo_root,
            raw_path,
            f"{location}[{index}]",
        )
        if resolved_path in seen_paths:
            raise ContextValidationError(
                f"{location} contains a duplicate path within one phase: {raw_path}."
            )
        seen_paths.add(resolved_path)
        resolved_paths.append(resolved_path)
    return resolved_paths


def relative_repo_path(path: Path, repo_root: Path) -> str:
    return path.relative_to(repo_root.resolve()).as_posix()


def verify_generated_outputs(repo_root: Path) -> None:
    try:
        result = subprocess.run(
            GENERATED_CHECK_COMMAND,
            cwd=repo_root,
            capture_output=True,
            check=False,
            text=True,
        )
    except FileNotFoundError as error:
        raise ContextValidationError(
            "generated-output check requires npm on PATH."
        ) from error

    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise ContextValidationError(
            "generated-output check failed before measurement"
            + (f": {detail}" if detail else ".")
        )


def build_measured_file_snapshot(
    contexts: Mapping[str, Any],
    repo_root: Path,
) -> dict[str, bytes]:
    relative_paths: set[str] = set(contexts["oneLoadBaseline"]["files"])
    for scenario in contexts["scenarios"]:
        for arm in scenario["arms"].values():
            for phase_files in arm["phases"].values():
                relative_paths.update(phase_files)

    return {
        relative_path: resolve_repo_file(
            repo_root,
            relative_path,
            f"measured file {relative_path}",
        ).read_bytes()
        for relative_path in sorted(relative_paths)
    }


def build_measured_file_sha256(
    measured_file_snapshot: Mapping[str, bytes],
) -> dict[str, str]:
    return {
        relative_path: hashlib.sha256(contents).hexdigest()
        for relative_path, contents in measured_file_snapshot.items()
    }


def assert_measured_file_snapshot_unchanged(
    measured_file_snapshot: Mapping[str, bytes],
    repo_root: Path,
) -> None:
    changed_paths = [
        relative_path
        for relative_path, expected_contents in measured_file_snapshot.items()
        if resolve_repo_file(
            repo_root,
            relative_path,
            f"measured file {relative_path}",
        ).read_bytes()
        != expected_contents
    ]
    if changed_paths:
        raise ContextValidationError(
            "measured files changed during measurement: "
            + ", ".join(changed_paths)
            + "."
        )


def parse_progressive_detail_path(
    relative_path: str,
    directory_name: str,
) -> tuple[str, str] | None:
    parts = Path(relative_path).parts
    if (
        len(parts) != 4
        or parts[0] != "skill"
        or parts[1] not in DOMAIN_ORDER
        or parts[2] != directory_name
        or not parts[3].endswith(".md")
    ):
        return None
    return parts[1], parts[3][:-3]


def matching_detail_path(domain: str, directory_name: str, rule_id: str) -> str:
    return f"skill/{domain}/{directory_name}/{rule_id}.md"


def contract_requires_full_rule(contract_path: Path) -> bool:
    return CRITICAL_IMPACT_MARKER in contract_path.read_text(encoding="utf-8")


def validate_oracle_phase_files(
    resolved_paths: Sequence[Path],
    repo_root: Path,
    location: str,
) -> None:
    for resolved_path in resolved_paths:
        relative_path = relative_repo_path(resolved_path, repo_root)
        parts = Path(relative_path).parts
        if (
            len(parts) != 3
            or parts[0] != "skill"
            or parts[2] not in {"SKILL.md", "HANDBOOK.md"}
        ):
            raise ContextValidationError(
                f"{location} oracle phase may load only SKILL.md and HANDBOOK.md: "
                f"{relative_path}."
            )


def validate_progressive_phase_files(
    resolved_paths: Sequence[Path],
    repo_root: Path,
    activated_domains: Sequence[str],
    allowed_non_critical_expansions: frozenset[tuple[str, str]],
    location: str,
) -> None:
    relative_paths = [relative_repo_path(path, repo_root) for path in resolved_paths]
    activated_domain_set = frozenset(activated_domains)

    for relative_path in relative_paths:
        parts = Path(relative_path).parts
        is_domain_entrypoint = (
            len(parts) == 3
            and parts[0] == "skill"
            and parts[1] in activated_domain_set
            and parts[2] in {"SKILL.md", "RULES_INDEX.md"}
        )
        is_audit_handbook = (
            len(parts) == 3
            and parts[0] == "skill"
            and parts[1] == "convention-audit"
            and parts[2] in {"SKILL.md", "HANDBOOK.md"}
        )
        contract_detail = parse_progressive_detail_path(relative_path, "contracts")
        full_rule_detail = parse_progressive_detail_path(relative_path, "rules")
        is_activated_contract = (
            contract_detail is not None and contract_detail[0] in activated_domain_set
        )
        is_activated_full_rule = (
            full_rule_detail is not None and full_rule_detail[0] in activated_domain_set
        )
        if not (
            is_domain_entrypoint
            or is_audit_handbook
            or is_activated_contract
            or is_activated_full_rule
        ):
            raise ContextValidationError(
                f"{location} progressive phase may load detailed guidance only through "
                f"contracts for activated domains: {relative_path}."
            )

    for index, (relative_path, resolved_path) in enumerate(
        zip(relative_paths, resolved_paths)
    ):
        contract_detail = parse_progressive_detail_path(relative_path, "contracts")
        if contract_detail is not None:
            domain, rule_id = contract_detail
            if contract_requires_full_rule(resolved_path):
                expected_full_rule = matching_detail_path(domain, "rules", rule_id)
                actual_next_path = (
                    relative_paths[index + 1]
                    if index + 1 < len(relative_paths)
                    else None
                )
                if actual_next_path != expected_full_rule:
                    raise ContextValidationError(
                        f"{location} CRITICAL contract {relative_path} must be "
                        "immediately followed by its matching full rule "
                        f"{expected_full_rule}."
                    )
            continue

        full_rule_detail = parse_progressive_detail_path(relative_path, "rules")
        if full_rule_detail is None:
            continue
        domain, rule_id = full_rule_detail
        expected_contract = matching_detail_path(domain, "contracts", rule_id)
        actual_previous_path = relative_paths[index - 1] if index > 0 else None
        if actual_previous_path != expected_contract:
            raise ContextValidationError(
                f"{location} full rule is not immediately preceded by its matching "
                f"contract {expected_contract}: {relative_path}."
            )

        contract_path = resolved_paths[index - 1]
        expansion_key = (domain, rule_id)
        if (
            not contract_requires_full_rule(contract_path)
            and expansion_key not in allowed_non_critical_expansions
        ):
            raise ContextValidationError(
                f"{location} non-CRITICAL full rule requires an explicit expansion "
                f"reason: {relative_path}."
            )


def validate_domains(value: Any, location: str) -> tuple[str, ...]:
    if not isinstance(value, list) or not value:
        raise ContextValidationError(f"{location} must be a non-empty domain array.")

    domains: list[str] = []
    for index, raw_domain in enumerate(value):
        domain = require_non_empty_string(raw_domain, f"{location}[{index}]")
        if domain not in DOMAIN_ORDER:
            raise ContextValidationError(f"{location} has unknown domain: {domain}.")
        if domain in domains:
            raise ContextValidationError(f"{location} has duplicate domain: {domain}.")
        domains.append(domain)

    canonical_domains = tuple(domain for domain in DOMAIN_ORDER if domain in domains)
    if tuple(domains) != canonical_domains:
        raise ContextValidationError(
            f"{location} must follow canonical domain order: {', '.join(canonical_domains)}."
        )
    return tuple(domains)


def validate_tokenizer(value: Any) -> None:
    tokenizer = require_exact_keys(
        value,
        frozenset(EXPECTED_TOKENIZER),
        "tokenizer",
    )
    for key, expected_value in EXPECTED_TOKENIZER.items():
        actual_value = tokenizer[key]
        if actual_value != expected_value:
            raise ContextValidationError(
                f"tokenizer.{key} must be {expected_value!r}, got {actual_value!r}."
            )


def validate_baseline(value: Any, repo_root: Path) -> None:
    baseline = require_exact_keys(
        value,
        frozenset({"id", "activatedDomains", "files"}),
        "oneLoadBaseline",
    )
    require_non_empty_string(baseline["id"], "oneLoadBaseline.id")
    domains = validate_domains(
        baseline["activatedDomains"],
        "oneLoadBaseline.activatedDomains",
    )
    if domains != DOMAIN_ORDER:
        raise ContextValidationError(
            "oneLoadBaseline.activatedDomains must contain the React/TypeScript/CSS triad."
        )
    validate_file_list(baseline["files"], repo_root, "oneLoadBaseline.files")
    if tuple(baseline["files"]) != EXPECTED_BASELINE_FILES:
        raise ContextValidationError(
            "oneLoadBaseline.files must match the exact canonical six-file order: "
            f"{', '.join(EXPECTED_BASELINE_FILES)}."
        )


def validate_expected_selected(
    value: Any,
    expected_skills: Sequence[str],
    location: str,
) -> dict[str, tuple[str, ...]]:
    selected = require_mapping(value, location)
    expected_skill_set = frozenset(expected_skills)
    actual_skill_set = frozenset(selected)
    if actual_skill_set != expected_skill_set:
        missing = sorted(expected_skill_set - actual_skill_set)
        extra = sorted(actual_skill_set - expected_skill_set)
        raise ContextValidationError(
            f"{location} keys must exactly match expectedSkills; "
            f"missing={missing}, extra={extra}."
        )

    result: dict[str, tuple[str, ...]] = {}
    for domain in expected_skills:
        raw_rule_ids = selected[domain]
        if not isinstance(raw_rule_ids, list):
            raise ContextValidationError(f"{location}.{domain} must be an array.")
        rule_ids: list[str] = []
        for index, raw_rule_id in enumerate(raw_rule_ids):
            rule_id = require_non_empty_string(
                raw_rule_id,
                f"{location}.{domain}[{index}]",
            )
            if rule_id in rule_ids:
                raise ContextValidationError(
                    f"{location}.{domain} has duplicate rule id: {rule_id}."
                )
            rule_ids.append(rule_id)
        result[domain] = tuple(rule_ids)
    return result


def parse_routing_selection(
    value: Any,
    location: str,
) -> dict[str, Any]:
    selection = require_mapping(value, location)
    if "expectedSkills" not in selection or "expectedSelected" not in selection:
        raise ContextValidationError(
            f"{location} must define expectedSkills and expectedSelected."
        )
    skills = validate_domains(selection["expectedSkills"], f"{location}.expectedSkills")
    selected = validate_expected_selected(
        selection["expectedSelected"],
        skills,
        f"{location}.expectedSelected",
    )
    return {"skills": skills, "selected": selected}


def load_routing_oracles(
    repo_root: Path,
    required_scenario_ids: frozenset[str] | None = None,
) -> dict[str, dict[str, Any]]:
    routing_oracles: dict[str, dict[str, Any]] = {}
    for routing_path in ROUTING_EVAL_PATHS:
        resolved_path = resolve_repo_file(
            repo_root,
            routing_path,
            f"routing oracle {routing_path}",
        )
        try:
            root = json.loads(resolved_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            raise ContextValidationError(
                f"routing oracle {routing_path} is not valid JSON: "
                f"{error.msg} at line {error.lineno}."
            ) from error
        routing_root = require_mapping(root, f"routing oracle {routing_path}")
        scenarios = routing_root.get("scenarios")
        if not isinstance(scenarios, list) or not scenarios:
            raise ContextValidationError(
                f"routing oracle {routing_path}.scenarios must be a non-empty array."
            )

        for scenario_index, scenario_value in enumerate(scenarios):
            location = f"routing oracle {routing_path}.scenarios[{scenario_index}]"
            scenario = require_mapping(scenario_value, location)
            scenario_id = require_non_empty_string(scenario.get("id"), f"{location}.id")
            if (
                required_scenario_ids is not None
                and scenario_id not in required_scenario_ids
            ):
                continue
            if scenario_id in routing_oracles:
                previous_source = routing_oracles[scenario_id]["source"]
                raise ContextValidationError(
                    f"duplicate routing oracle scenario id {scenario_id}: "
                    f"{previous_source}, {routing_path}."
                )
            base = parse_routing_selection(scenario, location)
            scope_drift = None
            if "scopeDrift" in scenario:
                scope_drift = parse_routing_selection(
                    scenario["scopeDrift"],
                    f"{location}.scopeDrift",
                )
            routing_oracles[scenario_id] = {
                "source": routing_path,
                "base": base,
                "scopeDrift": scope_drift,
            }
    return routing_oracles


def validate_arms(value: Any, scenario_location: str) -> Mapping[str, Any]:
    arms = require_mapping(value, f"{scenario_location}.arms")
    arm_keys = frozenset(arms)
    expected_arm_keys = frozenset(ARM_ORDER)
    unknown_arms = sorted(arm_keys - expected_arm_keys)
    missing_arms = sorted(expected_arm_keys - arm_keys)
    if unknown_arms:
        raise ContextValidationError(
            f"{scenario_location}.arms has unknown arm keys: {', '.join(unknown_arms)}."
        )
    if missing_arms:
        raise ContextValidationError(
            f"{scenario_location}.arms is missing arm counterpart: {', '.join(missing_arms)}."
        )
    return arms


def validate_arm(
    value: Any,
    repo_root: Path,
    location: str,
    arm_name: str,
) -> tuple[tuple[str, ...], tuple[str, ...]]:
    arm = require_exact_keys(
        value,
        frozenset({"activatedDomains", "phases"}),
        location,
    )
    domains = validate_domains(arm["activatedDomains"], f"{location}.activatedDomains")
    phases = require_mapping(arm["phases"], f"{location}.phases")
    phase_keys = frozenset(phases)
    unknown_phases = sorted(phase_keys - ALLOWED_PHASES)
    missing_phases = sorted(REQUIRED_PHASES - phase_keys)
    if unknown_phases:
        raise ContextValidationError(
            f"{location}.phases has unknown phase keys: {', '.join(unknown_phases)}."
        )
    if missing_phases:
        raise ContextValidationError(
            f"{location}.phases is missing required phase keys: {', '.join(missing_phases)}."
        )

    for phase_name, files in phases.items():
        phase_location = f"{location}.phases.{phase_name}"
        resolved_paths = validate_file_list(files, repo_root, phase_location)
        if arm_name == "oracle":
            validate_oracle_phase_files(resolved_paths, repo_root, phase_location)
    return domains, tuple(phases)


def routing_selection_for_phase(
    routing_oracle: Mapping[str, Any],
    phase_name: str,
) -> Mapping[str, Any]:
    scope_drift = routing_oracle["scopeDrift"]
    if phase_name != "implementation" and scope_drift is not None:
        return require_mapping(scope_drift, "routing oracle scopeDrift")
    return require_mapping(routing_oracle["base"], "routing oracle base")


def validate_expansions(
    value: Any,
    repo_root: Path,
    phase_order: Sequence[str],
    routing_oracle: Mapping[str, Any],
    location: str,
) -> dict[str, frozenset[tuple[str, str]]]:
    expansions = require_mapping(value, location)
    if tuple(expansions) != tuple(phase_order):
        raise ContextValidationError(
            f"{location} keys must exactly follow phase order: "
            f"{', '.join(phase_order)}."
        )

    result: dict[str, frozenset[tuple[str, str]]] = {}
    for phase_name in phase_order:
        phase_location = f"{location}.{phase_name}"
        raw_entries = expansions[phase_name]
        if not isinstance(raw_entries, list):
            raise ContextValidationError(f"{phase_location} must be an array.")
        selection = routing_selection_for_phase(routing_oracle, phase_name)
        expected_skills = tuple(selection["skills"])
        expected_selected = require_mapping(
            selection["selected"],
            f"routing selection for {phase_name}.selected",
        )
        expansion_keys: set[tuple[str, str]] = set()
        for entry_index, entry_value in enumerate(raw_entries):
            entry_location = f"{phase_location}[{entry_index}]"
            entry = require_exact_keys(
                entry_value,
                frozenset({"domain", "ruleId", "reason"}),
                entry_location,
            )
            domain = require_non_empty_string(entry["domain"], f"{entry_location}.domain")
            rule_id = require_non_empty_string(entry["ruleId"], f"{entry_location}.ruleId")
            reason = require_non_empty_string(entry["reason"], f"{entry_location}.reason")
            if not reason.strip():
                raise ContextValidationError(
                    f"{entry_location}.reason must be a non-empty, non-whitespace string."
                )
            if domain not in expected_skills:
                raise ContextValidationError(
                    f"{entry_location}.domain is not activated by the routing oracle: "
                    f"{domain}."
                )
            selected_rule_ids = tuple(expected_selected[domain])
            if rule_id not in selected_rule_ids:
                raise ContextValidationError(
                    f"{entry_location} must reference a selected contract: "
                    f"{domain}/{rule_id}."
                )
            expansion_key = (domain, rule_id)
            if expansion_key in expansion_keys:
                raise ContextValidationError(
                    f"{phase_location} has duplicate expansion: {domain}/{rule_id}."
                )
            contract_path = resolve_repo_file(
                repo_root,
                matching_detail_path(domain, "contracts", rule_id),
                f"{entry_location} contract",
            )
            if contract_requires_full_rule(contract_path):
                raise ContextValidationError(
                    f"{entry_location} cannot record a CRITICAL rule as a reasoned "
                    f"expansion: {domain}/{rule_id}."
                )
            expansion_keys.add(expansion_key)
        result[phase_name] = frozenset(expansion_keys)
    return result


def expected_oracle_phase_files(
    selection: Mapping[str, Any],
    phase_name: str,
) -> tuple[str, ...]:
    files: list[str] = []
    if phase_name in {"audit", "reviewer"}:
        files.extend(AUDIT_PHASE_FILES)
    for domain in selection["skills"]:
        files.extend(
            (
                f"skill/{domain}/SKILL.md",
                f"skill/{domain}/HANDBOOK.md",
            )
        )
    return tuple(files)


def expected_progressive_phase_files(
    selection: Mapping[str, Any],
    phase_name: str,
    expansion_keys: frozenset[tuple[str, str]],
    repo_root: Path,
) -> tuple[str, ...]:
    files: list[str] = []
    if phase_name in {"audit", "reviewer"}:
        files.extend(AUDIT_PHASE_FILES)
    selected = require_mapping(selection["selected"], "routing selection.selected")
    for domain in selection["skills"]:
        files.extend(
            (
                f"skill/{domain}/SKILL.md",
                f"skill/{domain}/RULES_INDEX.md",
            )
        )
        for rule_id in selected[domain]:
            contract_relative_path = matching_detail_path(
                domain,
                "contracts",
                str(rule_id),
            )
            contract_path = resolve_repo_file(
                repo_root,
                contract_relative_path,
                f"routing oracle selected contract {domain}/{rule_id}",
            )
            files.append(contract_relative_path)
            if contract_requires_full_rule(contract_path) or (
                domain,
                str(rule_id),
            ) in expansion_keys:
                files.append(matching_detail_path(domain, "rules", str(rule_id)))
    return tuple(files)


def validate_exact_phase_files(
    actual_files: Sequence[str],
    expected_files: Sequence[str],
    arm_name: str,
    location: str,
) -> None:
    actual = tuple(actual_files)
    expected = tuple(expected_files)
    if actual == expected:
        return
    missing = [path for path in expected if path not in actual]
    extra = [path for path in actual if path not in expected]
    order_mismatch = not missing and not extra
    raise ContextValidationError(
        f"{location} {arm_name} phase files do not match routing oracle; "
        f"missing={missing}, extra={extra}, orderMismatch={order_mismatch}."
    )


def validate_scenario(
    value: Any,
    repo_root: Path,
    scenario_index: int,
    routing_oracle: Mapping[str, Any],
    expected_expansions: Sequence[tuple[str, str, str]],
) -> str:
    location = f"scenarios[{scenario_index}]"
    scenario = require_exact_keys(
        value,
        frozenset({"id", "critical", "fallback", "expansions", "arms"}),
        location,
    )
    scenario_id = require_non_empty_string(scenario["id"], f"{location}.id")
    require_boolean(scenario["critical"], f"{location}.critical")
    require_boolean(scenario["fallback"], f"{location}.fallback")
    arms = validate_arms(scenario["arms"], location)

    arm_results: dict[str, tuple[tuple[str, ...], tuple[str, ...]]] = {}
    for arm_name in ARM_ORDER:
        arm_results[arm_name] = validate_arm(
            arms[arm_name],
            repo_root,
            f"{location}.arms.{arm_name}",
            arm_name,
        )

    oracle_domains, oracle_phases = arm_results["oracle"]
    progressive_domains, progressive_phases = arm_results["progressive"]
    if oracle_domains != progressive_domains:
        raise ContextValidationError(
            f"{location} activated-domain mismatch between oracle and progressive arms."
        )
    if oracle_phases != progressive_phases:
        raise ContextValidationError(
            f"{location} phase-boundary mismatch between oracle and progressive arms."
        )

    expected_phase_order = (
        DRIFT_PHASE_ORDER if "drift" in oracle_phases else BASE_PHASE_ORDER
    )
    if oracle_phases != expected_phase_order:
        raise ContextValidationError(
            f"{location} phases must follow canonical order: "
            f"{', '.join(expected_phase_order)}."
        )

    has_scope_drift = routing_oracle["scopeDrift"] is not None
    if ("drift" in oracle_phases) != has_scope_drift:
        raise ContextValidationError(
            f"{location} drift phase must exactly match the routing oracle scopeDrift."
        )
    final_selection = routing_selection_for_phase(routing_oracle, "reviewer")
    final_expected_domains = tuple(final_selection["skills"])
    if oracle_domains != final_expected_domains:
        raise ContextValidationError(
            f"{location}.arms activatedDomains do not match routing oracle "
            f"expectedSkills: expected={list(final_expected_domains)}, "
            f"actual={list(oracle_domains)}."
        )

    expansions_by_phase = validate_expansions(
        scenario["expansions"],
        repo_root,
        oracle_phases,
        routing_oracle,
        f"{location}.expansions",
    )
    expected_expansion_phases = frozenset(
        phase_name for phase_name, _, _ in expected_expansions
    )
    unexpected_expansion_phases = expected_expansion_phases.difference(
        oracle_phases
    )
    if unexpected_expansion_phases:
        raise AssertionError(
            "canonical expansion spec references unavailable phases: "
            + ", ".join(sorted(unexpected_expansion_phases))
            + "."
        )
    for phase_name in oracle_phases:
        expected_expansion_keys = frozenset(
            (domain, rule_id)
            for expected_phase_name, domain, rule_id in expected_expansions
            if expected_phase_name == phase_name
        )
        actual_expansion_keys = expansions_by_phase[phase_name]
        if actual_expansion_keys != expected_expansion_keys:
            raise ContextValidationError(
                f"{location}.expansions.{phase_name} scenario expansions do not "
                "match canonical evaluation suite; "
                f"expected={sorted(expected_expansion_keys)}, "
                f"actual={sorted(actual_expansion_keys)}."
            )
        selection = routing_selection_for_phase(routing_oracle, phase_name)
        oracle_phase_location = f"{location}.arms.oracle.phases.{phase_name}"
        progressive_phase_location = (
            f"{location}.arms.progressive.phases.{phase_name}"
        )
        oracle_files = arms["oracle"]["phases"][phase_name]
        progressive_files = arms["progressive"]["phases"][phase_name]
        expected_oracle_files = expected_oracle_phase_files(selection, phase_name)
        expected_progressive_files = expected_progressive_phase_files(
            selection,
            phase_name,
            expansions_by_phase[phase_name],
            repo_root,
        )
        resolved_paths = validate_file_list(
            progressive_files,
            repo_root,
            progressive_phase_location,
        )
        validate_progressive_phase_files(
            resolved_paths,
            repo_root,
            tuple(selection["skills"]),
            expansions_by_phase[phase_name],
            progressive_phase_location,
        )
        validate_exact_phase_files(
            oracle_files,
            expected_oracle_files,
            "oracle",
            oracle_phase_location,
        )
        validate_exact_phase_files(
            progressive_files,
            expected_progressive_files,
            "progressive",
            progressive_phase_location,
        )
    return scenario_id


def validate_contexts(
    contexts: Any,
    repo_root: Path,
    routing_oracles: Mapping[str, Mapping[str, Any]] | None = None,
) -> None:
    root = require_exact_keys(
        contexts,
        frozenset({"schemaVersion", "tokenizer", "oneLoadBaseline", "scenarios"}),
        "contexts",
    )
    schema_version = root["schemaVersion"]
    if not isinstance(schema_version, int) or isinstance(schema_version, bool):
        raise ContextValidationError("schemaVersion must be an integer.")
    if schema_version != EXPECTED_SCHEMA_VERSION:
        raise ContextValidationError(
            f"schemaVersion must be {EXPECTED_SCHEMA_VERSION}, got {schema_version}."
        )

    validate_tokenizer(root["tokenizer"])
    validate_baseline(root["oneLoadBaseline"], repo_root)
    scenarios = root["scenarios"]
    if not isinstance(scenarios, list) or not scenarios:
        raise ContextValidationError("scenarios must be a non-empty array.")

    scenario_mappings = [
        require_mapping(scenario, f"scenarios[{scenario_index}]")
        for scenario_index, scenario in enumerate(scenarios)
    ]
    actual_scenario_ids = tuple(
        require_non_empty_string(
            scenario.get("id"),
            f"scenarios[{scenario_index}].id",
        )
        for scenario_index, scenario in enumerate(scenario_mappings)
    )
    seen_scenario_ids: set[str] = set()
    for scenario_id in actual_scenario_ids:
        if scenario_id in seen_scenario_ids:
            raise ContextValidationError(f"duplicate scenario id: {scenario_id}.")
        seen_scenario_ids.add(scenario_id)

    expected_scenario_ids = tuple(spec[0] for spec in EXPECTED_SCENARIOS)
    if actual_scenario_ids != expected_scenario_ids:
        raise ContextValidationError(
            "scenarios must match the canonical ordered evaluation suite; "
            f"expected={list(expected_scenario_ids)}, "
            f"actual={list(actual_scenario_ids)}."
        )
    for scenario_index, (scenario, expected_spec) in enumerate(
        zip(scenario_mappings, EXPECTED_SCENARIOS)
    ):
        _, expected_critical, expected_fallback, _ = expected_spec
        actual_critical = require_boolean(
            scenario.get("critical"),
            f"scenarios[{scenario_index}].critical",
        )
        actual_fallback = require_boolean(
            scenario.get("fallback"),
            f"scenarios[{scenario_index}].fallback",
        )
        if (
            actual_critical != expected_critical
            or actual_fallback != expected_fallback
        ):
            raise ContextValidationError(
                f"scenarios[{scenario_index}] scenario classification does not match "
                "canonical evaluation suite; "
                f"expected critical={expected_critical}, "
                f"fallback={expected_fallback}; actual critical={actual_critical}, "
                f"fallback={actual_fallback}."
            )

    requested_scenario_ids = frozenset(actual_scenario_ids)
    active_routing_oracles = (
        load_routing_oracles(repo_root, requested_scenario_ids)
        if routing_oracles is None
        else routing_oracles
    )
    for scenario_index, scenario in enumerate(scenarios):
        scenario_mapping = require_mapping(scenario, f"scenarios[{scenario_index}]")
        scenario_id_value = require_non_empty_string(
            scenario_mapping.get("id"),
            f"scenarios[{scenario_index}].id",
        )
        if scenario_id_value not in active_routing_oracles:
            raise ContextValidationError(
                f"scenarios[{scenario_index}].id has no routing oracle in "
                f"{', '.join(ROUTING_EVAL_PATHS)}: {scenario_id_value}."
            )
        validate_scenario(
            scenario,
            repo_root,
            scenario_index,
            active_routing_oracles[scenario_id_value],
            EXPECTED_SCENARIOS[scenario_index][3],
        )


def load_contexts(
    repo_root: Path,
    contexts_relative_path: str,
) -> tuple[dict[str, Any], Path, bytes]:
    contexts_path = resolve_repo_file(
        repo_root,
        contexts_relative_path,
        "contexts path",
    )
    contexts_bytes = contexts_path.read_bytes()
    try:
        raw_contexts = json.loads(contexts_bytes.decode("utf-8"))
    except UnicodeDecodeError as error:
        raise ContextValidationError("contexts file is not valid UTF-8.") from error
    except json.JSONDecodeError as error:
        raise ContextValidationError(
            f"contexts file is not valid JSON: {error.msg} at line {error.lineno}."
        ) from error
    validate_contexts(raw_contexts, repo_root)
    return raw_contexts, contexts_path, contexts_bytes


def emit_json_line(payload: Mapping[str, Any]) -> None:
    print(
        json.dumps(
            payload,
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        )
    )


def load_encoding(tokenizer: Mapping[str, Any]) -> tuple[Any, str]:
    try:
        import tiktoken
    except ModuleNotFoundError as error:
        raise ContextValidationError(
            "tiktoken is required for measurement; install exactly tiktoken==0.11.0."
        ) from error

    installed_version = importlib.metadata.version("tiktoken")
    expected_version = str(tokenizer["version"])
    if installed_version != expected_version:
        raise ContextValidationError(
            f"tiktoken version must be {expected_version}, got {installed_version}."
        )
    encoding_name = str(tokenizer["encoding"])
    return tiktoken.get_encoding(encoding_name), installed_version


def measure_files(
    raw_paths: Sequence[str],
    measured_file_snapshot: Mapping[str, bytes],
    encoding: Any,
) -> int:
    token_total = 0
    for index, raw_path in enumerate(raw_paths):
        try:
            contents = measured_file_snapshot[raw_path]
        except KeyError as error:
            raise ContextValidationError(
                f"measurement files[{index}] is absent from the immutable snapshot: {raw_path}."
            ) from error
        try:
            text = contents.decode("utf-8")
        except UnicodeDecodeError as error:
            raise ContextValidationError(
                f"measurement files[{index}] is not valid UTF-8: {raw_path}."
            ) from error
        token_total += len(encoding.encode(text))
    return token_total


def reduction_percent(reference_tokens: int, candidate_tokens: int) -> float:
    if reference_tokens <= 0:
        raise ContextValidationError("reference token count must be positive.")
    return round(((reference_tokens - candidate_tokens) / reference_tokens) * 100, 4)


def rounded_median(values: Sequence[float | int]) -> float | None:
    if not values:
        return None
    return round(float(statistics.median(values)), 4)


def build_summary(
    group: str,
    scenario_metrics: Sequence[Mapping[str, Any]],
) -> dict[str, Any]:
    implementation_oracle = [
        int(metric["implementationTokens"]["oracle"]) for metric in scenario_metrics
    ]
    implementation_progressive = [
        int(metric["implementationTokens"]["progressive"])
        for metric in scenario_metrics
    ]
    cumulative_oracle = [
        int(metric["cumulativeTokens"]["oracle"]) for metric in scenario_metrics
    ]
    cumulative_progressive = [
        int(metric["cumulativeTokens"]["progressive"])
        for metric in scenario_metrics
    ]
    implementation_reductions = [
        float(metric["reductionPercent"]["implementation"])
        for metric in scenario_metrics
    ]
    one_load_reductions = [
        float(metric["reductionPercent"]["oneLoad"])
        for metric in scenario_metrics
    ]
    cumulative_reductions = [
        float(metric["reductionPercent"]["cumulative"])
        for metric in scenario_metrics
    ]

    def maximum(values: Sequence[float | int]) -> float | int | None:
        return max(values) if values else None

    def minimum(values: Sequence[float | int]) -> float | int | None:
        return min(values) if values else None

    return {
        "type": "summary",
        "group": group,
        "scenarioCount": len(scenario_metrics),
        "implementationOracleMedianTokens": rounded_median(implementation_oracle),
        "implementationOracleMaxTokens": maximum(implementation_oracle),
        "implementationProgressiveMedianTokens": rounded_median(
            implementation_progressive
        ),
        "implementationProgressiveMaxTokens": maximum(implementation_progressive),
        "implementationReductionMedianPercent": rounded_median(
            implementation_reductions
        ),
        "implementationReductionMinPercent": minimum(implementation_reductions),
        "implementationReductionMaxPercent": maximum(implementation_reductions),
        "oneLoadReductionMedianPercent": rounded_median(one_load_reductions),
        "oneLoadReductionMinPercent": minimum(one_load_reductions),
        "oneLoadReductionMaxPercent": maximum(one_load_reductions),
        "cumulativeOracleMedianTokens": rounded_median(cumulative_oracle),
        "cumulativeOracleMaxTokens": maximum(cumulative_oracle),
        "cumulativeProgressiveMedianTokens": rounded_median(cumulative_progressive),
        "cumulativeProgressiveMaxTokens": maximum(cumulative_progressive),
        "cumulativeReductionMedianPercent": rounded_median(cumulative_reductions),
        "cumulativeReductionMinPercent": minimum(cumulative_reductions),
        "cumulativeReductionMaxPercent": maximum(cumulative_reductions),
    }


def build_gate_result(summary: Mapping[str, Any]) -> dict[str, Any]:
    if summary.get("group") != "standard":
        raise ContextValidationError("measurement gates require the standard summary.")
    checks: list[dict[str, Any]] = []
    for gate_id, metric_key, operator, threshold in GATE_DEFINITIONS:
        actual = summary.get(metric_key)
        if (
            not isinstance(actual, (int, float))
            or isinstance(actual, bool)
        ):
            raise ContextValidationError(
                f"standard summary metric {metric_key} must be numeric."
            )
        passed = actual <= threshold if operator == "<=" else actual >= threshold
        checks.append(
            {
                "id": gate_id,
                "metric": metric_key,
                "operator": operator,
                "threshold": threshold,
                "actual": actual,
                "status": "pass" if passed else "fail",
            }
        )
    return {
        "type": "gate",
        "group": "standard",
        "status": (
            "pass"
            if all(check["status"] == "pass" for check in checks)
            else "fail"
        ),
        "checks": checks,
    }


def raise_for_failed_gate(gate_result: Mapping[str, Any]) -> None:
    if gate_result.get("status") == "pass":
        return
    failed_ids = [
        str(check["id"])
        for check in gate_result.get("checks", [])
        if check.get("status") == "fail"
    ]
    raise MeasurementGateError(
        f"measurement gates failed: {', '.join(failed_ids)}."
    )


def run_measurement(
    contexts: Mapping[str, Any],
    contexts_path: Path,
    contexts_bytes: bytes,
    repo_root: Path,
) -> None:
    tokenizer = require_mapping(contexts["tokenizer"], "tokenizer")
    encoding, installed_version = load_encoding(tokenizer)
    contexts_digest = hashlib.sha256(contexts_bytes).hexdigest()
    measured_file_snapshot = build_measured_file_snapshot(contexts, repo_root)
    measured_file_sha256 = build_measured_file_sha256(measured_file_snapshot)
    routing_oracle_snapshot = {
        routing_path: resolve_repo_file(
            repo_root,
            routing_path,
            f"routing oracle {routing_path}",
        ).read_bytes()
        for routing_path in ROUTING_EVAL_PATHS
    }
    # Close the preflight-to-snapshot race: this validation must observe either
    # the snapshotted oracle state or a later state that the drift check rejects.
    validate_contexts(contexts, repo_root)
    measurement_script_bytes = Path(__file__).read_bytes()
    emit_json_line(
        {
            "type": "metadata",
            "schemaVersion": contexts["schemaVersion"],
            "contexts": contexts_path.relative_to(repo_root).as_posix(),
            "contextsSha256": contexts_digest,
            "pythonVersion": platform.python_version(),
            "tiktokenVersion": installed_version,
            "encoding": tokenizer["encoding"],
            "generatedCheck": {
                "command": " ".join(GENERATED_CHECK_COMMAND),
                "status": "pass",
            },
            "measurementScriptSha256": hashlib.sha256(
                measurement_script_bytes
            ).hexdigest(),
            "measuredFileCount": len(measured_file_sha256),
            "measuredFileSha256": measured_file_sha256,
            "routingOracleSha256": {
                routing_path: hashlib.sha256(contents).hexdigest()
                for routing_path, contents in routing_oracle_snapshot.items()
            },
        }
    )

    baseline = require_mapping(contexts["oneLoadBaseline"], "oneLoadBaseline")
    baseline_files = baseline["files"]
    baseline_tokens = measure_files(baseline_files, measured_file_snapshot, encoding)
    emit_json_line(
        {
            "type": "one-load-baseline",
            "id": baseline["id"],
            "activatedDomains": baseline["activatedDomains"],
            "fileCount": len(baseline_files),
            "tokens": baseline_tokens,
        }
    )

    standard_metrics: list[Mapping[str, Any]] = []
    fallback_metrics: list[Mapping[str, Any]] = []
    for scenario_value in contexts["scenarios"]:
        scenario = require_mapping(scenario_value, "scenario")
        scenario_id = str(scenario["id"])
        arms = require_mapping(scenario["arms"], f"{scenario_id}.arms")
        phase_totals: dict[str, dict[str, int]] = {}
        cumulative_totals: dict[str, int] = {}

        for arm_name in ARM_ORDER:
            arm = require_mapping(arms[arm_name], f"{scenario_id}.{arm_name}")
            phases = require_mapping(
                arm["phases"],
                f"{scenario_id}.{arm_name}.phases",
            )
            cumulative_tokens = 0
            phase_totals[arm_name] = {}
            for phase_name, raw_files in phases.items():
                phase_tokens = measure_files(raw_files, measured_file_snapshot, encoding)
                cumulative_tokens += phase_tokens
                phase_totals[arm_name][phase_name] = phase_tokens
                emit_json_line(
                    {
                        "type": "phase",
                        "scenarioId": scenario_id,
                        "arm": arm_name,
                        "phase": phase_name,
                        "fileCount": len(raw_files),
                        "tokens": phase_tokens,
                        "cumulativeTokens": cumulative_tokens,
                    }
                )
            cumulative_totals[arm_name] = cumulative_tokens

        implementation_tokens = {
            arm_name: phase_totals[arm_name]["implementation"]
            for arm_name in ARM_ORDER
        }
        reductions = {
            "implementation": reduction_percent(
                implementation_tokens["oracle"],
                implementation_tokens["progressive"],
            ),
            "oneLoad": reduction_percent(
                baseline_tokens,
                implementation_tokens["progressive"],
            ),
            "cumulative": reduction_percent(
                cumulative_totals["oracle"],
                cumulative_totals["progressive"],
            ),
        }
        scenario_metric: dict[str, Any] = {
            "type": "scenario",
            "id": scenario_id,
            "critical": scenario["critical"],
            "fallback": scenario["fallback"],
            "activatedDomains": arms["oracle"]["activatedDomains"],
            "implementationTokens": implementation_tokens,
            "cumulativeTokens": cumulative_totals,
            "reductionPercent": reductions,
        }
        emit_json_line(scenario_metric)
        if scenario["fallback"]:
            fallback_metrics.append(scenario_metric)
        else:
            standard_metrics.append(scenario_metric)

    standard_summary = build_summary("standard", standard_metrics)
    fallback_summary = build_summary("fallback", fallback_metrics)
    emit_json_line(standard_summary)
    emit_json_line(fallback_summary)
    assert_measured_file_snapshot_unchanged(measured_file_snapshot, repo_root)
    if contexts_path.read_bytes() != contexts_bytes:
        raise ContextValidationError("contexts file changed during measurement.")
    changed_routing_oracles = [
        routing_path
        for routing_path, expected_contents in routing_oracle_snapshot.items()
        if resolve_repo_file(
            repo_root,
            routing_path,
            f"routing oracle {routing_path}",
        ).read_bytes()
        != expected_contents
    ]
    if changed_routing_oracles:
        raise ContextValidationError(
            "routing oracles changed during measurement: "
            + ", ".join(changed_routing_oracles)
            + "."
        )
    if Path(__file__).read_bytes() != measurement_script_bytes:
        raise ContextValidationError("measurement script changed during measurement.")
    verify_generated_outputs(repo_root)
    gate_result = build_gate_result(standard_summary)
    emit_json_line(gate_result)
    raise_for_failed_gate(gate_result)


Mutation = Callable[[dict[str, Any]], None]


def run_self_test(contexts: dict[str, Any], repo_root: Path) -> None:
    validate_contexts(contexts, repo_root)

    def first_phase_files(data: dict[str, Any]) -> list[str]:
        return data["scenarios"][0]["arms"]["progressive"]["phases"][
            "implementation"
        ]

    def first_critical_contract_pair(
        data: dict[str, Any],
    ) -> tuple[list[str], int]:
        for scenario in data["scenarios"]:
            for files in scenario["arms"]["progressive"]["phases"].values():
                for index, raw_path in enumerate(files[:-1]):
                    if "/contracts/" not in raw_path:
                        continue
                    contract_path = repo_root / raw_path
                    if "**Impact: CRITICAL**" in contract_path.read_text(
                        encoding="utf-8"
                    ):
                        return files, index
        raise AssertionError("self-test fixture has no CRITICAL contract pair.")

    def another_critical_rule_path(contract_path: str) -> str:
        expected_rule_path = contract_path.replace("/contracts/", "/rules/")
        domain = Path(contract_path).parts[1]
        for candidate_path in sorted(
            repo_root.glob(f"skill/{domain}/contracts/*.md")
        ):
            if "**Impact: CRITICAL**" not in candidate_path.read_text(
                encoding="utf-8"
            ):
                continue
            relative_contract_path = candidate_path.relative_to(repo_root).as_posix()
            candidate_rule_path = relative_contract_path.replace(
                "/contracts/", "/rules/"
            )
            if candidate_rule_path != expected_rule_path:
                return candidate_rule_path
        raise AssertionError("self-test fixture has only one CRITICAL contract.")

    def first_contract_location(data: dict[str, Any]) -> tuple[list[str], int]:
        for scenario in data["scenarios"]:
            for files in scenario["arms"]["progressive"]["phases"].values():
                for index, raw_path in enumerate(files):
                    if "/contracts/" in raw_path:
                        return files, index
        raise AssertionError("self-test fixture has no progressive contract.")

    def first_non_critical_contract_location(
        data: dict[str, Any],
    ) -> tuple[list[str], int]:
        for scenario in data["scenarios"]:
            for files in scenario["arms"]["progressive"]["phases"].values():
                for index, raw_path in enumerate(files):
                    if "/contracts/" not in raw_path:
                        continue
                    contract_path = repo_root / raw_path
                    if CRITICAL_IMPACT_MARKER not in contract_path.read_text(
                        encoding="utf-8"
                    ):
                        return files, index
        raise AssertionError("self-test fixture has no non-CRITICAL contract.")

    cases: list[tuple[str, Mutation, str]] = []

    def add_case(name: str, mutation: Mutation, expected_message: str) -> None:
        cases.append((name, mutation, expected_message))

    add_case(
        "absolute-path",
        lambda data: first_phase_files(data).__setitem__(
            0,
            str((repo_root / "README.md").resolve()),
        ),
        "must be repository-relative",
    )
    add_case(
        "escaping-path",
        lambda data: first_phase_files(data).__setitem__(0, "../outside.md"),
        "must be a canonical repository-relative path",
    )
    add_case(
        "non-canonical-path-alias",
        lambda data: first_phase_files(data).__setitem__(
            0,
            f"./{first_phase_files(data)[0]}",
        ),
        "must be a canonical repository-relative path",
    )
    add_case(
        "missing-path",
        lambda data: first_phase_files(data).__setitem__(
            0,
            "docs/evaluations/__missing_context_file__.md",
        ),
        "does not exist",
    )
    add_case(
        "non-file-path",
        lambda data: first_phase_files(data).__setitem__(0, "skill/react"),
        "is not a file",
    )
    add_case(
        "within-phase-duplicate",
        lambda data: first_phase_files(data).append(first_phase_files(data)[0]),
        "duplicate path within one phase",
    )
    add_case(
        "unknown-schema-key",
        lambda data: data.__setitem__("unexpected", True),
        "unknown schema keys",
    )
    add_case(
        "unknown-arm",
        lambda data: data["scenarios"][0]["arms"].__setitem__("candidate", {}),
        "unknown arm keys",
    )
    add_case(
        "unknown-phase",
        lambda data: data["scenarios"][0]["arms"]["oracle"]["phases"].__setitem__(
            "handoff",
            ["README.md"],
        ),
        "unknown phase keys",
    )
    add_case(
        "missing-arm-counterpart",
        lambda data: data["scenarios"][0]["arms"].pop("oracle"),
        "missing arm counterpart",
    )

    def reorder_progressive_phases(data: dict[str, Any]) -> None:
        phases = data["scenarios"][0]["arms"]["progressive"]["phases"]
        data["scenarios"][0]["arms"]["progressive"]["phases"] = {
            "implementation": phases["implementation"],
            "reviewer": phases["reviewer"],
            "audit": phases["audit"],
        }

    add_case(
        "phase-boundary-mismatch",
        reorder_progressive_phases,
        "phase-boundary mismatch",
    )
    add_case(
        "activated-domain-mismatch",
        lambda data: data["scenarios"][0]["arms"]["progressive"].__setitem__(
            "activatedDomains",
            ["react"],
        ),
        "activated-domain mismatch",
    )

    def add_baseline_file(data: dict[str, Any]) -> None:
        data["oneLoadBaseline"]["files"].append("skill/astro/SKILL.md")

    add_case(
        "baseline-file-addition",
        add_baseline_file,
        "oneLoadBaseline.files must match the exact canonical six-file order",
    )

    add_case(
        "baseline-file-deletion",
        lambda data: data["oneLoadBaseline"]["files"].pop(),
        "oneLoadBaseline.files must match the exact canonical six-file order",
    )

    def reorder_baseline_files(data: dict[str, Any]) -> None:
        files = data["oneLoadBaseline"]["files"]
        files[0], files[1] = files[1], files[0]

    add_case(
        "baseline-file-reorder",
        reorder_baseline_files,
        "oneLoadBaseline.files must match the exact canonical six-file order",
    )

    add_case(
        "scenario-suite-deletion",
        lambda data: data["scenarios"].pop(),
        "scenarios must match the canonical ordered evaluation suite",
    )

    def reorder_scenario_suite(data: dict[str, Any]) -> None:
        scenarios = data["scenarios"]
        scenarios[0], scenarios[1] = scenarios[1], scenarios[0]

    add_case(
        "scenario-suite-reorder",
        reorder_scenario_suite,
        "scenarios must match the canonical ordered evaluation suite",
    )

    add_case(
        "scenario-critical-flip",
        lambda data: data["scenarios"][0].__setitem__("critical", False),
        "scenario classification does not match canonical evaluation suite",
    )

    add_case(
        "scenario-fallback-flip",
        lambda data: data["scenarios"][0].__setitem__("fallback", True),
        "scenario classification does not match canonical evaluation suite",
    )
    add_case(
        "duplicate-scenario-id",
        lambda data: data["scenarios"].append(copy.deepcopy(data["scenarios"][0])),
        "duplicate scenario id",
    )
    add_case(
        "malformed-root-type",
        lambda data: data.__setitem__("scenarios", {}),
        "scenarios must be a non-empty array",
    )
    add_case(
        "malformed-phase-type",
        lambda data: data["scenarios"][0]["arms"]["oracle"]["phases"].__setitem__(
            "implementation",
            "README.md",
        ),
        "must be a non-empty array of paths",
    )
    add_case(
        "tokenizer-version-drift",
        lambda data: data["tokenizer"].__setitem__("version", "0.12.0"),
        "tokenizer.version must be '0.11.0'",
    )

    def remove_critical_full_rule(data: dict[str, Any]) -> None:
        files, contract_index = first_critical_contract_pair(data)
        files.pop(contract_index + 1)

    add_case(
        "missing-critical-full-rule",
        remove_critical_full_rule,
        "must be immediately followed by its matching full rule",
    )

    def mismatch_critical_full_rule(data: dict[str, Any]) -> None:
        files, contract_index = first_critical_contract_pair(data)
        files[contract_index + 1] = another_critical_rule_path(
            files[contract_index]
        )

    add_case(
        "mismatched-critical-full-rule",
        mismatch_critical_full_rule,
        "must be immediately followed by its matching full rule",
    )

    def orphan_critical_full_rule(data: dict[str, Any]) -> None:
        files, contract_index = first_critical_contract_pair(data)
        full_rule_path = files.pop(contract_index + 1)
        files.insert(0, full_rule_path)

    add_case(
        "orphan-full-rule",
        orphan_critical_full_rule,
        "full rule is not immediately preceded by its matching contract",
    )

    def delete_selected_contract(data: dict[str, Any]) -> None:
        files, contract_index = first_non_critical_contract_location(data)
        files.pop(contract_index)

    add_case(
        "selected-contract-deletion",
        delete_selected_contract,
        "progressive phase files do not match routing oracle",
    )

    def delete_critical_contract_pair(data: dict[str, Any]) -> None:
        files, contract_index = first_critical_contract_pair(data)
        files.pop(contract_index + 1)
        files.pop(contract_index)

    add_case(
        "critical-contract-pair-deletion",
        delete_critical_contract_pair,
        "progressive phase files do not match routing oracle",
    )

    def delete_activated_domain_entrypoint(data: dict[str, Any]) -> None:
        first_phase_files(data).remove("skill/react/SKILL.md")

    add_case(
        "activated-domain-entrypoint-deletion",
        delete_activated_domain_entrypoint,
        "progressive phase files do not match routing oracle",
    )

    def delete_activated_domain_guidance(data: dict[str, Any]) -> None:
        first_phase_files(data).remove("skill/react/RULES_INDEX.md")

    add_case(
        "activated-domain-guidance-deletion",
        delete_activated_domain_guidance,
        "progressive phase files do not match routing oracle",
    )

    def add_unexplained_non_critical_full_rule(data: dict[str, Any]) -> None:
        files, contract_index = first_non_critical_contract_location(data)
        full_rule_path = files[contract_index].replace("/contracts/", "/rules/")
        files.insert(contract_index + 1, full_rule_path)

    add_case(
        "non-critical-full-rule-without-reason",
        add_unexplained_non_critical_full_rule,
        "non-CRITICAL full rule requires an explicit expansion reason",
    )

    def add_non_critical_expansion(
        data: dict[str, Any],
        reason: str,
    ) -> None:
        for scenario in data["scenarios"]:
            for phase_name, files in scenario["arms"]["progressive"][
                "phases"
            ].items():
                for contract_index, contract_path in enumerate(files):
                    if "/contracts/" not in contract_path:
                        continue
                    resolved_contract_path = repo_root / contract_path
                    if contract_requires_full_rule(resolved_contract_path):
                        continue
                    parts = Path(contract_path).parts
                    scenario["expansions"][phase_name].append(
                        {
                            "domain": parts[1],
                            "ruleId": parts[3][:-3],
                            "reason": reason,
                        }
                    )
                    files.insert(
                        contract_index + 1,
                        contract_path.replace("/contracts/", "/rules/"),
                    )
                    return
        raise AssertionError("self-test fixture has no non-CRITICAL contract.")

    def add_expansion_with_missing_reason(data: dict[str, Any]) -> None:
        add_non_critical_expansion(data, "   ")

    add_case(
        "expansion-reason-missing",
        add_expansion_with_missing_reason,
        "reason must be a non-empty, non-whitespace string",
    )

    def replace_progressive_contract_with_handbook(data: dict[str, Any]) -> None:
        files, contract_index = first_contract_location(data)
        contract_parts = Path(files[contract_index]).parts
        files[contract_index] = f"skill/{contract_parts[1]}/HANDBOOK.md"

    add_case(
        "progressive-full-handbook",
        replace_progressive_contract_with_handbook,
        "progressive phase may load detailed guidance only through contracts",
    )

    def add_progressive_artifact_to_oracle(data: dict[str, Any]) -> None:
        files = data["scenarios"][0]["arms"]["oracle"]["phases"][
            "implementation"
        ]
        files.append("skill/react/RULES_INDEX.md")

    add_case(
        "oracle-progressive-artifact",
        add_progressive_artifact_to_oracle,
        "oracle phase may load only SKILL.md and HANDBOOK.md",
    )

    def delete_canonical_expansion(data: dict[str, Any]) -> None:
        scenario = next(
            scenario
            for scenario in data["scenarios"]
            if scenario["id"] == "RTE03-route-support-extraction"
        )
        full_rule_path = (
            "skill/react/rules/screen-extract-utilities-selectively.md"
        )
        for phase_name, entries in scenario["expansions"].items():
            entries.clear()
            scenario["arms"]["progressive"]["phases"][phase_name].remove(
                full_rule_path
            )

    add_case(
        "canonical-expansion-deletion",
        delete_canonical_expansion,
        "scenario expansions do not match canonical evaluation suite",
    )

    def replace_canonical_expansion(data: dict[str, Any]) -> None:
        scenario = next(
            scenario
            for scenario in data["scenarios"]
            if scenario["id"] == "RTE03-route-support-extraction"
        )
        replacement_rule_id = "screen-avoid-premature-abstraction"
        old_full_rule_path = (
            "skill/react/rules/screen-extract-utilities-selectively.md"
        )
        replacement_contract_path = (
            f"skill/react/contracts/{replacement_rule_id}.md"
        )
        replacement_full_rule_path = f"skill/react/rules/{replacement_rule_id}.md"
        for phase_name, entries in scenario["expansions"].items():
            entries[0]["ruleId"] = replacement_rule_id
            files = scenario["arms"]["progressive"]["phases"][phase_name]
            files.remove(old_full_rule_path)
            contract_index = files.index(replacement_contract_path)
            files.insert(contract_index + 1, replacement_full_rule_path)

    add_case(
        "canonical-expansion-replacement",
        replace_canonical_expansion,
        "scenario expansions do not match canonical evaluation suite",
    )

    for case_name, mutation, expected_message in cases:
        mutated_contexts = copy.deepcopy(contexts)
        mutation(mutated_contexts)
        try:
            validate_contexts(mutated_contexts, repo_root)
        except ContextValidationError as error:
            if expected_message not in str(error):
                raise AssertionError(
                    f"{case_name} rejected with unexpected message: {error}"
                ) from error
        else:
            raise AssertionError(f"{case_name} mutation was not rejected.")

    def assert_symlink_alias_rejected(alias_kind: str) -> None:
        with TemporaryDirectory(prefix="progressive-loading-path-") as temp_dir:
            fixture_root = Path(temp_dir)
            real_dir = fixture_root / "real"
            real_dir.mkdir()
            real_file = real_dir / "guidance.md"
            real_file.write_text("fixture\n", encoding="utf-8")

            if alias_kind == "file":
                alias_path = fixture_root / "guidance.md"
                alias_path.symlink_to(real_file)
                raw_path = "guidance.md"
            else:
                alias_path = fixture_root / "alias"
                alias_path.symlink_to(real_dir, target_is_directory=True)
                raw_path = "alias/guidance.md"

            try:
                resolve_repo_file(fixture_root, raw_path, f"{alias_kind} alias")
            except ContextValidationError as error:
                if "symbolic link" not in str(error):
                    raise AssertionError(
                        f"{alias_kind} alias rejected with unexpected message: {error}"
                    ) from error
            else:
                raise AssertionError(f"{alias_kind} symbolic-link alias was not rejected.")

    assert_symlink_alias_rejected("file")
    assert_symlink_alias_rejected("directory")

    with TemporaryDirectory(prefix="progressive-loading-snapshot-") as temp_dir:
        fixture_root = Path(temp_dir)
        fixture_path = fixture_root / "guidance.md"
        fixture_path.write_text("before\n", encoding="utf-8")
        fixture_snapshot = {"guidance.md": fixture_path.read_bytes()}
        fixture_path.write_text("after\n", encoding="utf-8")
        try:
            assert_measured_file_snapshot_unchanged(
                fixture_snapshot,
                fixture_root,
            )
        except ContextValidationError as error:
            if "changed during measurement" not in str(error):
                raise AssertionError(
                    f"snapshot drift rejected with unexpected message: {error}"
                ) from error
        else:
            raise AssertionError("measured-file snapshot drift was not rejected.")

    threshold_failure_summary = {
        "type": "summary",
        "group": "standard",
        "implementationProgressiveMedianTokens": 10_001,
        "implementationProgressiveMaxTokens": 12_000,
        "oneLoadReductionMedianPercent": 70,
        "cumulativeReductionMedianPercent": 60,
    }
    threshold_failure_gate = build_gate_result(threshold_failure_summary)
    if threshold_failure_gate["status"] != "fail":
        raise AssertionError("threshold-failure mutation was not rejected.")
    try:
        raise_for_failed_gate(threshold_failure_gate)
    except MeasurementGateError as error:
        if "measurement gates failed" not in str(error):
            raise AssertionError(
                f"threshold-failure rejected with unexpected message: {error}"
            ) from error
    else:
        raise AssertionError("threshold-failure mutation did not raise.")

    emit_json_line(
        {
            "type": "self-test",
            "status": "pass",
            "caseCount": len(cases) + 5,
            "cases": [name for name, _, _ in cases]
            + [
                "canonical-reasoned-expansion-accepted",
                "file-symlink-alias",
                "directory-symlink-alias",
                "measured-file-snapshot-drift",
                "threshold-failure",
            ],
        }
    )


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Measure checked-in progressive convention context snapshots.",
    )
    parser.add_argument(
        "--contexts",
        default=DEFAULT_CONTEXTS_PATH,
        help="Repository-relative context JSON path.",
    )
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="Run strict schema/path mutation tests without importing tiktoken.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    try:
        contexts, contexts_path, contexts_bytes = load_contexts(
            REPO_ROOT,
            args.contexts,
        )
        verify_generated_outputs(REPO_ROOT)
        if args.self_test:
            run_self_test(contexts, REPO_ROOT)
        else:
            run_measurement(contexts, contexts_path, contexts_bytes, REPO_ROOT)
    except (ContextValidationError, MeasurementGateError, AssertionError) as error:
        print(
            json.dumps(
                {"type": "error", "message": str(error)},
                ensure_ascii=False,
                separators=(",", ":"),
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
