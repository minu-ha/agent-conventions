---
title: Preserve Visible Labels and Headings Unless Explicitly Removed
titleKo: 명시적 삭제 요청 없이 라벨·제목을 없애지 않기
impact: HIGH
impactDescription: UI polish 중 사용자에게 보이는 구조 신호를 임의 삭제하지 않게 함
impactDescriptionKo: UI polish 중 사용자에게 보이는 구조 신호를 임의 삭제하지 않게 함
tags: implementation, labels, headings
---

## Preserve Visible Labels and Headings Unless Explicitly Removed

**Impact: HIGH (UI polish 중 사용자에게 보이는 구조 신호를 임의 삭제하지 않게 함)**

Visible label, section title, heading, column header는 화면 구조와 접근성의 일부입니다.
Figma 또는 사용자가 명확히 제거하라고 하지 않는 한, visual polish를 이유로 임의 삭제하지 않습니다.
Figma에 label이 있고 현재 구현에 없으면 static UI copy로 맞출 후보입니다.

**Incorrect (깔끔해 보이게 하려고 heading 삭제):**

```tsx
return <DataTable rows={rows} />;
```

**Correct (Figma의 visible section title 유지):**

```tsx
return (
  <section aria-labelledby="position-summary-title">
    <h2 id="position-summary-title">포지션 요약</h2>
    <DataTable rows={rows} />
  </section>
);
```
