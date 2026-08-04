# Expose Optional Values Instead of Silent Fallbacks

**Impact: HIGH (그 자리에서 지어낸 값으로 덮지 않아 빠진 데이터가 드러납니다)**

**`??`와 `||` 오른쪽에 리터럴을 적지 않고 이미 선언된 이름만 가리킵니다.**

| 형태 | 판정 |
| --- | --- |
| `?? "help@example.com"`, `?? 0`, `?? []`, `\|\| "-"` 같은 리터럴 | 위반 |
| `?? config.pagination.default_page_size`처럼 설정에 선언된 이름 | 통과 |
| 같은 파일 지역 `const`로 리터럴만 옮긴 것 | 위반. 자리만 바꾼 것입니다 |
| 기본 매개변수 `(size = 10) =>`, 구조분해 기본값 `{size = 10}` | 위반 |
| 삼항 `value ? value : "-"`, `String(value ?? "")` | 위반 |

기본값이 정말 필요하면 그 기본값에 이름을 붙여 선언하고 그 이름을 가리킵니다.
여러 소유자가 쓰면 `naming-centralize-shared-config-namespaces`,
한 소유자만 쓰면 `naming-place-owner-config-in-the-owner-config-folder`가 자리를 정합니다.
같은 파일 위쪽에 `const supportEmailFallback = "help@example.com";`을 두는 것으로는 통과하지 못합니다.
설정에 선언된 이름이어야 합니다.

이유 주석으로 이 규칙을 통과하지는 못합니다.
주석은 리터럴을 선언된 이름으로 바꾸지 않습니다.

빈 배열도 리터럴입니다.
`items ?? []` 대신 `items?.map(…)`으로 값이 없는 상태를 그대로 다룹니다.
선택 값을 그대로 비교하면 기본값이 아예 필요 없는 경우가 많습니다.

> 예시·예외가 필요하면 [full rule](../rules/04-01-absence-expose-optional-values-instead-of-silent-fallbacks.md)을 읽습니다.
