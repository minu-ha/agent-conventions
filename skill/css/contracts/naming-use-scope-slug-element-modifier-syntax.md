# Use Scope, Slug, Element, and Modifier Syntax

**Impact: MEDIUM-HIGH (클래스명만 보고 누가 소유하고 어떤 역할인지 읽힙니다)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 씁니다.
구분자 `_`, `__`, `--`를 고정하고 각 자리의 책임을 섞지 않습니다.

네 자리를 아래처럼 읽습니다.
다른 규칙 본문에서도 이 한국어 이름으로 부릅니다.

| 자리 | 읽는 이름 | 담는 것 |
| --- | --- | --- |
| `scope` | 범위 | `pg`, `wg`, `ui` 중 하나. 소문자로 씁니다 |
| `slug` | 식별자 | 그 CSS 파일 소유자의 이름. camelCase |
| `element` | 요소 | 소유자 안의 UI 역할. `listButton`, `emptyState` |
| `modifier` | 수정자 | 상태나 반복되는 모양. `routeActive`, `selected` |

수정자와 변형은 다릅니다.
수정자는 클래스 뒤에 붙는 `--이름`이고, 변형은 컴포넌트가 받는 `variant` 프롭입니다.

식별자에는 접두사가 이미 드러낸 낱말을 반복하지 않습니다.
`UiButton`은 `ui_button`이고 `ui_uiButton`이 아닙니다.

`selector-class-pattern`에 이 문법을 정규식으로 넣으면 기계가 검사합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-02-naming-use-scope-slug-element-modifier-syntax.md)을 읽습니다.
