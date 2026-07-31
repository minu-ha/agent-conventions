# Route Shared Constants Through `shared/config.ts`

**Impact: HIGH (공용 상수가 route와 local component 곳곳에 흩어지는 것을 막습니다)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 private 컴포넌트에 흩뿌리지 않습니다.
기본 출처는 `shared/config.ts` 한 파일입니다.

| 대상 | 위치 |
| --- | --- |
| 공용 상수·설정 | `shared/config.ts` 의 `config.*` |
| 공용 순수 함수 | `shared/util.ts` 의 `util.*` |
| owner 전용 선언형 설정 | owner 아래 `config` 폴더의 `<owner>_config` |

수가 많지 않으면 폴더 단위로 나누지 말고 `export const config = {}` 한 namespace를 유지합니다.
사용처는 `config.*` 체이닝으로 접근해 출처를 보존합니다.
`constants` 폴더는 만들지 않습니다. 입력을 받지 않는 선언형 값은 `config`가, 그 밖은 사용 지점이 소유합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-05-ownership-shared-config-entry-points.md)을 읽습니다.
