---
title: Keep Screen-specific Handler Flow Local Until a Real Utility Emerges
titleKo: 화면 전용 핸들러 흐름의 로컬 유지
impact: MEDIUM
impactDescription: 모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지합니다
appliesWhen:
  - 화면 전용 named handler의 분기·mutation·navigation·후처리를 여러 helper나 hook으로 나눌 때
  - 쪼개져 있던 handler 흐름을 다시 합칠 때
reviewWith: screen-extract-utilities-selectively
tags: events, handlers, flow
---

## Keep Screen-specific Handler Flow Local Until a Real Utility Emerges

**Impact: MEDIUM (모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지합니다)**

여기서 `local`은 JSX 인라인 핸들러가 아니라,
이미 이름 붙은 handler 본문 안에서 흐름을 계속 읽을 수 있게 유지한다는 뜻입니다.
핸들러가 길어져도 바로 `function` 폴더나 shared support code로 쪼개지 않습니다.

- 먼저 early return, 단계적 지역 변수, 의미 있는 블록 구분으로 읽기 쉽게 유지합니다.
- `screen-extract-utilities-selectively`를 만족할 때만 분리합니다.
- 화면 하나에서만 쓰는 custom hook으로 우회해 흐름을 숨기는 것도 피합니다.
- 인라인 callback을 같은 component 안의 named handler로 옮기기만 하는 변경은 대상이 아닙니다.

**Incorrect (재사용 근거 없이 흐름을 지나치게 분해):**

```ts
const validate = () => {/* ... */};
const buildRequest = () => {/* ... */};
const runMutation = async () => {/* ... */};
const postProcess = () => {/* ... */};
```

**Correct (핸들러에서 흐름을 직접 읽을 수 있게 유지):**

```ts
/**
 * @event 선택된 entry 저장과 화면 이동 처리
 */
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!responseEntryListSuspense.data.selectedEntry) {
    return;
  }

  if (mutationEntrySave.isPending) {
    return;
  }

  await mutationEntrySave.mutateAsync({ data: request });
  void navigate({ to: "/entries" });
};
```
