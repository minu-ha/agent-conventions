---
title: Label in English and Explain in Korean
titleKo: 라벨은 영어, 설명은 한국어로 씁니다
impact: HIGH
impactDescription: 어색한 한국어 라벨과 지어낸 상태 말을 없애 표와 카드를 한눈에 읽게 합니다
appliesWhen:
  - 설계 문서의 표 머리, 상태, 열쇠말을 정할 때
  - 새 상태 말이나 열쇠말을 만들려 할 때
tags: writing, labels, vocabulary
---

## Label in English and Explain in Korean

**Impact: HIGH (어색한 한국어 라벨과 지어낸 상태 말을 없애 표와 카드를 한눈에 읽게 합니다)**

라벨은 영어, 내용은 한국어입니다. 한국어로 옮기면 어색한 낱말을 억지로 옮기지 않습니다.

| 영어 | 한국어 |
| --- | --- |
| 열쇠말 `Why`, `Now`, `Ask`, 단계 `Blocks stage 2`, 상태와 결과 알약, 표 머리, frontmatter `name`과 `group` | 제목, 본문, frontmatter `label`, 앱 화면 이름인 표 머리 |

상태 말은 고정 목록에서 고릅니다. 새 말을 만들기 전에 이 표부터 봅니다.

| 쓰임 | 어휘 | for-humanity 배지 `kind` |
| --- | --- | --- |
| 질문 | `Needs answer`, `Waiting on BE`, `Waiting on plan`, `User decides`, `Follow-up` | `unverified` |
| 결과 | `As recommended`, `Per Figma`, `Per demo`, `Per spec`, `Dev decision`, `Kept`, `Rejected`, `N/A`, `Moved` | `neutral`, 날짜 포함 |
| 단계 | `Ready`, `Done` | `verified`. `Done`은 날짜 포함 |
| 단계 | `Blocked` | `blocked` |
| 문서 | `Design`, `Implemented`, `Paused` | `neutral` |

배지는 프로젝트의 `for-humanity.config.ts`에 `status` 목록으로 묶고, 번호 접두는 `refs`로 칩이 되게 합니다.
링크와 제목 안의 문구는 배지가 되지 않으므로 상태 뒤의 번호는 링크로 따로 둡니다.

**Incorrect 1 (열쇠말과 상태를 한국어와 지어낸 말로 써서 카드마다 다르게 읽힙니다):**

<<< ../examples/writing-label-in-english-and-explain-in-korean/01-incorrect.markdown

**Correct 1 (영어 열쇠말과 고정 상태 어휘, 한국어 내용으로 씁니다):**

<<< ../examples/writing-label-in-english-and-explain-in-korean/02-correct.markdown
