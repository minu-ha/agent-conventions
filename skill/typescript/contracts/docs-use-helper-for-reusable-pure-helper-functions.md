# Use `@helper` on Reusable Support Functions

**Impact: MEDIUM-HIGH (재사용 가능한 순수 support 로직을 지역 구현 세부나 통합 경계와 구분합니다)**

`@helper`는 재사용 가능한 pure support function에만 붙입니다.

사용 대상:

- 여러 caller가 직접 호출하는 문자열 조립, 정규화, 포맷, 계약 변환 함수
- owner-named support module의 domain-sized exported pure function
- 여러 owner가 공유하는 `shared/util.ts`의 `util.*` 함수

사용하지 않을 대상:

- 외부 I/O, 원격 데이터, 파일 접근 같은 `@api` 경계
- 한 함수나 한 support module 안에서만 쓰는 작은 sub-step
- 반복이 보이지만 아직 caller surface가 넓지 않은 local 계산

> 예시·예외가 필요하면 [full rule](../rules/05-04-docs-use-helper-for-reusable-pure-helper-functions.md)을 읽습니다.
