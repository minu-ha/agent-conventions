# Invalidate the Queries a Mutation Changed

**Impact: HIGH (저장 뒤 화면이 옛 서버 상태를 계속 보여 주지 않습니다)**

뮤테이션이 바꾼 서버 상태는 그 데이터를 소유한 쿼리 키로 `invalidateQueries`해서 되맞춥니다.

| 하려는 것 | 쓰는 것 |
| --- | --- |
| 바뀐 서버 상태를 다시 읽는다 | `invalidateQueries` |
| 응답으로 목록을 손으로 고쳐 넣는다 | 쓰지 않습니다 |
| 지금 화면만 다시 불러온다 | 쓰지 않습니다 |

`setQueryData`로 캐시를 조립하지 않습니다.
서버가 계산한 결과를 화면이 흉내 내는 것이라, 정렬이나 집계가 서버와 어긋나면 조용히 틀린 화면이 남습니다.

`refetch()`를 부르지 않습니다.
그 훅 하나만 다시 읽어서, 같은 데이터를 보는 다른 화면은 옛 값을 그대로 갖습니다.

- 쿼리 키 문자열을 화면에서 손으로 적지 않습니다.
  쿼리 훅이 내보낸 키를 씁니다.
- 무효화 대상이 여럿이면 성공 콜백에서 나란히 부릅니다.
- 무효화를 이펙트로 옮기지 않습니다.
  `events-run-user-actions-in-handlers-not-effects`가 그것을 막습니다.
- 어디서 부를지는 `data-handle-mutation-failure-where-it-is-called`가 정한 자리와 같습니다.

> 예시·예외가 필요하면 [full rule](../rules/07-06-data-invalidate-queries-the-mutation-changed.md)을 읽습니다.
