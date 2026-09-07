# Place Owner-only Constants in the Owner `_constant` Folder

**Impact: MEDIUM-HIGH (소유자 전용 상수를 함께 관리하고 파일명과 이름에서 소유자 표현을 반복하지 않습니다)**

한 소유자의 상수는 그 소유자 아래 `_constant`에 둡니다.
루트와 소유자를 구분하는 기준은 `naming-place-project-constants-in-the-root-constant-folder`를 따릅니다.

| 대상 | 배치·이름 |
| --- | --- |
| 상수 | `_constant/<주제>.ts`에 `<주제>_` 접두사로 선언합니다 |
| 소유자 문맥 | 폴더가 말하므로 이름에 반복하지 않습니다. `page/detail/_constant/legend.ts`에는 `legend_hit_tolerance_px`를 둡니다 |
| 파서 묶음·스키마 등 함수를 담은 계약 | 같은 `_constant`에 계약별 파일로 둡니다. 이름은 계약 규칙과 `naming-use-consistent-file-and-symbol-naming`을 따릅니다 |
| 파일이 하나뿐인 경우 | `_constant` 폴더를 유지합니다 |
| 소유자를 지워도 남는 값 | 루트 상수 규칙에 따라 옮깁니다 |

소유자 아래에 `config`, `constants`, `common` 폴더는 만들지 않습니다.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-02-naming-place-owner-constants-in-the-owner-constant-folder.md)을 읽습니다.
