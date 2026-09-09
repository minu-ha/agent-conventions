# Use Direct Imports and Dedicated Public Entry Points

**Impact: MEDIUM (배럴이나 재노출 계층 없이 선언의 출처를 직접 확인할 수 있습니다)**

필요한 파일에서 직접 가져오고 선언 앞에 `export`를 붙여 이름으로 내보냅니다.
`index.ts` 배럴이나 파일 끝의 `export {…}` 목록은 만들지 않습니다.

| 형태 | 판정 |
| --- | --- |
| 역할 폴더나 여러 파일을 `index.ts`로 재노출 | 배럴이므로 만들지 않습니다 |
| 같은 파일이 소유한 `export const Dialog = { Root, Header } as const` | 재노출 계층이 아닌 조립 객체이므로 허용합니다 |
| `default` 내보내기 | `vite.config.ts`처럼 도구가 요구하는 계약에만 씁니다 |
| 타입만 가져오기 | `import type`으로 실행 의존과 구분합니다 |

`default`는 사용처마다 이름이 달라지고 원본의 이름 변경도 반영되지 않습니다.
경로 형식은 `naming-import-by-absolute-path`를 따릅니다.
같은 경로라도 값, 타입 가져오기를 바꾸면 이 규칙을 적용합니다.

**Incorrect 1 (배럴과 섞인 가져오기로 경계를 흐립니다):**

```ts
import {pagination_default_page_size, toDisplayDate, UserProfile} from "./index";
```

**Correct 1 (필요한 파일에서 이름으로 바로 가져옵니다):**

```ts
import type {UserProfile} from "@/type/user-profile";
import {pagination_default_page_size} from "@/constant/pagination";
import {toDisplayDate} from "@/util/date/to-display-date";
```

> 나머지 예시와 예외는 [full rule](../rules/02-04-naming-use-direct-imports-and-public-entry-points.md)에 있습니다.
