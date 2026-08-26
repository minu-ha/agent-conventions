# Name URL State Bindings as a Set

**Impact: MEDIUM (주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다)**

라우트 search 파라미터가 소유한 상태는 세 자리의 이름을 한 벌로 고정합니다.
읽는 사람이 이름만 보고 파싱 전 원본인지, 파싱을 거친 값인지, 서버 응답인지 구분하는 것이 목적입니다.

| 자리 | 이름 |
| --- | --- |
| 파라미터별 파싱 함수를 모은 묶음 | `<범위>UrlParsers` |
| 파싱을 거친 값과 그 갱신 함수 | `urlParams` · `setUrlParams` |
| 플랫폼 `URLSearchParams` 객체 | `searchParams` |

- 파서 묶음은 화면이 주소에 올린 상태의 계약이므로 소유자 `_constant` 폴더에 둡니다.
  자리는 `typescript/naming-place-owner-constants-in-the-owner-constant-folder`가,
  파일과 심볼 표기는 `typescript/naming-use-consistent-file-and-symbol-naming`이 정합니다.
- `searchParams`는 플랫폼 객체를 그대로 쥔 자리에만 씁니다.
  파싱을 거친 값이 이 이름을 쓰면 원본과 구분되지 않습니다.
- `query`가 들어간 이름은 서버 요청 바인딩 전용입니다.
  그 자리는 `data-name-query-and-mutation-bindings-consistently`가 정합니다.
- 값을 주소에 올릴지 자체는 `state-choose-state-tools-by-source-of-truth`가 정합니다.

**Requires selected:** `typescript/naming-place-owner-constants-in-the-owner-constant-folder` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/08-06-state-name-url-state-bindings-as-a-set.md)을 읽습니다.
