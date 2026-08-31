# Open DOM Props in Three Steps

**Impact: HIGH (프롭 하나가 부딪혔다고 `id`·`role`·`aria-*`·이벤트까지 잃지 않습니다)**

무엇을 열지는 `typing-narrow-library-wrapper-contracts`가 먼저 정합니다.
이 규칙은 그중 DOM 표면을 어떤 형태로 열지만 봅니다.

**DOM 표면을 여는 방법은 세 단계이고 위에서부터 되는 것을 씁니다.**
어느 단계인지는 컴파일러가 알려 주므로 미리 고민하지 않습니다.

| 단계 | 언제 | 형태 |
| --- | --- | --- |
| 1 | 그냥 컴파일됨 | `extends HTMLAttributes<T>` |
| 2 | 라이브러리가 같은 이름 프롭의 **값을 좁혀** 부딪힘 | `extends Omit<HTMLAttributes<T>, "color">`로 빼고 그 프롭을 인덱스 접근으로 다시 엽니다 |
| 3 | 감싸는 요소와 이벤트 대상 요소가 **서로 다름** | `extends`를 쓰지 않고 필요한 프롭만 선언합니다 |

2단계가 필요한 이유는 `HTMLAttributes`에 `color`, `title`, `onChange`, `defaultValue`가 이미 있어서입니다.
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

- `aria-*`와 `data-*`는 하이픈이 들어 있어 TypeScript가 검사하지 않습니다.
  선언하지 않아도 넘어갑니다.
- `HTMLAttributes`를 `extends` 하면 `style`도 같이 열립니다.
  인라인 `style`을 쓸지는 `css/composition-do-not-style-through-the-style-attribute`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-typing-open-dom-props-in-three-steps.md)을 읽습니다.
