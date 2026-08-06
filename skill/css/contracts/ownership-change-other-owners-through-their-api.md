# Change Other Owners Through Their API

**Impact: MEDIUM-HIGH (남의 모습을 바꿀 때 배치, 변형, 내림 가운데 무엇이 맞는지 먼저 봅니다)**

바꿀 것이 남의 모습이면 세 가지를 순서대로 봅니다.

| 상황 | 방법 | 바꾸는 곳 |
| --- | --- | --- |
| 최상위 배치만 다름 | 사용처가 `className`을 넘기고 자기 클래스로 스타일을 줌 | 사용처 TSX와 사용처 CSS |
| 여러 화면이 쓰고 하나만 내부가 다름 | 그 소유자가 `variant` 프롭으로 수정자를 노출 | 소유자 TSX와 소유자 CSS, 사용처 TSX |
| 이 화면만 씀 | 화면 폴더 안으로 내림 | 파일 위치와 접두사 |

세 행에 안 맞으면 `ownership-use-foreign-classes-only-under-your-own-root` 규칙에 따라
내 최상위 블록 안에서 겨냥합니다.
**막다른 길이 아니라 마지막 선택지입니다.**

셋째 행을 흔히 놓칩니다.
한 화면만 쓰는 컴포넌트는 위젯이 아닙니다.
승격 기준은 서로 다른 화면 소유자 둘 이상이 이미 그 컴포넌트를 가져다 쓰는지입니다.
내릴 때 프롭을 열지 않습니다.
파일만 옮깁니다.

`className`이 최상위까지만 닿는 것은 제약이 아니라 경계입니다.
컴포넌트가 무엇을 노출하는지, 내부 노드로 가는 클래스 프롭을 왜 열지 않는지는
`composition-inject-classes-only-at-the-entry-point` 규칙이 정합니다.
여기서는 사용처가 세 가지 가운데 무엇을 고를지만 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-ownership-change-other-owners-through-their-api.md)을 읽습니다.
