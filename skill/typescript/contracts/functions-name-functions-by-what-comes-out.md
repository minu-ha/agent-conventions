# Name Functions by What Comes Out

**Impact: MEDIUM (이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다)**

함수 이름은 입력이나 구현 동작이 아니라 호출 뒤 얻는 값이나 효과를 말합니다.
접미사를 먼저 정하지 말고 아래 구분에서 가장 구체적인 동사를 고릅니다.

| 이름 | 사용하는 때 | 예 |
| --- | --- | --- |
| `to<대상>` | 입력 형태를 다른 출력 형태로 바꿀 때 | `toDetailContent` |
| `get<대상>` | 이미 존재하는 값을 가져올 때 | `getSelectedRow` |
| `find<대상>` | 값 하나 또는 없음을 돌려줄 때 | `findUserByEmail` |
| `resolve<대상>` | 조건·fallback·현재 문맥에서 답 하나를 정할 때 | `resolveDisplayRows` |
| `normalize<대상>` | 같은 개념의 값을 허용 범위나 기본 표현에 맞출 때 | `normalizePageSize` |
| `parse<대상>` | 문자열·`unknown`을 검증하며 타입이 보장된 값으로 읽을 때 | `parseSearchParams` |
| `format<대상>` | 값을 사람이 읽는 문자열로 표시할 때 | `formatCandidateDayCount` |
| `compare<대상>` | 두 값을 비교해 정렬 순서를 돌려줄 때 | `compareProductsByPrice` |
| `load<대상>`·`fetch<대상>` | 비동기 I/O를 수행하거나 여러 요청을 조율할 때 | `loadProductExport` |
| `is`·`has`·`can`·`should` | 참이나 거짓으로 질문에 답할 때 | `shouldShowSummary` |

`resolve`와 `normalize`는 계산 과정이 복잡하다는 이유만으로 붙이지 않습니다.

**이름에는 출력 역할만 남깁니다.**

- 입력은 시그니처가 말하므로 이름에 반복하지 않습니다.
  `mapResponseToModel`처럼 입력과 막연한 접미사를 함께 적지 않습니다.
- 소유자 경로가 이미 말하는 도메인을 되풀이하지 않습니다.
  `sales-trend-panel/_function/` 안에서는 `toSalesTrendComparisonWindows`보다
  `toComparisonWindows`가 적절합니다.
- 반환 타입 이름을 그대로 옮기기보다 호출자가 쓰는 결과 개념을 적습니다.
  `toReportViewModel`보다 `toReportRows`가 구체적입니다.
- 서버 요청처럼 계약 자체가 출력 역할이면 `toUserSaveRequest`처럼 계약 이름을 씁니다.

**값 대신 효과를 내는 함수는 그 효과로 이름 짓습니다.**

| 효과 | 이름 | 예 |
| --- | --- | --- |
| 저장·삭제 | `save<대상>`·`remove<대상>` | `saveProduct` |
| 조건 위반 시 예외 | `assert<조건>` | `assertLoggedIn` |
| 검사 결과 또는 오류 | `validate<대상>` | `validateProductForm` |
| 도메인 동작 | 실제 업무 동사 | `submitOrder`, `cancelBooking` |

`build`, `create`, `make`, `process`, `manage`, `do`, `perform`, `execute`,
`filter`, `map`, `update`는 우리가 짓는 이름의 첫 동사로 쓰지 않습니다.
무엇이 나오는지 또는 어떤 효과가 생기는지 구체적으로 말하지 못하기 때문입니다.

- `filterActiveUsers`는 활성 사용자를 남기는지 제외하는지 모호합니다.
  남은 목록이 출력이면 `toActiveUsers`로 씁니다.
- `mapProductRows`는 행이 입력인지 출력인지 모호합니다.
  행이 출력이면 `toProductRows`로 씁니다.
- `updateProduct`는 저장 효과인지 새 값을 만드는 계산인지 모호합니다.
  각각 `saveProduct`나 `toUpdatedProduct`처럼 나눕니다.
- 배열의 짧은 인라인 변환에서 쓰는 `array.map(...)`은 함수 이름 규칙과 무관합니다.
- `handle`과 `use`처럼 프레임워크가 의미를 정하는 이름은 해당 프레임워크 규칙이 판정합니다.

생성기·프레임워크·외부 계약이 정한 이름은 그대로 씁니다.
`new Promise((resolve, reject) => …)`의 매개변수와 생성된 API의 `fetch` 함수처럼
우리가 소유하지 않는 이름을 이 규칙에 맞추려고 바꾸거나 감싸지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-09-functions-name-functions-by-what-comes-out.md)을 읽습니다.
