# Use Global Tokens and Do Not Invent Local Ones

**Impact: MEDIUM-HIGH (공용 시각 값은 전역 토큰으로 모으고 값 재사용 목적의 지역 변수는 늘리지 않습니다)**

판정 기준은 **파일 경계**입니다.

| 반복 범위 | 처리 |
| --- | --- |
| 여러 파일 | 전역 core token을 쓰거나, 없으면 core token 목록에 추가를 검토합니다 |
| 한 파일 안 | 값을 그대로 둡니다. 지역 변수를 만들지 않습니다 |

같은 파일 안에서 `8px`이 세 번 나온다고 지역 custom property를 만들지 않습니다.
core token 목록에 없는 변수는 `values-always-provide-css-variable-fallbacks`에 따라 fallback이 필요해서
`var(--pg-detail-gap, 8px)`처럼 값이 결국 사용처에 남습니다.
읽는 사람은 변수 선언을 한 번 더 찾아가야 하고, 값을 바꿀 지점은 여전히 여러 곳입니다.

지역 custom property는 값 재사용이 아니라 **조상에서 자손으로 상태를 전달할 때만** 씁니다.
그 용도는 `selector-avoid-deep-descendant-dependencies`가 결합자를 줄이는 수단으로 인정합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-values-tokenize-repeated-visual-values.md)을 읽습니다.
