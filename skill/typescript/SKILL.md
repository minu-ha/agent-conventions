---
name: convention-typescript
description: Use when editing TypeScript or TSX modules, types, configs, API or helper contracts, fallbacks, imports, exports, or JSDoc.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TypeScript Convention Router

규칙집이 아닌 TypeScript 원문 router다. full handbook은 fallback에서만 읽는다.

## 1. Scope snapshot

수정 전 요청·계획·diff를 한 줄로 고정한다. `.ts`/`.tsx`, type·schema·config·API·helper, import/export, fallback, JSDoc 변경 시 활성화한다. React 경계나 CSS class contract 변경은 companion도 활성화한다.

변경 semantic delta만 판정한다. 추가·삭제·이동·이름 변경·재선언은 포함하고, read-only 문맥과 byte-equivalent 내부 구문은 제외한다. 파일 이동에서 이름·shape·동작이 같은 내부 선언·본문·class·value는 diff에 삭제+추가로 보여도 별도 추가·변경·재선언으로 다시 세지 않는다. 단, byte-equivalent named shape라도 새 callable input 또는 output 계약 역할에 연결되면 role semantic delta로 판정한다. N/A rule의 optional pattern을 새로 도입해 스스로 활성화하지 말고 요청을 충족하는 최소 semantic patch만 구현한다.

## 2. Index scan

[RULES_INDEX.md](./RULES_INDEX.md) 전체를 scan해 모든 `appliesWhen`을 scope evidence와 대조한다. 첫 match에서 절대 멈추지 않는다. stable ID는 배제 근거가 아니며 애매하면 `Unknown`이다.

## 3. Digest-bound receipt

index `sha256`에 묶인 exact receipt를 유지한다.

```md
Activated: typescript, <companions>
Index: typescript@sha256:<digest>
Selected: <ordinal + stable ID>
Not applicable: <나머지 전체 ordinal>
Excluded groups: <N/A ordinal group>: <비어 있지 않은 scope-evidence 이유>
Unknown: <ordinal + stable ID 또는 none>
Expanded: <full rule을 추가로 읽은 ordinal + stable ID: 이유 또는 none>
```

각 ordinal은 셋 중 하나다. exclusion group 합집합은 exact N/A이며 이유는 비어 있으면 안 된다. `reviewWith`는 재평가 신호다. `completionGate`는 완료 receipt에서 Selected이며 N/A 불가다.

## 4. Read and implement

Selected와 Unknown의 stable ID와 같은 `contracts/<stable-id>.md`를 전부 읽는다. `CRITICAL`이면 matching full rule도 반드시 읽는다. 나머지는 exact 판단·Unknown·audit에 필요할 때만 `Expanded: ID: 이유`로 확장한다. Unknown은 Selected/N/A로 먼저 해소하고, final N/A의 `requiresSelected`는 적용하지 않는다. Selected로 확정한 contract의 `requiresSelected` target은 companion까지 활성화해 즉시 Selected로 두며 N/A 불가다. Selected contract의 필수 변경만 scope evidence에 합치고 예시·선택적 대안·해소되지 않은 Unknown의 가상 변경은 evidence가 아니다. 새 surface·companion·Selected가 생기면 index와 `reviewWith`를 고정점까지 반복 판정한다. 고정점의 Selected contract와 Expanded 원문만 구현·리뷰 기준이다.

## 5. Scope drift

`scope drift`면 snapshot부터 활성 progressive index를 재scan하고 stale receipt를 폐기한다.

## 6. Finish gate

`convention-audit`이 마지막 diff로 활성 progressive index를 독립 재선택한다. digest·receipt·evidence·`Expanded`를 검증해 `FAIL 0`, `UNKNOWN 0`만 완료한다.

[AGENTS.md](./AGENTS.md)는 full handbook 요청이나 index/contract/필요 rule 손상·누락 fallback 때만 읽는다.
