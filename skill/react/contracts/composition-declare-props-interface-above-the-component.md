# Declare Props Interfaces Above the Component

**Impact: MEDIUM (계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다)**

프롭스 타입은 `interface`로 선언하고 컴포넌트 선언 바로 위에 둡니다.
파일을 열면 계약이 먼저 보이고 구현이 그 아래 옵니다.

- 이름은 컴포넌트 이름에 `Props`를 붙입니다.
  `UiButton`이면 `UiButtonProps`입니다.
- 합성 부품 여럿이 형태가 완전히 같으면 공통 이름 하나로 선언해 나눠 씁니다.
  `UiSectionRoot`·`UiSectionHeader`·`UiSectionFooter`가 모두 `{children}`이면 `UiSectionProps` 하나입니다.
  같은 형태를 부품마다 다시 선언하면 `typescript/types-reuse-existing-contracts-before-new-types`가 걸립니다.
- 사용처가 이 계약을 참조할 수 있어야 하므로 `export`합니다.
  같은 파일 안에서만 쓰는 화면 지역 컴포넌트의 프롭스는 `export`하지 않습니다.
- 합성 부품 여럿이 하나를 나눠 쓰는 프롭스 `interface`는 부품이 한 파일에 있으면 첫 부품 위에 둡니다.
  부품이 파일로 갈리면 소유자 `_type` 폴더에 둡니다.
- 프롭스 타입은 파일 위쪽에 모으지 않습니다.
  컴포넌트가 여러 개면 각자 위에 둡니다.
  컴포넌트가 아닌 함수의 객체 매개변수 타입은
  `typescript/functions-use-named-object-params-for-complex-signatures`가 정합니다.
- 설명, `interface`, 컴포넌트 순서로 붙여 둡니다.
  컴포넌트가 무엇인지 설명하는 문서 주석은 컴포넌트가 아니라 `interface` 위에 둡니다.
  합성 공개 부품도 같은 순서입니다.
  공유 `interface`를 쓰는 부품은 부품마다 다른 설명을 컴포넌트 위에 둡니다.
- 문서 주석에 무엇을 쓸지는 `typescript/types-document-custom-types-and-shapes`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-06-composition-declare-props-interface-above-the-component.md)을 읽습니다.
