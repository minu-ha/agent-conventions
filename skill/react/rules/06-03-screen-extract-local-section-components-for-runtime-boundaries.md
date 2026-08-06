---
title: Extract Local Section Components Only for Runtime Boundaries
titleKo: 런타임 경계가 있는 섹션만 화면 지역 컴포넌트로 뺍니다
impact: MEDIUM-HIGH
impactDescription: 화면 흐름은 보이게 두고 자기 것을 직접 가진 부분만 떼어 냅니다
appliesWhen:
  - 화면 지역 섹션 컴포넌트를 새로 추출할 때
  - 기존 섹션에 비동기, 지역 상태, 프로바이더, 상호작용, 외부 위젯, 성능 처리를 넣거나 뺄 때
tags: screen, routes
---

## Extract Local Section Components Only for Runtime Boundaries

**Impact: MEDIUM-HIGH (화면 흐름은 보이게 두고 자기 것을 직접 가진 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 그 조각이 **직접 소유하는 것이 있을 때만** 추출합니다.
감싸기만 하는 래퍼, `className` 묶기, 들여쓰기 감소만으로는 추출하지 않습니다.

떼어 낼 수 있는 경우는 그 섹션이 다음 중 하나를 직접 가질 때입니다.

- 비동기: `Suspense`, 스켈레톤, 로딩, 오류, 비었을 때 상태
- 상태, 프로바이더: 지역 상태, 이펙트 동기화, 폼 프로바이더, 컨텍스트, 범위를 좁힌 스토어
- 상호작용: 팝오버, 모달, 선택, 인라인 편집, 드래그, 펼치는 트리
- 라이브러리, 성능: 외부 위젯의 생명주기를 소유하는 어댑터, 가상 스크롤, 전환, 지연 값

흐름 제어는 섹션이 아니라 라우트 진입에 둡니다.
그 목록은 `screen-keep-route-flow-visible`이 정합니다.

지역 섹션 파일을 어느 폴더에 두는지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
진입 파일의 JSX에 나타나지 않는 섹션이 다른 섹션 파일 안에서 렌더되면 과하게 쪼갠 것입니다.

**Incorrect (레이아웃 래퍼가 화면 단위 쿼리까지 삼켜 라우트 흐름이 안 보임):**

```tsx
const PgProductSidebarPanel = () => {
	const responseProductTreeSuspense = useProductTreeSuspense();

	return (
		<section className={clsx("pg_products__sidebar")}>
			<UiTree treeData={responseProductTreeSuspense.data.nodes} />
		</section>
	);
};

const PgProductDetailPanel = () => {
	const responseProductListSuspense = useProductListSuspense();

	return (
		<section className={clsx("pg_products__detail")}>
			<UiTable dataSource={responseProductListSuspense.data.list} />
		</section>
	);
};

export const PgProducts = () => {
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
	 * 검색어는 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTreeSearchKeywordChange: UiInputProps["onChange"] = (event) => {
		setTreeSearchKeyword(event.target.value);
	};

	/**
	 * UiTree가 넘기는 key 타입이 넓어서 문자열로 좁혀 담는다
	 */
	const handleTreeExpand: UiTreeProps["onExpand"] = (keys) => {
		setExpandedKeys(keys.map(String));
	};

	/**
	 * tree가 넘긴 key에서 접두사를 떼어 route search가 받는 categoryId로 만든다
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
			<UiInput value={treeSearchKeyword} onChange={handleTreeSearchKeywordChange} />

			{filteredCategoryNodes.length > 0 ? (
				<UiTree
					treeData={filteredCategoryNodes.map(toTreeData)}
					expandedKeys={expandedKeys}
					selectedKeys={props.selectedCategoryId ? [`category:${props.selectedCategoryId}`] : []}
					onExpand={handleTreeExpand}
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
	 * 사이드바가 그릴 분류 노드만 남긴다. 트리 펼침 상태는 섹션이 따로 들고 있다
	 */
	const responseProductTreeSuspense = useProductTreeSuspense(
		{},
		{query: {select: (response) => ({categoryNodes: response.data.nodes})}},
	);

	/**
	 * 표가 쓰는 필드 이름으로 목록을 바꿔서 표가 응답 구조를 모르게 한다
	 */
	const responseProductListSuspense = useProductListSuspense(
		{},
		{query: {select: (response) => ({products: response.data.list})}},
	);

	/**
	 * 고른 분류를 route search에 적어 두어 새로 고침해도 같은 화면이 열리게 한다
	 */
	const handleCategorySelect: PgProductTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/products",
			search: {page: search.page, size: search.size, categoryId},
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
