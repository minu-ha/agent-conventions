# Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (화면 진입 파일이 자기 계약도 없는 조각들로 흩어지지 않습니다)**

화면 보조 code는 이름을 붙일 수 있다는 이유가 아니라 경계가 실재할 때만 추출합니다.

추출 후보:

- React 상태/훅과 직접 결합되지 않은 pure function
- 입력/출력 계약이 명확한 화면 전용 변환, 기본 설정, 옵션, column 메타
- 밖으로 빼면 라우트 진입의 응답, 상태, 핸들러, 렌더 flow가 더 잘 보이는 코드
- 여러 내보낸 함수에서 같은 단계가 반복되는 이름 있는 도메인 규칙

호출 지점에 남길 대상:

- 작은 1회성 가드, URL 조립, 빈 검색어 생략 같은 호출 지점 계산
- 핸들러/이펙트 안에 있어야 문맥이 보이는 질의 invalidation, 화면 이동, 기본값 처리
- 질의 `select` 내부 변환 함수.
  `data-shape-query-data-with-select`가 담당하므로 별도 함수나 보조 모듈 경계가 없으면 이 규칙은 적용하지 않습니다.

배치 기준:

- 소유자 아래 `function` 폴더에 대표 내보낸 함수 하나당 파일 하나로 둡니다.
- `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않습니다.
- 한 파일 안에서 작은 비공개 보조 함수를 쌓지 말고, 기본은 한 내보낸 함수 안에서 단계별로 정리합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-03-screen-extract-utilities-selectively.md)을 읽습니다.
