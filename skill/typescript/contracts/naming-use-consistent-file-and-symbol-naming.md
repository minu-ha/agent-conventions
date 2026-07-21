# Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (keeps file names, symbols, and shape fields predictable across modules and runtime structures)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입은 `PascalCase`를 사용합니다.\
`const`인지 여부로 별도 casing을 두지 않고, 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.\
공용 설정 객체 키와 enum-like 상수 객체 이름 및 그 키는 `snake_case`, 일반 객체 키, schema 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/naming-use-consistent-file-and-symbol-naming.md)을 추가로 읽고 fallback 사유를 기록합니다.
