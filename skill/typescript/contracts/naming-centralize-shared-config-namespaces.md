# Centralize Shared Config Under `shared/config.ts`

**Impact: HIGH (공용 설정 값이 말단 파일로 흩어져 공개 출처를 잃는 것을 막습니다)**

**두 소유자 이상이 같은 값을 쓰면** `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` 네임스페이스 아래에 모읍니다.
소유자 하나만 쓰는 값은 아직 여기 올리지 않습니다.
말단 파일마다 공용 URL, 기능 플래그, 페이지 크기, 상수 문자열을 흩뿌리지 않습니다.
`config.*` 체인으로 읽히게 정리합니다.

수가 많지 않으면 폴더로 미리 쪼개지 않고 `config.ts` 하나로 둡니다.
서로 독립된 여러 묶음으로 커졌을 때만 나눌지 검토합니다.

소유자 하나만 쓰는 선언형 설정을 어디 둘지는
`naming-place-owner-config-in-the-owner-config-folder`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-01-naming-centralize-shared-config-namespaces.md)을 읽습니다.
