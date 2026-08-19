# Order Hooks, Handlers, Effects, Then Return

**Impact: MEDIUM (어느 컴포넌트를 열어도 같은 자리에서 같은 종류를 찾습니다)**

컴포넌트 본문은 네 구획을 이 순서로 둡니다.

| 순서 | 구획 | 담는 것 |
| --- | --- | --- |
| 1 | 훅 | 라우터·스토어·쿼리·컨텍스트·커스텀 훅과 `useState`·`useRef` |
| 2 | 핸들러 | `handle*` 함수 |
| 3 | 이펙트 | `useEffect`·`useLayoutEffect` |
| 4 | 반환 | 조기 반환과 JSX |

본문은 렌더마다 위에서 아래로 실행되므로 앞 선언은 뒤 선언을 참조하지 못합니다.
이 순서는 그 제약을 그대로 따른 것입니다.

- 이펙트의 인자와 의존성 배열은 그 줄에서 바로 평가됩니다.
  이펙트를 마지막 훅으로 두면 본문의 어떤 선언이든 의존성에 넣을 수 있습니다.
- 조기 반환은 어떤 훅보다도 뒤에 옵니다.
  훅 호출 개수가 렌더마다 같아야 하기 때문입니다.
- 구획 안에서는 참조가 선언 뒤에 오게만 하고 순서를 더 정하지 않습니다.
- 파생 값은 구획이 아닙니다.
  `screen-keep-derived-values-close`대로 쓰는 자리에서 계산합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-09-composition-order-hooks-handlers-effects-then-return.md)을 읽습니다.
