# Preserve Shared Namespace Origin With Chained Access

**Impact: HIGH (keeps readers aware of where values come from instead of hiding origin behind wide-scope aliases)**

공용 설정과 공용 순수 함수는 leaf 모듈 직접 import 뒤에 `config.*`, `util.*` 체이닝 접근을 기본으로 합니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 원본 오리진을 흐리지 말고,
필요한 구조분해는 함수 내부의 좁은 스코프에서만 제한적으로 사용합니다.
특히 `shared/config.ts`와 `shared/util.ts`는 발견성을 위해 namespace를 유지하고,
feature-local `helper.ts`나 `utils.ts` 대신 공용 경계에서만 `config`/`util` 이름을 사용합니다.

> 예시·예외가 필요하면 [full rule](../rules/naming-preserve-config-origin-with-chained-access.md)을 읽습니다.
