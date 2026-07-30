# Tokenize Repeated Visual Values

**Impact: HIGH (반복되는 색·간격·radius 값이 매직 넘버로 흐르지 않고 공용 디자인 토큰에 맞게 유지함)**

색상, 간격, 타이포, 그림자 같은 반복 가능한 시각 값은 CSS 변수와 디자인 토큰을 우선 사용합니다.
같은 값이 2회 이상 반복되면 하드코딩을 늘리기 전에 토큰화 여부를 먼저 검토합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-values-tokenize-repeated-visual-values.md)을 읽습니다.
