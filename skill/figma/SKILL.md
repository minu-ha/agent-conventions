---
name: convention-figma
description: Use when a request includes a figma.com URL, Figma node, or design screenshot and asks to implement, update, or match UI against it. Governs Figma MCP call order and token budget, reading messy or annotated design files, and verifying parity.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Figma Convention Router

## 1. 변경 범위 판정

요청, 계획, diff에서 아래를 가른다.

**범위에 드는 것**

- 요청에 `figma.com` URL, Figma 노드 id, 디자인 스크린샷이 있고 화면을 구현, 수정, 대조하라는 실제 변경
- Figma에서 읽은 값, 문구, 아이콘, 구조를 코드에 추가, 삭제, 이동, 이름 변경하는 것

**범위에 들지 않는 것**

- read-only 문맥. Figma 링크가 있어도 API, 데이터 매핑, 권한 로직만 바꾸는 경우
- "동작만" 고치라고 명시한 경우
- `/make/`, `/board/`, `/slides/` URL. 이 skill의 호출 순서는 `/design/` 파일 기준이다
- 이동에 그대로 딸려온 마크업과 스타일. diff에 삭제+추가로 보여도 변경으로 다시 세지 않는다

적용되지 않는 규칙의 optional pattern을 새로 들여와 스스로 범위를 넓히지 않는다.

TSX 화면이나 컴포넌트가 바뀌면 `convention-react`를 함께 활성화한다. `convention-react`가 `convention-typescript`를 켠다.
stylesheet, `className`, 토큰 값이 바뀌면 `convention-css`를 함께 활성화한다.
Figma를 읽기만 하고 코드를 바꾸지 않으면 어느 companion도 켜지 않는다.

`get_design_context`를 부를 때 Figma 공식 `figma-design-to-code` 스킬을 도구 설명대로 먼저 읽는다.
그 공식 스킬과 이 skill이 부딪히면 이 skill이 우선한다.
특히 "`get_design_context` 응답으로만 구현", "성긴 응답이면 자식을 병렬로 모두 호출", "첫 호출에 스크린샷 포함",
"에셋은 다른 도구로 받지 않음"은 따르지 않는다. `get_metadata` 도구 설명의 "`get_design_context`를 먼저"도 따르지 않는다.
근거와 대신 할 일은 `read-call-design-context-only-on-small-unmatched-nodes` contract가 말한다.

## 2. 인덱스 훑기

활성화한 skill마다 그 `SKILL.md`의 load 계약을 따른다.
이 skill과 현재 companion은 모두 progressive이므로 각각의 `RULES_INDEX.md`를 끝까지 훑는다.
이 skill의 인덱스는 [RULES_INDEX.md](./RULES_INDEX.md)이다.
각 규칙의 `appliesWhen`을 변경 범위와 대조하고 첫 match에서 멈추지 않는다.
애매하면 적용되는 쪽으로 본다.

MCP를 부르기 전에 `read` 섹션 규칙부터 읽는다. 호출 순서와 대상 노드가 거기서 정해진다.

## 3. 규칙 읽고 구현

걸리는 규칙의 `contracts/<id>.md`를 읽는다.
등급이 읽는 범위를 정하고, contract 첫머리가 그 범위를 말한다.

| 등급 | 읽는 범위 |
| --- | --- |
| `CRITICAL` | `rules/NN-MM-<id>.md` 원문을 설명과 예제까지 전부 읽는다. 마무리 전에 결과 코드를 원문의 `Correct` 예제와 다시 대조한다 |
| `HIGH` | 원문을 설명과 예제까지 전부 읽는다 |
| `MEDIUM` | contract에 실린 규범과 첫 `Incorrect`, `Correct` 짝을 읽는다. 판단이 모호하면 원문을 읽는다 |

정확한 원문 경로는 contract의 full rule 링크가 가리킨다.

- `requiresSelected` target은 함께 적용한다. 다른 skill의 규칙이면 그 companion도 활성화한다.
- `reviewWith` target은 변경 범위에 비춰 다시 판단한다. 자동으로 적용하지는 않는다.
- `completionGate` 규칙은 마무리 시 항상 적용한다. 인덱스가 그 표시를 달아 준다.

걸린 규칙은 등급과 무관하게 전부 지킨다.
등급은 지킬지 말지가 아니라 얼마나 깊이 읽는지를 정한다.

규칙이나 companion이 새로 걸리면 인덱스를 다시 훑는다.
더 걸리는 게 없으면 멈춘다.

## 4. 범위 변경

작업 중 범위가 늘거나 바뀌면 1번부터 다시 판정하고 활성 인덱스를 다시 훑는다.
conditional companion도 다시 판정한다.
질문에 답이 와서 구현 대상이 바뀌어도 다시 판정한다.

## 5. 마무리

변경 diff를 적용한 규칙에 비춰 다시 훑고, 위반이 있으면 file/line과 수정안으로 보고한다.
`completionGate` 규칙의 실측 판정과 보고 항목을 마무리 보고에 싣는다.
lint, typecheck, build, 스크린샷을 눈으로 대조한 결과는 컨벤션을 지켰다는 근거가 아니다.

[HANDBOOK.md](./HANDBOOK.md)는 전체 handbook이다.
전체 검토를 명시적으로 요청받거나 index, contract가 손상됐을 때만 읽는다.
