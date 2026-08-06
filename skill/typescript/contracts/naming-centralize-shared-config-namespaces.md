# Centralize Shared Config Under `shared/config.ts`

**Impact: MEDIUM-HIGH (공용 설정 값이 쓰는 파일마다 흩어져 공개 출처를 잃는 것을 막습니다)**

설정을 어디 두는지는 그 값을 쓰는 소유자가 몇인지로 갈립니다.

| 쓰는 소유자 | 자리 | 이름 |
| --- | --- | --- |
| 둘 이상 | `shared/config.ts` | `config.*` |
| 하나 | `<owner>/config/<owner>-config.ts` | `<owner>Config` |

**두 소유자 이상이 같은 값을 쓰면** `shared/config.ts` 한 파일을 공개 진입점으로 삼습니다.
`config` 네임스페이스 아래에 모아 `config.*` 체인으로 읽히게 하고,
쓰는 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
소유자 하나만 쓰는 값은 아직 여기 올리지 않습니다.

최상위 네임스페이스가 다섯을 넘고 서로 참조하지 않을 때만 `config.ts` 하나를 폴더로 나눌지 검토합니다.
그 선에 닿기 전에는 미리 쪼개지 않습니다.

소유자 하나만 쓰는 설정의 폴더 위치와 파일명은
`naming-place-owner-config-in-the-owner-config-folder` 규칙이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-01-naming-centralize-shared-config-namespaces.md)을 읽습니다.
