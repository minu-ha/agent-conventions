---
name: convention-react
description: Use when editing React or TSX components, screens, handlers, rendered state or query flow, or React-owned support code.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# React Convention Router

## 1. Scope snapshot과 companion

React/TSX 요청·계획·diff의 render·screen·owner/route-local·handler·state·query·React support code 변경 semantic delta만 판정한다. 추가·삭제·이동·이름 변경·재선언, 특히 owner/route-local 이동 자체는 포함하고 read-only 문맥은 제외한다. owner 이동에 byte-equivalent로 따라온 내부 선언·본문·import·class/style은 diff의 삭제+추가로 보여도 별도 surface로 다시 세지 않는다. N/A rule의 optional pattern으로 자가 활성화하지 말고 최소 semantic patch만 구현한다. 판정 직후 수정 전 범위를 scope snapshot으로 고정한다.

`convention-typescript`는 필수다. class contract·stylesheet·styling surface 변경 때만 `convention-css`를 조건부 활성화하고, 조건이 없으면 CSS는 비활성화한다. route·search·navigation·browser test는 전용 skill도 판정한다.

## 2. Progressive index scan

모든 활성 skill의 `SKILL.md` load 계약을 따른다. `progressiveDisclosure: true`면 `RULES_INDEX.md` 전체 scan·digest receipt, non-progressive skill이면 `SKILL.md`·`AGENTS.md` 자체 load 계약을 쓴다. 모든 활성 progressive index의 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. 애매하면 `Unknown`이다.

## 3. Digest-bound receipt

활성 progressive index `sha256` receipt에 `Activated/Index/Selected/Not applicable/Excluded groups/Unknown/Expanded`를 기록한다. Selected/Unknown은 ordinal+stable ID, N/A는 ordinal exact set이다. Selected/N/A/Unknown은 disjoint하며 전체 ordinal을 exact partition한다. exclusion group의 ordinal 합집합은 exact N/A이며 이유는 비어 있으면 안 된다. `reviewWith`는 재평가 신호, `completionGate`는 완료 시 Selected이며 N/A 불가다.

## 4. Read and implement

Selected와 Unknown의 stable ID에 맞는 `contracts/<stable-id>.md`를 전부 읽는다. `CRITICAL`이면 matching full rule도 반드시 읽는다. 그 외는 exact·Unknown·audit 때 이유와 함께 확장한다. Unknown은 Selected/N/A로 먼저 해소하고 N/A의 `requiresSelected`는 적용하지 않는다. Selected로 확정한 contract의 `requiresSelected` target은 companion 활성화 후 즉시 Selected이며 N/A 불가다. Selected contract의 필수 변경만 scope evidence다. 예시·선택적 대안·해소되지 않은 Unknown의 가상 변경은 제외한다. 새 surface·companion·Selected·`reviewWith`면 고정점까지 반복한다. 고정점의 Selected contract와 Expanded 원문만 구현·리뷰 기준이다.

## 5. Scope drift

scope drift면 snapshot부터 activation을 재판정하고 모든 활성 progressive index를 재scan하며 stale receipt를 폐기한다. conditional·non-progressive도 재판정한다.

## 6. Finish gate

digest-bound implementer receipt·Expanded·evidence·검증을 sealed comparison용으로 audit에 넘긴 뒤, 모든 활성 progressive index를 `convention-audit`이 독립 재선택한다. `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md) full handbook은 명시적으로 요청하거나 index/contract/필요 rule 손상·누락 fallback 때만 읽는다.
