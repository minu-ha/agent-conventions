---
title: Keep Four Document Kinds
titleKo: 문서는 네 종류만 둡니다
impact: HIGH
impactDescription: 문서 종류가 늘어 같은 정보가 여러 문서에 흩어지거나 증분 문서가 쌓이는 일을 막습니다
appliesWhen:
  - 설계 문서를 새로 만들 때
  - 설계 문서를 나누거나 합치려 할 때
tags: structure, documents, for-humanity
---

## Keep Four Document Kinds

**Impact: HIGH (문서 종류가 늘어 같은 정보가 여러 문서에 흩어지거나 증분 문서가 쌓이는 일을 막습니다)**

설계 문서는 for-humanity의 `content/public/` 아래 네 종류만 둡니다. 캡처는 `img/<화면>/`에 둡니다.

| 문서 | 역할 | 사이드바 `group` |
| --- | --- | --- |
| `overview.md` | 프로젝트 지도. 라우트, 계층, API 정답, 재료 정답표, 규약 링크 | `Project` |
| `questions.md` | 결정과 질문 전부 | `Project` |
| `screen/<화면>.md` | 화면 문서. 늘 지금의 정답 | `Screen` |
| `change/<MMDD>-<주제>.md` | 변경 문서. 전달, Figma 수정, spec 갱신 한 건 | `Change` |

화면 하나는 문서 하나입니다. 증분 기능도 그 화면 문서 안에서 지금의 정답으로 고쳐 씁니다.
남은 일감 문서, 증분 문서, 화면별 질문 문서는 만들지 않습니다. 그 정보는 `questions.md`와 변경 문서가 쥡니다.
frontmatter는 `name`, `label`, `group`, `order`에 `created`, `revised`를 더합니다.
홈 `README.md`는 문서 지도와 지금 단계만 적습니다.

**Incorrect 1 (증분 문서와 남은 일감 문서를 따로 만들어 같은 화면의 정답이 세 곳에 흩어집니다):**

<<< ../examples/structure-keep-four-document-kinds/01-incorrect.markdown

**Correct 1 (네 종류와 캡처 폴더만 두고 증분은 화면 문서 안에서 고쳐 씁니다):**

<<< ../examples/structure-keep-four-document-kinds/02-correct.markdown
