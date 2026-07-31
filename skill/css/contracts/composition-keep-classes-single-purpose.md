# Keep Classes Single-purpose

**Impact: HIGH (class 하나가 base 스타일과 여러 상태·구조 의미를 동시에 지는 것을 막습니다)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다.
기존 클래스가 base와 state·variant 책임을 함께 가질 때 분리하고,
한 클래스를 독립된 여러 시각 책임에 재사용하지 않습니다.
처음부터 single-purpose base와 modifier를 별도로 만드는 작업은 결합 책임을 해소하는 변경이 없으므로 이 규칙을 선택하지
않습니다.
스타일 책임을 보존한 owner prefix 수정, single-purpose rename,
one-off modifier를 역할명 class로 바꾸기만 하는 경우도 대상이 아닙니다.

> 예시·예외가 필요하면 [full rule](../rules/02-03-composition-keep-classes-single-purpose.md)을 읽습니다.
