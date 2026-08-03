---
title: Use Visibility Primitives Deliberately for Show and Hide Branches
titleKo: 보이기와 숨기기는 정해진 방식 중에서 고릅니다
impact: MEDIUM
impactDescription: 표시 여부를 정하는 방식이 화면 전반에서 일관되게 남습니다
appliesWhen:
  - 마운트된 하위 트리의 표시 상태를 보존하려고 조건부 렌더링을 Activity로 바꿀 때
  - Activity 등 표시 방식과 조건부 렌더링 사이를 오갈 때
tags: composition, jsx, activity
---

## Use Visibility Primitives Deliberately for Show and Hide Branches

**Impact: MEDIUM (표시 여부를 정하는 방식이 화면 전반에서 일관되게 남습니다)**

React 19의 `<Activity />` 또는 프로젝트가 이미 채택한 동등한 표시 방식은
이미 마운트된 하위 트리를 보여주거나 숨기는 의도일 때만 씁니다.

삼항 렌더링과 표시 방식은 같은 의미가 아닙니다.
삼항은 branch를 아예 해제하지만, 표시 방식은 숨겨진 하위 트리의 상태와 이펙트를 유지합니다.

- 마운트와 해제 자체가 의미를 가지면 기존 조건부 렌더링을 유지합니다.
- 코드베이스에 `Activity`가 아직 없으면 이 규칙 때문에 새 추상화를 들이지 말고 기존 패턴을 따릅니다.

**Incorrect (생명주기 의미가 다른 분기를 무비판적으로 표시 방식으로 치환):**

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

**Correct (show/hide가 목적일 때만 표시 방식을 사용하고, mount 의미가 중요하면 조건부 렌더링을 유지):**

```tsx
return <Activity mode={isSidebarOpen ? "visible" : "hidden"}><EntrySidebar /></Activity>;
```

```tsx
return hasItems ? <ItemList /> : <EmptyState />;
```
