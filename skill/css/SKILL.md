---
name: convention-css
description: Use when editing CSS files, TSX className composition, wrapper-based third-party DOM styling, selector depth, design tokens, or deciding between plain CSS and CSS Modules.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# CSS Convention Router

규칙집이 아닌 CSS 원문 router다. 일반 작업은 full handbook을 먼저 읽지 않는다.

## 1. Scope snapshot

수정 전 요청·계획 파일·diff를 한 줄로 고정한다. stylesheet, selector, token·CSS variable, `className` contract, visual styling 변경 시 활성화한다.

판정은 변경 semantic delta만 본다. 추가·삭제·이동·이름 변경·재선언 surface는 포함한다. TSX owner 이동에 byte-equivalent로 따라온 `className`, style import, 기존 stylesheet는 CSS 근거가 아니다. 파일 이동에서 이름·shape·동작이 같은 내부 선언·본문·class·value는 diff에 삭제+추가로 보여도 별도 추가·변경·재선언으로 다시 세지 않는다. N/A rule의 optional pattern을 새로 도입해 스스로 활성화하지 말고 요청을 충족하는 최소 semantic patch만 구현한다.

TSX `className`·style import·styling contract를 추가·삭제·이름 변경하면 JSX 구조·state·handler가 그대로이고 기존 `clsx` import를 재사용해도 `convention-react`와 `convention-typescript`를 반드시 활성화한다. React Selected가 0이어도 activation은 유지한다. 순수 CSS 작업만 두 companion을 비활성화할 수 있다. TypeScript type·import·helper·wrapper Props 변경은 `convention-typescript`가 담당한다.

## 2. Index scan

[RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 읽고 모든 local entry의 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. stable ID는 탐색 보조일 뿐 배제 근거가 아니다. 애매한 항목은 `Unknown`으로 둔다.

## 3. Digest-bound receipt

index의 `sha256` digest에 묶인 exact receipt를 유지한다.

```md
Activated: css, <conditional companions>
Index: css@sha256:<digest>
Selected: <ordinal + stable ID>
Not applicable: <나머지 전체 ordinal>
Excluded groups: <N/A ordinal group>: <비어 있지 않은 scope-evidence 이유>
Unknown: <ordinal + stable ID 또는 none>
Expanded: <full rule을 추가로 읽은 ordinal + stable ID: 이유 또는 none>
```

각 ordinal은 셋 중 하나다. exclusion group 합집합은 exact N/A이고 이유는 비어 있으면 안 된다. `reviewWith`는 재평가 신호다. `completionGate`는 완료 receipt에서 Selected이며 N/A 불가다.

## 4. Read and implement

Selected와 Unknown의 stable ID와 같은 `contracts/<stable-id>.md`를 전부 읽는다. `CRITICAL`이면 matching full rule도 반드시 읽는다. 나머지는 exact 판단·Unknown·audit에 필요할 때만 `Expanded: ID: 이유`로 확장한다. Unknown은 Selected/N/A로 먼저 해소하고, final N/A의 `requiresSelected`는 적용하지 않는다. Selected로 확정한 contract의 `requiresSelected` target은 companion까지 활성화해 즉시 Selected로 두며 N/A 불가다. Selected contract의 필수 변경만 scope evidence에 합치고 예시·선택적 대안·해소되지 않은 Unknown의 가상 변경은 evidence가 아니다. 새 surface·companion·Selected가 생기면 index와 `reviewWith`를 고정점까지 반복 판정한다. 고정점의 Selected contract와 Expanded 원문만 구현·리뷰 기준이다.

## 5. Scope drift

`scope drift`면 scope snapshot부터 활성 progressive index scan/receipt를 다시 하고 stale digest receipt를 폐기한다.

## 6. Finish gate

`convention-audit`이 마지막 diff로 활성 progressive index를 독립 재선택한다. digest, receipt, evidence, `Expanded`와 검증을 넘기고 `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md)는 full handbook 요청이나 index/contract/필요 rule 손상·누락으로 fallback할 때만 읽는다.
