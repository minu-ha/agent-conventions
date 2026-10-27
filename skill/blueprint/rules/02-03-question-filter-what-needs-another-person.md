---
title: Filter What Needs Another Person
titleKo: 남의 답이 필요한 것만 남깁니다
impact: CRITICAL
impactDescription: 혼자 정할 수 있는 것까지 질문으로 쌓여 문서가 시작할 수 없는 것처럼 보이는 일을 막습니다
appliesWhen:
  - 질문 후보를 카드로 만들지 가를 때
  - 열린 질문이 단계를 막는지 셀 때
tags: question, filter, blocking, mock
---

## Filter What Needs Another Person

**Impact: CRITICAL (혼자 정할 수 있는 것까지 질문으로 쌓여 문서가 시작할 수 없는 것처럼 보이는 일을 막습니다)**

카드는 진짜 남의 답이 필요한 것에만 만듭니다. 후보가 생기면 먼저 아래 표로 거릅니다.

| 후보 | 처리 |
| --- | --- |
| FE 코드가 0줄인 것. 서버 정렬 기본값, 서버가 거르는 규칙 | 카드 없음. 구현 뒤 대조하는 Follow-up 목록 |
| BE가 아직 안 준 endpoint나 필드 | 지금 spec 위 mock으로 먼저 구현. 연동 단계에 "예정" 표로 |
| FE만으로 정할 수 있는 것 | D로 적고 Dev decision으로 바로 닫음 |
| FE에 영향이 없는 BE 사항 | 묻지 않음 |
| 서버 문자열과 수치의 뜻 | 그대로 그리고 캡처로 대조. Kept |
| 서버가 안 주는 집계 | FE가 계산. Kept |
| 기능, 문구, 데이터 기준처럼 기획이나 BE만 아는 것 | 카드 |

단계를 막는 질문은 그 단계의 코드가 답에 따라 달라지는 것뿐입니다.
BE 대기는 막는 것으로 세지 않고 연동 단계로 뺍니다. 들어올 때마다 spec을 다시 생성해 깨진 곳을 고치고 칸을 켭니다.
사용자가 답한 것과 정답표로 닫히는 것은 카드 없이 Resolved 표 한 줄로 끝냅니다.

**Incorrect 1 (BE 대기를 화면 단계의 막는 질문으로 세어 구현을 시작할 수 없는 문서로 보입니다):**

<<< ../examples/question-filter-what-needs-another-person/01-incorrect.markdown

**Correct 1 (막는 질문만 남기고 BE 대기는 연동 단계로, FE 0줄은 Follow-up으로 뺍니다):**

<<< ../examples/question-filter-what-needs-another-person/02-correct.markdown
