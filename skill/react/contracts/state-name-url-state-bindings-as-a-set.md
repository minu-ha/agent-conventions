# Name URL State Bindings as a Set

**Impact: MEDIUM (주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다)**

라우트 search 파라미터는 파싱 전 원본·파싱 결과·서버 응답이 구분되도록 이름을 고정합니다.

| 대상 | 이름과 위치 |
| --- | --- |
| 파라미터별 파싱 함수 묶음 | `<범위>UrlParsers`. 화면의 URL 계약이므로 소유자 `_constant`에 둡니다 |
| 파싱 결과와 갱신 함수 | `urlParams`, `setUrlParams` |
| 플랫폼 `URLSearchParams` 객체 | `searchParams`. 파싱 결과에는 쓰지 않습니다 |

`query`가 들어간 이름은 서버 요청 바인딩에만 씁니다.
해당 이름은 `data-name-query-and-mutation-bindings-consistently`를 따릅니다.
파서 배치는 `typescript/naming-place-owner-constants-in-the-owner-constant-folder`를,
파일명·심볼 표기는 `typescript/naming-use-consistent-file-and-symbol-naming`을 따릅니다.
값을 주소에 둘지는 `state-choose-state-tools-by-source-of-truth`로 판단합니다.

**Requires selected:** `typescript/naming-place-owner-constants-in-the-owner-constant-folder` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/08-06-state-name-url-state-bindings-as-a-set.md)을 읽습니다.
