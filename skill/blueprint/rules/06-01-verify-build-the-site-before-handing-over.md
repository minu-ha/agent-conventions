---
title: Build the Site Before Handing Over
titleKo: 넘기기 전에 사이트를 빌드합니다
impact: HIGH
impactDescription: 깨진 링크, 겹친 번호, 추천 없는 카드, 서술 어미가 남은 문서를 사람에게 넘기지 않게 합니다
appliesWhen:
  - 설계 문서 작업을 마무리하거나 넘길 때
  - 설계 문서를 고친 뒤 완료로 보고할 때
requiredOnCompletion: true
tags: verify, build, links
---

## Build the Site Before Handing Over

**Impact: HIGH (깨진 링크, 겹친 번호, 추천 없는 카드, 서술 어미가 남은 문서를 사람에게 넘기지 않게 합니다)**

문서를 넘기기 전에 아래 검사를 전부 돌리고 결과를 보고에 싣습니다.

| 검사 | 기준 |
| --- | --- |
| `for-humanity build` | 부품 오류 0, 없는 문서와 없는 제목 경고 0 |
| 번호 유일 | `questions.md`의 `### D1` 꼴 소제목이 겹치지 않음 |
| 추천 하나 | 선택지 표가 있는 카드마다 `★` 정확히 하나 |
| 서술 어미 | 인용 밖에서 `다`로 끝나는 줄 0. 흐름도 라벨 포함 |
| 열린 수 | 화면 문서의 열린 질문 수가 `questions.md`의 열린 카드 수와 같음 |
| 눈 확인 | 바꾼 절을 밝은 테마, 어두운 테마, 390 폭으로 열어 봄 |

빌드가 통과했다는 것은 링크와 부품이 멀쩡하다는 뜻이지 사실이 맞다는 근거가 아닙니다. 사실 대조는 따로 합니다.
검사 명령은 프로젝트 문서 폴더에서 한 번에 돌릴 수 있게 스크립트로 둡니다.

**Incorrect 1 (빌드와 검사 없이 정리했다고 넘깁니다):**

<<< ../examples/verify-build-the-site-before-handing-over/01-incorrect.markdown

**Correct 1 (검사 명령과 출력으로 넘깁니다):**

<<< ../examples/verify-build-the-site-before-handing-over/02-correct.markdown
