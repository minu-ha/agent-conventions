# Open DOM Props in Three Steps

**Impact: HIGH (프롭 타입 충돌을 해결하면서 필요한 DOM 속성과 이벤트를 유지합니다)**

`typing-narrow-library-wrapper-contracts`로 공개할 계약을 정한 뒤, DOM 속성은 아래 순서로 엽니다.
같은 요소로 `{...props}`를 전달하는 래퍼는 1·2단계 중 컴파일되는 형태를 씁니다.

| 단계 | 조건 | 형태 |
| --- | --- | --- |
| 1 | DOM 계약과 호환됨 | `extends <요소>HTMLAttributes<T>` |
| 2 | 같은 이름 프롭의 타입이 DOM 계약과 호환되지 않음 | `extends Omit<<요소>HTMLAttributes<T>, "size">`처럼 충돌하는 이름만 빼고, 그 프롭을 인덱스 접근으로 다시 엽니다 |
| 3 | 감싸는 요소와 이벤트 대상이 다르거나 자기 프롭을 하나씩 전달함 | `extends` 없이 전달할 DOM 프롭만 선언합니다 |

| 확인할 내용 | 기준 |
| --- | --- |
| 요소 전용 인터페이스 | 버튼은 `ButtonHTMLAttributes`, 입력은 `InputHTMLAttributes`, 셀은 `TdHTMLAttributes`를 씁니다. `HTMLAttributes`만 쓰면 `disabled`, `type`, `colSpan` 같은 전용 속성을 잃습니다 |
| 전용 인터페이스가 없는 요소 | `tr`처럼 전용 타입이 없을 때만 `HTMLAttributes`를 씁니다 |
| 호환되는 좁히기 | `string`을 문자열 리터럴 유니언으로 좁히면 1단계가 컴파일됩니다. 숫자 `size`를 문자열 크기 이름으로 바꾸는 경우에는 2단계가 필요합니다 |
| 요소 타입이 다름 | 겉은 `div`, 이벤트 대상은 `input`이면 `Omit`만으로 해결하지 않습니다. 필요한 DOM 프롭을 `string`, `ChangeEventHandler<HTMLInputElement>` 같은 플랫폼 타입으로 적습니다 |

`value`·`onChange`처럼 DOM이 정한 이름은 라이브러리 고유 계약이 아닙니다.
자기 프롭과 전달 방식은 `typing-choose-wrapper-shape-and-forwarding`을 따릅니다.
DOM 속성은 리액트가 추가한 속성도 받아야 하는 열린 집합이므로, 충돌한 이름만 `Omit`으로 뺍니다.
나머지를 직접 나열하지 않는 이 방식은 `typescript/types-reuse-existing-contracts-before-new-types`가 허용합니다.

선언되지 않은 `aria-*`·`data-*`는 JSX의 하이픈 이름이라 오류 없이 통과할 수 있지만,
이미 선언된 속성의 값은 타입 검사를 받습니다. 컴파일 결과뿐 아니라 실제 DOM 전달 코드도 확인합니다.
`HTMLAttributes`를 상속하면 `style`도 열리므로,
사용 여부는 `css/composition-do-not-style-through-the-style-attribute`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-typing-open-dom-props-in-three-steps.md)을 읽습니다.
