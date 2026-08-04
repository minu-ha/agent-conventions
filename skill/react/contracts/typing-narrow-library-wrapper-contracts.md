# Narrow the Contract a Library Wrapper Opens

**Impact: HIGH (라이브러리의 스타일 우회로가 화면으로 새지 않고 교체할 때 래퍼 한 파일만 고칩니다)**

라이브러리 컴포넌트는 화면에서 직접 쓰지 않고 `Ui*` 래퍼를 거칩니다.
래퍼가 있어야 라이브러리를 올리거나 바꿀 때 한 파일만 고칩니다.

**`export type UiXProps = LibraryXProps`로 두지 않습니다.**
라이브러리 표면이 통째로 열려서 `sx`, `classes`, `component`까지 화면이 쓸 수 있게 됩니다.
`css/composition-inject-classes-only-at-the-entry-point`가 정한 스타일 창구가 그 자리에서 뚫립니다.

**기본은 여는 프롭을 하나씩 선언하는 것입니다.**
값 타입은 손으로 적지 않고 인덱스 접근으로 가져옵니다.

| 프롭의 출처 | 타입을 어디서 가져오는가 |
| --- | --- |
| 라이브러리가 정한 표시 프롭 (`padding`, `sortDirection`, `color`) | `LibraryXProps["padding"]` |
| DOM 이벤트와 표준 속성 (`onClick`, `id`, `role`, `tabIndex`) | `MouseEventHandler<T>` 같은 리액트 타입 |
| 라이브러리 스타일 우회로 (`sx`, `classes`, `component`, `slotProps`) | 선언하지 않습니다 |

- 인덱스 접근은 상속 사슬을 따라갑니다.
  `StandardProps`나 `TableCellBaseProps`를 직접 가져올 필요 없이 바깥 타입 이름 하나만 씁니다.
- 값을 손으로 다시 적는 것은 일부러 좁힐 때만 합니다.
  그때는 좁힌 이유를 문서 주석에 남깁니다.
  같은 값을 다시 적는 것은 `typescript/types-reuse-existing-contracts-before-new-types`가 막습니다.
- `aria-*`와 `data-*`는 하이픈이 들어 있어 TypeScript가 검사하지 않습니다.
  선언하지 않아도 넘어가므로 목록에 적지 않습니다.
- `ref`를 여는 기준은 `composition-open-ref-props-only-for-imperative-contracts`가 정합니다.
- 사용처가 이 계약을 어떻게 참조하는지는 `typing-take-handler-types-from-existing-contracts`가 정합니다.
- 프롭을 어떻게 넘기는지는 `typing-choose-wrapper-shape-and-forwarding`가 정합니다.

**DOM 표면을 통째로 열고 싶으면 `extends HTMLAttributes<대상요소>`를 씁니다.
다만 늘 되지는 않습니다.**
`HTMLAttributes`에는 `color`, `title`, `onChange`, `defaultValue`가 들어 있고
라이브러리가 그중 하나라도 좁혀 놓으면 컴파일이 막힙니다.
MUI 기준으로 `TableCell`·`TableRow`·`ButtonBase`는 통과하고
`Button`·`Alert`·`Checkbox`·`TextField`는 막힙니다.
**막히면 그 래퍼는 프롭을 하나씩 선언하는 형태로 갑니다.** 어느 쪽인지는 컴파일러가 알려 줍니다.

요소 전용 타입(`ThHTMLAttributes`, `InputHTMLAttributes`)은 `extends` 하지 않습니다.
그 자리가 바로 라이브러리가 뜻을 바꿔 놓는 자리라 거의 항상 부딪힙니다.

`HTMLAttributes`를 `extends` 하면 `style`도 같이 열립니다.
인라인 `style`을 쓸지는 `css/values-do-not-style-through-the-style-attribute`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-02-typing-narrow-library-wrapper-contracts.md)을 읽습니다.
