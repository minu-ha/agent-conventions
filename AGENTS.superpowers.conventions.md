# AGENTS.superpowers.conventions.md

이 문서는 다른 프로젝트로 복사해 사용할 수 있는 `AGENTS.md` 예시입니다.
이 저장소의 실제 루트 `AGENTS.md`를 대체하지 않습니다.

## Purpose

- 이 프로젝트는 workflow orchestration에 `superpowers`를 사용합니다.
- 코드 구조, 경계, 스타일, 테스트 규칙은 `agent-conventions` pack의 convention skill을 사용합니다.
- 이 문서는 workflow skill과 convention skill을 함께 적용하는 공통 파이프라인을 정의합니다.
- 이 문서는 strong policy 예시입니다. workflow와 convention은 둘 다 완전 준수를 기본값으로 합니다.
- 목표는 `superpowers`의 relevant skill을 가능한 한 전부 라우팅하고, convention skill 준수까지 강제하는 것입니다.
- 모든 skill을 무조건 한 번씩 호출하는 것이 목적은 아닙니다. 요청 유형에 맞는 skill을 빠짐없이 타게 하는 것이 목적입니다.

## Assumption

- 대화 시작 시에는 항상 `using-superpowers` 원칙을 따른다고 가정합니다.
- `superpowers`는 필수 workflow pack입니다.
- 프로젝트는 `agent-conventions` pack을 필수로 사용한다고 가정합니다.
- `superpowers`가 없으면 구현 전에 먼저 fetch/install 가능 여부를 확인하고, 필요하면 사용자 승인 후 준비합니다.
- required workflow pack이 준비되기 전에는 구현을 시작하지 않습니다.
- subagent를 사용할 수 있으면 subagent workflow를 우선합니다.
- subagent를 사용할 수 없으면 동일한 review gate를 수동으로라도 유지합니다.

## Model Policy

- 이 문서는 subagent 품질을 위해 지나치게 약한 모델 사용을 금지합니다.
- 기본 모델 floor는 frontier-capable model + `medium` reasoning입니다.
- mini/economy-class subagent는 구현, 디버깅, 리뷰, 검증 task에 사용하지 않습니다.
- 역할별 기본값은 아래를 따릅니다.
  - 기계적 구현, 1~2파일 수준, 명확한 spec: frontier model + `medium`
  - 다중 파일 구현, 통합 변경, refactor, debugging, 상태/라우팅/계약 변경: frontier model + `high`
  - spec reviewer: frontier model + `high`
  - code quality reviewer: frontier model + `high`
  - final reviewer, architecture judgment, 반복 실패 task, ambiguous bug: frontier model + `xhigh`
- 플랫폼이 모델이나 reasoning override를 지원하지 않으면, 더 약한 subagent로 억지 위임하지 말고 메인 에이전트가 직접 수행합니다.
- subagent가 reasoning 부족으로 `BLOCKED` 또는 `NEEDS_CONTEXT`를 반환하면 같은 약한 설정으로 재시도하지 말고 더 강한 모델 또는 더 높은 reasoning으로 재디스패치합니다.

## Superpowers Coverage

- `using-superpowers`: 모든 대화 시작 시 skill discovery와 적용 강제
- `brainstorming`: 기능 추가, 동작 변경, 구조 변경, 새 UI/새 흐름 설계
- `systematic-debugging`: 버그, 실패 테스트, 예상과 다른 동작
- `receiving-code-review`: 리뷰 피드백 반영 전에 검증
- `writing-skills`: skill, AGENTS, workflow, process 문서 자체를 수정할 때
- `writing-plans`: multi-step 구현 plan 작성
- `using-git-worktrees`: 큰 작업, 고위험 변경, 격리가 필요한 작업
- `test-driven-development`: 기능 구현과 버그 수정의 기본 구현 방식
- `dispatching-parallel-agents`: 독립 failure나 독립 조사 대상이 여러 개일 때
- `subagent-driven-development`: subagent 사용 가능 + independent task가 있는 구현의 기본 실행 방식
- `executing-plans`: plan은 있지만 subagent를 쓸 수 없거나 separate execution이 필요한 경우
- `requesting-code-review`: major change, major feature, merge 전, complex bugfix 후
- `verification-before-completion`: 완료 주장 전 항상 적용
- `finishing-a-development-branch`: 구현과 검증이 모두 끝난 뒤 branch 마무리

## Agent-Conventions Coverage

