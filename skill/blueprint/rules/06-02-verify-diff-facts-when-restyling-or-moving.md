---
title: Diff Facts When Restyling or Moving
titleKo: 문체를 바꾸거나 절을 옮기면 사실을 대조합니다
impact: HIGH
impactDescription: 글을 고치는 동안 파일 위치, 번호, 숫자, 인용이 조용히 빠지거나 바뀌는 일을 잡습니다
appliesWhen:
  - 설계 문서의 문체를 바꾸거나 절을 옮길 때
  - 설계 문서의 절 번호나 제목을 바꿀 때
tags: verify, diff, facts
---

## Diff Facts When Restyling or Moving

**Impact: HIGH (글을 고치는 동안 파일 위치, 번호, 숫자, 인용이 조용히 빠지거나 바뀌는 일을 잡습니다)**

절을 옮길 때는 글을 고치지 않고 줄째 옮깁니다. 문체를 바꿀 때는 옛 판과 사실을 대조합니다.

| 작업 | 대조 |
| --- | --- |
| 절 옮기기 | 옛 줄이 전부 한 번씩 쓰였는지 셈. 그대로 옮기지 않은 줄은 낱말 대조 |
| 문체 바꾸기 | 파일 위치, Figma 링크, 번호, 숫자, "인용"을 옛 판에서 뽑아 새 판에 있는지 대조. 남는 것은 일부러 뺀 것만 |
| 제목 바꾸기 | 그 제목을 가리키는 링크를 전부 찾아 고침. hash 링크는 build 경고로 다시 확인 |

옛 판은 git이 쥡니다. 고치기 전에 커밋해 두고 대조는 두 커밋 사이에서 합니다.
옮기는 중에 손으로 새 글을 끼워 넣지 않습니다. 옮기기와 고치기를 다른 커밋으로 나눕니다.

**Incorrect 1 (옮기면서 글을 함께 고쳐 출처 줄 셋이 조용히 빠집니다):**

<<< ../examples/verify-diff-facts-when-restyling-or-moving/01-incorrect.markdown

**Correct 1 (옮기기와 고치기를 나누고 옛 판의 사실을 새 판과 대조합니다):**

<<< ../examples/verify-diff-facts-when-restyling-or-moving/02-correct.markdown
