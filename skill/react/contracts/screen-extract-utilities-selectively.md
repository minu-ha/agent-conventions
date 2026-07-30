# Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (route entry가 자기 계약이 없는 helper 조각으로 분해되는 것을 막습니다)**

화면 support code는 이름을 붙일 수 있다는 이유가 아니라 경계가 실재할 때만 추출합니다.

추출 후보:

- React state/hook과 직접 결합되지 않은 pure function
- 입력/출력 계약이 명확한 화면 전용 변환, preset, option, column meta
- 밖으로 빼면 route entry의 response, state, handler, render flow가 더 잘 보이는 코드
- 여러 exported 함수에서 같은 단계가 반복되는 이름 있는 도메인 규칙

호출 지점에 남길 대상:

- 작은 1회성 guard, URL 조립, 빈 검색어 생략 같은 호출 지점 계산
- handler/effect 안에 있어야 문맥이 보이는 query invalidation, navigation, fallback 처리
- query `select` 내부 mapper.
  `data-shape-query-data-with-select`가 담당하므로 별도 함수나 support module 경계가 없으면 이 규칙은 적용하지 않습니다.

배치 기준:

- route sibling `page.ts`에 named export로 둡니다.
- `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않습니다.
- support module 안에서도 작은 private helper를 쌓지 말고, 기본은 한 exported 함수 안에서 단계별로 정리합니다.

> 예시·예외가 필요하면 [full rule](../rules/screen-extract-utilities-selectively.md)을 읽습니다.
