# Handle Mutation Failure Where the Mutation Is Called

**Impact: HIGH (저장이 실패했는데 성공한 것처럼 넘어가거나 아무 표시 없이 끝나지 않습니다)**

뮤테이션 실패는 오류 경계가 받지 못합니다.
핸들러 안에서 난 오류는 렌더 중이 아니라 경계를 지나갑니다.
`runtime-place-error-boundaries-by-blast-radius`가 그 경계를 정하고, 여기서는 그 밖의 자리를 봅니다.

**기본은 `mutate`와 `useMutation`의 `onError`·`onSuccess`입니다.**
성공과 실패가 선언 자리에 함께 남고 핸들러는 부르기만 합니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 부른 뒤 핸들러가 더 할 일이 없다 | `mutate` + `onError`·`onSuccess` |
| 부른 결과를 기다렸다가 핸들러가 이어서 해야 한다 | `mutateAsync` + `try`/`catch` |

`mutateAsync`는 실패하면 던집니다.
`await`만 하고 `catch`하지 않으면 그 뒤 줄이 실행되지 않고 사용자에게 아무 표시도 남지 않습니다.
`mutateAsync`를 쓰기로 했으면 `try`/`catch`를 같이 씁니다.

- 한 뮤테이션을 부르는 자리들끼리는 형태를 섞지 않습니다.
  같은 저장을 어떤 자리는 `mutate`로, 어떤 자리는 `mutateAsync`로 부르면 실패를 어디서 받는지 다시 찾게 됩니다.
- 빈 `catch`로 실패를 삼키지 않습니다.
  다시 던지든 표시하든 무엇이든 합니다.
- 여러 번 눌러 같은 뮤테이션이 겹치는 것은 버튼을 `isPending`으로 `disabled` 처리해 막고,
  핸들러 첫 줄에서 `isPending` 이른 반환으로 한 번 더 막습니다.
- 성공 뒤 캐시를 다시 맞추는 것은 `data-invalidate-queries-the-mutation-changed`가 정합니다.

실패했을 때 무엇을 보여 줄지는 이 규칙이 정하지 않습니다.
제품마다 다르고 코드로 판정할 수 없습니다.

> 예시·예외가 필요하면 [full rule](../rules/02-05-data-handle-mutation-failure-where-it-is-called.md)을 읽습니다.