- `convention-astro`: Astro route adapter, rendering mode, island hydration, content collections, Actions/endpoints, frontmatter/docs 규칙
- `convention-react`: React 컴포넌트, TSX 렌더링 흐름, 화면 구조
- `convention-css`: 스타일, `className`, CSS 구조, selector, token 사용
- `convention-typescript`: 공통 TypeScript 규칙, 타입 계약, helper 분리, JSDoc
- `convention-tanstack-route`: route, navigation, search param, route-local 구조
- `convention-playwright-test`: Playwright integration/e2e 테스트
- `convention-nestjs`: NestJS module, controller, service, DTO, backend layering
- `convention-springboot`: Spring Boot 기반 backend convention

이 문서는 위 skill 중 요청과 직접 관련된 skill만 선택해 적용하는 것을 전제로 합니다.

## Request Router

- skill, AGENTS, process, workflow 문서 수정:
  - `writing-skills`
- 기능 추가, 동작 변경, UI 변경, 구조 변경:
  - `brainstorming`
- 버그, 실패 테스트, 예상과 다른 동작:
  - `systematic-debugging`
- 코드 리뷰 피드백 반영:
  - `receiving-code-review`
- 이미 승인된 plan이 있는 다단계 작업:
  - subagent 가능: `subagent-driven-development`
  - subagent 불가: `executing-plans`

## Convention Selection

- 구현 전에 이번 요청에 적용할 `agent-conventions` skill을 먼저 고릅니다.
- 변경 표면과 작업 단계에 직접 관련된 skill만 선택합니다.
- framework rule과 공통 언어 rule이 분리돼 있다면 companion convention skill을 함께 적용합니다.
- 각 activated skill은 먼저 자신의 `SKILL.md` load 계약을 따릅니다.
- 기본 선택 예시는 아래와 같습니다.
  - Astro page/route/rendering/content 변경: `convention-astro` + `convention-typescript` + `convention-css`
  - Astro + React island/TSX 변경: `convention-astro` + `convention-react` + `convention-typescript` + `convention-css`
  - Astro hydration/form/server 흐름을 브라우저에서 검증: `convention-astro` + 필요 시 `convention-playwright-test`
  - React/TSX/UI 상태 변경: `convention-react` + `convention-typescript`
  - 스타일, CSS, `className` 변경: 위 선택에 `convention-css` 추가
  - route/search/navigation 변경: `convention-tanstack-route` + 필요 시 `convention-typescript`
  - Playwright 테스트 변경: `convention-playwright-test` + 필요 시 관련 companion skill
  - NestJS backend 변경: `convention-nestjs` + `convention-typescript`
  - Spring Boot backend 변경: `convention-springboot`

framework/project 고유 규칙은 해당 skill이나 consuming project의 project-local overlay가 소유합니다. 이 공통 template에 Astro route/class naming 같은 rule body를 복제하지 않습니다.

## Progressive Convention Consumer Contract

아래 표는 progressive React/TypeScript/CSS skill에만 적용합니다. non-progressive owner는 자신의 `SKILL.md`가 지정한 local `AGENTS.md`/rule body 계약을 유지합니다.

| Surface or stage | Required contract |
| --- | --- |
| Activated skill | Follow its own `SKILL.md` load contract. |
| Non-progressive owner | Use the local `AGENTS.md` / rule bodies required by that `SKILL.md`. |
| TSX | Activate `convention-react` + `convention-typescript`. |
| `className` / CSS / styling surface | Add `convention-css`. |
| Activated progressive skill | Scan every activated `RULES_INDEX.md` completely; never stop at the first match. |
| Selected guidance | Read the `contracts/*.md` of every applicable rule; CRITICAL contracts require their full `rules/*.md`. |
| `completionGate` | Apply every marked entry in each activated progressive skill at finish. |
| `requiresSelected` closure | Apply every target too, and activate its companion when the target lives in another skill. |
| `reviewWith` closure | Re-judge every target against the changed surface; do not apply it automatically. |
| Repeat | Rescan the activated indexes whenever a new rule, companion, or surface comes into play; stop when nothing new applies. |
| Full rule expansion | Expand non-CRITICAL full rules when exact syntax or an exception call needs the examples. |
| Progressive full handbook | React/TypeScript/CSS `AGENTS.md` is opt-in, never default-loaded. |
| Scope drift | Restart activation and rescan every activated progressive index. |
| Completion | Re-read the diff against the applied rules and report violations with file/line and a fix. |

## Progressive Activation Matrix

확장자만으로 결정하지 않고 실제 ownership과 changed surface를 기준으로 아래 closure를 적용합니다. 파일 이동 안의 의미가 같은 선언·본문·class·value는 diff에 삭제+추가로 보여도 별도 내용 변경으로 다시 세지 않고, N/A rule의 optional pattern을 새로 도입해 스스로 활성화하지 않습니다. 요청을 충족하는 최소 semantic patch를 유지합니다.

