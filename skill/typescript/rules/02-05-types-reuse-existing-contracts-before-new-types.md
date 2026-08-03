---
title: Reuse Existing Contracts Before Declaring New Types
titleKo: 새 타입을 선언하기 전에 기존 계약을 먼저 씁니다
impact: HIGH
impactDescription: 의미가 그대로면 기존 타입이나 스키마에서 파생해 같은 형태를 두 번 선언하지 않습니다
appliesWhen:
  - 뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때
  - 같은 형태를 두 번 선언했다가 넣거나 뺄 때
  - 제외: 맞는 후보가 없는 새 형태, 소유자만 옮긴 경우, 그대로인 계약을 새 자리에서 쓰는 경우
reviewWith: types-document-custom-types-and-shapes
tags: type-reuse, pick, omit
---

## Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (의미가 그대로면 기존 타입이나 스키마에서 파생해 같은 형태를 두 번 선언하지 않습니다)**

기존 타입이나 스키마와 필드 타입, 선택 여부, 뜻이 같으면 그대로 참조하거나 `Pick`, `Omit`, Indexed Access로 파생합니다.
새로 선언하는 것은 뜻이 다를 때만입니다. 소유자 이동이나 이름, 주석만 바뀌면 대상이 아닙니다.

형태가 그대로인 계약을 새 자리에서 쓰는 것만으로는 이 규칙이 걸리지 않습니다.
호출 계약 역할은 `types-document-custom-types-and-shapes`가 따로 판정합니다.

위치 인자를 객체 입력으로 바꾸면서 고칠 수 있는 우리 형태를 다시 쓰면
`types-document-custom-types-and-shapes`만 걸리고 이 규칙은 걸리지 않습니다.
외부·생성된·읽기 전용·공용 형태를 그대로 쓰면 두 타입 규칙 모두 대상이 아니고, 문서화는 문서 규칙이 따로 판정합니다.
요청에 없는 `*Params`나 `*Input`을 만들어 이 규칙을 스스로 켜지 않습니다.
맞는 형태가 없는 새 도메인 계약은 문서화 규칙만 걸립니다.

원본 입력과 정규화한 값은 필드가 같아도 뜻이 달라 입력 형태를 따로 두는 것이 맞습니다.
그때도 문서화 규칙만 걸리고 이 규칙은 걸리지 않습니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
interface UserPreview {
	id: string;
	name: string;
}
```

**Correct (기존 계약에서 필요한 부분만 파생):**

```ts
/**
 * 사용자 미리보기 계약
 */
type UserPreview = Pick<UserRecord, "id" | "name">;
```
