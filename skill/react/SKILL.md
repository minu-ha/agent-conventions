---
name: convention-react
description: Use when editing React or TSX components, screens, handlers, rendered state or query flow, or React-owned support code.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# React Convention Router

## 1. 변경 범위 판정

요청·계획·diff에서 render·screen·owner/route-local 배치·handler·state·query·React support code의 실제 변경만 범위로 잡는다. 추가·삭제·이동·이름 변경·재선언은 포함하고, 특히 owner/route-local 이동 자체는 변경이다. read-only 문맥은 제외한다. owner 이동에 그대로 딸려온 내부 선언·본문·import·class/style은 diff에 삭제+추가로 보여도 변경으로 다시 세지 않는다. 적용되지 않는 규칙의 optional pattern을 새로 들여와 스스로 범위를 넓히지 않는다.

`convention-typescript`는 항상 함께 활성화한다. class contract·stylesheet·styling surface가 바뀔 때만 `convention-css`를 추가하고, 아니면 켜지 않는다.

## 2. 인덱스 훑기

활성화한 skill마다 그 `SKILL.md`의 load 계약을 따른다. progressive skill이면 `RULES_INDEX.md`를 끝까지 훑고, non-progressive skill이면 그 `SKILL.md`가 지시하는 대로 `HANDBOOK.md`를 읽는다. 각 규칙의 `appliesWhen`을 변경 범위와 대조하고 첫 match에서 멈추지 않는다. 애매하면 적용되는 쪽으로 본다.

## 3. 규칙 읽고 구현

걸리는 규칙의 `contracts/<id>.md`를 읽는다. `CRITICAL`이면 `rules/NN-MM-<id>.md` 원문도 반드시 읽는다. 정확한 원문 경로는 contract의 full rule 링크가 가리킨다. 그 외에도 정확한 문법이나 예외 판단이 필요하면 원문으로 확장한다.

- `requiresSelected` target은 함께 적용한다. 다른 skill의 규칙이면 그 companion도 활성화한다.
- `reviewWith` target은 변경 범위에 비춰 다시 판단한다. 자동으로 적용하지는 않는다.
- `completionGate` 규칙은 마무리 시 항상 적용한다. index가 그 표시를 달아 준다.

걸린 규칙은 `impact`와 무관하게 전부 적용한다. 등급은 어겼을 때의 결과 크기를 말할 뿐 지킬지 말지를 정하지 않는다.

규칙이나 companion이 새로 걸리면 인덱스를 다시 훑는다. 더 걸리는 게 없으면 멈춘다.

## 4. 범위 변경

작업 중 범위가 늘거나 바뀌면 1번부터 다시 판정하고 활성 인덱스를 다시 훑는다. conditional companion도 다시 판정한다.

## 5. 마무리

변경 diff를 적용한 규칙에 비춰 다시 훑고, 위반이 있으면 file/line과 수정안으로 보고한다. lint·typecheck·build·테스트 통과는 컨벤션을 지켰다는 근거가 아니다.

[HANDBOOK.md](./HANDBOOK.md)는 전체 handbook이다. 전체 검토를 명시적으로 요청받거나 index·contract가 손상됐을 때만 읽는다.
