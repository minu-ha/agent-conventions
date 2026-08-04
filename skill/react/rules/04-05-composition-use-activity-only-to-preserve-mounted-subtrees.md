---
title: Use Activity Only to Preserve Mounted Subtrees
titleKo: 상태를 살려 둬야 할 때만 `Activity`로 감춥니다
impact: MEDIUM
impactDescription: 숨기기와 마운트 해제를 구분해 써서 되돌릴 때 상태가 사라지는 사고를 막습니다
appliesWhen:
  - 조건부 렌더링과 `Activity` 사이를 오갈 때
  - `<Activity>`를 추가·삭제하거나 `mode`를 계산하는 식을 바꿀 때
reviewWith: composition-do-not-define-components-inside-components
tags: composition, jsx
---

## Use Activity Only to Preserve Mounted Subtrees

**Impact: MEDIUM (숨기기와 마운트 해제를 구분해 써서 되돌릴 때 상태가 사라지는 사고를 막습니다)**

기본은 조건부 렌더링입니다.
`<Activity>`는 **숨겼다 되돌릴 때 하위 트리 상태를 그대로 살려야 할 때만** 씁니다.

두 방식은 같은 일이 아닙니다.

| | 조건부 렌더링 | `<Activity mode="hidden">` |
| --- | --- | --- |
| 하위 트리 | 해제됩니다 | 마운트된 채 남습니다 |
| 상태 | 사라집니다 | 유지됩니다 |
| 이펙트 | 정리됩니다 | 정리됩니다 |
| 렌더 비용 | 없습니다 | 낮은 우선순위로 계속 듭니다 |
| 보조 기술 | 없는 것으로 읽힙니다 | 숨겨진 것으로 읽힙니다 |

- 마운트와 해제 자체가 의미를 가지면 조건부 렌더링을 유지합니다.
  폼 초기화, 구독 해제, 첫 진입 애니메이션이 그런 경우입니다.
- 숨긴 하위 트리도 렌더 비용이 계속 듭니다.
  무거운 트리를 습관적으로 감춰 두지 않습니다.
- `<Activity>`는 리액트 19.2 이상에만 있습니다.
  그보다 낮으면 조건부 렌더링만 씁니다.

**Incorrect (폼 초기화가 필요한 자리를 표시 방식으로 치환):**

```tsx
// 편집을 취소했다가 다시 들어가면 지난 입력이 그대로 남는다
return (
  <Fragment>
    <Activity mode={isEditing ? "visible" : "hidden"}>
      <PgProductEditorForm />
    </Activity>
    <Activity mode={isEditing ? "hidden" : "visible"}>
      <PgProductPreviewPane />
    </Activity>
  </Fragment>
);
```

**Correct (되돌릴 때 살려야 할 상태가 하위 트리에 있는 자리에만 사용):**

```tsx
const PgProductSidebar = () => {
  // 접어 둔 노드와 스크롤 위치가 사이드바 안에 있다. 닫았다 열면 그대로 있어야 한다
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  return <UiTree expandedKeys={expandedKeys} onExpand={setExpandedKeys} />;
};
```

```tsx
return (
  <Activity mode={isSidebarOpen ? "visible" : "hidden"}>
    <PgProductSidebar />
  </Activity>
);
```

**Correct (마운트 의미가 있으면 조건부 렌더링을 유지):**

```tsx
return hasItems ? <PgProductList /> : <PgProductEmptyState />;
```
