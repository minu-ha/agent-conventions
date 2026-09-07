# Extract Support Functions Only When the Boundary Is Real

**Impact: MEDIUM (불필요한 함수 분리를 줄여 호출부에서 처리 흐름을 읽을 수 있습니다)**

한 곳에서만 쓰는 단계는 호출부에 두고, 다음 사유가 있을 때만 보조 함수에 이름을 붙입니다.
추출한 함수는 바깥 변수·훅·컴포넌트 상태 없이도 뜻이 통해야 합니다.

| 허용 사유 | 조건 |
| --- | --- |
| 실제 재사용 | 변경 후 코드에서 두 자리 이상이 부릅니다. 한 줄 함수도 같습니다 |
| 요청 조립을 렌더 파일 밖으로 이동 | `.tsx`의 순수 요청·저장 payload 조립은 한 곳에서만 써도 같은 소유자의 `.ts`로 옮깁니다. 표시용 가공이나 기존 `.ts`는 해당하지 않습니다 |
| 함수 형태가 필수 | 삼항 하나로 표현할 수 없는 판정, `value is T` 타입 가드, 재귀입니다 |

| 추출을 검토하는 이유 | 처리 |
| --- | --- |
| 한 번 쓰는 단계가 길거나 나중에 재사용할 것 같음 | 호출부에 두고 `docs-keep-body-comments-for-intent-and-steps`의 단계 주석으로 나눕니다 |
| `.map()` 콜백 하나에서만 쓰는 변환 | 그 콜백에 둡니다 |
| 값이 두 분기로 갈림 | 호출부에서 삼항 하나로 씁니다 |
| 값이 세 분기 이상으로 갈림 | 함수로 추출하고 분기마다 `return`으로 끝냅니다 |

추출 전에 값 검사를 `absence-check-once-at-the-boundary`의 경계로 보내 분기를 줄일 수 있는지 확인합니다.
같은 판정이 반복되면 `values-decide-once-and-carry-the-result`에 따라 결과를 전달할지도 먼저 봅니다.
함수 배치는 `functions-give-each-function-its-own-file`,
루트 승격은 `functions-promote-shared-functions-to-root-util`이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-functions-extract-helpers-only-when-the-boundary-is-real.md)을 읽습니다.
