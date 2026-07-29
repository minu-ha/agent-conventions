---
name: convention-css
description: Use when editing CSS files, TSX className composition, wrapper-based third-party DOM styling, selector depth, design tokens, or deciding between plain CSS and CSS Modules.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# CSS Convention Router

## 1. 변경 범위 판정

요청·계획·diff에서 stylesheet·selector·token·CSS variable·`className`·visual 스타일의 실제 변경만 범위로 잡는다. 추가·삭제·이동·이름 변경·재선언은 포함하고, read-only 문맥과 TSX owner 이동에 byte-equivalent로 딸려온 class·style·stylesheet는 제외한다. 이름·shape·동작이 같은 이동은 diff에 삭제+추가로 보여도 변경으로 다시 세지 않는다. 적용되지 않는 규칙의 optional pattern을 새로 들여와 스스로 범위를 넓히지 않는다.

TSX component/JSX의 `className`·style이 바뀌면 `convention-react`와 `convention-typescript`를 함께 활성화한다. 그쪽에서 걸리는 규칙이 없더라도 활성화는 유지한다. 순수 CSS 변경이면 둘 다 켜지 않는다. TypeScript type·import·helper·wrapper Props는 `convention-typescript`가, React state·handler는 `convention-react`가 담당한다.

## 2. 인덱스 훑기

[RULES_INDEX.md](./RULES_INDEX.md)를 끝까지 훑어 각 규칙의 `appliesWhen`을 변경 범위와 대조한다. 첫 match에서 멈추지 않는다. 애매하면 적용되는 쪽으로 본다.

## 3. 규칙 읽고 구현

걸리는 규칙의 `contracts/<id>.md`를 읽는다. `CRITICAL`이면 `rules/<id>.md` 원문도 반드시 읽는다. 그 외에도 정확한 문법이나 예외 판단이 필요하면 원문으로 확장한다.

- `requiresSelected` target은 함께 적용한다. 다른 skill의 규칙이면 그 companion도 활성화한다.
- `reviewWith` target은 변경 범위에 비춰 다시 판단한다. 자동으로 적용하지는 않는다.
- `completionGate` 규칙은 마무리 시 항상 적용한다.

규칙이나 companion이 새로 걸리면 인덱스를 다시 훑는다. 더 걸리는 게 없으면 멈춘다.

## 4. 범위 변경

작업 중 범위가 늘거나 바뀌면 1번부터 다시 판정하고 인덱스를 다시 훑는다.

## 5. 마무리

변경 diff를 적용한 규칙에 비춰 다시 훑고, 위반이 있으면 file/line과 수정안으로 보고한다. lint·build·브라우저 확인 통과는 컨벤션을 지켰다는 근거가 아니다.

[AGENTS.md](./AGENTS.md)는 전체 handbook이다. 전체 검토를 명시적으로 요청받거나 index·contract가 손상됐을 때만 읽는다.
