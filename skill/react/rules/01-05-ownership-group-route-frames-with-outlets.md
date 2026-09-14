---
title: Group Route Frames with Outlets
titleKo: 공통 라우트 프레임은 Outlet 그룹으로 묶습니다
impact: HIGH
impactDescription: 라우트 중첩을 폴더로 드러내면서 화면 아래 한 겹 소유 경계를 지킵니다
appliesWhen:
  - 라우트 트리나 Outlet 진입 파일을 추가, 변경할 때
  - '`page` 아래 라우트 그룹을 만들거나 화면을 그룹 사이로 옮길 때'
requiresSelected: ownership-place-owner-files-in-role-folders, ownership-keep-component-imports-flowing-downward
reviewWith: ownership-prefix-layer-names-on-files-and-symbols, runtime-place-error-boundaries-by-blast-radius
tags: ownership, routing
---

## Group Route Frames with Outlets

**Impact: HIGH (라우트 중첩을 폴더로 드러내면서 화면 아래 한 겹 소유 경계를 지킵니다)**

라우트의 중첩과 화면 안 컴포넌트의 중첩은 서로 다른 축입니다.
공통 외곽이 필요한 자리에만 Outlet 프레임을 두고, 폴더의 포함 관계를 라우트 선언과 맞춥니다.
파일 기반 라우터를 쓰는 프로젝트는 그 라우터가 강제하는 표기를 먼저 따릅니다.

### 진입 파일과 그룹

| 대상 | 배치와 책임 |
| --- | --- |
| 기본 프레임 | `page/pg-outlet.tsx`. 모든 화면의 공통 외곽과 `Outlet`을 소유합니다 |
| 경로 없는 그룹 | `page/(main)/pg-main-outlet.tsx`. 폴더의 `(이름)`과 진입 파일의 `pg-<이름>-outlet`을 맞춥니다 |
| 화면 | `page/(main)/products/pg-products.tsx`. 그룹이 아니라 화면 폴더가 소유자입니다 |
| 라우터 | URL과 진입 파일의 중첩 관계를 선언합니다 |

그룹은 `page` 바로 아래나 다른 그룹 아래에 두고, 그룹마다 자식 라우트를 감싸는 Outlet 진입 파일을 둡니다.
분류만 하는 그룹과 `Outlet`만 렌더하는 빈 프레임은 만들지 않습니다.
`(이름)` 폴더는 URL에 나타나지 않으며, 폴더를 만드는 것만으로 라우트가 생기지도 않습니다.
기본 프레임도 공통 외곽이 필요할 때만 만들고, `page` 전체를 한 번 더 감싸는 `(app)` 같은 그룹은 두지 않습니다.

### 깊이와 소유자 경계

화면 폴더부터는 하위 소유자 한 겹 제한이 그대로 적용되고, 그룹의 깊이는 여기에 더하지 않습니다.
화면이나 하위 소유자 아래에는 그룹을 만들지 않습니다.
더 깊은 URL이 필요해도 화면 폴더는 다른 화면과 형제로 두고 중첩은 라우터가 선언합니다.

기본 프레임, 그룹 프레임, 각 화면은 서로 다른 소유자입니다.
다른 프레임이나 화면의 `_` 부품과 역할 폴더는 같은 그룹 안에서도 가져오지 않습니다.
부품 프롭스의 `import type` 예외는 `ownership-keep-component-imports-flowing-downward`를 따릅니다.
프레임은 자식 화면을 직접 가져오지 않고 `Outlet`으로 받으며, 진입 파일을 가져오는 것은 라우터뿐입니다.
`children`을 받는 범용 셸은 라우트 프레임이 아니라 `widget`이므로 레이어 방향대로 가져옵니다.

모든 자식 화면에 적용하는 인증 가드는 기본 프레임이 직접 소유할 수 있습니다.
별도 실행 경계가 필요할 때만 자기 `_` 부품으로 분리합니다.
인증 확인이 끝나기 전에는 `Outlet` 아래를 렌더하지 않습니다.
화면마다 다른 접근 정책은 라우터가 연결하며, `page`는 라우터의 구현을 가져오지 않습니다.

같은 화면을 여러 URL에서 열면 라우터가 같은 진입 파일을 연결할 수 있습니다.
분석 모드와 복귀 목록 같은 차이는 params나 명시적인 진입 프롭으로 전달합니다.
URL마다 빈 화면 파일을 만들거나, 같은 본문을 쓴다는 이유만으로 Outlet 프레임이나 `widget`을 추가하지 않습니다.

### 프레임이 유지하는 것

자식 화면이 바뀌어도 남아야 하는 제목, 탭은 그 프레임이 소유하고, 화면마다 다른 데이터는 프레임에 모으지 않습니다.
프레임보다 위에서 URL 경로마다 `key`를 바꾸면 프레임까지 다시 마운트되므로 쓰지 않습니다.
오류와 로딩 경계의 자리는 `runtime-place-error-boundaries-by-blast-radius`와
`runtime-place-suspense-boundaries-at-the-section-owner`를 따릅니다.

**Incorrect 1 (화면 아래에 그룹을 만들어 소유자를 한 겹 더 쌓습니다):**

```txt
page/
├── pg-outlet.tsx
└── (main)/
    ├── pg-main-outlet.tsx
    ├── products/
    │   ├── pg-products.tsx
    │   ├── product-table-section/
    │   │   └── pg-product-table-section.tsx
    │   └── (detail)/
    │       ├── pg-detail-outlet.tsx
    │       └── product-detail/
    │           └── pg-product-detail.tsx
    └── orders/
        └── pg-orders.tsx
```

**Correct 1 (더 깊은 URL을 쓰는 화면도 그룹 밖 형제 소유자로 둡니다):**

```txt
page/
├── pg-outlet.tsx
├── (main)/
│   ├── pg-main-outlet.tsx
│   ├── products/
│   │   ├── pg-products.tsx
│   │   └── product-table-section/
│   │       └── pg-product-table-section.tsx
│   └── orders/
│       └── pg-orders.tsx
└── product-detail/
    └── pg-product-detail.tsx
```

**Correct (라우터가 프레임과 화면의 진입 파일을 중첩으로 잇습니다):**

```tsx
// route/app-routes.tsx
import {PgOutlet} from "@/page/pg-outlet";
import {PgMainOutlet} from "@/page/(main)/pg-main-outlet";
import {PgOrders} from "@/page/(main)/orders/pg-orders";
import {PgProducts} from "@/page/(main)/products/pg-products";
import {PgProductDetail} from "@/page/product-detail/pg-product-detail";

export const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<PgOutlet />}>
				<Route element={<PgMainOutlet />}>
					<Route path="products" element={<PgProducts />} />
					<Route path="orders" element={<PgOrders />} />
				</Route>
				<Route path="products/:productId" element={<PgProductDetail />} />
			</Route>
		</Routes>
	);
};
```
