# Centralize Shared Config Under `shared/config.ts`

**Impact: HIGH (공용 설정 값이 leaf 파일로 흩어져 공개 출처 하나를 잃는 것을 막음)**

여러 파일에서 공유되는 설정과 상수는 기본적으로 `shared/config.ts` 한 파일을 공개 진입점으로 삼아 `config` namespace
아래에 모읍니다.
leaf 파일마다 공용 URL, feature flag, 페이지 크기, 상수 문자열을 흩뿌리지 말고,
`config.*` 체이닝으로 읽을 수 있게 정리합니다.
수가 많지 않을 때는 `config/` 폴더로 미리 쪼개지 말고 단일 `config.ts`를 유지하고,
여러 독립 섹션으로 커졌을 때만 분리를 검토합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-01-naming-centralize-shared-config-namespaces.md)을 읽습니다.
