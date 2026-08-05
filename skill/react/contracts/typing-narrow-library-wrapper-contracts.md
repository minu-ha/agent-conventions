# Narrow the Contract a Library Wrapper Opens

**Impact: HIGH (라이브러리의 스타일 우회로가 화면으로 새지 않고 교체할 때 래퍼 한 파일만 고칩니다)**

라이브러리 컴포넌트는 화면에서 직접 쓰지 않고 `Ui*` 래퍼를 거칩니다.
래퍼가 있어야 라이브러리를 올리거나 바꿀 때 한 파일만 고칩니다.

**`export type UiXProps = LibXProps`로 두지 않습니다.**
라이브러리 표면이 통째로 열려서 그 라이브러리의 스타일 통로까지 화면이 쓸 수 있게 됩니다.
`css/composition-inject-classes-only-at-the-entry-point`가 정한 스타일 창구가 그 자리에서 뚫립니다.

DOM 프롭이 아닌 계약은 세 갈래로 나눠 각각 다르게 씁니다.
DOM 표면은 아래 세 단계 표가 맡습니다.

| 프롭 | 어떻게 |
| --- | --- |
| 라이브러리에 **이미 있는** 표시 프롭 (`color`, `padding`, `size`) | `LibXProps["color"]` 인덱스 접근으로 하나씩 |
| 우리가 **새로 만든** 자기 프롭 (`icon`, `label`, `helperText`) | 우리가 타입을 적습니다 |
| 라이브러리 스타일 통로 (테마 스타일 프롭, 클래스 맵, 렌더 태그 교체) | 선언하지 않습니다 |

**자기 프롭**은 안쪽 컴포넌트가 받지 않는 프롭입니다.
`UiIconButtonProps`의 `icon`은 감싸는 컴포넌트가 모르므로 자기 프롭이고,
`UiTableRowProps`의 `selected`는 감싸는 컴포넌트가 받으므로 자기 프롭이 아닙니다.
인덱스 접근은 자기 프롭이 아닌 것, 곧 **이미 있는 프롭을 그대로 여는 자리**에만 씁니다.

**DOM 표면을 여는 방법은 세 단계이고 위에서부터 되는 것을 씁니다.**
어느 단계인지는 컴파일러가 알려 주므로 미리 고민하지 않습니다.

| 단계 | 언제 | 형태 |
| --- | --- | --- |
| 1 | 그냥 컴파일된다 | `extends HTMLAttributes<T>` |
| 2 | 라이브러리가 같은 이름 프롭의 **값을 좁혀** 부딪힌다 | `extends Omit<HTMLAttributes<T>, "color">`로 빼고 그 프롭을 인덱스 접근으로 다시 연다 |
| 3 | 감싸는 요소와 이벤트 대상 요소가 **서로 다르다** | `extends`를 쓰지 않고 필요한 프롭만 선언합니다 |

2단계가 필요한 이유는 `HTMLAttributes`가 `color`, `title`, `onChange`, `defaultValue`를 갖고 있어서입니다.
라이브러리가 그중 하나를 자기 값 집합으로 좁혀 두면 `extends`가 막힙니다.
그때는 **부딪히는 이름만 빼면 되지, 나머지 DOM 표면을 포기하지 않습니다.**

3단계는 입력 래퍼에서 나옵니다.
겉을 `div`로 감싸면서 이벤트는 안쪽 `input`이 받는 컴포넌트가 그렇습니다.
값이 아니라 요소 타입이 어긋나므로 `Omit`으로 한둘 빼도 이벤트 핸들러가 줄줄이 걸립니다.
이때는 DOM 프롭도 필요한 것만 적고, 라이브러리 타입이 아니라 `string`,
`ChangeEventHandler<HTMLInputElement>` 같은 플랫폼 타입을 씁니다.
`value`나 `onChange`처럼 DOM이 이미 정한 이름은 라이브러리 것이 아닙니다.

여기 쓰는 `Omit`은 `typescript/types-reuse-existing-contracts-before-new-types`가 허용하는 자리입니다.
DOM 표면은 리액트가 속성을 더하면 래퍼도 따라 받아야 하는 열린 집합이라
뺄 이름만 적는 것이 맞습니다.
남는 것을 손으로 적을 수도 없습니다.

- 인덱스 접근은 상속 사슬을 따라갑니다.
  바깥 타입 이름 하나만 쓰면 됩니다.
- 값을 손으로 다시 적는 것은 일부러 좁힐 때만 합니다.
  좁힌 이유를 적는 형식과 근거 기준은
  `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- `aria-*`와 `data-*`는 하이픈이 들어 있어 TypeScript가 검사하지 않습니다.
  선언하지 않아도 넘어갑니다.
- `ref`를 여는 기준은 `composition-open-ref-props-only-for-imperative-contracts`가 정합니다.
- 프롭을 어떻게 넘기는지는 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.
- `HTMLAttributes`를 `extends` 하면 `style`도 같이 열립니다.
  인라인 `style`을 쓸지는 `css/values-do-not-style-through-the-style-attribute`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-02-typing-narrow-library-wrapper-contracts.md)을 읽습니다.
