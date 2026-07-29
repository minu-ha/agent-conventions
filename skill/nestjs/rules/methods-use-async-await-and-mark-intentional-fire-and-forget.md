---
title: Use Async/Await and Mark Intentional Fire-and-forget Calls
impact: HIGH
impactDescription: keeps asynchronous backend flow readable and makes intentionally unawaited side effects explicit
tags: async, await, side-effects
---

## Use Async/Await and Mark Intentional Fire-and-forget Calls

**Impact: HIGH (keeps asynchronous backend flow readable and makes intentionally unawaited side effects explicit)**

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
