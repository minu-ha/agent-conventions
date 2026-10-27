---
name: convention-blueprint
description: Use when writing or revising a screen design document, project overview, questions page or change note in for-humanity Markdown, when turning requirements, a demo, Figma or an API spec into decisions and questions, or when reporting a blueprint stage as done.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Blueprint Convention Router

## 1. 변경 범위 판정

요청, 계획, diff에서 아래를 가른다.

**범위에 드는 것**

- `overview.md`, `questions.md`, 화면 문서, 변경 문서를 새로 쓰거나 고치는 것
- 전달문, 기획 데모, Figma, API spec을 읽어 결정과 질문으로 옮기는 분석
- 설계 문서의 단계를 구현하고 완료로 보고하는 것

**범위에 들지 않는 것**

- 설계 문서 없이 코드만 바꾸는 작업
- 설계 문서를 읽기만 하는 문맥
- 설계 문서가 아닌 일반 문서와 README

적용되지 않는 규칙의 선택 사항을 새로 들여와 스스로 범위를 넓히지 않는다.

Figma 파일이나 노드를 재료로 읽을 때만 `convention-figma`를 함께 활성화한다.
코드 변경은 이 skill의 범위가 아니므로 코드 skill을 켜지 않는다. 구현 단계에서 코드가 바뀌면 그 코드가 해당 skill을 켠다.

## 2. 인덱스 훑기

활성화한 skill마다 그 `SKILL.md`의 로드 계약을 따른다.
이 skill과 companion 각각의 `RULES_INDEX.md`를 끝까지 훑는다.
이 skill의 인덱스는 [RULES_INDEX.md](./RULES_INDEX.md)이다.
각 규칙의 `appliesWhen`을 변경 범위와 대조하고 첫 match에서 멈추지 않는다.
애매하면 적용되는 쪽으로 본다.

문서를 쓰기 전에 `material` 섹션 규칙부터 읽는다. 무엇이 정답인지 거기서 정해진다.

## 3. 규칙 읽고 구현

걸리는 규칙의 `contracts/<id>.md`를 읽는다.
등급이 읽는 범위를 정하고, contract 첫머리가 그 범위를 말한다.

| 등급 | 읽는 범위 |
| --- | --- |
| `CRITICAL` | `rules/NN-MM-<id>.md` 원문을 설명과 예제까지 전부 읽는다. 마무리 전에 결과 문서를 원문의 `Correct` 예제와 다시 대조한다 |
| `HIGH` | 원문을 설명과 예제까지 전부 읽는다 |
| `MEDIUM` | contract에 실린 규범과 첫 `Incorrect`, `Correct` 짝을 읽는다. 판단이 모호하면 원문을 읽는다 |

정확한 원문 경로는 contract의 full rule 링크가 가리킨다.
`Correct` 예제의 Markdown 템플릿은 그대로 복사해 시작한다.

- `requiresSelected` 대상은 함께 적용한다. 다른 skill의 규칙이면 그 companion도 활성화한다.
- `reviewWith` 대상은 변경 범위에 비춰 다시 판단한다. 자동으로 적용하지는 않는다.
- `completionGate` 규칙은 마무리 시 항상 적용한다. 인덱스가 그 표시를 달아 준다.

걸린 규칙은 등급과 무관하게 전부 지킨다.
등급은 지킬지 말지가 아니라 얼마나 깊이 읽는지를 정한다.

규칙이나 companion이 새로 걸리면 인덱스를 다시 훑는다.
더 걸리는 게 없으면 멈춘다.

## 4. 범위 변경

작업 중 범위가 늘거나 바뀌면 1번부터 다시 판정하고 활성 인덱스를 다시 훑는다.
conditional companion도 다시 판정한다.
질문에 답이 와서 문서가 바뀌어도 다시 판정한다.

## 5. 마무리

바뀐 문서를 적용한 규칙에 비춰 다시 훑고, 위반이 있으면 파일과 줄, 수정안으로 보고한다.
`completionGate` 규칙의 검사 결과와 보고 항목을 마무리 보고에 싣는다.
사이트 빌드가 통과했다는 것은 링크와 부품이 멀쩡하다는 뜻이지 사실이 맞다는 근거가 아니다.

전체 검토를 명시적으로 요청받거나 index, contract가 손상됐을 때만 `rules/*.md`를 번호 순서로 읽는다.
