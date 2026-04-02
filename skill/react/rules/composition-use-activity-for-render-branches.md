---
title: Use Activity for JSX Render Branches
impact: MEDIUM
impactDescription: 표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함
tags: composition, jsx, activity
---

## Use Activity for JSX Render Branches

**Impact: MEDIUM (표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함)**

React 19의 `<Activity />` 또는 프로젝트가 이미 채택한 동등한 visibility primitive가 있다면, JSX에서 렌더링 노드를 바꾸는 조건부 분기에는 삼항 렌더링 대신 그 primitive를 사용합니다.   
속성값 계산은 삼항을 허용하지만, 노드 자체의 표시/숨김은 일관된 visibility primitive로 통일합니다. 코드베이스에 `Activity`가 아직 없다면 이 규칙 때문에 새 추상화를 도입하지 말고 기존 패턴을 따릅니다.

**Incorrect (렌더링 노드 선택을 삼항으로 처리):**

```tsx
return hasItems ? <ItemList /> : <EmptyState />;
```

**Correct (`Activity`를 이미 쓰는 코드베이스에서는 표시/숨김을 같은 primitive로 드러냄):**

```tsx
return (
  <>
    <Activity mode={hasItems ? "visible" : "hidden"}>
      <ItemList />
    </Activity>
    <Activity mode={hasItems ? "hidden" : "visible"}>
      <EmptyState />
    </Activity>
  </>
);
```
