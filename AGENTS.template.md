# AGENTS.template.md

> **다른 프로젝트의 `AGENTS.md` 로 복사할 템플릿.**
> 아래 `---` 밑을 통째로 복사하고, 맨 끝 `프로젝트 로컬 규칙` 만 채울 것.
> 규칙 본문은 복사하지 않음 — 정본은 `agent-conventions` skill.

## 목차

- [복사 방법](#복사-방법)
- [템플릿 본문](#템플릿-본문)
- [workflow pack 을 함께 쓸 때](#workflow-pack-을-함께-쓸-때)

## 복사 방법

| 단계 | 할 일 |
| --- | --- |
| 1 | `skill/` 을 `~/.agents/skills/conventions` 로 symlink |
| 2 | 아래 `---` 밑 전체를 프로젝트 `AGENTS.md` 로 복사 |
| 3 | `프로젝트 로컬 규칙` 항목을 실제 값으로 채움 |
| 4 | 에이전트 재시작 |

설치 절차는 [ONBOARDING.md](./ONBOARDING.md) 참고.

---

## 템플릿 본문

### Convention

- 규칙 정본은 `agent-conventions` skill. 이 문서에 규칙 본문을 복사하지 않음
- 구현 전 활성화한 skill 의 `SKILL.md` 를 먼저 읽고 그 load 계약을 따름

### Activation

판정 기준은 **이번 작업에서 실제로 바꾼 것**.

| 바꾼 것 | 활성화 |
| --- | --- |
| TSX | `convention-react` + `convention-typescript` |
| TSX 의 `className` · style import · styling surface | 위 + `convention-css` |
| React `.ts` hook · ownership | `convention-react` + `convention-typescript` |
| 순수 TypeScript — type · schema · API · helper · config | `convention-typescript` |
| 순수 CSS — stylesheet · selector · token | `convention-css` |

- 추가·삭제·이동·이름 변경·재선언 = 변경
- diff 의 read-only 문맥, owner 이동에 그대로 딸려온 type·import·`className` = 변경 아님
- 이름·shape·동작이 같은 이동은 diff 에 삭제+추가로 보여도 다시 세지 않음
- 순수 CSS 는 TypeScript 를 자동 활성화하지 않음
- 적용되지 않는 규칙의 optional pattern 을 새로 들여와 범위를 넓히지 않음

### Loading

- activated skill 마다 `RULES_INDEX.md` 를 **끝까지** 훑음. 첫 match 에서 멈추지 않음
- 애매하면 적용되는 쪽으로 판단
- 걸리는 규칙의 `contracts/*.md` 를 읽음
- `CRITICAL` 이면 `rules/*.md` 원문 필수. 정확한 문법·예외 판단이 필요할 때도 원문으로 확장
- full `HANDBOOK.md` 는 기본 로드하지 않음. 전체 검토가 명시적으로 필요할 때만

| routing 키 | 동작 |
| --- | --- |
| `requiresSelected` | 함께 적용. 다른 skill 이면 그 companion 도 활성화 |
| `reviewWith` | 재판단만. 자동 적용 아님. 역방향 추론 금지 |
| `completionGate` | 마무리 시 항상 적용 |

규칙·companion·새 surface 가 걸리면 index 를 다시 훑음. 더 걸리는 게 없으면 멈춤.

### 범위 변경

작업 중 범위가 늘거나 바뀌면 Activation 부터 다시 판정하고 index 를 다시 훑음.
이전 판정을 그대로 재사용하지 않음.

### 마무리

- 변경 diff 를 적용한 규칙에 비춰 다시 훑고, 위반은 file/line 과 수정안으로 보고
- lint · typecheck · build · 테스트 통과는 근거 자료일 뿐 컨벤션 준수의 증명이 아님
- 판단이 서지 않는 항목은 넘기지 말고 무엇이 불확실한지 함께 보고
- 컨벤션 위반을 문서화만 하고 종료하지 않음

### 프로젝트 로컬 규칙

> 여기부터는 이 프로젝트에만 해당하는 내용. 공통 규칙을 복사하지 말 것.

- **owner 와 디렉터리 경계** —
- **허용 파일과 변경 금지 영역** —
- **generated file 보호** —
- **검증 명령** — build:  lint:  typecheck:  test:  browser:
- **프로젝트 고유 API · naming · 예외** — (예외는 근거와 제거 조건을 함께)

---

## workflow pack 을 함께 쓸 때

`superpowers` 같은 외부 workflow pack 은 선택. 이 저장소의 convention skill 은
그것 없이도 동작함. 함께 쓴다면 위 템플릿 아래에 이 단계를 덧붙일 것.

| 단계 | skill |
| --- | --- |
| 작업 시작 | `brainstorming` — 요구사항과 설계를 먼저 정리 |
| 계획 | `writing-plans` → `executing-plans` |
| 병렬 작업 | `dispatching-parallel-agents` · `subagent-driven-development` |
| 구현 | `test-driven-development` |
| 디버깅 | `systematic-debugging` |
| 리뷰 | `requesting-code-review` · `receiving-code-review` |
| 완료 전 | `verification-before-completion` |
| 마무리 | `finishing-a-development-branch` |

프로젝트 `AGENTS.md` 가 특정 skill 이름을 직접 참조한다면 그 pack 설치를
전제로 명시해 둘 것.
