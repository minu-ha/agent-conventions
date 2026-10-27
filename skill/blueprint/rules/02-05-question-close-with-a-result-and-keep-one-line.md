---
title: Close with a Result and Keep One Line
titleKo: 닫을 때는 결과 한 줄만 남깁니다
impact: CRITICAL
impactDescription: 풀린 질문이 카드째 남아 열린 것과 섞이고 표가 수십 줄로 자라는 일을 막습니다
appliesWhen:
  - 답이 와서 질문을 닫을 때
  - 새 재료가 사용자가 앞서 답한 것과 어긋날 때
tags: question, resolve, result
---

## Close with a Result and Keep One Line

**Impact: CRITICAL (풀린 질문이 카드째 남아 열린 것과 섞이고 표가 수십 줄로 자라는 일을 막습니다)**

질문이 풀리면 카드를 지우고 그 화면 절 끝의 접힌 `Resolved` 표에 한 줄을 더합니다.
줄의 칸은 번호, 결정, 결과입니다. 결과는 고정 어휘에 날짜를 붙입니다.

| 결과 | 뜻 |
| --- | --- |
| `As recommended` | 추천대로 |
| `Per Figma`, `Per demo`, `Per spec` | 그 재료대로 |
| `Dev decision` | 개발이 정함 |
| `Kept` | 지금대로 |
| `Rejected` | 하지 않음 |
| `N/A` | 질문이 성립하지 않음 |
| `Moved` | 다른 화면이나 변경 문서로 |

본문과 단계 표의 번호 링크는 풀린 뒤 글로 바꿉니다. `Blocked by`에 풀린 번호를 남기지 않습니다.
열린 수에는 열린 것만 셉니다.
새 재료가 사용자가 앞서 답한 것과 어긋나면 그 답을 뒤집지 않고 `R` 카드로 올립니다.
이유와 경위는 변경 문서와 git이 쥡니다. `Resolved` 줄에는 적지 않습니다.

**Incorrect 1 (풀린 카드가 본문에 그대로 남고 단계 표가 풀린 번호를 계속 막는 것으로 셉니다):**

<<< ../examples/question-close-with-a-result-and-keep-one-line/01-incorrect.markdown

**Correct 1 (풀린 것은 접힌 표 한 줄, 어긋난 옛 답은 R 카드로 올립니다):**

<<< ../examples/question-close-with-a-result-and-keep-one-line/02-correct.markdown
