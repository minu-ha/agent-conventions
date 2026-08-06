# Use Consistent File, Symbol, and Field Naming

**Impact: MEDIUM-HIGH (이름을 지을 때 그 값이 무엇인지 따지지 않고 어느 자리인지만 보면 표기가 정해집니다)**

| 자리 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 타입, 인터페이스, 컴포넌트 | `PascalCase` |
| 나머지 전부 — 변수, 함수, 객체 키, 스키마 키, 타입 필드 | `camelCase` |

`const`인지, 설정인지, 상수 집합인지에 따라 표기를 달리하지 않습니다.
그 값이 무엇인지는 표기가 아니라 이름과 자리가 말합니다.

설정 키도 `camelCase`입니다.
`config.pagination.defaultPageSize`가 설정에서 왔다는 사실은 표기가 아니라 `config.` 체인이 말해 줍니다.
`naming-preserve-config-origin-with-chained-access` 규칙이 그 체인을 강제하므로
표기가 같은 말을 두 번 할 필요가 없습니다.
`enum` 성격 상수도 같습니다.
`types-replace-enum-with-as-const-objects` 규칙이 `as const`를 강제하고, 선언에 붙는 문서 주석이 값 집합임을 밝힙니다.

**예외는 밖으로 나가는 키뿐입니다.**
API 요청 본문, 라이브러리 인자, DOM 속성, 환경 변수처럼 받는 쪽이 이름을 정하는 자리는 받는 쪽 표기를 그대로 씁니다.
`{user_id: 1}`을 보내야 하는 API에는 `user_id`로 적습니다.
우리가 짓는 이름이 아니라 받는 쪽 계약이라 우리 표기로 바꾸지 않습니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것도 지역 심볼을 새로 짓는 일이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

폴더명은 프레임워크가 강제하는 이름만 예외로 둡니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-naming-use-consistent-file-and-symbol-naming.md)을 읽습니다.
