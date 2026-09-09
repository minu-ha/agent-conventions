# Declare Functions as Arrow Consts

**Impact: MEDIUM (함수 선언과 본문 형식을 통일해 변경 범위를 줄이고 선언 순서를 확인하기 쉽게 합니다)**

### 선언과 본문 형식

이름 붙인 함수는 `const` 화살표로 선언하고, 객체에 담는 함수도 화살표로 씁니다.
본문은 블록으로 열고 값을 반환할 때 `return`을 적으며, 반환값이 없으면 생략합니다.

| 대상 | 선언, 본문 형식 |
| --- | --- |
| 이름 붙인 함수 | `const name = (…) => { … }` |
| 객체에 담긴 함수 | `name: (…) => { … }`. 메서드 축약형은 쓰지 않습니다 |
| 일회성 인라인 콜백 | `rows.map((row) => row.id)`처럼 표현식 본문을 허용합니다 |
| 커링의 바깥 화살표 | `(id) => (event) => { … }`처럼 안쪽 함수만 블록으로 엽니다 |
| 클래스 메서드 | 메서드 문법을 유지하고 화살표 필드로 바꾸지 않습니다 |
| 제너레이터 | `function*` 문법을 씁니다 |
| 오버로드 | `function` 선언을 허용합니다. 호출 시그니처 타입을 `const`에 붙일 수 있으면 그쪽을 씁니다 |

선언, 본문 형식을 고정하면 호이스팅 의존을 줄이고 코드가 늘 때의 diff와 주석 경계를 일정하게 유지합니다.
객체 반환에도 별도의 `({...})` 괄호가 필요하지 않습니다.

### `this`를 쓰는 함수

**`this`를 쓰는 함수는 기계적으로 치환하지 않습니다.**
축약 메서드의 `this`는 호출 방식에 따라 달라지고, 화살표는 선언된 바깥 스코프의 `this`를 사용합니다.
메서드를 떼어 내거나 화살표로 바꾸기 전에 동작을 확인합니다.
외부 콜백이 호출 시점의 `this`를 요구하면 계약을 유지하고 이유 주석을 남깁니다.

`useConsistentArrowReturn`은 인라인 콜백과 커링까지 강제하므로 켜지 않습니다.
도구 설정은 `tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

**Incorrect 1 (이름 붙인 함수를 `function`으로 선언합니다):**

```ts
/**
 * 검색어 비교에서 공백 차이를 무시하도록 제목의 공백을 정리한다
 */
export function toTrimmedTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}
```

**Correct 1 (같은 함수를 `const` 화살표와 블록 본문으로 선언합니다):**

```ts
/**
 * 검색어 비교에서 공백 차이를 무시하도록 제목의 공백을 정리한다
 */
export const toTrimmedTitle = (rawTitle: string): string => {
	return rawTitle.trim().replace(/\s+/g, " ");
};
```

> 나머지 예시와 예외는 [full rule](../rules/03-01-functions-declare-functions-as-arrow-consts.md)에 있습니다.
