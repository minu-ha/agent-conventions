# Render a Single Branch With `&&`, Not a Ternary

**Impact: HIGH (조건부 렌더링 형태가 하나로 고정되고 쓰지 않는 `: null`이 사라집니다)**

JSX 안에서 그릴 분기가 **하나면** `&&`를 씁니다.
`조건 ? <X /> : null`로 쓰지 않습니다.
`: null`은 아무것도 안 하면서 눈이 한 번 더 멈추는 자리를 만듭니다.

컴포넌트가 통째로 아무것도 안 그릴 때는 `&&`를 쓰지 않습니다.
`&&`는 조건이 거짓이면 `false`를 돌려주는데, 반환값 자리에서는 `null`이 뜻이 분명합니다.
조건을 이른 반환으로 먼저 걸러 냅니다.

**둘 중 하나를 그릴 때만** 삼항을 씁니다.
그때는 두 분기가 다 뜻을 갖습니다.

| 그리는 것 | 쓰는 것 |
| --- | --- |
| 조건이 참일 때만 | `{조건 && <X />}` |
| 참일 때와 거짓일 때 각각 | `{조건 ? <X /> : <Y />}` |

**`&&` 왼쪽에 숫자를 두지 않습니다.**
`0`은 거짓이지만 리액트가 화면에 `0`을 그대로 그립니다.
`NaN`도 `NaN`으로 그려집니다.
길이나 개수로 판단할 때는 비교식으로 바꿔 불리언을 만듭니다.

문자열과 객체는 왼쪽에 두어도 됩니다.
빈 문자열, `undefined`, `null`은 리액트가 아무것도 그리지 않습니다.

삼항을 여러 개 겹치지 않습니다.
분기가 셋 이상이면 조건을 이름 붙인 값으로 꺼내거나 섹션 컴포넌트로 나눕니다.
어느 쪽인지는 `screen-extract-local-section-components-for-runtime-boundaries`가 정합니다.

숨긴 하위 트리의 상태를 살려야 하면 `composition-use-activity-only-to-preserve-mounted-subtrees`를 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/05-08-composition-render-one-branch-with-and.md)을 읽습니다.
