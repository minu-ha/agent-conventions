<div lang="en">

<div align="center">

<img src="content/asset/favicon.svg" width="112" height="112" alt="agent conventions gray pixel face">

# agent conventions

**Coding conventions for AI-assisted development.**

Rules, examples and the reasoning behind everyday decisions in React, TypeScript, CSS and Figma.

[![MIT](https://img.shields.io/badge/license-MIT-1111aa?style=flat-square)](LICENSE)
[![Documentation](https://img.shields.io/github/actions/workflow/status/minu-ha/agent-conventions/docs.yml?branch=main&label=docs&style=flat-square)](https://github.com/minu-ha/agent-conventions/actions/workflows/docs.yml)
![Node.js 22.12.0+](https://img.shields.io/badge/node-22.12.0%2B-444444?style=flat-square)

[Documentation](https://minu-ha.github.io/agent-conventions/) | [Usage](content/public/usage.md) | [Rule authoring](CONTRIBUTING.md) | [Research](content/public/research/progressive-loading.md)

</div>

agent-conventions is a personal collection of the coding decisions I return to when building and reviewing software with AI agents.
It covers how components own their state and data, where modules begin and end, how styles are scoped, how behavior is tested, and how designs become code.

The repository keeps those decisions in two forms: structured skills that agents can apply to a task, and a documentation site for reading the explanations, examples and related rules.
The conventions grow from actual project work, with changes to the rules and the reasoning behind them kept together.

## Five connected areas

| Skill | What it covers |
| --- | --- |
| [React](https://minu-ha.github.io/agent-conventions/convention/react/) | Component ownership, server data, state, composition, events, runtime boundaries and accessibility |
| [TypeScript](https://minu-ha.github.io/agent-conventions/convention/typescript/) | Types and contracts, imports, naming, function boundaries, values, fallbacks and comments |
| [CSS](https://minu-ha.github.io/agent-conventions/convention/css/) | Class names, ownership, selectors, design tokens, layout, responsive behavior and motion |
| [Testing](https://minu-ha.github.io/agent-conventions/convention/testing/) | Test boundaries, scenarios, data and isolation, Vitest, Playwright, network mocking, golden and visual baselines, and verification |
| [Figma](https://minu-ha.github.io/agent-conventions/convention/figma/) | Reading designs, identifying intent, tracing values and copy, implementing and comparing the result |

The skills declare their dependencies explicitly.
React always activates the shared TypeScript conventions and adds CSS when styling changes.
Figma activates React and CSS according to the implementation work involved.
Testing activates TypeScript and adds React or CSS when a test harness or the implementation changes those areas.
This keeps common rules in one place while each area owns its specific decisions.

Testing conventions live under Coding. Vitest and Playwright guidance shares the same rules for scenarios, expectations and isolation.
Project-specific case IDs, folder numbering and report formats stay with the project.

## From a task to the relevant rules

An agent starts with the skill router, identifies the scope of the change and scans the complete rule index.
It then reads the contracts for the rules that apply, following links to the full explanations and examples where required.

| Document | Role |
| --- | --- |
| `SKILL.md` | Defines the skill's scope, companion activation and reading process |
| `RULES_INDEX.md` | Gives each rule's application conditions in a compact index |
| `contracts/<id>.md` | Provides the selected rule's guidance or directs the agent to the full source |
| `rules/*.md` | Contains the full rule, its rationale and code examples |

Critical and high-impact rules require the full source; medium-impact contracts include the core guidance and the first example pair.
When the task's scope changes, the agent revisits the selection.
Related rules and required companions are declared as part of the same structure.

## Explain the decision, show the difference

Each rule records when it applies, what to check and why the decision matters.
Incorrect and correct examples make the distinction concrete, including file paths, code changes and related rules where they help explain the boundary.

Examples live in separate source files and are referenced by the rules.
The correct examples are linted and type-checked with the repository's dependencies, so changes to the conventions can be checked against the code that demonstrates them.
Rule validation also checks metadata, references and declared routing relationships.

## One source for skills and documentation

The build derives agent-facing indexes and contracts, and human-facing documentation pages, from the same rule sources and example files.
A revised rule or example carries through to both views when they are rebuilt.

On the site, each skill has an overview and a page for each section.
Rule numbers follow the source file numbers, making it possible to move between a rule in the browser and its original file.
The site is built with [for-humanity](https://github.com/minu-ha/for-humanity).

## Keep the reasoning with the rules

Research notes record why the loading structure exists, how rule selection has been evaluated and what the observations do and do not establish.
Dated audits track wording, examples and gaps found during review.

Keeping these records alongside the conventions makes later changes easier to assess: the current rule has examples, and the history has the decisions and evidence behind it.

## Documentation

| Topic | Reference |
| --- | --- |
| Connect the skills and apply them to a project | [Usage](content/public/usage.md) |
| Write or revise a convention | [Rule authoring](CONTRIBUTING.md) |
| Build, validate and deploy the documentation | [Tooling](content/public/tooling.md) |
| Understand the loading design and evaluations | [Progressive loading](content/public/research/progressive-loading.md), [Design notes](content/public/research/progressive-loading-design.md) |
| Review the recorded rule audit | [Rule audit](content/public/research/rule-audit-2026-10-14.md) |
| Start a project's agent instructions | [AGENTS template](AGENTS.template.md) |

The detailed guides and rule explanations are currently written in Korean.

## License

[MIT](LICENSE) © 2026 [Minu Ha](https://github.com/minu-ha)

</div>
