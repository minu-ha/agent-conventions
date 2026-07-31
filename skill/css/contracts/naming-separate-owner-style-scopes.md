# Separate Owner Style Scopes

**Impact: HIGH (route shell·private component·공용 widget·primitive 스타일이 같은 namespace나 파일에 섞이는 것을 막습니다)**

scope prefix는 폴더 경로가 아니라 그 CSS 파일의 소유자를 가리킵니다.

| prefix | owner |
| --- | --- |
| `rt_` | route entry와 page shell |
| `pv_` | 한 owner 안에서만 쓰이는 private component |
| `wg_` | 여러 화면이 재사용하는 widget |
| `ui_` | primitive component |

판정은 CSS 파일 소유로 갈립니다.

- 자기 CSS 파일을 가진 component는 자기 scope slug를 씁니다.
- 부모가 스타일을 소유하면 부모 CSS 파일과 부모 slug에 남깁니다.
- 별도 CSS 파일인데 부모 slug를 쓰고 있으면 ownership이 잘못 나뉜 상태입니다.

서로 다른 owner 범위는 한 파일에 섞지 않습니다.
어떤 component가 route shell이고 어떤 것이 private인지 판단하는 책임은 활성화된 framework convention이 가집니다.

> 예시·예외가 필요하면 [full rule](../rules/01-05-naming-separate-owner-style-scopes.md)을 읽습니다.
