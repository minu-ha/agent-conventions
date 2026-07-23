# Tokenize Repeated Visual Values

**Impact: HIGH (keeps repeated colors, spacing, and radius values aligned with shared design tokens instead of drifting into magic numbers)**

색상, 간격, 타이포, 그림자 같은 반복 가능한 시각 값은 CSS 변수와 디자인 토큰을 우선 사용합니다. 같은 값이 2회 이상 반복되면 하드코딩을 늘리기 전에 토큰화 여부를 먼저 검토합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/values-tokenize-repeated-visual-values.md)을 추가로 읽고 fallback 사유를 기록합니다.
