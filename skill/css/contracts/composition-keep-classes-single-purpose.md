# Keep Classes Single-purpose

**Impact: HIGH (stops one class from carrying both base styling and multiple state or structural meanings at once)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다. 상태나 변형이 필요하면 modifier를 별도로 두고, 기본 클래스에 모든 의미를 몰아넣지 않습니다. 스타일 선언과 책임을 그대로 보존한 responsibility-preserving owner prefix 수정이나 single-purpose class rename만으로는 이 규칙을 선택하지 않습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-keep-classes-single-purpose.md)을 추가로 읽고 fallback 사유를 기록합니다.
