# Route Shared Constants Through `shared/config.ts`

**Impact: HIGH (공용 상수가 route와 local component 곳곳에 흩어지는 것을 막음)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 `-local` 컴포넌트에 흩뿌리지 않습니다.
기본 출처는 `shared/config.ts` 한 파일입니다.

| 대상 | 위치 |
| --- | --- |
| 공용 상수·설정 | `shared/config.ts` 의 `config.*` |
| 공용 순수 함수 | `shared/util.ts` 의 `util.*` |
| route·feature 전용 support code | sibling `page.ts` 또는 owner-named module |

수가 많지 않으면 폴더로 쪼개지 말고 `export const config = {}` 한 namespace를 유지합니다.
사용처는 `config.*` 체이닝으로 접근해 출처를 보존합니다.

> 예시·예외가 필요하면 [full rule](../rules/ownership-shared-config-entry-points.md)을 읽습니다.
