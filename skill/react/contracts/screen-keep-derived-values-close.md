# Keep Derived Values Close to Where They Are Used

**Impact: HIGH (오리진을 보존하고 route 파일이 alias와 명령형 setup 코드로 채워지는 것을 막음)**

화면 상단에서 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 추가·유지하지 않고 기존 항목은 제거합니다. Hook 파라미터, JSX 표시값, effect 내부 계산은 실제 사용하는 좁은 스코프에서 직접 계산합니다. JSX 전용 표시값은 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/screen-keep-derived-values-close.md)을 추가로 읽고 fallback 사유를 기록합니다.
