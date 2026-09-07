# Order Hooks, Handlers, Effects, Then Return

**Impact: MEDIUM (컴포넌트마다 훅·핸들러·이펙트를 같은 순서로 찾을 수 있습니다)**

컴포넌트 본문은 아래 네 구획 순서로 작성합니다.
렌더 중에 읽는 값은 사용 위치보다 위에서 선언합니다.

| 순서 | 구획 | 내용 |
| --- | --- | --- |
| 1 | 훅 | 라우터·스토어·쿼리·컨텍스트·커스텀 훅과 `useState`, `useRef` |
| 2 | 핸들러 | `handle*` 함수 |
| 3 | 이펙트 | `useEffect`, `useLayoutEffect` |
| 4 | 반환 | 이른 반환과 JSX |

이펙트의 인자와 의존성 배열은 해당 줄에서 평가되므로, 이펙트를 마지막 훅으로 두어 앞선 선언을 참조합니다.
이른 반환은 모든 훅 뒤에 두어 렌더마다 훅 호출 개수를 유지합니다.
구획 안에서는 선언 뒤에 참조한다는 조건만 지키고 별도 순서를 강제하지 않습니다.
파생 값은 별도 구획으로 모으지 않고 `screen-keep-derived-values-close`에 따라 사용하는 곳에서 계산합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-09-composition-order-hooks-handlers-effects-then-return.md)을 읽습니다.
