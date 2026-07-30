# Extract Support Functions Only When the Boundary Is Real

**Impact: HIGH (재사용 계약이나 테스트 경계가 실제로 없을 때 헬퍼 추출이 지역 흐름을 조각내는 것을 막음)**

support function은 "이름"이 아니라 "호출 경계"가 있을 때만 분리합니다.

- 필수: 명확한 input/output, 런타임 문맥 없는 독립 검증 가능성
- 추출 신호: 여러 owner의 직접 호출, 여러 export에서 반복되는 도메인 규칙
- 유지: 한 번만 쓰는 짧은 계산, optional 보정, label fallback, 단일 namespace method 전용 mapper
- 배치: generic `helper.ts`/`utils.ts` 금지, owner-named support module 우선
- 승격: 여러 owner가 실제 공유하는 범용 pure function만 `shared/util.ts`의 `util.*`

> 예시·예외가 필요하면 [full rule](../rules/03-02-functions-extract-helpers-only-when-the-boundary-is-real.md)을 읽습니다.
