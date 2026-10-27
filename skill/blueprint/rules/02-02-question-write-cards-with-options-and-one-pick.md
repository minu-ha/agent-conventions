---
title: Write Cards with Options and One Pick
titleKo: 카드는 선택지와 추천 하나로 씁니다
impact: CRITICAL
impactDescription: 답하는 사람이 카드만 읽고 고를 수 있게 해서 질문이 설명문이 되지 않게 합니다
appliesWhen:
  - questions.md에 질문 항목을 추가하거나 고칠 때
  - 사용자가 질문을 읽고 답을 못 고르겠다고 할 때
tags: question, card, options
---

## Write Cards with Options and One Pick

**Impact: CRITICAL (답하는 사람이 카드만 읽고 고를 수 있게 해서 질문이 설명문이 되지 않게 합니다)**

카드는 질문 한 줄, 선택지 표, 열쇠말 목록 순서로 7줄 안팎입니다. 경위와 작업 이야기는 적지 않습니다.

| 자리 | 내용 |
| --- | --- |
| 첫 줄 | 질문 한 줄을 굵게. 상태와 막는 단계를 같은 줄에 |
| 선택지 표 | `A`, `B`, `C` 한 줄씩. 추천 하나에만 `★` |
| `Why` | 추천 이유 한 줄 |
| `Ask`, `Request` | 상대에게 묻거나 요청하는 것 한 줄 |
| `Now`, `Fallback`, `Impact`, `Also` | 지금 동작, 답 전 대체값, 영향, 같이 볼 것. 필요한 것만 |
| `Figure` | 캡처 링크. B 카드는 필수 |

열쇠말은 영어 고정 목록에서 고릅니다. 새 열쇠말을 만들지 않습니다.
막는 단계는 `Blocks stage 2`처럼 적고, 막지 않으면 `Non-blocking`입니다.
상태는 `Needs answer`, `Waiting on BE`, `Waiting on plan`, `User decides`, `Follow-up` 가운데 하나입니다.
선택지가 있는 카드의 추천은 정확히 하나입니다. 추천이 없으면 선택지 표를 두지 않습니다.
근거가 7줄을 넘으면 화면 문서의 접힌 구현 상세로 보내고 카드에는 링크만 둡니다.

**Incorrect 1 (경위와 속뜻을 문장으로 풀어 답하는 사람이 고를 자리를 못 찾습니다):**

<<< ../examples/question-write-cards-with-options-and-one-pick/01-incorrect.markdown

**Correct 1 (질문 한 줄, 선택지와 추천 하나, 이유 한 줄로 7줄에 끝냅니다):**

<<< ../examples/question-write-cards-with-options-and-one-pick/02-correct.markdown
