# Use Consistent File, Symbol, and Field Naming

**Impact: HIGH (모듈과 실행 구조를 넘나들며 파일명, 심볼, 형태 필드가 예측대로 유지됩니다)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입은 `PascalCase`입니다.
폴더명은 `kebab-case` 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.
`const`인지에 따라 표기를 달리하지 않습니다. 모듈 안 지역 값은 모두 `camelCase`로 맞춥니다.

공용 설정 객체의 키와 enum 성격 상수 객체의 이름과 키는 `snake_case`입니다.
일반 객체 키, 스키마 키, 커스텀 타입 필드는 `camelCase`를 유지합니다.

외부 패키지가 내보낸 이름을 별칭 없이 그대로 가져오는 것은 지역 심볼을 새로 짓는 일이 아니라 이 규칙의 대상이 아닙니다.
지역 별칭을 추가하거나 가져오기 이름을 바꿀 때만 다시 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/01-03-naming-use-consistent-file-and-symbol-naming.md)을 읽습니다.
