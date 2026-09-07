# Use Scope, Slug, Element, and Modifier Syntax

**Impact: MEDIUM (클래스명에서 소유자와 역할을 확인할 수 있습니다)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 씁니다.
구분자 `_`, `__`, `--`를 고정하고 각 자리의 역할을 구분합니다.
다른 규칙에서도 아래 한국어 이름을 씁니다.

| 자리 | 읽는 이름 | 담는 것 |
| --- | --- | --- |
| `scope` | 범위 | `pg`, `wg`, `ui` 중 하나. 소문자로 씁니다 |
| `slug` | 식별자 | CSS 파일 소유자의 이름. camelCase로 씁니다 |
| `element` | 요소 | 소유자 안의 UI 역할. `listButton`, `emptyState`처럼 camelCase로 씁니다 |
| `modifier` | 수정자 | 클래스 뒤에 `--`로 붙는 이름. camelCase로 쓰며 허용 범위는 `composition-do-not-build-structural-variants-with-modifiers`가 정합니다 |

수정자는 클래스의 `--이름`이고, 변형은 컴포넌트가 받는 `variant` 프롭입니다.
식별자에는 접두사가 이미 드러낸 낱말을 반복하지 않습니다.
`UiButton`은 `ui_button`으로 쓰고 `ui_uiButton`으로 쓰지 않습니다.
기계 검증은 이 문법을 정규식으로 등록한 `selector-class-pattern`이 담당합니다.

**Incorrect (식별자, 요소, 수정자에 snake_case와 kebab-case가 섞입니다):**

```txt
ui_uiButton__root
ui_tag_list__root
ui_tagList__list-item
wg_site_header__root
wg_siteHeader__brand-link
pg_catalog_detail__root
pg_catalogDetail__main-content
pg_catalogDetail__main--route_active
```

**Correct (범위는 소문자로 쓰고 식별자, 요소, 수정자는 camelCase로 씁니다):**

```txt
ui_tagList__root
ui_tagList__listItem
wg_siteHeader__root
wg_siteHeader__brandLink
pg_catalogDetail__root
pg_catalogDetail__mainContent
pg_catalogDetail__main--routeActive
```

> 나머지 예시·예외는 [full rule](../rules/01-02-naming-use-scope-slug-element-modifier-syntax.md)에 있습니다.
