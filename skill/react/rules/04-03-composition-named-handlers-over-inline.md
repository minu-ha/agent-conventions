---
title: Use Named Handlers Instead of Hiding Logic in JSX
titleKo: `JSX` 안 로직은 이름 붙인 핸들러로 뺍니다
impact: HIGH
impactDescription: 부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다
appliesWhen:
  - TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때
  - 인라인 콜백에 여러 동작·부수효과나 읽어서 의도가 안 보이는 상태 전환이 들어갈 때
  - 제외: 인자 없이 핸들러 참조만 넘기는 경우
requiresSelected: docs-require-jsdoc-on-key-declarations, events-curry-extra-handler-arguments
reviewWith: events-keep-handler-flow-inline, events-run-user-actions-in-handlers-not-effects
tags: composition, jsx, handlers
---

## Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다)**

JSX에는 이름 붙인 핸들러 참조만 넘깁니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 핸들러로 분리합니다.

추가 인자를 넘기려고 `onClick={() => handleX(id)}` 같은 인라인 래퍼를 쓰지 않습니다.
그 자리는 `events-curry-extra-handler-arguments`가 커링으로 정합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨김):**

```tsx
<UiButton
  onClick={async () => {
    if (!selectedProduct) {
      return;
    }

    await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
    void navigate({ to: "/next" });
  }}
/>
```

**Correct (로직을 명명된 핸들러로 노출):**

```tsx
import type { MouseEventHandler } from "react";

/**
 * 선택된 product 삭제와 다음 화면 이동 처리
 */
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedProduct) {
    return;
  }

  await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
  void navigate({ to: "/products" });
};

<UiButton onClick={handleRemoveProductButtonClick} />;
```
