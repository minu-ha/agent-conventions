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
| `AGENTS.md` | Generated full handbook; opt-in for progressive React/TypeScript/CSS. |
| `routing-evals.json` | Progressive-only editable test oracle; never runtime context. |

`progressiveDisclosure: true`인 skill은 `RULES_INDEX.md`와 `contracts/*.md`를 생성합니다. non-progressive skill은 `SKILL.md`가 안내하는 `AGENTS.md`와 rule 원문을 사용합니다. `convention-audit`는 local 8-rule `AGENTS.md` 전체를 읽고 progressive companion만 index/contract로 라우팅합니다.

`metadata.json.companions`는 progressive companion 관계를 선언합니다. `required`는 owner와 항상 활성화하고 `conditional`은 non-empty `appliesWhen`이 실제 변경 surface와 맞을 때만 활성화합니다. `metadata.json.extends`는 progressive migration 전 non-progressive skill의 recursive companion 호환 계약입니다.

공통 rule은 companion skill이 소유하고 framework/project 전용 규칙은 local overlay에 남깁니다. build 결과를 직접 편집해 overlay를 우회하지 않습니다.

## What Each Script Does

- `npm run build -- --skill=<name>` / `npm run build:<skill>`: 한 skill의 generated `AGENTS.md`를 갱신하고 progressive skill이면 `RULES_INDEX.md`와 `contracts/*.md`도 갱신합니다.
- `npm run build:all`: 모든 buildable skill의 generated output을 갱신합니다.
- `npm run validate -- --skill=<name>` / `npm run validate:<skill>`: source, metadata, companion closure, progressive index 입력, routing eval manifest를 검증합니다.
- `npm run validate:all`: 모든 buildable skill을 검증합니다.
- `npm run dev -- --skill=<name>` / `npm run dev:<skill>`: 같은 target에 `validate` 후 `build`를 실행합니다.
- `npm run dev:all`: 모든 skill에 `validate` 후 `build`를 실행합니다.
- `npm run check:generated -- --skill=<name>`: 파일을 수정하지 않고 한 skill과 progressive companion closure의 generated index/contract가 source와 일치하는지 확인합니다.
- `npm run check:generated:all`: 모든 progressive `RULES_INDEX.md`와 `contracts/*.md`의 missing/stale/orphan output, companion link를 확인합니다.
- `npm run check:generated:{react,css,typescript}`: progressive skill과 그 companion closure의 generated index/contract를 확인합니다.
- `npm run check:handbooks:all`: 모든 buildable skill의 generated `AGENTS.md`를 source renderer와 byte-for-byte 비교합니다.
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

`check:generated`는 progressive router/index/contract의 missing·stale·orphan·symlink와 recursive companion closure, non-progressive skill의 unexpected index/contract 부재를 검사합니다. full `AGENTS.md` freshness는 `check:handbooks:all`이 별도로 read-only 검증하며, token 측정은 두 checker를 묶은 `check:measurement-artifacts`를 자동 preflight합니다.

## Buildable Loading Topology

| Skill | Loading | Companion contract |
| --- | --- | --- |
| `astro` | non-progressive | extends `typescript`, `css` |
| `react` | progressive | required `typescript`; conditional `css` |
| `css` | progressive | conditional `typescript` |
| `convention-audit` | non-progressive local | conditional `react`, `typescript`, `css` |
| `figma-visual-parity` | non-progressive | extends `react`, `css`, `playwright-test` |
| `nestjs` | non-progressive | extends `typescript` |
| `playwright-test` | non-progressive | extends `typescript` |
| `tanstack-route` | non-progressive | extends `typescript` |
| `typescript` | progressive | none |

Progressive skill은 `SKILL.md` → activated `RULES_INDEX.md` 전체 scan → Selected/Unknown `contracts/*.md` → CRITICAL 또는 근거가 필요한 `rules/*.md` full expansion 순서로 소비합니다. non-progressive structured skill은 각자의 `SKILL.md`가 기존 full-handbook 계약을 결정합니다. legacy single-document `java`는 structured build pipeline에서 의도적으로 제외합니다.

progressive owner는 `extends` 대신 `companions`를 사용하고 companion target도 progressive여야 합니다. non-progressive owner의 legacy `extends`와 local `AGENTS.md` 계약은 계속 지원합니다.

## Per-Skill Aliases

- `astro`
- `react`
- `css`
- `convention-audit`
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
