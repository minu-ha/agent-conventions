---
title: Declare Functions as Arrow Consts
titleKo: 함수는 `const` 화살표로 선언합니다
impact: MEDIUM
impactDescription: 선언 형태가 한 가지로 고정되어 호이스팅에 기대는 순서 의존이 생기지 않습니다
appliesWhen:
  - 이름 붙인 함수를 새로 만들거나 선언 형태를 바꿀 때
  - 제외: 클래스 메서드, 제너레이터, 오버로드 선언
reviewWith: functions-use-named-object-params-for-complex-signatures
tags: functions, declarations
---

## Declare Functions as Arrow Consts

**Impact: MEDIUM (선언 형태가 한 가지로 고정되어 호이스팅에 기대는 순서 의존이 생기지 않습니다)**

이름 붙인 함수는 `const`에 화살표 함수를 담아 선언합니다.
`function` 선언문은 쓰지 않습니다.

- 한 파일 안에서 두 형태를 섞으면 어느 것이 공개 계약인지 형태로 구분할 수 없습니다.
- `function` 선언문은 호이스팅되므로 선언보다 위에서 호출해도 동작합니다.
  그러면 읽는 순서와 실행 순서가 달라집니다.
- 화살표 함수는 `this`를 새로 만들지 않아 콜백으로 넘길 때 묶어 줄 필요가 없습니다.

세 자리는 예외로 둡니다.

| 예외 | 이유 |
| --- | --- |
| 클래스 메서드 | 메서드 문법이 정본입니다. 화살표 필드로 바꾸지 않습니다 |
| 제너레이터 | `function*` 없이 쓸 수 없습니다 |
| 오버로드 선언 | 시그니처를 여러 줄로 겹쳐 쓰려면 `function` 선언문이 필요합니다 |

**Incorrect (`function` 선언문과 화살표를 한 파일에서 섞음):**

```ts
export function normalizeEntryTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}

export const buildEntrySlug = (title: string): string => normalizeEntryTitle(title).toLowerCase();
```

**Incorrect (선언보다 위에서 호출해 호이스팅에 기댐):**

```ts
export const buildEntryLabel = (entry: Entry): string => decorate(entry.title);

function decorate(title: string): string {
	return `# ${title}`;
}
```

**Correct (모두 `const` 화살표로 선언하고 쓰기 전에 선언):**

```ts
const decorate = (title: string): string => `# ${title}`;

export const normalizeEntryTitle = (rawTitle: string): string => rawTitle.trim().replace(/\s+/g, " ");

export const buildEntryLabel = (entry: Entry): string => decorate(entry.title);
```

**Correct (클래스 메서드와 제너레이터는 그대로 둠):**

```ts
export class EntryCursor {
	private buffer: Entry[] = [];

	*pages(): Generator<Entry[]> {
		yield this.buffer;
	}

	reset(): void {
		this.buffer = [];
	}
}
```
