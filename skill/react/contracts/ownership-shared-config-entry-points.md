# Route Shared Constants Through `shared/config.ts`

**Impact: HIGH (공용 상수가 라우트와 지역 컴포넌트 곳곳으로 흩어지지 않습니다)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 비공개 컴포넌트에 흩뿌리지 않습니다.
기본 출처는 `shared/config.ts` 한 파일입니다.

| 대상 | 위치 |
| --- | --- |
| 공용 상수·설정 | `shared/config.ts` 의 `config.*` |
| 공용 순수 함수 | `shared/util.ts` 의 `util.*` |
| 소유자 전용 선언형 설정 | 소유자 아래 `config` 폴더의 `<owner>_config` |

수가 많지 않으면 폴더 단위로 나누지 말고 `export const config = {}` 한 네임스페이스를 유지합니다.
사용처는 `config.*` 체이닝으로 접근해 출처를 보존합니다.
`constants` 폴더는 만들지 않습니다. 입력을 받지 않는 선언형 값은 `config`가, 그 밖은 사용 지점이 소유합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-ownership-shared-config-entry-points.md)을 읽습니다.
