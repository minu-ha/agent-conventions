---
title: Use Named Handlers Instead of Hiding Logic in JSX
impact: HIGH
impactDescription: 부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 함
appliesWhen: TSX event prop에 인라인 callback을 추가·수정하고 그 안에 분기, 비동기 호출, 상태 변경 또는 여러 동작이 들어간다.
reviewWith: events-name-and-curry-handlers, events-keep-handler-flow-inline, events-run-user-actions-in-handlers-not-effects, docs-require-jsdoc-on-key-declarations
tags: composition, jsx, handlers
---

## Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 함)**

JSX에서는 명명된 핸들러 참조를 기본으로 하고, 아주 짧은 단순 위임만 인라인 함수로 허용합니다. 분기, 비동기 호출, 여러 부수효과가 들어가면 반드시 핸들러로 분리합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨김):**

```tsx
<UiButton
  onClick={async () => {
    if (!selectedEntry) {
      return;
    }

    await mutationEntryRemove.mutateAsync({ params: { entryId: selectedEntry.id } });
    void navigate({ to: "/next" });
  }}
/>
```

**Correct (로직을 명명된 핸들러로 노출):**

```tsx
/**
 * @event 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  // ...
};

<UiButton onClick={handleRemoveEntryButtonClick} />;
```
