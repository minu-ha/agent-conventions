---
title: Do Not Extract Section Components That Only Group Layout
titleKo: 레이아웃만 묶는 섹션 컴포넌트는 만들지 않습니다
impact: HIGH
impactDescription: 화면 흐름은 보이게 두고 자기 것을 직접 가진 부분만 떼어 냅니다
appliesWhen:
  - 화면 지역 섹션 컴포넌트를 새로 추출할 때
  - 기존 섹션이 비동기·상태·프로바이더·상호작용·라이브러리·성능을 직접 소유하는지 바꿀 때
tags: screen, routes
---

## Do Not Extract Section Components That Only Group Layout

**Impact: HIGH (화면 흐름은 보이게 두고 자기 것을 직접 가진 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 그 조각이 **직접 소유하는 것이 있을 때만** 추출합니다.
단순 레이아웃 래퍼, `className` 묶기, 들여쓰기 감소만으로는 추출하지 않습니다.

떼어 낼 수 있는 경우는 그 섹션이 다음 중 하나를 직접 가질 때입니다.

- 비동기: `Suspense`, 스켈레톤, 로딩, 오류, 비었을 때 상태
- 상태, 프로바이더: 지역 상태, 이펙트 동기화, 폼 프로바이더, 컨텍스트, 범위를 좁힌 스토어
- 상호작용: 팝오버, 모달, 선택, 인라인 편집, 드래그, 펼치는 트리
- 라이브러리, 성능: 촘촘한 위젯 어댑터, 가상 스크롤, 전환, 지연 값

검색 매개변수, 화면 이동, 화면 단위 쿼리/뮤테이션, 화면 전체 이펙트, 무효화,
여러 섹션에 걸친 파생값은 라우트 진입에 둡니다.

호출 계층은 폴더 깊이가 아니라 진입 파일의 조립이 드러냅니다.
"어느 컴포넌트가 이걸 쓰는지"를 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.
진입의 JSX와 가져오기 목록을 위에서 아래로 읽으면 답이 나와야 하고, 그러지 않으면 섹션을 과하게 쪼갠 것입니다.

**Incorrect (레이아웃 래퍼만 분리해 라우트 흐름을 숨김):**

```tsx
const PgProductSidebarPanel = () => {
	return (
		<section className={clsx("pg_products__sidebar")}>
			<SidebarStats />
			<SearchField />
			<ProductTree />
		</section>
	);
};

const PgProductDetailPanel = () => {
	return (
		<section className="product-layout__detail">
			<DetailHeader />
			<ProductTable />
		</section>
	);
};

export const PgProducts = () => {
	const responseProductTreeSuspense = useProductTreeSuspense();
	const responseProductListSuspense = useProductListSuspense();

	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductSidebarPanel />
			<PgProductDetailPanel />
		</div>
	);
};
```

**Correct (지역 상태와 상호작용을 직접 가진 섹션만 화면 지역 컴포넌트로 추출):**

```tsx
interface PgProductTreeSectionProps {
	categoryNodes: ProductCategoryNode[];
	selectedCategoryId?: string;
	onCategorySelect: (categoryId: string) => void;
}

const PgProductTreeSection = (props: PgProductTreeSectionProps) => {
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [treeSearchKeyword, setTreeSearchKeyword] = useState("");

	const filteredCategoryNodes = filterCategoryNodes(
		props.categoryNodes,
		treeSearchKeyword,
	);

	/**
	 * tree에서 선택한 category key를 route search용 categoryId로 변환
	 */
	const handleTreeSelect: UiTreeProps["onSelect"] = (keys, _info) => {
		const selectedKey = keys[0];
		if (typeof selectedKey !== "string" || !selectedKey.startsWith("category:")) {
			return;
		}

		props.onCategorySelect(selectedKey.replace("category:", ""));
	};

	return (
		<section className={clsx("pg_products__sidebar")}>
			<UiInput
				value={treeSearchKeyword}
				onChange={(event) => setTreeSearchKeyword(event.target.value)}
			/>

			{filteredCategoryNodes.length > 0 ? (
				<UiTree
					treeData={filteredCategoryNodes.map(toTreeData)}
					expandedKeys={expandedKeys}
					selectedKeys={props.selectedCategoryId ? [`category:${props.selectedCategoryId}`] : []}
					onExpand={(keys) => setExpandedKeys(keys.map(String))}
					onSelect={handleTreeSelect}
				/>
			) : (
				<UiEmpty description="검색 결과가 없습니다" />
			)}
		</section>
	);
};
```

**Correct (라우트 진입이 흐름 제어를 계속 소유):**

```tsx
export const PgProducts = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	/**
	 * tree sidebar 조회 API
	 */
	const responseProductTreeSuspense = useProductTreeSuspense({}, {
		query: {select: (response) => ({categoryNodes: response.data.nodes})},
	});

	/**
	 * product 목록 조회 API
	 */
	const responseProductListSuspense = useProductListSuspense({}, {
		query: {select: (response) => ({products: response.data.list})},
	});

	/**
	 * tree에서 선택한 category로 route search를 갱신
	 */
	const handleCategorySelect: PgProductTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/products",
			search: { page: search.page, size: search.size, categoryId },
		});
	};

	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductTreeSection
				categoryNodes={responseProductTreeSuspense.data.categoryNodes}
				selectedCategoryId={search.categoryId}
				onCategorySelect={handleCategorySelect}
			/>
			<PgProductTableSection
				products={responseProductListSuspense.data.products}
			/>
		</div>
	);
};
```
