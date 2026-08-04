# Keep Derived Values Close to Where They Are Used

**Impact: HIGH (출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다)**

파생값은 실제 쓰는 자리에서 계산합니다.
화면 상단으로 끌어올리면 값의 출처를 잃습니다.

어느 파일이 그 값을 소유하는지는 이 규칙이 정하지 않습니다.
`screen-extract-local-section-components-for-runtime-boundaries`가 정합니다.
여기서는 소유한 파일 안에서 얼마나 가까이 두는지만 봅니다.

- 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 새로 만들지 않고
  기존 항목은 제거합니다.
- 훅 파라미터, JSX 표시값, 이펙트 내부 계산은 쓰는 자리의 좁은 스코프에서 직접 계산합니다.
- JSX 전용 표시값은 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-screen-keep-derived-values-close.md)을 읽습니다.
