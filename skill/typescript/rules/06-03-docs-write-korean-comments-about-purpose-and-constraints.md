---
title: Write Korean Comments About Purpose and Constraints
titleKo: 주석에는 목적과 제약만 짧은 한국어 명사형으로 적습니다
impact: HIGH
impactDescription: 몇 해 뒤에 코드를 여는 사람도 주석을 한눈에 읽고 고칠 수 있습니다
appliesWhen:
  - TypeScript, TSX의 문서 주석이나 인라인 주석 문구를 추가, 수정, 번역하거나 검토할 때
  - 문서 주석에 태그를 붙이거나 뺄 때
tags: docs, comments
---

## Write Korean Comments About Purpose and Constraints

**Impact: HIGH (몇 해 뒤에 코드를 여는 사람도 주석을 한눈에 읽고 고칠 수 있습니다)**

주석에는 이름과 시그니처에 없는 목적, 제약, 부수효과만 짧은 한국어 명사형으로 적습니다.
긴 문장과 경위는 읽는 데 오래 걸리고, 코드가 바뀌면 틀린 설명으로 남습니다.
적을 정보가 없으면 주석을 지웁니다.

### 문장

| 항목 | 기준 |
| --- | --- |
| 끝맺음 | `~한다`, `~이다` 대신 명사나 명사형(`고정`, `불가`, `필요`, `덮어씀`)으로 끝냅니다. 줄 끝에는 마침표를 찍지 않습니다 |
| 한 줄 | 사실 하나만 적습니다. 결론이 먼저이고 이유는 마침표 뒤나 다음 줄에 둡니다 |
| 군더더기 | 접속사, 꾸밈말, 경위를 뺍니다. 예전 동작과 바뀐 과정은 커밋 메시지에 둡니다 |
| 나열 | 쉼표로 잇습니다. 가운뎃점과 대시는 쓰지 않습니다 |
| 조사 | 영어 낱말과 식별자 뒤에도 붙여 씁니다(`MUI가`, `className을`) |

### 낱말

| 낱말 | 주석 표기 |
| --- | --- |
| 우리말로 통하는 일반 낱말 | 우리말. request는 요청, product는 상품 |
| 우리말이 없거나 어색한 기술 용어 | 한글 외래어. provider는 프로바이더, wrapper는 래퍼 |
| 코드 이름, 제품 이름, 약어 | 원문 그대로. `QueryClientProvider`, MUI, API |

### 여러 줄

설명이 둘 이상이면 한 줄에 몰지 않고 줄을 나눕니다.
첫 줄은 요약입니다.
빈 줄 뒤에 이유와 조건을 한 줄씩 적고, 딸린 내용은 목록이나 들여쓰기로 묶습니다.

### 내용과 태그

| 내용, 태그 | 판정 |
| --- | --- |
| 선언 이름만 번역하거나 코드를 한 줄씩 옮긴 설명 | 쓰지 않습니다 |
| 본문 전체가 영어인 주석 | 쓰지 않습니다. 헤더가 영어뿐이면 필드 주석이 한국어여도 요구를 충족하지 못합니다 |
| 설명 없이 `@param`, `@returns`만 나열 | 쓰지 않습니다 |
| `@api`, `@helper`, `@field` | 이름과 문법이 드러내는 역할을 태그로 반복하지 않습니다 |
| `@schema` 같은 비표준 태그 | 새로 만들지 않습니다 |
| `@summary` | 헤더 첫 줄과 겹치므로 쓰지 않습니다 |
| `@deprecated`, `@example`, `@param`, `@returns` 등 TSDoc 태그 | 필요할 때만 씁니다 |

선언 위 문서 주석은 `docs-write-doc-comments-as-multiline-blocks`,
본문 설명은 `docs-keep-body-comments-for-intent-and-steps`에 따라 `//`로 씁니다.

**Incorrect 1 (영문이거나 선언 이름을 옮겨 적기만 합니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/01-incorrect-1.ts

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/01-incorrect-2.ts

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/01-incorrect-3.ts

**Correct 1 (이름에 없는 정보를 명사형으로 더합니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/02-correct-1.ts

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/02-correct-2.ts

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/02-correct-3.ts

**Incorrect 2 (긴 동사형 문장에 경위, 가운뎃점, 대시, 영어 낱말을 섞습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/03-incorrect.ts

**Correct 2 (결론을 명사형으로 먼저 쓰고 이유는 다음 줄에 짧게 둡니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/04-correct.ts

**Incorrect 3 (제약 셋을 한 문장에 몰아 씁니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/05-incorrect.ts

**Correct 3 (요약 한 줄 뒤에 제약을 한 줄씩 목록으로 나눕니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/06-correct.ts

**Incorrect 4 (역할 태그로 선언의 성격을 다시 적습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/07-incorrect.ts

**Correct 4 (태그를 지우고 헤더 첫 줄에 선언이 하는 일을 적습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/08-correct.ts
