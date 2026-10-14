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

주석에는 이름과 시그니처에 없는 목적, 제약, 부수효과만 스펙 문서의 한국어로 적습니다.
긴 문장, 비유, 경위는 읽는 데 오래 걸리고, 코드가 바뀌면 틀린 설명으로 남습니다.
적을 정보가 없으면 주석을 지웁니다.

### 문장

| 항목 | 기준 |
| --- | --- |
| 끝맺음 | 한자어 명사로 끝냅니다(`조회`, `병합`, `미포함`, `필요`, `불가`, `고정`). 용언을 명사형으로 바꾼 `읽음`, `둠`, `넘김`, `합쳐짐`은 쓰지 않습니다. 상태를 말하는 `없음`, `있음`, `않음`, `열림`, `닫힘`은 허용합니다. 줄 끝에는 마침표를 찍지 않습니다 |
| 한 줄 | 사실 하나만 적습니다. 결론이 먼저이고 조건과 결과는 쉼표 뒤에 둡니다(`오류 경계 미포함, 그래프 오류 시 뒤로가기 유지`) |
| 조사 | 주제 조사는 항목에 하나까지(`패턴 ID는 영역별 URL 직접 조회`), 목적격 조사는 생략합니다. 쓸 때는 영어 낱말 뒤에도 붙여 씁니다(`MUI가`) |
| 접속 | `그래서`, `때문에`, `위해`, `~라서`, `덕분`을 쓰지 않습니다. 인과는 쉼표 뒤 결과로 적습니다 |
| 비유 | `몫`, `껍데기`, `무너짐`, `길이 남음`, `갈아 끼움`, `흔들림` 같은 비유와 의인화를 쓰지 않습니다. `담당`, `래퍼`, `실패`, `복귀 경로`, `교체`, `변동`으로 적습니다 |
| 군더더기 | 꾸밈말, 경위를 뺍니다. 예전 동작과 바뀐 과정은 커밋 메시지에 둡니다 |
| 나열 | 쉼표로 잇습니다. 가운뎃점, 대시, 화살표는 쓰지 않습니다 |

### 낱말

| 낱말 | 주석 표기 |
| --- | --- |
| 우리말로 통하는 일반 낱말 | 우리말이나 흔한 음차. request는 요청, product는 상품, back 버튼은 뒤로가기 또는 백 버튼, reset은 리셋 |
| 우리말이 없거나 어색한 기술 용어 | 한글 음차. provider는 프로바이더, wrapper는 래퍼, render는 렌더 |
| 코드 이름, 제품 이름, 약어 | 원문 그대로. `QueryClientProvider`, MUI, API |

자주 바꿔 쓰는 낱말입니다.

| 용언 명사형, 비유 | 스펙 낱말 |
| --- | --- |
| 읽음, 가져옴 | 조회, 수신 |
| 받음, 넘김, 줌 | 수신, 전달, 반환 |
| 씀, 둠, 놓음 | 사용, 배치, 보관 |
| 그림, 보임, 표시됨 | 렌더, 표시 |
| 붙음, 뺌, 비움, 채움 | 추가, 제외, 초기화, 입력 |
| 나눔, 묶음, 합쳐짐, 맞춤 | 분리, 병합, 일치 |
| 남음, 바뀜, 겹침 | 유지, 변경, 중첩 |
| 정함, 고름, 잡음, 좁힘 | 결정, 선택, 계산, 제한 |
| 몫, 자리 | 담당, 구간 |

### 상자

문서 주석은 제목 한 줄이 기본입니다.
본문이 있으면 빈 줄 뒤에 두 칸 들여쓴 목록 하나로 씁니다. 평문 줄은 쓰지 않습니다.

| 자리 | 기준 |
| --- | --- |
| 제목 | 선언이 무엇인지 명사구 한 줄. 짧은 보충 하나는 마침표 뒤 같은 줄 |
| 본문 | 빈 줄 하나 뒤, 줄마다 `  - `로 시작하는 목록. 사실 하나면 항목 하나 |
| 항목 | 사실 하나. 결론이 먼저이고 이유는 마침표 뒤 |
| `{@link}` | 마지막 줄, 목록 밖 |
| `//` | 사실 하나. 둘이면 줄을 나누거나 헤더 블록의 목록으로 올립니다 |

항목 앞에는 종류를 알리는 태그 셋만 씁니다. 그 밖의 사실은 태그 없이 적습니다.

| 태그 | 뜻 |
| --- | --- |
| `제약:` | 바깥(API, 라이브러리, 명세, 기획)이 정해 코드가 따르는 조건 |
| `예외:` | 규칙을 비껴간 자리와 확인할 수 있는 근거. `docs-justify-convention-exceptions-with-a-reason-comment`의 자리 |
| `임시:` | 없어질 사실과 지울 조건. 예) 서버 작업이 끝나면 삭제 |

괄호 꼬리는 출처 전용입니다.
누가 정했는지와 그 날짜를 적습니다(`(백엔드 답변 10-14)`, `(기획 10-07)`, `(피그마 10-01)`, `(사용자 10-13)`).
날짜만 있는 `(10-14)`는 출처가 아닙니다.
바뀐 경위는 적지 않습니다. 언제 무엇이 바뀌었는지는 커밋이 답하고, 주석은 지금 참인 사실만 가집니다.
코드가 이미 보여 주는 사실도 적지 않습니다.

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

**Correct 1 (이름에 없는 정보를 스펙 낱말로 더합니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/02-correct-1.ts

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/02-correct-2.ts

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/02-correct-3.ts

**Incorrect 2 (긴 동사형 문장에 경위, 가운뎃점, 대시, 영어 낱말을 섞습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/03-incorrect.ts

**Correct 2 (결론을 제목에 쓰고 조건과 결과는 목록 항목으로 둡니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/04-correct.ts

**Incorrect 3 (제약 셋을 한 문장에 몰아 씁니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/05-incorrect.ts

**Correct 3 (요약 한 줄 뒤에 제약을 항목 하나씩 들여쓴 목록으로 나눕니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/06-correct.ts

**Incorrect 4 (역할 태그로 선언의 성격을 다시 적습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/07-incorrect.ts

**Correct 4 (태그를 지우고 헤더 첫 줄에 선언이 하는 일을 적습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/08-correct.ts

**Incorrect 5 (바뀐 경위와 날짜만 있는 괄호를 적습니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/09-incorrect.ts

**Correct 5 (지금 참인 사실에 출처를 붙이고 없어질 사실은 `임시:`로 표시합니다):**

<<< ../examples/docs-write-korean-comments-about-purpose-and-constraints/10-correct.ts
