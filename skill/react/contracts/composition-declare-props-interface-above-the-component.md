# Declare and Export Props Interfaces Above the Component

**Impact: MEDIUM (계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다)**

프롭스 타입은 `interface`로 선언하고 컴포넌트 선언 바로 위에 둡니다.
파일을 열면 계약이 먼저 보이고 구현이 그 아래 옵니다.

- 이름은 컴포넌트 이름에 `Props`를 붙입니다. `UiButton`이면 `UiButtonProps`입니다.
- 사용처가 이 계약을 참조할 수 있어야 하므로 `export`합니다.
  래퍼 사용처가 원본 라이브러리 프롭스를 보지 않게 하려는 것입니다.
- 프롭스 타입은 파일 위쪽에 모으지 않습니다. 컴포넌트가 여러 개면 각자 위에 둡니다.
  컴포넌트가 아닌 함수의 객체 매개변수 타입은 `typescript/functions-use-named-object-params-for-complex-signatures`가 정합니다.
- 문서 주석은 `typescript/types-document-custom-types-and-shapes`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-06-composition-declare-props-interface-above-the-component.md)을 읽습니다.
