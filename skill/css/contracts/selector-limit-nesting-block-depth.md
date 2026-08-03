# Limit Nesting to One Level and Write the Rest Inline

**Impact: HIGH (중첩을 항상 한 겹으로 고정해 실제 선택자가 코드에 그대로 보이게 합니다)**

**중첩**은 `{}`를 겹치는 것입니다. 규칙은 하나입니다.

> 중첩은 항상 한 겹이고, `&`도 한 선택자에 한 번입니다.

`&`는 **그 블록이 소유한 요소 하나**를 가리킵니다.
그 요소에 조건이나 pseudo-element를 붙일 때만 `&`를 씁니다.
다른 요소로 내려가면 `&`를 다시 열지 않고 같은 선택자 줄에 이어 씁니다.

- `.box { &::before { } }` — box 자신의 pseudo-element라서 `&`입니다.
- `.button { &:hover .box::before { } }` — 이 `::before`는 box의 것이라 `&`로 쓸 수 없습니다.

그래서 `&`를 어디에 쓸지 고르지 않습니다. **어느 요소를 가리키느냐가 정합니다.**
"언제는 중첩, 언제는 한 줄"이 아니라 한 겹까지가 중첩이고 그 다음은 늘 한 줄입니다.

중첩을 두 겹 이상 열면 실제 선택자가 숨습니다.
`.pg_a { & .pg_b { & .pg_c { } } }`에 쓰인 선택자는 `& .pg_c`뿐이어서
`.pg_a .pg_b .pg_c` 체이닝이 보이지 않습니다. lint도 각 블록만 봅니다.

기계 검증은 `max-nesting-depth: 1`입니다. top-level이 0단입니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-selector-limit-nesting-block-depth.md)을 읽습니다.
