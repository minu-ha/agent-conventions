# Build Tooling

`skill/*` 아래 structured convention skill을 build, validate, test하는 저장소 루트 `package.json`의 TypeScript 도구입니다. 소스는 `src/`, 테스트는 `test/`입니다.

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

## Scripts

| Script | Does |
| --- | --- |
| `npm run validate` | source, metadata, companion closure, progressive index 입력, routing eval manifest, 규칙 문체를 검사합니다. `-- --skill=<name>`으로 하나만 봅니다. |
| `npm run build` | 모든 buildable skill의 `HANDBOOK.md`, `RULES_INDEX.md`, `contracts/*.md`를 다시 쓰고 `site/`에 [for-humanity](https://github.com/minu-ha/for-humanity) Markdown을 생성합니다. `site/`는 커밋하지 않습니다. |
| `npm run check` | `validate`, `check:generated`, `check:handbooks`, `check:diagrams`, `typecheck`, `lint`, `test`를 차례로 실행합니다. 커밋 전 한 번에 돌리는 명령입니다. |
| `npm run check:generated` | 파일을 수정하지 않고 progressive `RULES_INDEX.md`와 `contracts/*.md`의 missing, stale, orphan, symlink와 companion closure를 확인합니다. |
| `npm run check:handbooks` | 모든 `HANDBOOK.md`를 renderer 결과와 byte 단위로 비교합니다. |
| `npm run check:diagrams` | 규칙의 `mermaid` 흐름도가 격자 폭 125칸 안에 그려지는지 봅니다. |
| `npm run dev` | `build` 후 for-humanity 개발 서버를 띄웁니다. 포트는 `site/for-humanity.config.mjs`의 `port`입니다. |
| `npm run site:build` | `build` 후 `site/dist`에 배포용 정적 사이트를 만듭니다. |
| `npm run test` | CLI, build, progressive routing, `routing-evals.json`, 사이트 생성 회귀 테스트를 실행합니다. |
| `npm run lint`, `npm run lint:fix` | Biome 검사와 자동 수정입니다. |
| `npm run typecheck` | `tsc --noEmit`입니다. |

`build` 뒤의 `check:generated`는 generated file을 다시 쓰는 단계가 아니라 stale 여부를 검증하는 단계입니다. CI에서는 build로 dirty output을 숨기지 말고 `check`를 gate로 둡니다.

## Buildable Loading Topology

| Skill | Loading | Companion contract |
| --- | --- | --- |
| `react` | progressive | required `typescript`; conditional `css` |
| `css` | progressive | conditional `typescript` |
| `typescript` | progressive | none |
| `figma` | progressive | conditional `react`, `css` |

Progressive skill은 `SKILL.md` → activated `RULES_INDEX.md` 전체 scan과 completion gate → Selected/Unknown `contracts/*.md` → CRITICAL 또는 판정 근거가 필요한 `rules/*.md` full expansion → Unknown 해소 → final Selected의 `requiresSelected` closure 순서로 소비합니다. 형태를 정하는 규칙은 원문의 `Correct` 예제도 읽습니다. 새 selection이나 companion이 생기면 고정점까지 반복합니다. 현재 제공하는 skill은 위 표의 네 가지입니다.

progressive owner는 `extends` 대신 `companions`를 사용하고 companion target도 progressive여야 합니다. non-progressive owner의 legacy `extends`와 local `HANDBOOK.md` 계약은 계속 지원합니다.

`routing-evals.json`과 회귀 테스트는 예상 선택 목록, 필수 규칙 관계, 전체 규칙의 적용 사례 유무를 검사합니다.
이 검사를 통과해도 실제 에이전트의 선택 정확도가 인증되는 것은 아닙니다.
적용 조건을 바꿀 때는 비적용 사례도 검토하고, 행동 평가를 했다면 사용한 모델·입력·결과를 별도로 기록합니다.
