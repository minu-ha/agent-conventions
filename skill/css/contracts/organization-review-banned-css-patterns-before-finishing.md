# Review Banned CSS Patterns Before Finishing

**Impact: MEDIUM (선택되지 않은 규칙의 위반이 그대로 병합되는 것을 완료 직전에 잡습니다)**

이 규칙은 새 기준을 만들지 않습니다. 판정을 놓친 규칙도 마무리에서 한 번 걸리게 하는 색인이고,
각 항목의 정본은 소관 규칙입니다.

| 확인할 것 | 소관 규칙 |
| --- | --- |
| 요소 선택자 중심 스타일링 | `selector-limit-nesting-block-depth` |
| 결합자 상한 초과 | `selector-avoid-deep-descendant-dependencies` |
| root 없는 library class targeting | `selector-target-third-party-dom-from-owned-roots` |
| top-level pseudo selector 재오픈 | `selector-use-pseudo-classes-for-dom-owned-states` |
| 재사용 근거 없는 structural modifier | `composition-do-not-build-structural-variants-with-modifiers` |
| base와 state를 이름 하나에 융합 | `composition-keep-classes-single-purpose` |
| core token에 붙은 fallback, 지역 토큰 발명 | `values-always-provide-css-variable-fallbacks` |
| owner가 섞인 stylesheet | `organization-keep-style-files-owned-by-one-component-or-route` |

`!important`만 여기서 직접 금지합니다. third-party가 inline style로 덮는 경우에만 근거 주석과 함께 남깁니다.

**Required on completion:** 마무리 시 항상 적용

> 예시·예외가 필요하면 [full rule](../rules/05-02-organization-review-banned-css-patterns-before-finishing.md)을 읽습니다.
