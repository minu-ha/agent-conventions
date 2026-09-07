# Declare Meaningful Numbers Instead of Writing Them Inline

**Impact: MEDIUM (숫자의 의미를 이름으로 드러내고 한곳에서 변경할 수 있습니다)**

제품 정책처럼 뜻이 있는 숫자는 상수로 선언하고, 사용처에서는 그 이름을 참조합니다.
`attempts > 42` 대신 `attempts > retry_max_attempts`로 씁니다.

| 숫자의 용도 | 처리 |
| --- | --- |
| 재시도 횟수 `3`, 페이지 크기 `20` 등 제품 정책 | 작거나 흔한 숫자여도 상수로 선언합니다 |
| 일반 연산의 `0`, `1`, 단위 변환의 `60` | 그대로 적습니다 |
| 배열 인덱스, 선언 초기값, 상수 선언 자신의 값 | 그대로 적습니다 |
| `??`, `\|\|` 오른쪽이나 기본 매개변수 | `absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다 |
| 여러 숫자가 한 뜻을 이룸 | 배열 대신 `{first: 0x1100, last: 0x115f}`처럼 이름 있는 객체 필드로 둡니다 |

소유자를 지워도 남으면 루트 `constant`, 함께 사라지면 소유자의 `_constant`에 둡니다.
배치는 `naming-place-project-constants-in-the-root-constant-folder`가 정합니다.
같은 파일의 지역 `const`로 옮기는 것은 규칙을 충족하지 못합니다.
지역 변수에는 `functions-name-a-value-only-for-recompute-or-judgment`의 두 사유 중 하나가 필요합니다.
조회표를 둘지는 `values-avoid-lookup-tables-for-simple-choices`가 정합니다.

`tooling-configure-biome-to-enforce-these-rules`의 `style/noMagicNumbers`로 검사합니다.
테스트 파일에서는 리터럴 자체가 기대 계약일 수 있어 이 검사를 끕니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-values-declare-meaningful-numbers.md)을 읽습니다.
