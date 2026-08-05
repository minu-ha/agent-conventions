# Place Owner-only Config in the Owner Config Folder

**Impact: MEDIUM-HIGH (한 소유자만 쓰는 설정이 전역 진입점을 넓히지 않습니다)**

소유자 하나만 쓰는 선언형 설정은 전역으로 올리지 않습니다.
그 소유자 아래 `config` 폴더에 둡니다.
전역과 소유자 중 어디에 두는지 가르는 표는 `naming-centralize-shared-config-namespaces` 규칙에 있습니다.

- 파일은 소유자 폴더 바로 아래 `config/<owner>-config.ts`, 내보내는 상수는 `<owner>Config`입니다.
- `constants` 폴더는 만들지 않습니다.
- 두 번째 소유자가 같은 값을 쓰게 되면 `naming-centralize-shared-config-namespaces` 규칙을 따라 올립니다.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-02-naming-place-owner-config-in-the-owner-config-folder.md)을 읽습니다.
