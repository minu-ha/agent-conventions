# Skills Build Package

`../skill/*` 아래 structured convention skill을 build, validate, test하는 standalone TypeScript package입니다.

## Artifact Model

| Artifact | Role |
| --- | --- |
| `rules/_sections.md`, `rules/_template.md`, `rules/*.md` | Editable rule source of truth. |
| `metadata.json` | Editable build and companion activation contract. |
| `SKILL.md` | Editable activation/load router; compact for progressive skills. |
| `RULES_INDEX.md` | Progressive-only generated compact index. |
| `contracts/*.md` | Progressive-only generated selected-rule contract; never edit directly. |
| `HANDBOOK.md` | Generated full handbook; progressive rules include `Applies when`. |
| `routing-evals.json` | Progressive-only editable test oracle; never runtime context. |

`progressiveDisclosure: true`인 skill은 `RULES_INDEX.md`와 `contracts/*.md`를 생성합니다. non-progressive skill은 `SKILL.md`가 안내하는 `HANDBOOK.md`와 rule 원문을 사용합니다.

progressive rule frontmatter의 `reviewWith`는 조건부 재평가, `requiresSelected`는 source가 final Selected일 때 target도 반드시 Selected인 전이, `requiredOnCompletion: true`는 활성 skill의 완료 gate입니다. compact index에는 `completionGate` marker와 `reviewWith`만 렌더하고, 필수 target 목록은 selected/unknown contract에서만 로드해 초기 token 비용을 제한합니다. Unknown을 먼저 해소하며 N/A contract의 필수 target은 전이하지 않습니다.

`metadata.json.companions`는 progressive companion 관계를 선언합니다. `required`는 owner와 항상 활성화하고 `conditional`은 non-empty `appliesWhen`이 실제 변경 surface와 맞을 때만 활성화합니다. `metadata.json.extends`는 progressive migration 전 non-progressive skill의 recursive companion 호환 계약입니다.

공통 rule은 companion skill이 소유하고 framework/project 전용 규칙은 local overlay에 남깁니다. build 결과를 직접 편집해 overlay를 우회하지 않습니다.

## What Each Script Does

- `npm run build -- --skill=<name>` / `npm run build:<skill>`: 한 skill의 generated `HANDBOOK.md`를 갱신하고 progressive skill이면 `RULES_INDEX.md`와 `contracts/*.md`도 갱신합니다.
- `npm run build:all`: 모든 buildable skill의 generated output을 갱신합니다.
- `npm run validate -- --skill=<name>` / `npm run validate:<skill>`: source, metadata, companion closure, progressive index 입력, routing eval manifest를 검증합니다.
- `npm run validate:all`: 모든 buildable skill을 검증합니다.
- `npm run dev -- --skill=<name>` / `npm run dev:<skill>`: 같은 target에 `validate` 후 `build`를 실행합니다.
- `npm run dev:all`: 모든 skill에 `validate` 후 `build`를 실행합니다.
- `npm run check:generated -- --skill=<name>`: 파일을 수정하지 않고 한 skill과 progressive companion closure의 generated index/contract가 source와 일치하는지 확인합니다.
- `npm run check:generated:all`: 모든 progressive `RULES_INDEX.md`와 `contracts/*.md`의 missing/stale/orphan output, companion link를 확인합니다.
- `npm run check:generated:{react,css,typescript}`: progressive skill과 그 companion closure의 generated index/contract를 확인합니다.
- `npm run check:handbooks:all`: 모든 buildable skill의 generated `HANDBOOK.md`를 source renderer와 byte-for-byte 비교합니다.
- `npm run check:measurement-artifacts`: routing 산출물과 full handbook freshness를 함께 확인해 token denominator inflation을 차단합니다.
- `npm run measurement:self-test`: token context schema, exact scenario suite, path/symlink, expansion, threshold anti-gaming 회귀 테스트를 실행합니다.
- `npm run measurement:tokens`: `uv`로 `tiktoken==0.11.0`/`o200k_base` 실제 gate를 실행합니다.
- `npm run test`: CLI, build, progressive routing, `routing-evals.json`, documentation contract 회귀 테스트를 실행합니다.
- `npm run typecheck`: package source와 test를 `tsc --noEmit`으로 검사합니다.
- `npm run biome:check:all`: package source/test 형식을 검사합니다.

## Typical Workflow

```bash
npm --prefix package run validate:all
npm --prefix package run build:all
npm --prefix package run check:generated:all
npm --prefix package run check:handbooks:all
npm --prefix package run typecheck
npm --prefix package run test
npm --prefix package run biome:check:all
npm --prefix package run measurement:self-test
npm --prefix package run measurement:tokens
```

`build` 뒤의 `check:generated:all`은 generated file을 다시 쓰는 단계가 아니라 stale 여부를 검증하는 단계입니다. CI에서는 build로 dirty output을 숨기지 말고 `check:generated:all`을 별도 gate로 유지합니다.

`check:generated`는 progressive router/index/contract의 missing·stale·orphan·symlink와 recursive companion closure, non-progressive skill의 unexpected index/contract 부재를 검사합니다. full `HANDBOOK.md` freshness는 `check:handbooks:all`이 별도로 read-only 검증하며, token 측정은 두 checker를 묶은 `check:measurement-artifacts`를 자동 preflight합니다.

## Behavioral Evidence Workflow

행동 평가는 clean source commit과 digest가 채워진 protocol을 먼저 고정한 뒤 실행합니다. 일반 좌표는 coordinator가 oracle-free request와 전용 payload 경로를 no-overwrite로 만들고, fresh child가 그 payload 하나만 작성한 뒤 merge가 source·request·payload·routing 고정점을 다시 검증합니다. RTE02는 initial payload를 봉인한 다음 같은 사전 바인딩 agent target에 drift를 공개하고, staged finalizer가 두 trace와 composed virtual patch를 검증합니다.

