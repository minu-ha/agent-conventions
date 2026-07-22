# Do Not Use Modifiers for One-off Structural Patches

**Impact: HIGH (keeps modifiers reserved for state instead of turning them into a second layout naming system)**

modifier는 상태나 반복 variant를 표현할 때만 사용합니다.

금지:

- spacing patch
- 방향 보정
- 특정 화면 하나에서만 필요한 구조 차이

허용:

- `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태
- `dense`, `horizontal`, `compact`처럼 component API로 반복 노출되는 variant

금지 대상은 "상태 의미가 아닌 모든 modifier"가 아니라, 재사용 contract 없이 생긴 one-off structural modifier입니다.

이 규칙의 Selected는 modifier가 금지됐다는 뜻이 아니라 변경된 modifier의 계약을 분류했다는 뜻입니다. `active`·`selected` 같은 허용된 domain state로 결론 나면 `Selected + pass`이며, 위반이 없다는 이유로 N/A로 돌리지 않습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-do-not-build-structural-variants-with-modifiers.md)을 추가로 읽고 fallback 사유를 기록합니다.