| Changed surface | Activate |
| --- | --- |
| Pure TypeScript / type / schema / helper / API / config | `convention-typescript` |
| Pure CSS / selector / token / stylesheet | `convention-css` |
| React `.ts` hook / ownership | `convention-react` + `convention-typescript` |
| TSX | `convention-react` + `convention-typescript` |
| TSX `className` / style import / styling surface | `convention-react` + `convention-typescript` + `convention-css` |
| TSX owner 이동에 기존 `className` / style import가 byte-equivalent로 따라오기만 함 | `convention-react` + `convention-typescript`; CSS 비활성 |

Pure CSS는 TypeScript를 자동 활성화하지 않고, pure TypeScript는 React/CSS를 자동 활성화하지 않습니다.

## Project-local Overlay Contract

- 공통 rule body를 복제하지 않습니다.
- 프로젝트 디렉터리/owner/허용 파일/금지 영역만 추가합니다.
- 실제 build/lint/test/browser 명령과 generated-file 보호를 추가합니다.
- scoped exception은 근거와 제거 조건을 함께 적습니다.
- 공통 convention과 충돌하면 약화하지 않고 명시적으로 보고합니다.

## Workflow Pipeline

### Stage 0. Skill Bootstrap

- 대화 시작 시 `using-superpowers` 원칙에 따라 relevant skill을 먼저 찾고 적용합니다.
- relevant skill 확인 전에는 바로 구현하지 않습니다.

### Stage 1. Workflow Availability

- `superpowers`와 required `agent-conventions` skill을 실제로 사용할 수 있는지 먼저 확인합니다.
- 하나라도 없으면 fetch/install 또는 연결 여부를 먼저 정리합니다.
- required pack이 준비되기 전에는 구현하지 않습니다.

### Stage 2. Request Framing

- 구현 전에 요청의 목표, 제약, 완료조건, 변경 표면을 정리합니다.
- 기능/동작 변경 요청은 먼저 `brainstorming`으로 요구사항과 설계를 정리합니다.
- 버그 수정은 먼저 `systematic-debugging`으로 재현과 원인 가설을 정리합니다.
- 리뷰 피드백 반영은 먼저 `receiving-code-review` 원칙으로 검증합니다.
- skill/process 문서 수정은 먼저 `writing-skills` 원칙으로 범위와 목적을 정리합니다.

### Stage 3. Convention Selection

- 적용할 `agent-conventions` skill을 먼저 확정합니다.
- 어떤 convention skill을 적용할지 정하기 전에는 구현하지 않습니다.
- 완료조건은 확인 가능한 문장으로 정리합니다.
- TSX는 `convention-react`와 `convention-typescript`를 함께 활성화합니다.
- `className`, CSS, styling surface가 있으면 `convention-css`를 추가합니다.
- owner의 `metadata.json.companions`에서 `required`는 항상, `conditional`은 실제 surface가 `appliesWhen`과 맞을 때 활성화합니다.
- non-progressive skill은 기존 `extends`와 자신의 `SKILL.md` load 계약을 유지합니다.

### Stage 4. Context Collection

- 관련 코드, 테스트, 기존 구현 패턴, 인접 경계를 확인합니다.
- 변경 근거가 되는 파일과 검증 포인트를 먼저 확보합니다.
- 각 activated skill의 `SKILL.md`를 먼저 읽습니다.
- activated progressive skill마다 `RULES_INDEX.md`를 끝까지 훑고 첫 match에서 멈추지 않습니다.
- 각 activated index의 `completionGate` 규칙은 마무리 시 항상 적용합니다.
- 걸리는 규칙의 generated contract를 읽고, CRITICAL이거나 정확한 판단이 더 필요하면 full rule로 확장합니다.
- `requiresSelected` target은 함께 적용하고, 다른 skill의 규칙이면 그 companion도 활성화합니다.
- `reviewWith` target은 변경 범위에 비춰 다시 판단하되 자동으로 적용하지는 않습니다.
- 규칙·companion·새 surface가 걸리면 activated index를 다시 훑고, 더 걸리는 게 없으면 멈춥니다.
- progressive React/TypeScript/CSS full `AGENTS.md`는 전체 handbook이 명시적으로 필요한 경우에만 opt-in합니다.
- non-progressive owner가 `SKILL.md`에서 local `AGENTS.md` 전체를 요구하면 그 계약을 따릅니다.

### Stage 5. Planning and Isolation

