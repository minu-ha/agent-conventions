# Limit Nesting Block Depth

**Impact: HIGH (들여쓰기가 깊어져 규칙의 적용 대상을 머릿속에서 조립해야 하는 상태를 막습니다)**

**중첩**은 `{}`를 겹치는 것이고, 브라우저는 이를 펼쳐서 평가합니다.
그래서 이 규칙은 가독성만 담당합니다. 결합자 개수는 `selector-avoid-deep-descendant-dependencies`가 셉니다.

- 중첩 block은 2단까지 씁니다. top-level class block 안에 한 겹만 더 엽니다.
- 중첩 block 안에서 다시 중첩 block을 열지 않습니다.
- 관련 선언은 owner class block 안에 모아 둡니다.

중첩을 펼치는 것은 개선이 아닙니다.
`.a { & .b { } }`를 `.a .b { }`로 바꿔도 펼친 selector가 같아서 마크업 변경에 똑같이 깨지고,
오히려 owner 소속이 보이지 않게 됩니다.

동작 차이는 하나뿐입니다. `,`로 묶은 목록 안의 `&`는 specificity가 목록 중 가장 높은 것으로 계산됩니다.
`.a, #x { & .b { } }`는 `:is(.a, #x) .b`가 되어 `#x` 기준입니다. 그 경우가 아니면 시각적 차이뿐입니다.

`__prose`, `__copy`, `__content`처럼 raw HTML wrapper가 owner boundary라면
같은 block 안에서 `& h2`, `& p`, `& > :first-child`를 씁니다.
raw HTML에는 클래스를 붙일 수 없어서 element selector가 유일한 수단입니다.
이 예외는 raw element에만 적용하고, 다른 project-owned class를 체이닝하는 근거로 쓰지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-02-selector-limit-nesting-block-depth.md)을 읽습니다.
