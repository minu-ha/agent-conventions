---
title: Fold Only Sizes and Contracts
titleKo: 접는 것은 치수와 계약뿐입니다
impact: HIGH
impactDescription: 코드와 테스트가 정본인 것을 문서에 베껴 두 곳을 고치는 일과 문서 비대화를 막습니다
appliesWhen:
  - 화면 문서에 구현용 정보를 넣을 때
  - 구현이 끝난 화면 문서를 정리할 때
tags: structure, details, fold
---

## Fold Only Sizes and Contracts

**Impact: HIGH (코드와 테스트가 정본인 것을 문서에 베껴 두 곳을 고치는 일과 문서 비대화를 막습니다)**

`:::details[구현 상세]`에는 사람이 넘겨도 되고 에이전트가 구현할 때 필요한 것만 둡니다.

| 접는 것 | 두지 않는 것 | 그 정보의 정본 |
| --- | --- | --- |
| 폭 급, 정렬, 자리 같은 치수 | CSS 실측 값 | 스타일시트 |
| 응답 필드, URL 파서, 값 규칙 같은 계약 | 더미 데이터와 mock 값 | mock 폴더 |
| 적용한 규칙 번호 같은 근거 | 테스트 케이스 목록 | 테스트 폴더 |
| — | 개정 이력, 작업 경위 | git과 변경 문서 |
| — | 읽은 노드 전체 표 | `Sources` 절의 몇 줄 |

구현이 끝나면 문서는 화면이 어떻게 동작하는지의 참조가 됩니다. 그때 코드로 읽을 수 있는 것은 지웁니다.
접힌 절도 개조식으로 짧게 씁니다. 접었다고 길어도 되는 것이 아닙니다.

**Incorrect 1 (테스트 목록과 CSS 실측 값을 접어 두어 코드와 문서를 둘 다 고쳐야 합니다):**

<<< ../examples/structure-fold-only-sizes-and-contracts/01-incorrect.markdown

**Correct 1 (치수의 급과 계약만 접고 나머지는 정본을 가리킵니다):**

<<< ../examples/structure-fold-only-sizes-and-contracts/02-correct.markdown
