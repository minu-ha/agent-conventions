# Separate Owner Style Scopes

**Impact: HIGH (화면 소유 스타일·공용 widget 스타일·primitive 스타일이 같은 namespace나 파일에 섞이는 것을 막습니다)**

scope prefix는 폴더 경로가 아니라 그 CSS 파일 소유자의 재사용 범위를 가리킵니다.

| prefix | owner |
| --- | --- |
| `pg_` | 한 화면 안에서만 쓰이는 shell과 component |
| `wg_` | 여러 화면이 재사용하는 widget과 그 part |
| `ui_` | primitive component와 그 part |

`pg_`는 화면 shell과 그 아래 component를 함께 덮습니다.
shell은 slug가 route 이름과 같아서 따로 표시하지 않아도 구분됩니다.

판정은 CSS 파일 소유로 갈립니다.

- 자기 CSS 파일을 가진 component는 자기 scope slug를 씁니다.
- 부모가 스타일을 소유하면 부모 CSS 파일과 부모 slug에 남깁니다.
- 별도 CSS 파일인데 부모 slug를 쓰고 있으면 ownership이 잘못 나뉜 상태입니다.
- 폴더가 아니라 가장 가까운 공개 패키지 경계로 판정합니다.
  widget 내부 part가 `component` 폴더에 있어도 `wg_`입니다.

서로 다른 owner 범위는 한 파일에 섞지 않습니다.
어떤 파일이 화면 소유인지 판단하는 책임은 활성화된 framework convention이 가집니다.

> 예시·예외가 필요하면 [full rule](../rules/01-05-naming-separate-owner-style-scopes.md)을 읽습니다.
