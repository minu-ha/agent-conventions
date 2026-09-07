# Avoid Imperative Assembly in Wide Scopes

**Impact: MEDIUM (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체에 걸친 `let` 재할당, `push`, 조건부 누적으로 값을 조립하지 않습니다.
`if`나 `for` 블록 안에서만 쓰는 누적은 대상이 아닙니다.

| 상황 | 조립 방법 |
| --- | --- |
| 좁은 스코프에서만 씀 | 해당 스코프에서 바로 계산합니다 |
| 값 하나가 두 분기로 갈림 | 삼항 하나로 씁니다 |
| 값 하나가 세 분기 이상으로 갈림 | 함수로 추출하고 분기마다 `return`으로 끝냅니다 |
| 목록에 조건부 항목을 넣음 | 조건부 스프레드나 `filter`로 한 번에 조립합니다 |

중첩 삼항과 기본값을 `let`에 넣은 뒤 덮어쓰는 방식은 사용하지 않습니다.
분기별 결과가 그 자리에서 끝나야 읽는 사람이 이후 재할당까지 확인하지 않아도 됩니다.
추출 전에 `absence-check-once-at-the-boundary`에 따라 값을 검사하면 분기가 줄어들 수 있습니다.

추출 여부는 `functions-extract-helpers-only-when-the-boundary-is-real`,
함수 이름은 `functions-name-functions-by-what-comes-out`을 따릅니다.
중간값 명명은 `functions-name-a-value-only-for-recompute-or-judgment`가 판단합니다.

**Incorrect (넓은 스코프에서 명령형으로 조립을 쌓습니다):**

```ts
let visibleTabs = ["overview"];

if (canManageItems) {
	visibleTabs.push("items");
}
```

**Correct (조건부 스프레드로 한 번에 계산합니다):**

```ts
const visibleTabs = ["overview", ...(canManageItems ? ["items"] : [])];
```

> 나머지 예시·예외는 [full rule](../rules/03-07-functions-avoid-imperative-assembly-in-wide-scopes.md)에 있습니다.
