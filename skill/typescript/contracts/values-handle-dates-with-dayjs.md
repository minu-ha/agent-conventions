# Handle Dates With dayjs

**Impact: MEDIUM-HIGH (날짜의 단위와 타임존을 드러내고 파싱과 표시 형식을 일관되게 유지합니다)**

날짜는 `dayjs`로 다루고, `moment`는 새로 들이지 않습니다.
계산 단위, 입력 형식, 표시 타임존을 계약에 맞게 구분합니다.

| 작업 | 기준 |
| --- | --- |
| 파싱·유효성 검사 | `new Date(text)` 대신 `dayjs(text)`와 입력 형식에 맞는 검증을 사용합니다 |
| 경과 시간·달력 날짜 계산 | `add`, `subtract`의 단위를 구분합니다. 정확히 24시간과 현지 다음 날은 서머타임 경계에서 다를 수 있습니다 |
| 밀리초·월 계산 교체 | 밀리초 연산을 `add(..., "day")`로 일괄 치환하지 않습니다. 월 계산은 월말 처리 계약을 확인합니다 |
| 표시·비교 | 수동 문자열 조합·`toLocaleDateString` 대신 `format`, `getTime` 비교 대신 `isBefore`, `isAfter`, `isSame`을 씁니다 |

| 입력·표시 계약 | 처리 |
| --- | --- |
| 고정된 날짜 형식 | 파싱 후 같은 형식으로 되돌려 원문과 비교합니다. `2026-02-30`처럼 보정되는 날짜도 거릅니다 |
| 여러 입력 형식·엄격한 형식 검증 | `CustomParseFormat`을 초기화하고 `dayjs(value, input_format, true).isValid()`로 검사합니다 |
| 시각과 오프셋이 포함된 문자열 | 날짜만 되돌리는 비교를 적용하지 않습니다 |
| UTC·특정 지역 시간 | `utc`, `timezone` 플러그인을 초기화합니다. 기본 `dayjs(value)`는 실행 환경의 로컬 타임존을 사용합니다 |
| 타임존 기본값·날짜 계산 | `dayjs.tz.setDefault()`는 일반 `dayjs(value)`를 바꾸지 않습니다. 서머타임 전후 현지 시각과 오프셋을 실제로 확인합니다 |
| 서버가 표시 타임존·형식까지 확정한 문자열 | 그대로 표시할 때는 파싱하지 않습니다. 문자열 자르기가 표시 규칙이면 유지합니다 |
| UTC 시각을 사용자 타임존으로 표시 | 먼저 타임존을 변환합니다 |

형식 문자열은 상수로 선언하며 입력 형식과 화면 표시 형식은 별도 상수로 둡니다.
배치는 `naming-place-project-constants-in-the-root-constant-folder`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/04-07-values-handle-dates-with-dayjs.md)을 읽습니다.
