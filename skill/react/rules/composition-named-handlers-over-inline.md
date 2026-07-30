---
title: Use Named Handlers Instead of Hiding Logic in JSX
titleKo: JSX 인라인 로직의 명명된 핸들러 분리
impact: HIGH
impactDescription: 부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 합니다
impactDescriptionKo: 부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 합니다
appliesWhen: >-
  TSX event prop의 인라인 callback에 분기, 비동기 호출, 여러 동작·부수효과 또는 비자명한 state transition을
  추가·수정한다. 단순 setter·인자 전달 한 줄 위임은 제외한다.
appliesWhenKo:
  - TSX event prop의 인라인 callback에 분기나 비동기 호출을 추가·수정할 때
  - 인라인 callback에 여러 동작·부수효과나 비자명한 state transition이 들어갈 때
  - 제외: 단순 setter나 인자 전달 한 줄 위임만 있는 경우
requiresSelected: docs-require-jsdoc-on-key-declarations, events-name-and-curry-handlers
reviewWith: events-keep-handler-flow-inline, events-run-user-actions-in-handlers-not-effects
tags: composition, jsx, handlers
---

## Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 합니다)**

JSX에서는 명명된 핸들러 참조를 기본으로 하고, 아주 짧은 단순 위임만 인라인 함수로 허용합니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 반드시 핸들러로 분리합니다.

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
