---
title: Report Done with the Check Command
titleKo: 완료는 확인 명령으로 보고합니다
impact: HIGH
impactDescription: 끝났다는 말 대신 명령의 출력으로 단계를 닫고 문서의 단계 표를 같은 턴에 갱신하게 합니다
appliesWhen:
  - 설계 문서의 단계 구현을 끝내고 보고할 때
  - 단계 표의 상태를 Done으로 바꿀 때
requiredOnCompletion: true
tags: stage, done, report
---

## Report Done with the Check Command

**Impact: HIGH (끝났다는 말 대신 명령의 출력으로 단계를 닫고 문서의 단계 표를 같은 턴에 갱신하게 합니다)**

단계를 끝내면 단계 표의 `Check` 명령을 실제로 돌리고 그 출력으로 보고합니다.

| 보고에 싣는 것 | 내용 |
| --- | --- |
| 단계 | 번호와 이름 |
| 확인 | 돌린 명령과 출력 요약. 실행하지 않았으면 실행하지 않았다고 |
| 문서 | 단계 표의 `Status`를 `Done` 날짜로, `revised` 갱신 |
| 남은 것 | 구현 중 생긴 질문은 `questions.md`의 카드로, 다음 단계의 `Blocked by` |

통과할 것이라는 추측으로 `Done`을 찍지 않습니다. 명령이 없는 단계는 캡처 대조 결과를 적습니다.
보고와 문서 갱신은 같은 턴에 합니다. 문서가 코드보다 늦으면 다음 사람이 옛 표를 믿습니다.

**Incorrect 1 (명령을 돌리지 않고 끝났다고 보고하며 문서는 그대로 둡니다):**

<<< ../examples/stage-report-done-with-the-check-command/01-incorrect.markdown

**Correct 1 (확인 명령의 출력으로 보고하고 단계 표를 같은 턴에 갱신합니다):**

<<< ../examples/stage-report-done-with-the-check-command/02-correct.markdown
