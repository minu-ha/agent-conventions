# Prefer Function Variable Types Over Parameter Annotations

**Impact: MEDIUM-HIGH (계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다)**

타입을 붙일 자리가 둘 있습니다.

| 붙이는 자리 | 형태 |
| --- | --- |
| 매개변수와 반환값에 하나씩 | `const handleClick = (event: MouseEvent<HTMLButtonElement>): void => …` |
| 함수를 담는 변수에 한 번 | `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …` |

쓸 수 있는 계약이 이미 있으면 아래쪽을 씁니다.
이름 하나로 매개변수와 반환값이 함께 정해져서 계약이 한 자리에 모입니다.

| 상황 | 하는 것 |
| --- | --- |
| 인터페이스, 객체 계약, 프레임워크 별칭이 이미 있음 | 그 계약을 함수를 담는 변수에 붙입니다 |
| 인터페이스에 콜백 필드가 있음 | `Contract["onSelect"]`처럼 인덱스 접근으로 가져다 씁니다 |
| 같은 시그니처를 쓰는 구현이 이미 둘 이상 | 함수 타입 별칭을 새로 선언합니다 |
| 쓸 계약이 없고 구현도 하나뿐 | 매개변수 타입을 직접 적습니다. 지역 함수 하나 때문에 별칭을 늘리지 않습니다 |

가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore` 규칙을 다시 봅니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`useQuery`에 넘기는 `select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
커링 팩토리가 돌려주는 리액트 핸들러는 프레임워크 컨벤션이 판정합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-03-types-prefer-function-variable-types-over-parameter-annotations.md)을 읽습니다.
