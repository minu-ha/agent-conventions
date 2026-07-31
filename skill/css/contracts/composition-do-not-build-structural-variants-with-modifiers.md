# Do Not Use Modifiers for One-off Structural Patches

**Impact: HIGH (modifier를 두 번째 레이아웃 이름 체계로 만들지 않고 상태 표현에만 남겨둡니다)**

modifier는 상태나 반복 variant를 표현할 때만 사용합니다.

금지:

- spacing patch
- 방향 보정
- 특정 화면 하나에서만 필요한 구조 차이

허용:

- `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태
- `dense`, `horizontal`, `compact`처럼 component API로 반복 노출되는 variant

금지 대상은 "상태 의미가 아닌 모든 modifier"가 아니라, 재사용 contract 없이 생긴 one-off structural modifier입니다.
허용 여부가 갈리는 지점은 그 modifier를 두 번째 화면에서도 같은 이름으로 쓸 수 있느냐입니다.

> 예시·예외가 필요하면 [full rule](../rules/02-02-composition-do-not-build-structural-variants-with-modifiers.md)을 읽습니다.
