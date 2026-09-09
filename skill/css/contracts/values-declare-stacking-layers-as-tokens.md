# Declare Stacking Layers as Tokens in One Place

**Impact: MEDIUM (층 순서를 한 파일에서 확인하고 `z-index` 숫자를 임의로 늘리지 않습니다)**

층은 전역 토큰 파일에 한 번 선언하고 `z-index`에서는 토큰 이름만 씁니다.
`layout-keep-layout-intent-explicit`에 따라 숫자를 직접 쓰거나 사용처에서 층 사이 값을 만들지 않습니다.

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--app-z-index-base` | `0` | 일반 흐름 |
| `--app-z-index-sticky` | `100` | `sticky` 헤더, 툴바 |
| `--app-z-index-overlay` | `200` | 모달, 드로어, 백드롭 |
| `--app-z-index-popper` | `300` | 툴팁, 드롭다운, 알림 |

새 용도가 네 층에 모두 맞지 않을 때만 토큰 파일에 층을 추가하고 100 간격을 유지합니다.
**층 순서는 같은 쌓임 맥락 안에서만 성립합니다.**
조상의 맥락이 바깥 `sticky`보다 아래면 내부 `popper`의 숫자를 올려도 그 위로 나오지 못합니다.

| 새 쌓임 맥락을 만드는 대표 속성 | 조건 |
| --- | --- |
| `position` | `relative` 또는 `absolute`이면서 `z-index`가 `auto`가 아님 |
| `transform`, `filter`, `backdrop-filter` | `none`이 아님 |
| `will-change` | 쌓임 맥락을 만드는 속성을 지정함 |
| `opacity`, `isolation`, `contain` | `opacity`는 1 미만, `isolation`은 `isolate`, `contain`은 `layout`, `paint`, `content`, `strict` 중 하나 |

`fixed`와 `sticky`는 그 자체로 새 쌓임 맥락을 만듭니다.

요소가 가려졌으면 숫자를 올리기 전에 아래 순서로 확인합니다.

1. `z-index`가 적용되는지 봅니다. 일반 요소는 `static`이면 적용되지 않고 `relative`부터 적용됩니다.
2. `flex`와 `grid` 아이템인지 봅니다. `static`이어도 `auto`가 아닌 값이 적용되고 쌓임 맥락도 만듭니다.
3. 같은 층 안에서 순서가 충돌하면 층 분류를 다시 봅니다. 값을 `+1` 하지 않습니다.
4. 조상의 쌓임 맥락이나 잘림이 원인이면 해당 조상 밖의 포털 대상으로 옮깁니다.
5. 포털도 실제 부착 위치의 DOM 맥락을 따르므로 대상 위치를 확인합니다.
6. `showModal()`로 연 `dialog`나 열린 popover는 최상위 레이어입니다.
   일반 문서의 `z-index` 토큰으로 그 위에 올라가려 하지 않습니다.

**Incorrect 1 (숫자를 직접 쓰고 경쟁으로 올립니다):**

```css
/* src/page/products/pg-products.css */
.pg_products__toolbar {
	position: sticky;
	z-index: 10;
}

/* src/component/widget/product-filter/wg-product-filter.css */
.wg_productFilter__dropdown {
	position: absolute;
	z-index: 11;
}
```

**Correct 1 (층 토큰만 씁니다):**

```css
/* src/style/token.css */
:root {
	--app-z-index-base: 0;
	--app-z-index-sticky: 100;
	--app-z-index-overlay: 200;
	--app-z-index-popper: 300;
}

/* src/page/products/pg-products.css */
.pg_products__toolbar {
	/* 페이지 스크롤 컨테이너에 붙는다. 드롭다운이 이 쌓임 맥락을 벗어나야 하면 포털 대상을 밖에 둔다 */
	position: sticky;
	z-index: var(--app-z-index-sticky);
}

/* src/component/widget/product-filter/wg-product-filter.css */
.wg_productFilter__dropdown {
	position: absolute;
	z-index: var(--app-z-index-popper);
}
```

> 나머지 예시 · 예외는 [full rule](../rules/05-03-values-declare-stacking-layers-as-tokens.md)에 있습니다.
