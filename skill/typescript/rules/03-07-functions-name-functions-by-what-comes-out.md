---
title: Name Functions by What Comes Out
titleKo: 함수 이름은 무엇이 나오는지로 짓습니다
impact: MEDIUM
impactDescription: 이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다
appliesWhen:
  - 이름 붙인 함수를 새로 만들거나 이름을 바꿀 때
  - 제외: 외부 패키지가 정한 이름을 별칭 없이 그대로 쓰는 경우
tags: functions, naming
---

## Name Functions by What Comes Out

**Impact: MEDIUM (이름만 읽고 결과를 알 수 있어 구현을 열어 보지 않아도 됩니다)**

`build`, `create`, `normalize`, `resolve`, `process`는 서로 바꿔 써도 뜻이 안 변합니다.
그런 동사는 이름 자리를 차지하면서 아무것도 알려 주지 않습니다.
아래 금지 목록이 그런 동사를 모아 둔 것입니다.

**형태를 바꾸는 함수는 `to<나오는 것>`으로 짓습니다.**
반환 타입을 이름이 말해 주므로 구현을 열지 않아도 됩니다.

| 하는 일 | 이름 |
| --- | --- |
| 형태를 바꿈 | `to<결과>` |
| 이미 있는 값을 꺼냄 | `get<대상>` |
| 찾되 없을 수 있음 | `find<대상>` |
| 참·거짓을 답함 | `is<상태>`, `has<대상>`, `can<동작>` |
| 걸러 냄 | `filter<대상>` |
| 정렬함 | `sort<대상>` |
| 서버를 부름 | `fetch<대상>`, `save<대상>`, `remove<대상>` |

표에 없는 도메인 동작은 그 동작의 이름을 그대로 씁니다.
`submitOrder`, `cancelBooking`처럼 씁니다.
표는 자주 나오는 경우를 못 박은 것이고, 아래 금지 목록만 예외 없이 지킵니다.

**이름의 첫 동사만 봅니다.** `isCheckedRow`나 `handleCheckAll`처럼 뒤에 섞인 낱말은 대상이 아닙니다.

첫 동사로 쓰지 않는 낱말입니다.
이름이 무엇이 나오는지 알려 주지 않습니다.

`build`, `create`, `make`, `normalize`, `resolve`, `process`, `manage`, `do`, `perform`, `execute`

- `update<대상>`은 무엇이 어떻게 바뀌는지 알 수 없어 쓰지 않습니다.
  `save<대상>`이나 `to<결과>`로 나눠 적습니다.
- `handle`은 이벤트 핸들러 이름에만 씁니다.
  리액트 규칙이 그 형태를 따로 정합니다.
- 프레임워크가 이름을 정해 둔 자리는 대상이 아닙니다.
  규격이 요구하는 메서드 이름은 금지 목록에 있어도 그대로 씁니다.
- `new Promise((resolve, reject) => …)`의 매개변수처럼 언어 관용구가 정한 이름도 대상이 아닙니다.
- 외부 패키지가 `createClient`처럼 지어 둔 이름은 그대로 씁니다.
  우리가 짓는 이름만 봅니다.

**Incorrect (동사가 결과를 안 알려 줌):**

```ts
export const buildUserPayload = (formValues: UserFormValues) => { /* … */ };
export const normalizeUserValues = (formValues: UserFormValues) => { /* … */ };
export const resolveUserLabel = (user: User) => { /* … */ };
export const processUserRows = (rows: UserRow[]) => { /* … */ };
```

**Correct (이름이 결과를 말함):**

```ts
/**
 * 사용자 저장 요청 조립. 서버가 빈 문자열을 거부해 비운 칸은 넣지 않는다
 */
export const toUserSaveRequest = (formValues: UserFormValues) => { /* … */ };

/**
 * 목록에 표시할 사용자 이름을 만든다. 표시 이름이 비면 이메일 앞부분을 쓴다
 */
export const toUserDisplayName = (user: User) => { /* … */ };

/**
 * 비활성 사용자를 뺀 목록
 */
export const filterActiveUsers = (rows: UserRow[]) => { /* … */ };

/**
 * 관리자 권한 판정. 역할 목록이 비어 있으면 조회가 끝나지 않은 상태라 false 다
 */
export const isAdminUser = (user: User) => { /* … */ };
```
