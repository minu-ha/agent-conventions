---
title: Reuse Existing Contracts Before Declaring New Types
titleKo: 새 타입을 선언하기 전에 이미 있는 타입과 스키마를 먼저 씁니다
impact: MEDIUM-HIGH
impactDescription: 뜻이 그대로면 기존 타입이나 스키마를 그대로 참조해 같은 형태를 두 번 선언하지 않습니다
appliesWhen:
  - 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때
  - 같은 형태를 두 번 선언했다가 넣거나 뺄 때
  - 제외: 맞는 후보가 없거나 소유자만 옮긴 경우
  - 제외: 그대로인 계약을 새 자리에서 쓰는 경우
  - 제외: 고칠 수 없는 형태를 그대로 쓰는 경우
reviewWith: types-derive-subsets-with-indexed-access, types-document-custom-types-and-shapes
tags: types
---

## Reuse Existing Contracts Before Declaring New Types

**Impact: MEDIUM-HIGH (뜻이 그대로면 기존 타입이나 스키마를 그대로 참조해 같은 형태를 두 번 선언하지 않습니다)**

필드 이름, 타입, 선택 여부가 모두 같은 선언이 이미 있으면 그대로 참조합니다.
같은 이름의 필드가 타입이나 선택 여부에서 하나라도 다르면 끌어오지 않고 새로 선언합니다.
필드 구성이 부분집합인 것만으로는 다르다고 보지 않습니다.
일부만 필요할 때 어떻게 파생하는지는 `types-derive-subsets-with-indexed-access`가 정합니다.
소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

형태가 그대로인 계약을 새 자리에서 쓰는 것만으로는 이 규칙이 걸리지 않습니다.
호출 계약 역할은 `types-document-custom-types-and-shapes`가 따로 판정합니다.

위치 인자를 객체 입력으로 바꾸면서, 우리가 고칠 수 있는 기존 형태를 그대로 다시 쓰면
`types-document-custom-types-and-shapes`만 걸리고 이 규칙은 걸리지 않습니다.
외부·생성된·읽기 전용·공용 형태를 그대로 쓰면 두 타입 규칙 모두 대상이 아니고, 문서화는 문서 규칙이 따로 판정합니다.
요청에 없는 `*Params`나 `*Input`을 만들어 이 규칙을 스스로 켜지 않습니다.
맞는 형태가 없는 새 도메인 계약은 문서화 규칙만 걸립니다.

원본 입력과 정규화한 값은 필드가 같아도 뜻이 달라 입력 형태를 따로 두는 것이 맞습니다.
그때도 문서화 규칙만 걸리고 이 규칙은 걸리지 않습니다.

**Incorrect (기존 계약과 같은 구조를 다시 선언합니다):**

```ts
// 이미 있는 계약
interface UserRecord {
	id: string;
	name: string;
	email: string;
}

// 필드 이름, 타입, 선택 여부가 그대로인데 새로 선언했다
interface InviteRecipient {
	id: string;
	name: string;
	email: string;
}

export const sendInvites = (recipients: InviteRecipient[]): Promise<void> => { /* … */ };
```

**Correct (형태가 같으면 기존 계약을 그대로 참조합니다):**

```ts
/**
 * 초대 대상은 사용자 레코드 그대로다. 필드가 같아 따로 선언하지 않는다
 */
export const sendInvites = (recipients: UserRecord[]): Promise<void> => { /* … */ };
```

**Correct (선택 여부가 하나라도 다르면 새로 선언합니다):**

```ts
/**
 * 초대 폼 입력. 이름을 비울 수 있어 UserRecord와 선택 여부가 다르다
 */
interface InviteDraft {
	/**
	 * 받는 사람 이메일
	 */
	email: string;
	/**
	 * 표시 이름. 비우면 이메일을 그대로 보여 준다
	 */
	name?: string;
}
```
