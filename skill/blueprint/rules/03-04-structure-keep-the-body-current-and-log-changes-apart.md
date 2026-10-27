---
title: Keep the Body Current and Log Changes Apart
titleKo: 본문은 지금만, 변경은 따로 둡니다
impact: HIGH
impactDescription: 변경을 본문에 날짜 꼬리표 절로 흡수해 문서가 지금의 정답이 아니라 이력이 되는 일을 막습니다
appliesWhen:
  - 전달문, Figma 수정, spec 갱신을 받아 설계 문서를 고칠 때
  - 화면 문서에 날짜가 붙은 절이나 소제목을 더하려 할 때
tags: structure, change, revised
---

## Keep the Body Current and Log Changes Apart

**Impact: HIGH (변경을 본문에 날짜 꼬리표 절로 흡수해 문서가 지금의 정답이 아니라 이력이 되는 일을 막습니다)**

변경은 `change/<MMDD>-<주제>.md` 한 장으로 받습니다. 화면 문서 본문에는 날짜가 붙은 절을 만들지 않습니다.

| 변경 문서 절 | 담는 것 |
| --- | --- |
| `Overview` | 무엇이 왔나. 전달문, Figma 판, spec 커밋. 반영, 제외, 질문의 수. 상태 |
| `Items` | 표. 화면, 항목, 지금 → 바뀜, 처리 |
| `Figures` | 캡처와 번호 |
| `Done` | 반영 커밋과 화면 문서 갱신 확인 목록 |

변경의 수명은 받음, 반영, 본문 고쳐 쓰기, `Done`입니다.
반영이 끝나면 화면 문서의 해당 절을 지금의 정답으로 고쳐 쓰고 `revised`를 올립니다. 옛 값은 지웁니다.
새 질문은 `questions.md`에 쓰고 변경 문서는 링크만 둡니다. 변경 문서는 `Done` 뒤에도 기록으로 남깁니다.
어느 변경이 어느 줄을 바꿨는지는 git과 변경 문서가 답합니다. 본문에 "10-01부터"를 적지 않습니다.

**Incorrect 1 (변경을 날짜 꼬리표 소제목으로 본문에 쌓아 옛 값과 새 값이 함께 남습니다):**

<<< ../examples/structure-keep-the-body-current-and-log-changes-apart/01-incorrect.markdown

**Correct 1 (변경 문서가 받고 본문은 지금의 정답으로 고쳐 씁니다):**

<<< ../examples/structure-keep-the-body-current-and-log-changes-apart/02-correct.markdown
