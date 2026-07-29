---
title: Classify Static UI Copy and Dynamic Values
impact: CRITICAL
impactDescription: Figma copy는 맞추되 서버/API 값을 하드코딩하는 오류를 막음
tags: data, copy, api
---

## Classify Static UI Copy and Dynamic Values

**Impact: CRITICAL (Figma copy는 맞추되 서버/API 값을 하드코딩하는 오류를 막음)**

Figma에 보이는 모든 텍스트와 숫자를 static UI copy와 dynamic data로 먼저 분류합니다.
버튼명, 탭명, 컬럼명, 라벨, placeholder, empty state, default option, 고정 안내문구는 Figma 기준으로 맞춥니다.
row data, metric value, user-specific data, API mock 값은 UI 고정값처럼 박지 않습니다.

**Incorrect (Figma 숫자를 API 값 대신 하드코딩):**

```tsx
<MetricCard label="성공률" value="98.7%" />
```

**Correct (static label만 맞추고 value는 데이터 오리진 유지):**

```tsx
<MetricCard label="성공률" value={responseMetric.successRateLabel} />
```
