# Keep Classes Single-purpose

**Impact: HIGH (stops one class from carrying both base styling and multiple state or structural meanings at once)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다.
기존 클래스가 base와 state·variant 책임을 함께 가질 때 분리하고, 한 클래스를 독립된 여러 시각 책임에 재사용하지 않습니다.
처음부터 single-purpose base와 modifier를 별도로 만드는 작업은 결합 책임을 해소하는 변경이 없으므로 이 규칙을 선택하지 않습니다.
스타일 책임을 보존한 owner prefix 수정, single-purpose rename, one-off modifier를 역할명 class로 바꾸기만 하는 경우도 대상이 아닙니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-keep-classes-single-purpose.md)을 추가로 읽고 fallback 사유를 기록합니다.
