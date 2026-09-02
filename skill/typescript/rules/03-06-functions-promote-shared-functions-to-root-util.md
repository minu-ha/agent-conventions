---
title: Promote Owner-Free Functions to the Root util Folder
titleKo: 소유자를 지워도 남는 함수만 루트 `util`로 올립니다
impact: MEDIUM-HIGH
impactDescription: 루트 `util`에 한 소유자의 함수가 섞이지 않고 쓰는 곳 수에 따라 자리가 흔들리지 않습니다
appliesWhen:
  - 함수를 루트 `util` 폴더로 옮기거나 종류 폴더를 새로 만들 때
  - 두 소유자가 같은 함수를 쓰게 될 때
  - 제외: 소유자 안에서 파일 자리만 바꾸는 경우
tags: functions, boundaries
---

## Promote Owner-Free Functions to the Root util Folder

**Impact: MEDIUM-HIGH (루트 `util`에 한 소유자의 함수가 섞이지 않고 쓰는 곳 수에 따라 자리가 흔들리지 않습니다)**

승격은 쓰는 곳이 몇 개인지가 아니라 그 함수가 누구 것인지로 판정합니다.
가르는 법은 소유자를 지워 보는 것입니다.

- 소유자와 함께 사라지면 그 소유자 아래에 둡니다.
  profile 저장 화면이 없어지면 `toProfileSaveRequest`가 조립할 요청도 없습니다.
- 소유자를 지워도 남으면 지금 한 곳만 써도 올립니다.
  `toDisplayDate`는 소유자가 하나든 셋이든 `util/date/`에 둘 함수입니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 함수가 자리를 옮겨 다닙니다.

**루트 `util`은 프로젝트가 소유자인 함수 폴더입니다.**
파일 하나에 함수 하나, 전용 보조는 자기 이름 폴더라는 규칙은 소유자 아래와 같습니다.
다른 점은 폴더 한 겹입니다.
함수가 많아 종류 폴더로 묶습니다.

| 종류 폴더 | 기준 |
| --- | --- |
| `date`, `money`, `string`, `array`, `dom`, `url` | 함수가 **받는 값의 타입**입니다 |
| `spread` 같은 도메인 이름 | 도메인 타입도 값의 타입입니다. `Spread`를 받는 함수는 `util/spread/`입니다 |
| 화면이나 기능 이름 | 짓지 않습니다. 종류를 못 지으면 그 함수는 `util`이 아니라 소유자 함수입니다 |
| 소유자 아래 `_function` | 종류 폴더를 두지 않습니다. 함수가 몇 개라 파일 목록으로 충분합니다 |

**두 소유자가 같은 함수를 써야 하면 셋 중 하나로 해소합니다.**

1. 표시까지 같으면 `widget` 컴포넌트가 소유합니다.
2. 계산만 같으면 각 소유자가 각자 갖습니다.
3. 프로젝트 전반의 계산이면 루트 `util`로 올립니다.

1번은 함수를 공유하는 것이 아니라 표시를 공유하는 것입니다.
어느 레이어인지는 프레임워크 컨벤션의 레이어 규칙이 판정합니다.

**Incorrect (소유자와 함께 사라질 함수를 루트 `util`로 올립니다):**

```ts
// util/profile/to-profile-save-request.ts
// profile은 값의 종류가 아니라 화면 이름이다. 화면이 없어지면 이 요청도 없다
/**
 * 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (values: ProfileFormValues) => {
	return {body: {displayName: values.displayName.trim()}};
};
```

**Correct (소유자와 함께 사라질 함수는 그 소유자의 `_function` 폴더에 둡니다):**

```ts
// page/profile/_function/to-profile-save-request.ts
/**
 * 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (values: ProfileFormValues) => {
	return {body: {displayName: values.displayName.trim()}};
};
```

**Incorrect (소유자를 지워도 남을 함수를 쓰는 곳이 하나라고 소유자 아래 둡니다):**

```ts
// page/orders/_function/to-display-date.ts
// 날짜 표시는 orders 화면을 지워도 남는다. 지금 이 화면만 쓴다는 이유로 여기 있다
/**
 * 형식을 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
 */
export const toDisplayDate = (value: string): string => {
	return dayjs(value).format(date_format);
};
```

**Correct (승격 판정 흐름입니다):**

```txt
이 함수는 누구 것인가?
│
└ 소유자를 지워 본다
   │
   ├ 함수도 같이 사라짐 ──→ 그 소유자 아래에 둔다
   └ 함수는 그대로 남음 ──→ util/<받는 값의 종류>/ 로 올린다
      │
      └ 종류 이름을 못 짓겠음 → util 이 아니다. 소유자 아래로 되돌린다
```

**Correct (소유자를 지워도 남는 함수는 종류 폴더에 파일 하나로 올립니다):**

```txt
util/
├── date/
│   ├── to-display-date.ts
│   └── to-display-date.test.ts
└── money/
    └── to-signed-amount.ts
```

```ts
// util/date/to-display-date.ts
/**
 * 형식을 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
 */
export const toDisplayDate = (value: string): string => {
	return dayjs(value).format(date_format);
};
```

```ts
// util/money/to-signed-amount.ts
/**
 * 금액 표시는 화면마다 다르지 않다. 소수 두 자리와 부호를 고정한다
 */
export const toSignedAmount = (amount: Amount): string => {
	return `${amount.value < 0 ? "-" : "+"}$${Math.abs(amount.value).toFixed(2)}`;
};
```