```bash
npm --prefix package run behavioral:coordinator -- matrix --protocol=<protocol.json>
npm --prefix package run behavioral:coordinator -- prepare --protocol=<protocol.json> --head=<commit> --run-id=<id> --arm=<arm> --scenario=<id> --trial=<n> --output-dir=<runs-dir>
npm --prefix package run behavioral:coordinator -- merge --envelope=<dispatch-envelope.json> --payload=<child-payload.json> --output-dir=<runs-dir>

npm --prefix package run behavioral:staging -- prepare-initial --protocol=<protocol.json> --head=<commit> --run-id=<id> --arm=<arm> --trial=<n> --agent-target=/root/behavioral_eval_agent --output-dir=<runs-dir>
npm --prefix package run behavioral:staging -- seal-initial --envelope=<initial-envelope.json> --payload=<initial-child-payload.json> --agent-target=/root/behavioral_eval_agent --output-dir=<runs-dir>
npm --prefix package run behavioral:staging -- prepare-followup --initial-envelope=<initial-envelope.json> --initial-seal=<initial-seal.json> --output-dir=<runs-dir>
npm --prefix package run behavioral:staging -- merge-staged --initial-envelope=<initial-envelope.json> --initial-seal=<initial-seal.json> --followup-envelope=<followup-envelope.json> --initial-payload=<initial-child-payload.json> --drift-payload=<drift-child-payload.json> --agent-target=/root/behavioral_eval_agent --output-dir=<runs-dir>
npm --prefix package run behavioral:staging -- finalize-staged --initial-envelope=<initial-envelope.json> --initial-seal=<initial-seal.json> --followup-envelope=<followup-envelope.json> --combined-payload=<combined-child-payload.json> --merge-provenance=<staged-merge-provenance.json> --output-dir=<runs-dir>
```

34개 candidate run이 immutable해진 뒤 semantic audit은 30개 regular merge와 4개 staged finalize를 fresh temp directory에서 재생해 run JSON byte equality를 먼저 확인합니다. 그 다음 committed criteria로 만든 8개 opaque batch를 각각 fresh reviewer에게 보내고, candidate 34/34 PASS·negative control 8/8 탐지·FAIL 0·UNKNOWN 0일 때만 aggregate가 통과합니다.

```bash
npm --prefix package run behavioral:semantic-audit -- commit-criteria --criteria=<criteria.json> --commitment=<commitment.json> --skill-root=<skill-root> --protocol=<protocol.json>
npm --prefix package run behavioral:semantic-audit -- matrix --criteria=<criteria.json> --commitment=<commitment.json> --runs-dir=<runs-dir> --skill-root=<skill-root> --protocol=<protocol.json> --output=<matrix.json>
npm --prefix package run behavioral:semantic-audit -- prepare --matrix=<matrix.json> --batch=<opaque-id> --output-dir=<semantic-dir> --skill-root=<skill-root> --protocol=<protocol.json>
npm --prefix package run behavioral:semantic-audit -- merge --envelope=<review-envelope.json> --payload=<reviewer-payload.json> --output-dir=<semantic-dir> --skill-root=<skill-root> --protocol=<protocol.json>
npm --prefix package run behavioral:semantic-audit -- aggregate --matrix=<matrix.json> --results-dir=<semantic-dir> --skill-root=<skill-root> --protocol=<protocol.json> --output=<aggregate.json>
```

child와 reviewer의 `declaredLoadedFiles`는 선언 telemetry입니다. exact served model build, 실제 reasoning setting, observed file reads, agent token usage, 플랫폼 차원의 fresh/same-agent attestation은 현재 API로 관측할 수 없으므로 결과 보고서에서도 관측 사실처럼 표현하지 않습니다.

## Buildable Loading Topology

| Skill | Loading | Companion contract |
| --- | --- | --- |
| `astro` | non-progressive | extends `typescript`, `css` |
| `react` | progressive | required `typescript`; conditional `css` |
| `css` | progressive | conditional `typescript` |
| `figma-visual-parity` | non-progressive | extends `react`, `css`, `playwright-test` |
| `nestjs` | non-progressive | extends `typescript` |
| `playwright-test` | non-progressive | extends `typescript` |
| `tanstack-route` | non-progressive | extends `typescript` |
| `typescript` | progressive | none |

Progressive skill은 `SKILL.md` → activated `RULES_INDEX.md` 전체 scan과 completion gate → Selected/Unknown `contracts/*.md` → CRITICAL 또는 판정 근거가 필요한 `rules/*.md` full expansion → Unknown 해소 → final Selected의 `requiresSelected` closure 순서로 소비합니다. 새 selection이나 companion이 생기면 고정점까지 반복합니다. non-progressive structured skill은 각자의 `SKILL.md`가 기존 full-handbook 계약을 결정합니다. legacy single-document `java`는 structured build pipeline에서 의도적으로 제외합니다.

progressive owner는 `extends` 대신 `companions`를 사용하고 companion target도 progressive여야 합니다. non-progressive owner의 legacy `extends`와 local `HANDBOOK.md` 계약은 계속 지원합니다.

## Per-Skill Aliases

- `astro`
- `react`
- `css`
- `figma-visual-parity`
- `nestjs`
- `playwright-test`
- `tanstack-route`
- `typescript`

예시:

```bash
npm --prefix package run validate:react
npm --prefix package run build:react
npm --prefix package run check:generated:react
```
