# Keep Layout Intent Explicit

**Impact: MEDIUM (조상 DOM을 찾아보지 않고 `sticky`, `fixed`의 기준과 각 요소의 배치 역할을 파악합니다)**

레이아웃의 기준과 역할은 클래스명과 선언에서 드러나야 합니다.
크기 고정 여부는 `layout-reach-for-intrinsic-sizing-before-breakpoints` 규칙을 따릅니다.

| 선언이나 요소 | 요구 사항 | 이유 |
| --- | --- | --- |
| `z-index` | 숫자 대신 층 토큰을 씁니다. 목록과 쌓임 맥락은 `values-declare-stacking-layers-as-tokens`를 따릅니다 | 토큰 이름으로 쌓임 순서를 읽습니다 |
| `sticky`, `fixed` | 기준 컨테이너를 주석 한 줄로 남깁니다 | 조상 조건은 해당 선언만으로 알 수 없습니다 |
| 로딩 대체 화면 | 실제 내용과 같은 컨테이너 클래스 안에 넣습니다 | 대체 화면에만 높이를 주면 교체 시 그 높이가 사라져 레이아웃이 튈 수 있습니다 |

`fixed`는 `transform`이 적용된 조상 아래에서 뷰포트 기준을 잃습니다.
`sticky`는 중간 조상에 `overflow: hidden`이나 `auto`가 있으면 그 조상이 기준이 되어 뷰포트에 붙지 않습니다.

**Incorrect (층 숫자를 직접 적고 기준 컨테이너 설명이 없습니다):**

```css
.pg_dashboard__toolbar {
	position: sticky;
	top: 0;
	z-index: 9999;
}
```

**Correct (기준 컨테이너와 의도를 드러냅니다):**

```css
.pg_dashboard__toolbar {
	/* .pg_dashboard__content가 스크롤 컨테이너다 */
	position: sticky;
	top: 0;
	z-index: var(--app-z-index-sticky);
}

.pg_dashboard__content {
	display: grid;
	min-height: 0;
	overflow-y: auto;
}
```

> 나머지 예시·예외는 [full rule](../rules/06-03-layout-keep-layout-intent-explicit.md)에 있습니다.
