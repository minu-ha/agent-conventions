---
title: Use Activity Only to Preserve Mounted Subtrees
titleKo: 상태를 살려 둬야 할 때만 `Activity`로 감춥니다
impact: HIGH
impactDescription: 숨기기와 마운트 해제를 구분해 써서 되돌릴 때 상태가 사라지는 사고를 막습니다
appliesWhen:
  - 조건부 렌더링과 `Activity` 사이를 오갈 때
  - `<Activity>`를 추가·삭제하거나 `mode`를 계산하는 표현식을 바꿀 때
reviewWith: composition-do-not-define-components-inside-components
tags: composition, jsx
---

## Use Activity Only to Preserve Mounted Subtrees

**Impact: HIGH (숨기기와 마운트 해제를 구분해 써서 되돌릴 때 상태가 사라지는 사고를 막습니다)**

기본은 조건부 렌더링입니다.
`<Activity>`는 **숨겼다 되돌릴 때 하위 트리 상태를 그대로 살려야 할 때만** 씁니다.

두 방식은 같은 일이 아닙니다.

| | 조건부 렌더링 | `<Activity mode="hidden">` |
| --- | --- | --- |
| 하위 트리 | 해제됩니다 | 마운트된 채 남습니다 |
| 상태 | 사라집니다 | 유지됩니다 |
| 이펙트 | 정리됩니다 | 정리됩니다 |
| 렌더 비용 | 없습니다 | 업데이트가 생기면 낮은 우선순위로 렌더됩니다 |
| DOM 노드 | 문서에서 사라집니다 | 문서에 남습니다 |

- 마운트와 해제 자체가 의미를 가지면 조건부 렌더링을 유지합니다.
  폼 초기화, 구독 해제, 첫 진입 애니메이션이 그런 경우입니다.
- 숨긴 하위 트리도 업데이트가 생기면 다시 렌더됩니다.
  무거운 트리를 습관적으로 감춰 두지 않습니다.
- 접근성을 이유로 `<Activity>`를 고르지 않습니다.
  리액트는 숨길 때 `display: none`만 걸고, 그 노드는 접근성 트리에서 빠집니다.
  스크린 리더에는 조건부 렌더링과 똑같이 없는 것으로 읽힙니다.
- `<Activity>`는 리액트 19.2 이상에만 있습니다.
  그보다 낮으면 조건부 렌더링만 씁니다.

**Incorrect (폼 초기화가 필요한 자리를 표시 방식으로 바꿉니다):**

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

**Correct (마운트 의미가 있으면 조건부 렌더링을 둡니다):**

```tsx
// 편집을 취소하면 폼이 해제돼서 다시 들어갈 때 빈 입력으로 시작한다
return (
	<Fragment>
		{isEditing && <PgProductEditorForm />}
		{!isEditing && <PgProductPreviewPane />}
	</Fragment>
);
```

**Incorrect (되돌릴 때 살려야 할 상태를 조건부 렌더링으로 날립니다):**

```tsx
// 사이드바: 접어 둔 노드와 스크롤 위치를 자기 상태로 갖는다
const PgProductSidebar = () => {
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	return <UiTree expandedKeys={expandedKeys} onExpand={setExpandedKeys} />;
};

// 사이드바를 소유한 화면: 닫으면 해제돼서 접어 둔 노드와 스크롤 위치가 사라진다
return isSidebarOpen && <PgProductSidebar />;
```

**Correct (되돌릴 때 살려야 할 상태가 하위 트리에 있는 자리에만 씁니다):**

```tsx
// 사이드바: 접어 둔 노드와 스크롤 위치를 자기 상태로 갖는다
const PgProductSidebar = () => {
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	return <UiTree expandedKeys={expandedKeys} onExpand={setExpandedKeys} />;
};

// 사이드바를 소유한 화면: 닫아도 마운트를 유지해 그 상태를 그대로 살린다
return (
	<Activity mode={isSidebarOpen ? "visible" : "hidden"}>
		<PgProductSidebar />
	</Activity>
);
```
