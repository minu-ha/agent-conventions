# Handle Dates With dayjs

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
이때 쓰는 형식은 입력이 들어온 형식이고, 화면 표시 형식과 같은 상수를 쓰지 않습니다.

**서버가 준 시각 문자열을 그대로 보여줄 때는 파싱하지 않습니다.**
파싱하면 타임존 변환이 붙어 표시 시각이 밀립니다.
문자열을 자르는 것이 표시 규칙이면 자르는 코드를 그대로 둡니다.

> 예시·예외가 필요하면 [full rule](../rules/04-07-values-handle-dates-with-dayjs.md)을 읽습니다.
