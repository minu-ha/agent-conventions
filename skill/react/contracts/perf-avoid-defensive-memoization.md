# Do Not Memoize Without a Confirmed Reason

**Impact: MEDIUM (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`을 막습니다)**

`useMemo`와 `useCallback`은 기본적으로 쓰지 않습니다.
쓰는 경우는 다음 셋뿐입니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 이펙트 의존성으로 들어가는 객체나 배열이어서 감싸지 않으면 이펙트가 매 렌더 다시 돌 때
- 병목이 실제로 측정됐을 때

이펙트 의존성을 이유로 감쌀 때는 성능이 아니라 정합성 때문입니다.
객체와 배열은 렌더마다 새 참조라 의존성 비교가 늘 어긋납니다.

`perf-defer-heavy-renders-with-measured-evidence`를 따라 지연 값 기준으로 다시 계산하는 자리는
측정 사유에 듭니다.

리액트 컴파일러를 켜지 않은 프로젝트도 같습니다.
"컴파일러가 없으니 다 감싼다"는 이유는 이 셋에 없습니다.
자리마다 위 셋 중 하나가 있어야 합니다.

> 예시·예외가 필요하면 [full rule](../rules/10-01-perf-avoid-defensive-memoization.md)을 읽습니다.
