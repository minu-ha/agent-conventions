# Limit Nesting Block Depth

**Impact: HIGH (들여쓰기가 깊어져 규칙의 적용 대상을 머릿속에서 조립해야 하는 상태를 막습니다)**

중첩 `{}`는 소스 형식이고 브라우저는 이를 펼쳐서 평가합니다.
그래서 이 규칙은 결합도가 아니라 **가독성**만 담당합니다. 결합도는 `selector-avoid-deep-descendant-dependencies`가 셉니다.

- 중첩 block은 2단까지 씁니다. top-level class block 안에 한 겹만 더 엽니다.
- nested block 안에서 다시 nested block을 열지 않습니다.
- 관련 선언은 owner class block 안에 모아 둡니다.

**중첩을 펼치는 것은 개선이 아닙니다.**
`.a { & .b { } }`를 `.a .b { }`로 바꿔도 effective selector가 같아서 마크업 변경에 똑같이 깨집니다.
오히려 owner 소속이 보이지 않게 되어 파일 아무 곳에나 흩어질 수 있습니다.
깊이를 줄이려면 combinator를 줄여야 하고, 그 방법은 위 규칙이 정합니다.

`__prose`, `__copy`, `__content`처럼 raw HTML wrapper가 owner boundary라면
같은 block 안에서 `& h2`, `& p`, `& > :first-child`를 씁니다.
이 예외는 raw element styling에만 적용하고, 다른 project-owned class를 체이닝하는 근거로 쓰지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-02-selector-limit-nesting-block-depth.md)을 읽습니다.
