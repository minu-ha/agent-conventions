# AGENTS.superpowers.md

이 문서는 다른 프로젝트로 복사해 사용할 수 있는 `AGENTS.md` 예시입니다.
이 저장소의 실제 루트 `AGENTS.md`를 대체하지 않습니다.

## Purpose

- 이 프로젝트는 workflow orchestration에 `superpowers`를 사용합니다.
- 이 문서는 작업 순서, 리뷰 루프, 검증 게이트를 정의합니다.
- 구현 세부 규칙은 프로젝트 자체 규칙이나 별도 skill pack이 있으면 그 문서를 따릅니다.
- 목표는 `superpowers`의 relevant skill을 적재적소에 모두 사용하는 것입니다.
- 모든 skill을 무조건 한 번씩 호출하는 것이 목적은 아닙니다. 요청 유형에 맞는 skill을 빠짐없이 라우팅하는 것이 목적입니다.

## Assumption

- 대화 시작 시에는 항상 `using-superpowers` 원칙을 따른다고 가정합니다.
- 이 문서는 `superpowers`를 사용하는 프로젝트를 전제로 합니다.
- `superpowers`가 없으면 구현 전에 먼저 fetch/install 가능 여부를 확인하고, 필요하면 사용자 승인 후 준비합니다.
- subagent를 사용할 수 있으면 subagent workflow를 우선합니다.
- subagent를 사용할 수 없으면 동일한 게이트를 수동으로 유지합니다.

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

## Workflow Pipeline

### Stage 0. Skill Bootstrap

- 대화 시작 시 `using-superpowers` 원칙에 따라 relevant skill을 먼저 찾고 적용합니다.
- relevant skill 확인 전에는 바로 구현하지 않습니다.

### Stage 1. Workflow Availability

- `superpowers`를 실제로 사용할 수 있는지 먼저 확인합니다.
- 없으면 workflow pack을 fetch/install할지 먼저 결정합니다.
- workflow pack이 준비되기 전에는 이 문서 기준의 full pipeline compliance를 주장하지 않습니다.

### Stage 2. Request Framing

- 구현 전에 요청의 목표, 제약, 완료조건, 변경 표면을 정리합니다.
- 기능/동작 변경 요청은 먼저 `brainstorming`으로 요구사항과 설계를 정리합니다.
- 버그 수정은 먼저 `systematic-debugging`으로 재현과 원인 가설을 정리합니다.
- 리뷰 피드백 반영은 먼저 `receiving-code-review` 원칙으로 검증합니다.
- skill/process 문서 수정은 먼저 `writing-skills` 원칙으로 범위와 목적을 정리합니다.

### Stage 3. Context Collection

- 관련 코드, 테스트, 기존 구현 패턴, 인접 경계를 확인합니다.
- 변경 근거가 되는 파일과 검증 포인트를 먼저 확보합니다.

### Stage 4. Planning and Isolation

- 작업이 여러 단계이거나 independent task로 분리 가능하면 먼저 `writing-plans`를 사용합니다.
- 변경 격리와 안전성이 중요하면 먼저 `using-git-worktrees`를 사용합니다.
- 작성된 plan이 있고 subagent를 사용할 수 있으면 `subagent-driven-development`를 사용합니다.
- 작성된 plan은 있지만 subagent를 사용할 수 없으면 `executing-plans`를 사용합니다.
- 기능 구현과 버그 수정은 가능하면 `test-driven-development`를 함께 적용합니다.
- 여러 independent failure나 조사 대상이 있으면 `dispatching-parallel-agents`를 사용합니다.

### Stage 5. Implementation

- 필요한 파일만 수정합니다.
- 생성 산출물은 직접 수정하지 않습니다.
- plan이 있다면 task 단위 완료조건을 유지합니다.

### Stage 6. Review Loop

- `subagent-driven-development`를 쓰는 경우 각 task는 아래 순서를 반드시 통과합니다.
  - implementer
  - spec review
  - code quality review
  - 이슈 수정
  - re-review
- 중요한 변경, major feature, complex bugfix 뒤에는 `requesting-code-review`를 사용합니다.
- 리뷰 피드백을 받으면 `receiving-code-review` 원칙에 따라 검증 후 반영합니다.
- Critical 또는 Important 이슈를 남긴 채 다음 단계로 진행하지 않습니다.

### Stage 7. Verification

- 완료를 주장하기 전에 항상 `verification-before-completion`을 적용합니다.
- 검증 명령은 추정하지 말고 실제로 실행합니다.
- agent 보고만으로 완료 처리하지 않습니다.
- 실행한 검증과 미실행 검증을 구분합니다.

### Stage 8. Completion

- 구현과 검증이 끝나면 `finishing-a-development-branch`를 사용해 merge, PR, cleanup 중 무엇을 할지 결정합니다.

## Gates

- bootstrap stage에서 relevant skill 확인 없이 구현하지 않습니다.
- required workflow pack이 없는데도 아무 언급 없이 진행하지 않습니다.
- 요청 정리 없이 구현하지 않습니다.
- plan이 필요한 작업은 execution strategy를 정하기 전에는 구현하지 않습니다.
- review 미통과 상태로 다음 task나 완료 단계로 넘어가지 않습니다.
- fresh verification 없이 완료 처리하지 않습니다.

## Final Report

- 무엇을 바꿨는지 적습니다.
- 적용한 `superpowers` workflow skill을 적습니다.
- 실행한 검증 명령과 결과를 적습니다.
- 자동 검사와 수동 확인을 구분합니다.
- 남은 리스크와 미실행 항목을 구분합니다.
