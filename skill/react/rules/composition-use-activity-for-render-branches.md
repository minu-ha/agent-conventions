---
title: Use Visibility Primitives Deliberately for Show and Hide Branches
impact: MEDIUM
impactDescription: 표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함
appliesWhen: 이미 마운트된 subtree의 표시 상태를 보존하려고 조건부 렌더링과 Activity 또는 동등한 visibility primitive 사이를 바꾼다.
tags: composition, jsx, activity
---

## Use Visibility Primitives Deliberately for Show and Hide Branches

**Impact: MEDIUM (표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함)**

React 19의 `<Activity />` 또는 프로젝트가 이미 채택한 동등한 visibility primitive가 있다면, 이미 마운트된 subtree를 보여주거나 숨기는 의도일 때만 사용합니다.
삼항 렌더링과 visibility primitive는 같은 의미가 아닙니다.
전자는 branch를 아예 unmount할 수 있지만, 후자는 숨겨진 subtree의 state와 effect를 유지할 수 있습니다.
mount/unmount 의미가 중요하면 기존 조건부 렌더링을 유지하고, 코드베이스에 `Activity`가 아직 없다면 이 규칙 때문에 새 추상화를 도입하지 말고 기존 패턴을 따릅니다.

**Incorrect (lifecycle 의미가 다른 분기를 무비판적으로 visibility primitive로 치환):**

```tsx
return (
  <>
    <Activity mode={isEditing ? "visible" : "hidden"}>
      <EditorForm />
    </Activity>
    <Activity mode={isEditing ? "hidden" : "visible"}>
      <PreviewPane />
    </Activity>
  </>
);
```

**Correct (show/hide가 목적일 때만 visibility primitive를 사용하고, mount 의미가 중요하면 조건부 렌더링을 유지):**

```tsx
return <Activity mode={isSidebarOpen ? "visible" : "hidden"}><EntrySidebar /></Activity>;
```

```tsx
return hasItems ? <ItemList /> : <EmptyState />;
```
