# Extract Support Functions Only When the Boundary Is Real

**Impact: HIGH (재사용 계약이나 테스트 경계가 없는데 보조 함수를 빼서 흐름이 조각나는 것을 막습니다)**

보조 함수는 "이름"이 아니라 "호출 경계"가 있을 때만 떼어 냅니다.

- 필수: 입력과 출력이 분명하고, 실행 문맥 없이도 따로 검증할 수 있어야 합니다
- 떼어 낼 신호: 여러 소유자가 직접 호출하거나, 여러 내보낸 함수에서 같은 도메인 규칙이 반복됩니다
- 그대로 둘 것: 한 번만 쓰는 짧은 계산, 선택 값 보정, 라벨 기본값, 메서드 하나만 쓰는 변환 함수
떼어 낸 다음 어디 두고 언제 공용으로 올릴지는
`functions-place-and-promote-support-functions`가 정합니다.

내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
흐름을 알려고 파일을 왕복해야 하면 경계가 아니라 그냥 쪼갠 것입니다.

> 예시·예외가 필요하면 [full rule](../rules/03-02-functions-extract-helpers-only-when-the-boundary-is-real.md)을 읽습니다.
