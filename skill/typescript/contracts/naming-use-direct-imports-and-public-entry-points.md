# Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (barrel이나 모호한 재노출 계층에 기대지 않고 import 소유를 명시적으로 드러냅니다)**

`index.ts` 기반 barrel export를 만들지 않고 직접 export/import 구조를 유지합니다.
role 폴더를 `index.ts`로 묶는 것도 barrel이므로 만들지 않습니다.
타입 전용 import는 `import type`을 사용해 계약과 런타임 의존을 분리합니다.

절대경로 alias는 전역 레이어 루트만 가리킵니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget` | 허용 |
| `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

화면이나 owner 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
owner 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

같은 module path를 계속 사용하더라도 import specifier의 value/type 구성이 추가·삭제·전환되면
import 계약 변경이므로 Selected입니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-naming-use-direct-imports-and-public-entry-points.md)을 읽습니다.
