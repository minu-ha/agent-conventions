# Frontend Convention Router

이 문서는 React + TypeScript + CSS 프로젝트의 `AGENTS.md`에 복사해 쓰는 compact convention policy입니다. 공통 rule body는 프로젝트에 복제하지 않고 `agent-conventions` skill을 정본으로 사용합니다.

## Activation

- 활성화와 규칙 판정은 이번 작업에서 실제로 바꾼 것만 기준으로 삼는다. 추가·삭제·이동·이름 변경·재선언된 owner/API/selector는 변경이다. 반면 diff의 read-only 문맥이나 owner 이동에 그대로 딸려온 내부 type, import, `className`, style import는 그 자체로 domain 활성화 근거가 아니다. 이름·shape·동작이 같은 이동은 diff에 삭제+추가로 보여도 다시 세지 않는다.
- 적용되지 않는 규칙의 optional pattern을 새로 들여와 스스로 범위를 넓히지 말고, 요청을 충족하는 최소 변경만 구현한다.
- React, TSX, React hook·state·event·ownership 변경은 `convention-react` + `convention-typescript`를 활성화한다.
- pure TypeScript의 type·schema·API·helper·config 변경은 `convention-typescript`만 활성화한다.
- CSS, stylesheet, selector, token, `className`, style import 변경이면 `convention-css`도 활성화한다.
- pure CSS는 TypeScript를 자동 활성화하지 않는다. CSS 규칙이 TS/TSX class contract나 wrapper Props를 함께 다룰 때만 추가한다.
- 구현 전에 각 activated skill의 `SKILL.md`를 먼저 읽고 그 load 계약을 따른다.

## Loading

- activated skill마다 `RULES_INDEX.md`를 끝까지 훑는다. 첫 match에서 멈추지 않는다. 애매하면 적용되는 쪽으로 본다.
- 걸리는 규칙의 `contracts/*.md`를 읽는다. `CRITICAL`이면 대응하는 `rules/*.md` 원문도 반드시 읽고, 그 외에도 정확한 문법이나 예외 판단이 필요하면 원문으로 확장한다.
- `requiresSelected` target은 함께 적용한다. 다른 skill의 규칙이면 그 companion도 활성화한다.
- `reviewWith` target은 변경 범위에 비춰 다시 판단하되 자동으로 적용하지는 않는다.
- `completionGate` 규칙은 마무리 시 항상 적용한다.
- 규칙, companion, 새 surface가 걸리면 activated index를 다시 훑는다. 더 걸리는 게 없으면 멈춘다.
- React/TypeScript/CSS의 full `AGENTS.md`를 기본 로드하지 않는다. 전체 handbook 비교가 명시적으로 필요할 때만 읽는다.

## 마무리

- 변경 diff를 적용한 규칙에 비춰 다시 훑고, 위반이 있으면 file/line과 수정안으로 보고한다.
- lint, typecheck, build, 테스트 통과는 근거 자료일 뿐 컨벤션을 지켰다는 증명이 아니다.
- 판단이 서지 않는 항목은 임의로 넘기지 말고 무엇이 불확실한지 함께 보고한다.

## 프로젝트 로컬 overlay

아래에는 공통 rule을 복사하지 말고 이 프로젝트에만 속하는 제약을 적는다.

- owner와 디렉터리 경계:
- 허용 파일과 변경 금지 영역:
- generated file 보호:
- build, lint, typecheck, test, browser 검증 명령:
- 프로젝트 고유 API·naming·exception 및 제거 조건:
