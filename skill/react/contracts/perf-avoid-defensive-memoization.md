# Do Not Memoize Without a Confirmed Reason

**Impact: MEDIUM (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`, `memo`를 막습니다)**

`useMemo`·`useCallback`·`memo`는 아래 네 경우에만 씁니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다.

| 허용 근거 | 확인할 내용 |
| --- | --- |
| 외부 라이브러리의 참조 계약 | 참조 변경이 상태 초기화나 구독 재설치로 이어집니다 |
| 불필요한 이펙트 재구독 | 객체·배열이 이펙트 밖에서도 필요하며, 재구독이 확인됐고 의존성을 더 단순하게 만들 수 없습니다 |
| 실측 병목 | 계산이나 렌더 비용을 실제로 측정했습니다 |
| 지연 값을 받는 하위 트리 | `perf-defer-heavy-renders-with-measured-evidence`에서 `memo`를 요구합니다 |

계산이나 함수가 다시 실행된다는 사실만으로 메모이제이션하지 않습니다.
이펙트에서만 쓰는 객체·배열은 이펙트 안에서 만들고 원본 값에 의존합니다.

리액트는 `useMemo`·`useCallback` 캐시를 버릴 수 있으므로 정확성을 캐시에 의존하지 않습니다.
다시 계산되거나 이펙트가 재설치되어도 동작해야 합니다.
외부 인스턴스의 수명은 소유 이펙트가, 렌더 사이에 보존할 값은 상태나 `ref`가 관리합니다.

리액트 컴파일러가 없어도 같은 기준을 적용합니다.
컴파일러가 같은 최적화를 이미 제공하면 수동 메모이제이션을 더하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/10-01-perf-avoid-defensive-memoization.md)을 읽습니다.