- 기능 추가, 구조 변경, cross-file 변경, review 중요도가 높은 작업은 먼저 `writing-plans`를 사용합니다.
- 큰 작업, 고위험 변경, 오래 걸리는 작업은 먼저 `using-git-worktrees`를 사용해 격리된 workspace를 확보합니다.
- 작성된 plan이 있고 subagent를 사용할 수 있으면 `subagent-driven-development`를 기본 실행 방식으로 사용합니다.
- 작성된 plan은 있지만 subagent를 사용할 수 없으면 `executing-plans`를 사용하되, spec review와 code quality review gate는 생략하지 않습니다.
- 기능 구현과 버그 수정은 기본적으로 `test-driven-development`를 적용합니다.
- 여러 independent failure나 조사 대상이 있으면 `dispatching-parallel-agents`를 사용합니다.
- subagent 모델 선택은 위 `Model Policy`의 floor와 역할별 기본값을 따릅니다.

### Stage 6. Implementation

- 필요한 파일만 수정합니다.
- 생성 산출물은 직접 수정하지 않습니다.
- 구현 중에도 선택한 convention skill을 계속 기준으로 사용합니다.
- plan이 있다면 task 단위 완료조건을 유지합니다.
- changed file, surface, companion activation, applicable rule에 scope drift가 생기면 Stage 3으로 돌아가 모든 activated progressive index를 다시 scan합니다.

### Stage 7. Review Loop

- `subagent-driven-development`를 쓰는 경우 각 task는 아래 순서를 반드시 통과합니다.
  - implementer
  - spec review
  - code quality review
  - 이슈 수정
  - re-review
- 중요한 변경, major feature, complex bugfix 뒤에는 추가로 `requesting-code-review`를 사용합니다.
- 리뷰 피드백을 받으면 `receiving-code-review` 원칙에 따라 검증 후 반영합니다.
- Critical 또는 Important 이슈를 남긴 채 다음 단계로 진행하지 않습니다.
- spec review가 pass되기 전에는 code quality review로 넘어가지 않습니다.
- review가 open 상태면 task 완료로 간주하지 않습니다.
- reviewer subagent는 `Model Policy`의 reviewer floor 아래로 내리지 않습니다.

### Stage 8. Verification

- 완료를 주장하기 전에 항상 `verification-before-completion`을 적용합니다.
- 검증 명령은 추정하지 말고 실제로 실행합니다.
- agent 보고만으로 완료 처리하지 않습니다.
- 실행한 검증과 미실행 검증을 구분합니다.

### Stage 9. Convention Review

- 완료 전에 변경 diff를 적용한 규칙에 비춰 다시 훑습니다.
- 위반은 file/line과 수정안으로 보고하고, 고친 뒤 다시 확인합니다.
- 자동 검사 결과는 evidence일 뿐 컨벤션을 지켰다는 증명이 아닙니다.
- 판단이 서지 않는 항목은 넘기지 말고 무엇이 불확실한지 함께 보고합니다.
- convention 예외는 기본 금지이며, 예외가 필요하면 근거와 제거 조건을 함께 남깁니다.

### Stage 10. Completion

- 구현과 검증이 끝나면 `finishing-a-development-branch`를 사용해 merge, PR, cleanup 중 무엇을 할지 결정합니다.

## Gates

- bootstrap stage에서 relevant skill 확인 없이 구현하지 않습니다.
- required workflow pack 또는 required `agent-conventions` skill이 없는데도 진행하지 않습니다.
- `Model Policy` floor 아래 모델로 subagent를 dispatch하지 않습니다.
- 요청 정리와 convention selection 없이 구현하지 않습니다.
- plan이 필요한 작업은 execution strategy를 정하기 전에는 구현하지 않습니다.
- review 미통과 상태로 다음 task나 완료 단계로 넘어가지 않습니다.
- fresh verification 없이 완료 처리하지 않습니다.
- scope drift 뒤 이전 판정을 그대로 재사용하지 않습니다.
- 컨벤션 위반을 문서화만 하고 종료하지 않습니다.
- spec review 또는 code quality review를 생략하고 완료 처리하지 않습니다.

## Final Report

- 무엇을 바꿨는지 적습니다.
- 적용한 `superpowers` workflow skill을 적습니다.
- 적용한 `agent-conventions` skill을 적습니다.
- 어떤 `superpowers` skill이 왜 선택되었는지 적습니다.
- 실행한 검증 명령과 결과를 적습니다.
- 자동 검사와 수동 확인을 구분합니다.
- 남은 리스크와 미실행 항목을 구분합니다.
- 예외가 있으면 근거와 제거 조건을 적습니다.
