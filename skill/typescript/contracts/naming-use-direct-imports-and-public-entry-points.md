# Use Direct Imports and Dedicated Public Entry Points

**Impact: HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 import 소유를 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않습니다. 필요한 파일에서 바로 가져옵니다.
역할 폴더를 `index.ts`로 묶는 것도 배럴이라 만들지 않습니다.
같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체는
다시 내보내는 계층이 아니라 배럴이 아닙니다.
타입만 가져올 때는 `import type`을 써서 계약과 실행 의존을 나눕니다.

절대경로 별칭은 전역 레이어 루트만 가리킵니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget` | 허용 |
| `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면
import 계약이 바뀐 것이라 이 규칙을 적용합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-naming-use-direct-imports-and-public-entry-points.md)을 읽습니다.
