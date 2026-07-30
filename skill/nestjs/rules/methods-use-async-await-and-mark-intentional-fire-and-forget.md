---
title: Use Async/Await and Mark Intentional Fire-and-forget Calls
titleKo: async/await 쓰고 의도적 fire-and-forget은 표시
impact: HIGH
impactDescription: 비동기 백엔드 흐름을 읽을 수 있게 유지하고 의도적으로 await 하지 않은 부수효과를 드러냄
tags: async, await, side-effects
---

## Use Async/Await and Mark Intentional Fire-and-forget Calls

**Impact: HIGH (비동기 백엔드 흐름을 읽을 수 있게 유지하고 의도적으로 await 하지 않은 부수효과를 드러냄)**

비동기 처리는 `async/await`를 기본으로 사용하고 `.then()` 체이닝은 피합니다.
`void` 반환 비동기 호출은 반드시 `await`하거나 `void` 키워드로 fire-and-forget 의도를 명시합니다.

**Incorrect (`.then()` 체이닝과 숨은 비동기 호출):**

```ts
this.prisma.user.findUnique({where: {id}}).then((user) => {
	return user;
});

this.eventsService.emit("user.created", user);
```

**Correct (`await` 또는 `void`로 의도를 드러냄):**

```ts
await this.eventsService.emit("user.created", user);

void this.eventsService.emit("user.created", user);
```
