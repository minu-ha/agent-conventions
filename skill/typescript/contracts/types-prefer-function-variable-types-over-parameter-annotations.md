# Prefer Function Variable Types Over Parameter Annotations

**Impact: MEDIUM-HIGH (계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다)**

타입을 붙일 자리가 둘 있습니다.

| 붙이는 자리 | 형태 |
| --- | --- |
| 매개변수와 반환값에 하나씩 | `const handleClick = (event: MouseEvent<HTMLButtonElement>): void => …` |
| 함수를 담는 변수에 한 번 | `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …` |

쓸 수 있는 계약이 이미 있으면 아래쪽을 씁니다.
이름 하나로 매개변수와 반환값이 함께 정해져서 계약을 한 자리에서 읽습니다.
이미 있는 인터페이스, 객체 계약, 프레임워크 별칭을 먼저 찾고,
매개변수 타입은 쓸 계약이 없을 때만 직접 적습니다.
인터페이스에 콜백 필드가 있으면 `Contract["onSelect"]`처럼 인덱스 접근으로 가져다 씁니다.
가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore` 규칙을 다시 봅니다.
함수 타입 별칭을 새로 선언하는 것은 같은 시그니처를 쓰는 구현이 이미 둘 이상일 때만입니다.
한 번만 쓰는 지역 함수 때문에 함수 타입 별칭을 늘리지 않습니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
커링 팩토리가 돌려주는 리액트 핸들러는 프레임워크 컨벤션이 판정합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-02-types-prefer-function-variable-types-over-parameter-annotations.md)을 읽습니다.
