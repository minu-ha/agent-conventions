# 섹션

이 파일은 Convention Audit rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Trigger and Scope (trigger)
**Impact:** CRITICAL
**Description:** React/CSS/TypeScript convention이 걸리는 변경에서는 audit을 선택 사항으로 두지 않고, 변경 표면과 companion skill을 먼저 확정해야 합니다.

## 2. Evidence Packet (evidence)
**Impact:** CRITICAL
**Description:** 판단형 rule은 감으로 검토하지 않고 diff, 파일 outline, import/export, component/state/data flow, CSS selector 같은 구조 증거를 먼저 모아야 합니다.

## 3. Rule Coverage Matrix (coverage)
**Impact:** CRITICAL
**Description:** 변경 파일마다 적용되는 React/CSS/TypeScript rule을 명시적으로 매핑해야 누락된 companion rule과 애매한 경계를 드러낼 수 있습니다.

## 4. Semantic Review Gate (review)
**Impact:** CRITICAL
**Description:** 자동 검사로 끝내지 않고 독립 reviewer 또는 main-agent reviewer가 rule 원문과 증거를 대조해 PASS/FAIL/UNKNOWN을 판정해야 합니다.

## 5. Repair and Completion (completion)
**Impact:** CRITICAL
**Description:** FAIL 또는 UNKNOWN을 남긴 채 완료하지 않고, 수정 반복과 최종 verdict 보고를 완료 조건으로 삼아야 합니다.
