---
title: Handle Dates With dayjs
titleKo: 날짜는 `dayjs`로 다룹니다
impact: MEDIUM-HIGH
impactDescription: 월말과 서머타임에서 어긋나는 날짜 산술을 없애고 표시 형식을 한 상수로 모읍니다
appliesWhen:
  - 날짜를 파싱하거나 형식을 맞추거나 더하고 뺄 때
  - `new Date`, `getTime()`, `setDate()`, `toLocaleDateString()`을 쓸 때
  - 제외: 서버가 준 시각 문자열을 파싱 없이 그대로 보여주는 경우
reviewWith: values-use-es-toolkit-for-value-helpers, naming-place-project-constants-in-the-root-constant-folder
tags: values, dayjs
---

## Handle Dates With dayjs

**Impact: MEDIUM-HIGH (월말과 서머타임에서 어긋나는 날짜 산술을 없애고 표시 형식을 한 상수로 모읍니다)**

날짜는 `dayjs`로 다룹니다.
`es-toolkit`이나 `clsx`와 같은 자리입니다.
쓸지 말지 고르는 라이브러리가 아니라 기본값입니다.
`moment`는 새로 들이지 않습니다.

밀리초를 더하는 산술은 월말과 서머타임에서 틀립니다.
`getTime() + 7 * 24 * 60 * 60 * 1000`은 하루가 23시간이거나 25시간인 날을 모릅니다.

| 손으로 쓰던 것 | `dayjs` |
| --- | --- |
| `new Date(text)` 파싱과 유효성 검사 | `dayjs(text)`와 라운드트립 비교 |
| `getTime()` 밀리초 더하기, `setDate()` | `add()`, `subtract()` |
| `toLocaleDateString()`, 자릿수 채워 이어 붙이기 | `format()` |
| `getTime()` 대소 비교 | `isBefore()`, `isAfter()`, `isSame()` |

**형식 문자열은 상수로 둡니다.**
`format("YYYY.MM.DD")`를 파일마다 적으면 화면끼리 표기가 갈립니다.
자리는 `naming-place-project-constants-in-the-root-constant-folder`가 정합니다.

**형식은 맞지만 없는 날짜는 라운드트립으로 거릅니다.**
`dayjs("2026-02-30")`은 실패하지 않고 3월 2일로 넘어갑니다.
되돌린 문자열이 원래 문자열과 같은지 보아야 걸립니다.

**서버가 준 시각 문자열을 그대로 보여줄 때는 파싱하지 않습니다.**
파싱하면 타임존 변환이 붙어 표시 시각이 밀립니다.
문자열을 자르는 것이 표시 규칙이면 자르는 코드를 그대로 둡니다.

**Incorrect (밀리초를 더하고 자릿수를 손으로 채움):**

```ts
const expiresAt = new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
const expiresLabel = `${expiresAt.getFullYear()}.${toPaddedDatePart(expiresAt.getMonth() + 1)}`;
```

**Incorrect (형식만 보고 없는 날짜를 통과시킴):**

```ts
const isValidDateText = /^\d{4}-\d{2}-\d{2}$/.test(dateText);
```

**Correct (날짜를 다루는 갈림길):**

```txt
날짜 문자열이 들어왔다
│
├ 서버가 준 시각을 그대로 보여주기만 함 ─→ 파싱하지 않는다. 문자열을 자른다
└ 계산하거나 형식을 바꿔야 함
   │
   ├ 형식만 바꿈 ──────→ dayjs(value).format(date_format)
   ├ 더하거나 뺌 ──────→ dayjs(value).add(7, "day")
   └ 값이 유효한지 봄 ─→ format 한 결과가 원래 문자열과 같은지 본다
```

**Correct (더하기와 형식은 `dayjs`, 형식 문자열은 상수):**

```ts
import dayjs from "dayjs";

import {date_format} from "@/constant/date";

const expiresAt = dayjs(issuedAt).add(7, "day");
const expiresLabel = expiresAt.format(date_format);
```

**Correct (라운드트립으로 없는 날짜를 거름):**

```ts
import dayjs from "dayjs";

import {date_format} from "@/constant/date";

/**
 * 형식은 맞지만 존재하지 않는 2026-02-30 같은 날짜를 거른다
 */
export const parseEntryDateText = (dateText: string): string | undefined => {
	return dayjs(dateText).format(date_format) === dateText ? dateText : undefined;
};
```

**Correct (서버 시각 문자열은 파싱하지 않고 자름):**

```ts
// 서버가 이미 표시 타임존으로 준 문자열이다. dayjs 로 파싱하면 변환이 붙어 시각이 밀린다
const compactDateTime = responseDateTime.slice(0, 16).replace("T", " ");
```
