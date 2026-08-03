# Expose Only a Root Class From Other Owners

**Impact: HIGH (내부 노드로 가는 클래스 prop을 막고 배치·variant·강등 중 무엇이 맞는지 먼저 보게 합니다)**

바꿀 것이 남의 표현이면 세 갈래를 순서대로 봅니다.

| 상황 | 방법 | 비용 |
| --- | --- | --- |
| root의 배치만 다름 | 호출부가 `className`을 넘기고 자기 클래스로 스타일 | 호출부 1곳 |
| 여러 화면이 쓰고 하나만 내부가 다름 | 그 소유자가 modifier를 노출 | 소유자 파일 2줄 + 호출부 1줄 |
| 이 화면만 씀 | 화면 폴더 안으로 내림 | 파일 이동과 접두사 rename |

세 행에 안 맞으면 `ownership-use-foreign-classes-only-under-your-own-root`에 따라
내 root 블록 아래에서 겨냥합니다. **막다른 길이 아니라 마지막 선택지입니다.**

셋째 행이 흔히 놓치는 답입니다. 한 화면만 쓰는 컴포넌트는 widget이 아닙니다.
승격 기준은 맥락 독립성이고, 내리는 것은 props를 여는 것이 아니라 파일을 옮기는 것입니다.

`className`이 root까지만 닿는 것은 제약이 아니라 경계입니다.
컴포넌트가 무엇을 노출하는지는 `composition-inject-classes-only-at-the-entry-point`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-ownership-change-other-owners-through-their-api.md)을 읽습니다.
