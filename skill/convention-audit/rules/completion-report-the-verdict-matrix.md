---
title: Report the Final Verdict Matrix
impact: CRITICAL
impactDescription: selection completeness, semantic 결과, reviewer와 관찰 한계를 다시 확인할 수 있게 함
tags: completion, report, matrix
---

## Report the Final Verdict Matrix

**Impact: CRITICAL (selection completeness, semantic 결과, reviewer와 관찰 한계를 다시 확인할 수 있게 함)**

최종 보고에는 다음을 분리해 기록합니다.

- activated indexes: skill별 current routing digest와 total rule count
- coverage: selected, N/A, unknown count와 exact partition 검증 결과
- excluded groups: ordinal/ID 범위와 non-empty evidence reason
- selection comparison: 구현자/auditor `Selected/N/A/Unknown` all-set exact match 여부
- expanded guidance: full rule로 확장한 ordinal/ID와 CRITICAL 또는 예외 판단 이유
- reviewWith closure와 inactive cross-skill decision
- semantic verdicts: PASS/FAIL/UNKNOWN count와 예외
- reviewer mode, receipt exposure timing, independent reviewer 미사용 사유
- 파일 읽기 telemetry limitation과 `declared` document list
- lint/typecheck/build/test/browser 등 실행한 verification

자동 검사와 browser 결과는 semantic 결과와 같은 줄에 합쳐 PASS처럼 보이게 하지 않습니다. 미실행 검증이나 telemetry 부재도 숨기지 않습니다.

**Incorrect (판정과 한계를 생략):**

```md
컨벤션 검토와 빌드를 모두 마쳤습니다.
```

**Correct (추적 가능한 최종 보고):**

```md
Activated indexes: react 42 sha256:..., typescript 22 sha256:...
Coverage: selected 8, N/A 56, unknown 0; exact=true
Excluded groups: recorded with file/diff reasons
Selection comparison: exact match
Verdicts: PASS 8, FAIL 0, UNKNOWN 0
Reviewer mode: independent; receipt opened after auditor scan
Telemetry: unavailable; document list is declared
Verification: lint/build PASS; browser not run
```
