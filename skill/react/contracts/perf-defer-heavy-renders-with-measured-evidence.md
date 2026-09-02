# Defer Heavy Renders Only With Measured Evidence

**Impact: MEDIUM (무겁다고 짐작해서 트랜지션과 지연 값으로 감싸지 않고 실제로 무거운 자리만 미룹니다)**

렌더를 미루는 도구는 `startTransition`, `useTransition`, `useDeferredValue`입니다.
**먼저 미룰 만큼 무거운지 확인합니다.**

`perf-avoid-defensive-memoization`이 허용하는 세 사유 중 측정한 병목 하나만 여기서 근거가 됩니다.
목록이 몇 줄인지, 어느 조작이 몇 밀리초 걸렸는지 확인한 뒤에 씁니다.
"목록이 커질 것 같아서"는 근거가 아닙니다.

미루기로 했으면 원인이 어디에 있느냐에 따라 도구가 갈립니다.

| 원인 | 쓰는 것 |
| --- | --- |
| 내가 부르는 `setState`가 무거운 렌더를 일으킴 | `startTransition`으로 그 호출을 감쌉니다 |
| 값은 즉시 반응해야 하는데 그 값에서 파생되는 렌더가 무거움 | `useDeferredValue`로 한 박자 지연 값을 만듭니다 |

`set` 함수가 내 것이 아니면 `startTransition`을 쓸 수 없습니다.
그때는 `useDeferredValue`입니다.

- 입력값 자체, 폼 오류, 즉시 비활성화처럼 급한 반응은 트랜지션에 넣지 않습니다.
- `startTransition`은 대기 상태를 알려 주지 않습니다.
  진행 표시가 필요하면 `useTransition`의 `isPending`을 씁니다.
- `await` 뒤에 상태를 갱신하면 그 갱신을 다시 `startTransition`으로 감쌉니다.
  `await` 뒤에는 트랜지션 범위가 끊깁니다.
  리액트가 비동기 문맥을 이어가지 못하기 때문입니다.
- 무거운 하위 트리의 렌더를 늦추려면 지연 값을 받는 컴포넌트가 `memo`여야 합니다.
  `memo`가 아니면 부모가 다시 렌더할 때 그 트리도 함께 다시 렌더합니다.
- 무거운 것이 하위 트리 렌더가 아니라 계산이면 `memo`가 필요 없습니다.
  `useMemo`가 지연 값에서만 다시 계산하므로 급한 입력 렌더는 그 계산을 건너뜁니다.
- 지연 값 기준 재계산에 `useMemo`를 함께 쓰는 것은 `perf-avoid-defensive-memoization`의 허용 사유에 듭니다.
  그때도 측정한 근거를 주석으로 남깁니다.

> 예시·예외가 필요하면 [full rule](../rules/10-03-perf-defer-heavy-renders-with-measured-evidence.md)을 읽습니다.
