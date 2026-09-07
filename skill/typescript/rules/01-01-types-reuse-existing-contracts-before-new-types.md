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

뜻과 수명이 같고 필드 이름, 타입, 선택 여부, 읽기 전용 여부까지 같은 기존 계약을 재사용합니다.
구조가 같아도 단위나 도메인 역할이 다르면 합치지 않습니다.

| 상황 | 처리 |
| --- | --- |
| 같은 뜻의 계약과 모든 필드 조건이 같음 | 기존 타입이나 스키마를 그대로 참조합니다 |
| 같은 필드의 타입·선택 여부·읽기 전용 여부가 다름 | 새 계약을 선언합니다 |
| 기존 계약의 일부 필드만 필요함 | `types-derive-subsets-with-indexed-access`에 따라 파생합니다 |
| 원본 입력과 정규화 결과처럼 역할이 다름 | 필드가 같아도 별도 계약을 둡니다 |

다음은 이 규칙을 적용하지 않는 경우입니다.

| 변경 | 별도로 판단할 것 |
| --- | --- |
| 소유자 이동, 이름·주석 변경, 그대로인 계약의 새 사용처 | 새 호출 계약 역할이 생기는지만 문서화 규칙으로 판단합니다 |
| 위치 인자를 우리가 고칠 수 있는 기존 객체 계약으로 대체 | `types-document-custom-types-and-shapes`만 적용합니다 |
| 맞는 기존 형태가 없는 새 도메인 계약 | 문서화 규칙만 적용합니다 |
| 외부·생성된·읽기 전용·공용 형태를 그대로 사용 | 두 타입 규칙 모두 대상이 아닙니다. 함수 문서화는 문서 규칙이 판단합니다 |

규칙을 적용하려고 요청에 없는 `*Params`나 `*Input`을 만들지 않습니다.

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
