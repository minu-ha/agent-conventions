# Centralize Shared Config Under `shared/config.ts`

**Impact: MEDIUM-HIGH (공용 설정 값이 쓰는 파일마다 흩어져 공개 출처를 잃는 것을 막습니다)**

설정을 어디 두는지는 그 값이 누구 것인지로 갈립니다.

| 값 | 자리 | 이름 |
| --- | --- | --- |
| 프로젝트 전반의 값 | `shared/config.ts` | `config.*` |
| 한 소유자의 값 | `<owner>/config/<owner>-config.ts` | `<owner>_config` |

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 값도 사라지면 그 소유자 것입니다.
`chart_axis_tick_count`는 그 화면과 함께 사라지고, `billing_base_url`은 화면을 지워도 서버 주소로 남습니다.

**프로젝트 전반의 값은** `shared/config.ts` 한 파일을 공개 진입점으로 삼습니다.
`config` 네임스페이스 아래에 모아 `config.*` 체인으로 읽히게 하고,
쓰는 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 값이 자리를 옮겨 다닙니다.

최상위 네임스페이스가 다섯을 넘고 서로 참조하지 않을 때만 `config.ts` 하나를 폴더로 나눌지 검토합니다.
그 선에 닿기 전에는 미리 쪼개지 않습니다.

한 소유자의 설정을 두는 폴더 위치와 파일명은
`naming-place-owner-config-in-the-owner-config-folder` 규칙이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-01-naming-centralize-shared-config-namespaces.md)을 읽습니다.
