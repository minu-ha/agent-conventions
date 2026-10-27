---
title: Give BE Cards a Figure
titleKo: BE 카드에는 그림을 붙입니다
impact: CRITICAL
impactDescription: 값 이름만 있는 카드를 읽은 사람이 화면의 어느 자리인지 떠올리지 못하는 일을 없앱니다
appliesWhen:
  - B 카드를 쓸 때
  - 사용자가 카드의 뜻을 모르겠다고 할 때
tags: question, be, figure, capture
---

## Give BE Cards a Figure

**Impact: CRITICAL (값 이름만 있는 카드를 읽은 사람이 화면의 어느 자리인지 떠올리지 못하는 일을 없앱니다)**

BE 카드는 `Meaning`, `Figure`, `Ask` 순서로 씁니다. 필드 이름으로 시작하는 카드는 BE도 기획도 읽지 못합니다.

| 자리 | 내용 |
| --- | --- |
| `Meaning` | 그 값이 화면에서 무엇으로 보이는지 한 줄 |
| `Figure` | 앱 캡처나 Figma 캡처 위 번호. 번호는 캡처에 굽고 설명은 목록 |
| `Ask` | 묻는 것 한 줄. 값의 뜻이 아니라 기준이나 형식 |

캡처는 `writing` 섹션의 캡처 규칙대로 만들고 `img/<화면>/`에 둡니다.
사용자가 뜻을 모르겠다고 한 카드는 고치지 않고 지운 뒤 `Meaning`부터 다시 씁니다.
값의 뜻 자체는 묻지 않습니다. 그대로 그린 뒤 캡처로 대조하고, 어긋날 때만 묻습니다.

**Incorrect 1 (필드 이름과 내부 용어만 있어 어느 자리의 값인지 알 수 없습니다):**

<<< ../examples/question-give-be-cards-a-figure/01-incorrect.markdown

**Correct 1 (화면에서의 뜻, 번호 붙인 캡처, 묻는 것 한 줄로 씁니다):**

<<< ../examples/question-give-be-cards-a-figure/02-correct.markdown
