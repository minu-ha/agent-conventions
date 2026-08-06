# Name Functions by What Comes Out

**Impact: MEDIUM (이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다)**

**기준은 하나입니다 — 이름만 보고 무엇이 나오는지 아는가.**
동사가 결과를 말하면 그 동사를 쓰고, 말하지 않으면 `to<결과>`로 바꿉니다.

| 동사 | 무엇이 나온다고 말하는가 | 예 |
| --- | --- | --- |
| `to<결과>` | 그 형태로 바꾼 값 | `toUserSaveRequest` |
| `get<대상>` | 이미 있는 그 값 | `getSelectedRow` |
| `find<대상>` | 그 값 또는 없음 | `findUserByEmail` |
| `is`·`has`·`can` | 참이나 거짓 | `isAdminUser` |
| `parse<대상>` | 텍스트에서 뽑은 그 구조 | `parseSearchParams` |
| `sort<대상>` | 정렬한 그 목록 | `sortProductsByUpdatedAt` |

`.toSorted()`처럼 표준 라이브러리가 `to`를 붙이는 자리도 같은 이유입니다.
원본을 두고 새 값을 돌려준다는 사실을 접두사가 말합니다.

**`filter`는 첫 동사로 쓰지 않습니다.**
`filterActiveUsers`는 활성 사용자를 남기는지 빼는지 말하지 않습니다.
영어 filter는 거르는 쪽으로도 남기는 쪽으로도 읽히는데 `Array.prototype.filter`는 남기는 쪽입니다.
이름이 정반대로 읽힐 수 있으면 결과를 말한 것이 아닙니다.
남는 것을 이름에 담아 `toActiveUsers`로 씁니다.

**값이 아니라 효과를 내는 함수는 하는 일로 짓습니다.**
돌려줄 값이 없으니 결과로 부를 수 없습니다.

| 하는 일 | 이름 | 예 |
| --- | --- | --- |
| 서버를 부름 | `fetch`·`save`·`remove` | `saveProduct` |
| 어기면 던짐 | `assert<조건>` | `assertLoggedIn` |
| 검사하고 결과나 오류를 돌려줌 | `validate<대상>` | `validateProductForm` |
| 도메인 동작 | 그 동작 이름 | `submitOrder`, `cancelBooking` |

**이름의 첫 동사만 봅니다.** `isCheckedRow`나 `handleCheckAll`처럼 뒤에 섞인 낱말은 대상이 아닙니다.

첫 동사로 쓰지 않는 낱말입니다.
무엇이 나오는지를 어떤 자리에서도 말해 주지 않습니다.

`build`, `create`, `make`, `process`, `manage`, `do`, `perform`, `execute`, `filter`

- `normalize`나 `resolve`처럼 대상에 따라 갈리는 동사는 위 기준으로 판정합니다.
  `normalizePath`는 경로가 나온다고 말하지만 `normalizeUserValues`는 아무것도 말하지 않습니다.
  뜻이 정해진 기술 용어면 남기고, 도메인 값에 붙어 뭉뚱그리면 `to<결과>`로 바꿉니다.
- `update<대상>`은 무엇이 어떻게 바뀌는지 알 수 없어 쓰지 않습니다.
  `save<대상>`이나 `to<결과>`로 나눠 적습니다.
- `handle`은 이벤트 핸들러 이름에만 씁니다.
  프레임워크 컨벤션이 그 형태를 따로 정합니다.
- 프레임워크가 이름을 정해 둔 자리는 대상이 아닙니다.
  규격이 요구하는 메서드 이름은 금지 목록에 있어도 그대로 씁니다.
- `new Promise((resolve, reject) => …)`의 매개변수처럼 언어 관용구가 정한 이름도 대상이 아닙니다.
- 외부 패키지가 `createClient`처럼 지어 둔 이름은 그대로 씁니다.
  우리가 짓는 이름만 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-functions-name-functions-by-what-comes-out.md)을 읽습니다.
