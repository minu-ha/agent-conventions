# Use Direct Imports and Dedicated Public Entry Points

**Impact: MEDIUM-HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않고, 필요한 파일에서 바로 가져옵니다.
내보내기는 이름 붙인 내보내기만 씁니다.

| 형태 | 판정 |
| --- | --- |
| `index.ts`로 묶어 다시 내보내는 배럴 | 만들지 않습니다 |
| 역할 폴더를 `index.ts`로 묶는 것 | 배럴이라 만들지 않습니다 |
| 같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체 | 다시 내보내는 계층이 아니므로 배럴이 아닙니다 |
| `default` 내보내기 | 도구가 그 파일의 계약으로 요구할 때만 씁니다. `vite.config.ts` 같은 설정 진입점이 그 자리입니다 |
| 타입만 가져오기 | `import type`을 써서 계약과 실행 의존을 나눕니다 |

`default`는 이름을 사용처가 짓습니다.
같은 것이 파일마다 다른 이름으로 불리고, 이름 바꾸기도 사용처까지 번지지 않습니다.

경로 모양은 `naming-import-by-absolute-path` 규칙이 정합니다.
경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면 가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-naming-use-direct-imports-and-public-entry-points.md)을 읽습니다.
