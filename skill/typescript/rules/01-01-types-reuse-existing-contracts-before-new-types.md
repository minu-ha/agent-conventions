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

새 타입을 적기 전에 뜻과 수명이 같은 기존 타입이나 스키마를 먼저 찾습니다.
필드 이름, 타입, 선택 여부, 읽기 전용 여부까지 같으면 그 계약을 그대로 참조합니다.
구조가 같아도 단위나 도메인 역할이 다르면 합치지 않습니다.

| 찾은 기존 계약 | 처리 |
| --- | --- |
| 뜻이 같고 필드 조건도 모두 같음 | 그대로 참조합니다 |
| 뜻은 같지만 필드 일부만 필요하거나 타입·선택 여부·읽기 전용 여부가 다름 | 새 계약을 선언하고 필드는 `types-derive-subsets-with-indexed-access`에 따라 원본에서 파생합니다 |
| 원본 입력과 정규화 결과처럼 역할이 다름 | 필드가 같아도 별도 계약을 둡니다 |

다음은 이 규칙을 적용하지 않는 경우입니다.

| 변경 | 처리 |
| --- | --- |
| 소유자 이동, 이름·주석 변경, 그대로인 계약의 새 사용처 | 타입을 새로 만들지 않습니다. 기존 선언의 주석에 새 역할을 적을지만 `types-document-custom-types-and-shapes`로 판단합니다 |
| 여러 위치 인자를 우리가 고칠 수 있는 기존 객체 계약 하나로 묶음 | 그 계약을 그대로 받고 `types-document-custom-types-and-shapes`만 적용합니다 |
| 맞는 기존 형태가 없는 새 도메인 계약 | 새로 선언하고 `types-document-custom-types-and-shapes`만 적용합니다 |
| 외부·생성된·읽기 전용·공용 형태를 그대로 사용 | 이 규칙과 `types-derive-subsets-with-indexed-access` 모두 대상이 아닙니다. 함수 헤더 주석은 `docs-require-header-jsdoc-on-key-declarations`가 판단합니다 |

규칙을 적용하려고 요청에 없는 `*Params`나 `*Input`을 만들지 않습니다.

**Incorrect (기존 계약과 같은 구조를 다시 선언합니다):**

```ts
// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
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
// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
/**
 * 초대 대상은 사용자 레코드 그대로다. 필드가 같아 따로 선언하지 않는다
 */
export const sendInvites = (recipients: UserRecord[]): Promise<void> => { /* … */ };
```

**Incorrect (선택 여부가 다른데 기존 계약을 그대로 써서 없는 값을 빈 문자열로 채웁니다):**

```ts
// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
export const sendInvite = (draft: UserRecord): Promise<void> => { /* … */ };

// 폼은 이름을 비울 수 있고 id 가 아직 없어 빈 문자열을 채워야 타입이 맞는다
sendInvite({ id: "", name: "", email });
```

**Correct (선택 여부가 하나라도 다르면 새로 선언하되 필드는 원본에서 파생합니다):**

```ts
// 이미 있는 계약: UserRecord { id: string; name: string; email: string }
/**
 * 초대 폼 입력. 이름을 비울 수 있고 id 가 아직 없어 UserRecord 와 필드 조건이 다르다
 */
interface InviteDraft {
	/**
	 * 받는 사람 이메일
	 */
	email: UserRecord["email"];
	/**
	 * 표시 이름. 비우면 이메일을 그대로 보여 준다
	 */
	name?: UserRecord["name"];
}

/**
 * 초대 한 건을 보낸다
 */
export const sendInvite = (draft: InviteDraft): Promise<void> => { /* … */ };
```
