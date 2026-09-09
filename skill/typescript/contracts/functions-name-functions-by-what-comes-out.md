# Name Functions by What Comes Out

**Impact: MEDIUM (함수 이름으로 반환값이나 효과를 파악할 수 있습니다)**

### 역할별 동사

함수 이름은 호출 뒤 얻는 값이나 효과를 구체적으로 드러냅니다.
입력은 시그니처가 설명하므로 이름에 반복하지 않습니다.

| 반환값의 역할 | 동사 | 예 |
| --- | --- | --- |
| 다른 형태로 변환 · 분류 | `to` | `toDetailContent` |
| 이미 존재하는 값 | `get` | `getSelectedRow` |
| 값 하나 또는 없음 | `find` | `findUserByEmail` |
| 서로 다른 입력 둘 이상의 우선순위 선택 | `choose` | `chooseBackSource` |
| 같은 개념의 허용 범위 · 표현 보정 | `normalize` | `normalizePageSize` |
| 문자열 · `unknown` 검증 후 읽기 | `parse` | `parseSearchParams` |
| 사람이 읽는 표시 문자열 | `format` | `formatCandidateDayCount` |
| 두 값의 정렬 순서 | `compare` | `compareProductsByPrice` |
| 비동기 I/O · 여러 요청 조율 | `load`, `fetch` | `loadProductExport` |
| 참 · 거짓 판정 | `is`, `has`, `can`, `should` | `shouldShowSummary` |

| 함수의 역할 | 동사 | 예 |
| --- | --- | --- |
| 저장 · 삭제 | `save`, `remove` | `saveProduct` |
| 조건 위반 시 예외 | `assert` | `assertLoggedIn` |
| 검사 결과 또는 오류 | `validate` | `validateProductForm` |
| 도메인 동작 | 실제 업무 동사 | `submitOrder`, `cancelBooking` |

`choose`는 서로 다른 입력 사이에서 `??` 등으로 고를 때 씁니다. 입력이 하나면 해당하지 않습니다.
소유자 경로가 이미 말하는 도메인도 빼고, 반환 타입 이름보다 호출자가 쓰는 결과 개념을 적습니다.
`toComparisonWindows`, `toReportRows`처럼 쓰되 요청 계약 자체가 출력이면 `toUserSaveRequest`처럼 짓습니다.

### 쓰지 않는 동사

`build`, `create`, `make`, `process`, `manage`, `do`, `perform`, `execute`, `filter`, `map`, `update`, `resolve`는
직접 짓는 이름의 첫 동사로 쓰지 않습니다.

| 모호한 이름 | 결과 · 효과를 드러낸 이름 |
| --- | --- |
| `filterActiveUsers` | 남기는 목록이면 `toActiveUsers` |
| `mapProductRows` | 출력이 행이면 `toProductRows` |
| `updateProduct` | 저장이면 `saveProduct`, 계산이면 `toUpdatedProduct` |
| `resolveStatusTone` | 분류 결과인 `toStatusTone` |

### 대상이 아닌 이름

`array.map(...)` 같은 표준 메서드 호출은 함수 명명 규칙의 대상이 아닙니다.
`handle`, `use`는 프레임워크 규칙을 따릅니다.
생성기, 프레임워크, 외부 계약이 정한 이름과 `Promise`의 `resolve`, `reject`는 바꾸거나 감싸지 않습니다.

**Incorrect 1 (입력 · 구현 동작 · 막연한 접미사를 이름에 씁니다):**

```ts
// page/detail/_function/build-user-payload.ts
export const buildUserPayload = (formValues: UserFormValues) => { /* … */ };
```

```ts
// page/detail/_function/map-response-to-model.ts
export const mapResponseToModel = (response: UserResponse) => { /* … */ };
```

```ts
// page/detail/_function/process-user-rows.ts
export const processUserRows = (rows: UserRow[]) => { /* … */ };
```

```ts
// page/detail/_function/resolve-status-tone.ts
export const resolveStatusTone = (status: string) => { /* … */ };
```

**Correct 1 (출력 역할이나 효과를 이름에 씁니다):**

```ts
// page/detail/_function/to-user-save-request.ts
/**
 * 사용자 저장 요청 조립. 서버가 빈 문자열을 거부해 비운 칸은 넣지 않는다
 */
export const toUserSaveRequest = (formValues: UserFormValues) => { /* … */ };
```

> 나머지 예시 · 예외는 [full rule](../rules/03-09-functions-name-functions-by-what-comes-out.md)에 있습니다.
