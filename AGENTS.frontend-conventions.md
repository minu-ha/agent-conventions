# Frontend Convention Router

이 문서는 React + TypeScript + CSS 프로젝트의 `AGENTS.md`에 복사해 쓰는 compact convention policy입니다. 공통 rule body는 프로젝트에 복제하지 않고 `agent-conventions` skill을 정본으로 사용합니다.

## Activation

- 활성화와 rule selection은 현재 작업의 변경 semantic delta만 기준으로 삼는다. 추가·삭제·이동·이름 변경·재선언된 owner/API/selector는 변경 surface다. 반면 diff의 read-only 문맥이나 owner 이동에 byte-equivalent로 따라온 내부 type, import, `className`, style import는 그 자체로 별도 domain 활성화 근거가 아니다. 파일 이동에서 이름·shape·동작이 같은 내부 선언·본문·class·value는 diff에 삭제+추가로 보여도 별도 추가·변경·재선언으로 다시 세지 않는다.
- N/A rule의 optional pattern을 새로 도입해 스스로 활성화하지 말고 요청을 충족하는 최소 semantic patch만 구현한다.
- React, TSX, React hook·state·event·ownership 변경은 `convention-react` + `convention-typescript`를 활성화한다.
- pure TypeScript의 type·schema·API·helper·config 변경은 `convention-typescript`만 활성화한다.
- CSS, stylesheet, selector, token, `className`, style import 또는 styling surface를 변경하면 `convention-css`도 활성화한다.
- pure CSS는 TypeScript를 자동 활성화하지 않는다. CSS rule이 TS/TSX class contract나 wrapper Props를 함께 다룰 때만 TypeScript를 추가한다.
- 구현 전에 각 activated skill의 `SKILL.md`를 먼저 읽고 그 load contract를 따른다.

## Progressive Loading

- activated skill마다 `RULES_INDEX.md` 전체를 끝까지 scan한다. 첫 match에서 멈추지 않는다.
- 모든 ordinal을 `Selected`, `N/A`, `Unknown` 중 정확히 하나로 partition하고 현재 routing digest를 receipt에 남긴다.
- `Selected`와 `Unknown` stable ID에 대응하는 `contracts/*.md`를 읽는다.
- CRITICAL contract는 대응하는 full `rules/*.md`를 즉시 읽는다. 그 밖의 full rule은 exact syntax, 예외, unresolved Unknown, audit evidence 부족일 때만 확장하고 이유를 남긴다.
- React/TypeScript/CSS full `AGENTS.md`를 기본 로드하지 않는다. 전체 handbook 비교가 명시적으로 필요할 때만 opt-in한다.

## Routing Closure

- 모든 `Unknown`을 증거로 `Selected` 또는 `N/A`로 먼저 해소한다. Unknown 또는 최종 N/A source는 필수 target을 전파하지 않는다.
- activated skill의 모든 `completionGate`를 `Selected`로 둔다. N/A는 허용하지 않는다.
- final Selected contract의 `requiresSelected` target은 즉시 `Selected`로 두고, cross-skill target이면 그 companion도 활성화한다.
- `reviewWith` target은 변경 surface로 다시 판단하되 자동 선택하지 않는다. 근거가 있으면 N/A일 수 있다.
- 새 파일, abstraction, selector, API/type boundary 또는 companion이 생기면 모든 activated index를 다시 scan한다.
- activation, partition, mandatory target, review outcome과 scope evidence가 더 바뀌지 않는 고정점까지 반복한다.

## Completion Gate

- 완료 전 `convention-audit`을 활성화한다.
- auditor는 changed files와 diff에서 독립 selection receipt를 만들고 구현 receipt와 exact partition을 비교한다.
- lint, typecheck, build와 테스트는 evidence이지 semantic convention PASS의 대체물이 아니다.
- coverage `FAIL = 0`, semantic `FAIL = 0`, `UNKNOWN = 0`일 때만 완료한다. 하나라도 남으면 selection·구현·검증을 갱신하고 다시 audit한다.

## 프로젝트 로컬 overlay

아래에는 공통 rule을 복사하지 말고 이 프로젝트에만 속하는 제약을 적는다.

- owner와 디렉터리 경계:
- 허용 파일과 변경 금지 영역:
- generated file 보호:
- build, lint, typecheck, test, browser 검증 명령:
- 프로젝트 고유 API·naming·exception 및 제거 조건:
