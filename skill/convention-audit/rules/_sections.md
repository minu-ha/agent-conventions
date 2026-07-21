# 섹션

이 파일은 Convention Audit rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Trigger and Scope (trigger)
**Impact:** CRITICAL
**Description:** local audit gate를 먼저 고정하고 actual changed surface로 React, TypeScript, CSS companion을 조건부 활성화합니다.

## 2. Evidence Packet (evidence)
**Impact:** CRITICAL
**Description:** diff, owner/data/style 경계, runtime evidence와 자동 검증을 audit packet에 분리 기록하고 구현자 receipt는 독립 selection 뒤에만 비교합니다.

## 3. Exact Rule Coverage (coverage)
**Impact:** CRITICAL
**Description:** activated index 전체를 current digest 기준 exact ordinal partition으로 덮고 N/A exclusion evidence와 conditional companion 결정을 검증합니다.

## 4. Independent Semantic Review (review)
**Impact:** CRITICAL
**Description:** auditor가 구현자 selection을 보기 전에 독립 scan을 수행하고 reviewWith closure와 selected/unknown 원문을 실제 증거에 대조합니다.

## 5. Repair and Completion (completion)
**Impact:** CRITICAL
**Description:** coverage mismatch, unsupported N/A, semantic FAIL/UNKNOWN 또는 scope drift를 고치고 exact receipt와 verdict를 다시 검증한 뒤 한계까지 보고합니다.
