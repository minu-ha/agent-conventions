# Use Consistent File, Symbol, and Field Naming

**Impact: MEDIUM-HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

| 대상 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 폴더명 | `kebab-case` 단수 |
| 변수, 함수 | `camelCase` |
| 타입, 인터페이스, 컴포넌트 | `PascalCase` |
| 선언형 설정 객체의 키 | `snake_case` |
| `enum` 성격 상수 객체의 이름과 키 | `snake_case` |
| 일반 객체 키, 스키마 키, 타입 필드 | `camelCase` |

`const`인지에 따라 표기를 달리하지 않습니다.
설정과 `enum` 성격 객체를 뺀 나머지 모듈 값은 `camelCase`입니다.
설정 키는 공용이든 소유자 전용이든 `snake_case`라, 소유자 설정을 공용으로 올릴 때 키를 고치지 않습니다.
폴더명은 프레임워크가 강제하는 이름만 예외로 둡니다.

**`snake_case`를 쓰는 자리는 선언형 설정 객체와 `enum` 성격 상수 객체뿐입니다.**
라이브러리 인자, API 요청 본문, DOM 속성으로 그대로 넘어가는 키는 받는 쪽 표기를 그대로 씁니다.
그 둘이 아니면 `camelCase`입니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것은 지역 심볼을 새로 짓는 일이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-naming-use-consistent-file-and-symbol-naming.md)을 읽습니다.
