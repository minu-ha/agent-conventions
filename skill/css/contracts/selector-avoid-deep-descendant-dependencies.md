# Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (selector가 훑는 요소 수를 제한해 마크업 변경에 함께 깨지지 않게 합니다)**

중첩을 펼친 effective selector의 combinator 개수를 셉니다.
같은 요소에 붙는 조건인 `.a.b`, `:hover`, `:not()`, `::before`는 DOM 관계가 아니므로 세지 않습니다.

기본값은 combinator 0입니다. 규칙 하나가 요소 하나만 겨냥하고, 상태는 그 요소의 modifier class로 받습니다.

combinator를 쓸 수 있는 경우와 상한은 넷뿐입니다.

| 경우 | 상한 |
| --- | --- |
| 조상의 DOM 상호작용 상태가 자손 모양을 바꿈 | 1 |
| 소유 root 아래 third-party 내부 DOM | 2 |
| raw HTML wrapper 안 element selector | 1 |
| 공유 컴포넌트가 slot class prop을 열지 않은 부분 override | 1 |

첫 항목은 CSS에 부모 선택자가 없어 생기는 정상 소비입니다.
다만 도메인 상태까지 부모 조건으로 얹지 말고 자손 modifier로 옮깁니다.

상한을 넘으면 순서대로 시도합니다.

1. 자손에 modifier를 주고 combinator 0으로 편다
2. 조상 block에서 custom property를 바꾸고 자손이 그 값을 읽는다
3. 위 네 경우 중 무엇인지 주석 한 줄로 남긴다
4. 어디에도 안 걸리면 리팩터 대상이다

중첩을 펼쳐도 effective selector는 같아서 결합도가 줄지 않습니다. 블록 깊이는 별도 규칙이 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-selector-avoid-deep-descendant-dependencies.md)을 읽습니다.
