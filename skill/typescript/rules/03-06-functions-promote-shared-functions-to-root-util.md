---
title: Promote Owner-Free Functions to the Root util Folder
titleKo: 소유자를 지워도 남는 함수만 루트 `util`로 올립니다
impact: HIGH
impactDescription: 소유자 전용 함수를 구분하고 사용처 수가 달라져도 배치 기준을 유지합니다
appliesWhen:
  - 함수를 루트 `util` 폴더로 옮기거나 종류 폴더를 새로 만들 때
  - 두 소유자가 같은 함수를 쓰게 될 때
  - 제외: 소유자 안에서 파일 자리만 바꾸는 경우
tags: functions, boundaries
---

## Promote Owner-Free Functions to the Root util Folder

**Impact: HIGH (소유자 전용 함수를 구분하고 사용처 수가 달라져도 배치 기준을 유지합니다)**

루트 `util` 승격은 사용처 수가 아니라 소유자를 지워도 계산이 남는지로 판단합니다.
사용처가 늘거나 줄어도 이 기준은 바뀌지 않습니다.

| 소유자를 지운 결과 | 배치 |
| --- | --- |
| 함수도 사라짐 | 해당 소유자의 `_function`에 둡니다. `toProfileSaveRequest`가 그 예입니다 |
| 함수가 남음 | 한 곳에서만 써도 `util/<받는 값의 종류>/`에 둡니다. `toDisplayDate`가 그 예입니다 |
| 값의 종류로 폴더명을 지을 수 없음 | 루트로 올리지 않고 소유자 아래에 둡니다 |

| 폴더 | 기준 |
| --- | --- |
| `date`, `money`, `string`, `array`, `dom`, `url` | 함수가 받는 값의 타입입니다 |
| `spread` 등 도메인 이름 | `Spread`처럼 실제 입력 타입이면 허용합니다. 화면·기능 이름은 쓰지 않습니다 |
| 소유자 아래 `_function` | 종류 폴더 없이 함수 파일을 나열합니다 |

루트의 소유자는 프로젝트입니다.
함수마다 파일 하나, 자기만 쓰는 보조는 자기 이름 폴더의 `_` 파일이라는 규칙은 소유자 아래와 같습니다.

| 두 소유자가 공유하는 것 | 처리 |
| --- | --- |
| 표시까지 같음 | 프레임워크의 레이어 규칙에 따라 `widget`이 소유합니다 |
| 계산만 같음 | 각 소유자가 각각 갖습니다 |
| 프로젝트 전반의 계산임 | 루트 `util`로 올립니다 |

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
