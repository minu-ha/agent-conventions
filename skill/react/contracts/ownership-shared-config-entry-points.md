# Route Shared Constants Through `shared/config.ts`

**Impact: HIGH (공용 상수가 route와 local component 곳곳에 흩어지는 것을 막음)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 `-local` 컴포넌트에 흩뿌리지 말고 기본적으로 `shared/config.ts` 한
파일에서 가져옵니다.
수가 많지 않을 때는 폴더로 쪼개기보다 `export const config = {}` 한 namespace를 유지하고,
사용처는 `config.*` 체이닝으로 접근해 출처를 보존합니다.
공용 순수 함수는 `config`에 섞지 말고 `shared/util.ts`의 `util.*` 아래로 분리합니다.
route나 feature 전용 support code는 `shared/util.ts`로 올리지 말고 sibling `page.ts`나 owner-named module에 둡니다.

> 예시·예외가 필요할 때만 [full rule](../rules/ownership-shared-config-entry-points.md)을 추가로 읽고 fallback 사유를 기록합니다.
