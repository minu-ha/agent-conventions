---
title: Use Noun Phrases One Fact per Line
titleKo: 개조식으로 한 줄에 한 사실만 씁니다
impact: HIGH
impactDescription: 설명문과 경위가 섞인 긴 글 대신 사실만 남겨 사람이 읽고 답할 수 있게 합니다
appliesWhen:
  - 설계 문서의 본문, 표, 캡션을 쓸 때
  - 설계 문서의 긴 문장을 고칠 때
tags: writing, style, facts
---

## Use Noun Phrases One Fact per Line

**Impact: HIGH (설명문과 경위가 섞인 긴 글 대신 사실만 남겨 사람이 읽고 답할 수 있게 합니다)**

설계 문서는 설명문이 아니라 개조식입니다. 줄은 명사구로 끝내고 한 줄에 사실 하나만 둡니다.

| 규칙 | 쓰는 법 |
| --- | --- |
| 명사구 종결 | `교체`, `삭제`, `유지`, `불가`, `…?`. `~다`, `~합니다` 없음 |
| 한 줄 한 사실 | 사실 둘을 `·`로 잇지 않고 목록 항목으로 나눔 |
| 기호 | `→` 바뀜과 결과, `·` 한 사실 안의 나열, `=` 같음과 정의, `↔` 어긋남, `?` 물음 |
| 사실만 | 경위, 속뜻, 작업 이야기 없음. 이유는 `Why` 한 줄 |
| 서버 한글 문자열 | 따옴표. 코드 글꼴은 한글 사이가 벌어짐 |

| 쓰지 않음 | 대신 |
| --- | --- |
| "전체가 앞인 것이 의도다 (09-10 댓글을 뒤집었다)" | `09-10 → 09-29 댓글로 대체` |
| "첫 추천을 버렸다" | 지움. 결정만 남김 |
| "~라서 ~이다" 이유 문장 | `Why` 줄 하나 |

표 칸과 캡션도 같습니다. 사실이 여럿이면 칸 안에서도 목록으로 씁니다.
글이 길어지면 접힌 구현 상세로 보내지 않고 먼저 줄입니다. 접힘은 길이의 핑계가 아닙니다.

**Incorrect 1 (경위를 문장으로 풀고 사실 셋을 한 줄에 `·`로 잇습니다):**

<<< ../examples/writing-use-noun-phrases-one-fact-per-line/01-incorrect.markdown

**Correct 1 (명사구 한 줄에 사실 하나, 이유는 Why 한 줄로 줄입니다):**

<<< ../examples/writing-use-noun-phrases-one-fact-per-line/02-correct.markdown
