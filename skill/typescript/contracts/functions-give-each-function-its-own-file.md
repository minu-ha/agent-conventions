# Give Each Support Function Its Own File

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 내보낸 함수끼리 사슬을 이루지 않습니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 그 결과를 어느 파일에 둘지만 봅니다.
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
- 내보낸 대표 함수 하나당 파일 하나이고, 파일명은 그 함수 이름입니다.
- 호출 깊이는 파일마다 내보낸 함수 하나, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  단계가 더 필요하면 먼저 같은 파일의 비공개 함수로 둡니다.

**전용 보조가 파일로 나가면 대표 함수는 자기 이름 폴더를 갖습니다.**
나간 파일은 그 폴더 안에 둡니다.
루트 `util`도 같습니다.

**내보낸 함수가 내보낸 함수를 타고 가는 사슬은 자기 폴더 밖에서 만들지 않습니다.**

| 가져오기 | 판정 |
| --- | --- |
| 대표 함수가 자기 폴더 안 파일을 부름 | 사슬이 아니라 그 함수의 내부입니다. 자기 폴더 안 파일을 가져오는 것은 그 대표 함수뿐입니다 |
| 다른 파일도 그 폴더 안 파일을 부르게 됨 | 재사용이 생긴 것이니 `_function` 바로 아래로 꺼냅니다 |
| 루트 `util` 함수가 다른 루트 `util` 함수를 가져옴 | 사슬이 아닙니다. 둘 다 공개 진입점이고, 가져오는 줄에서 어느 종류 폴더의 무엇인지 그대로 읽힙니다 |

**Requires selected:** `functions-extract-helpers-only-when-the-boundary-is-real` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/03-04-functions-give-each-function-its-own-file.md)을 읽습니다.
