# Read Props Through the Props Object Without Destructuring

**Impact: MEDIUM-HIGH (값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다)**

컴포넌트는 `props` 전체를 받고 쓰는 자리마다 `props.id`로 읽습니다.
시그니처에서도, 본문 어느 줄에서도, 본문 안 중첩 함수에서도 구조분해하지 않습니다.

구조분해는 이름만 남기고 출처를 지웁니다.
파일이 길어지면 `id`가 프롭스인지 지역 변수인지 훅 결과인지 읽는 쪽에서 구분할 수 없습니다.
`props.id`는 그 값이 어디서 왔는지를 쓰는 자리마다 다시 말해 줍니다.

- 예외를 두지 않습니다.
  `짧은 컴포넌트`나 `지역 스코프`는 코드를 보고 판정할 수 없는 기준입니다.
- `{...props}`로 그대로 펼치는 것은 구조분해가 아닙니다.
  `props`를 이름 그대로 읽어 넘기는 것이라 출처가 지워지지 않습니다.
  스프레드를 쓸 조건은 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.
- 선택 프롭에 기본값이 필요하면
  `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.
  값을 그대로 비교하면 기본값 없이 끝나는 경우가 많습니다.
- 출처를 남기라는 요구는 이 규칙에만 있지 않습니다.
  쿼리 결과는 `data-preserve-origin-chaining`, 계산한 값은 `screen-keep-derived-values-close`,
  설정 값은 `typescript/naming-preserve-config-origin-with-chained-access`가 같은 말을 합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-composition-read-props-without-destructuring.md)을 읽습니다.
