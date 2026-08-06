# Read Props Through the Props Object Without Destructuring

**Impact: MEDIUM (값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다)**

컴포넌트는 `props` 전체를 받고 쓰는 자리마다 `props.id`로 읽습니다.
시그니처에서도, 본문 어느 줄에서도, 본문 안 중첩 함수에서도 구조분해하지 않습니다.

구조분해로 끊지 않는 규범과 그 예외는 `typescript/values-read-objects-through-chains`가 모든 객체에 정합니다.
프롭스는 컴포넌트 시그니처라 끊고 싶은 압력이 가장 센 자리여서 여기서 한 번 더 못 박습니다.

- `{...props}`로 그대로 펼치는 것은 구조분해가 아닙니다.
  `props`를 이름 그대로 읽어 넘기는 것이라 출처가 지워지지 않습니다.
  스프레드를 쓸 조건은 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.
- 선택 프롭에 기본값이 필요하면
  `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.
  프롭 값을 그대로 비교해서 쓰면 기본값 자체가 필요 없는 경우가 많습니다.
- 쿼리 결과는 `data-preserve-origin-chaining`, 계산한 값은 `screen-keep-derived-values-close`가
  같은 원본에 대해 각각 더 볼 것을 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-01-composition-read-props-without-destructuring.md)을 읽습니다.
