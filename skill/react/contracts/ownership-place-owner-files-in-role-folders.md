# Place Owner Files in Role Folders

**Impact: MEDIUM-HIGH (추출한 파일의 소유자와 역할을 경로에서 확인할 수 있습니다)**

추출한 파일은 소유자 폴더에 두고, 역할과 공개 범위에 맞춰 이름을 정합니다.
호출 계층은 폴더를 중첩하지 않고 진입 파일의 조립으로 드러냅니다.

| 구분 | 배치와 이름 |
| --- | --- |
| 소유자 | 자기만 쓰는 파일이 있는 컴포넌트는 자기 이름의 폴더를 갖습니다. 하위 컴포넌트 하나만 있어도 같고, 라우트는 항상 소유자입니다 |
| 진입 파일 | 레이어 접두사를 뺀 이름을 폴더와 맞춥니다. 한 폴더에 라우트가 여럿이면 첫 진입은 `pg-<folder>`, 나머지는 `pg-<folder>-<변형>`입니다 |
| 하위 컴포넌트 | 역할 폴더에 넣지 않고 소유자 폴더의 `_` 파일로 둡니다. 동반 `.css`도 같은 이름을 씁니다 |
| 하위 소유자 | 소유자 폴더 안에 한 겹만 둡니다. 역할 폴더 네 개를 제외한 폴더는 모두 하위 소유자이며, 더 깊어지면 형제로 올리거나 `widget`으로 분리할지 판단합니다 |
| 역할 폴더 | 필요한 것만 만들고 파일이 하나여도 유지합니다. 아래 네 종류만 허용합니다 |
| 함수의 보조 파일 | 전용 보조 파일이 있는 함수만 `_function` 아래 자기 이름 폴더를 갖습니다. 보조 파일은 `_`로 시작하며 그 안에 역할 폴더를 다시 만들지 않습니다 |

| 역할 폴더 | 담는 것 |
| --- | --- |
| `_constant` | 입력을 받지 않는 상수·기본값·기준값·파서 묶음 등 선언형 계약 |
| `_function` | 이름 붙여 내보낸 도메인 계산 |
| `_hook` | 실제 상태·이펙트·컨텍스트를 소유한 커스텀 훅 |
| `_type` | 여러 파일이 공유하는 계약. 개별 컴포넌트의 프롭스는 해당 TSX에 둡니다 |

소유자 폴더에서 `_`가 없는 이름은 진입 파일과 하위 소유자 폴더뿐입니다.
`_`는 둘에 해당하지 않는다는 표식이며, 정렬상 하위 소유자 폴더보다 앞에 놓입니다.
`_` 파일은 같은 폴더에서만 가져오고, 역할 폴더는 외부에서도 가져올 수 있는 공개 영역입니다.
가져오기 경계는 `ownership-keep-component-imports-flowing-downward`를 따릅니다.

폴더 이름은 단수로 쓰되 프레임워크가 강제하는 이름은 예외입니다.
소유자 아래에 `component`·`util`·`helper`·`config`·`constants`·`common`·`shared` 폴더를 만들지 않습니다.
루트의 `constant`·`type`·`hook`은 프로젝트가 소유하는 역할 폴더이므로 같은 규칙을 따르되 `_`를 붙이지 않습니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 보조 함수 추출과 배치 | `typescript/functions-extract-helpers-only-when-the-boundary-is-real`, `typescript/functions-give-each-function-its-own-file` |
| 파일명과 심볼의 접두사 | `ownership-prefix-layer-names-on-files-and-symbols` |
| 루트에만 두는 `util`과 `config` | `typescript/functions-promote-shared-functions-to-root-util`, `typescript/naming-read-environment-values-through-config-env` |

> 예시·예외가 필요하면 [full rule](../rules/01-03-ownership-place-owner-files-in-role-folders.md)을 읽습니다.
