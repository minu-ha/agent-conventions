# Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (barrel이나 모호한 재노출 계층에 기대지 않고 import 소유를 명시적으로 드러냅니다)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다.
공용 설정과 공용 순수 함수는 각각 `shared/config.ts`, `shared/util.ts` 같은 공개 진입점으로 모으고,
타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.
feature 전용 support code는 owner-named module처럼 소유자가 보이는 파일에서 named export를 직접 import합니다.

같은 module path를 계속 사용하더라도 import specifier의 value/type 구성이 추가·삭제·전환되면
import 계약 변경이므로 Selected입니다.
예를 들어 React value import에서 `useEffect`를 제거하거나 같은 `react` 경로에 handler type import를 추가하는 작업을
"module path가 같다"는 이유로 N/A 처리하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-naming-use-direct-imports-and-public-entry-points.md)을 읽습니다.
