---
title: Extract Route-local Section Components Only for Runtime Boundaries
titleKo: 런타임 경계 기준의 route-local 섹션 추출
impact: HIGH
impactDescription: route entry 흐름은 보이게 두면서 실제 런타임 경계가 있는 subtree만 분리하게 합니다
appliesWhen:
  - route-local section component를 새로 추출할 때
  - 기존 section이 async·state·provider·interaction·library·performance 경계를 소유하는지 바꿀 때
tags: screen, routes, local-components, boundaries
---

## Extract Route-local Section Components Only for Runtime Boundaries

**Impact: HIGH (route entry 흐름은 보이게 두면서 실제 런타임 경계가 있는 subtree만 분리하게 합니다)**

route entry의 local component는 `runtime boundary`가 있을 때만 추출합니다.
단순 layout wrapper, className grouping, 들여쓰기 감소만으로는 추출하지 않습니다.

추출 가능한 boundary:

- async: `Suspense`, skeleton, loading, error, empty state
- state/provider: local state, effect sync, form provider, context, scoped store
- interaction: popover, modal, selection, inline edit, drag, expandable tree
- library/performance: dense widget adapter, virtualization, transition, deferred value

search param, navigation, page-level query/mutation, cross-section effect, invalidate, redirect,
여러 section에 걸친 파생값은 route entry에 둡니다.

호출 계층은 폴더 깊이가 아니라 entry 파일의 조립이 드러냅니다.
"어느 component가 이걸 쓰는지"를 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.
entry의 JSX와 import 목록을 위에서 아래로 읽으면 답이 나와야 하고, 그러지 않으면 section을 과하게 쪼갠 것입니다.

**Incorrect (layout wrapper만 분리해 route flow를 숨김):**

```tsx
const EntrySidebarPanel = () => {
	return (
		<section className="entry-layout__sidebar">
			<SidebarStats />
			<SearchField />
			<EntryTree />
		</section>
	);
};

const EntryDetailPanel = () => {
	return (
		<section className="entry-layout__detail">
			<DetailHeader />
			<EntryTable />
		</section>
	);
};

export const RouteComponent = () => {
	const responseEntryTreeSuspense = useEntryTreeSuspense();
	const responseEntryListSuspense = useEntryListSuspense();

	return (
		<div className="entry-layout">
			<EntrySidebarPanel />
			<EntryDetailPanel />
		</div>
	);
};
```

**Correct (runtime boundary를 소유하는 section만 route-local component로 추출):**

```tsx
interface EntryTreeSectionProps {
	categoryNodes: EntryCategoryNode[];
	selectedCategoryId?: string;
	onCategorySelect: (categoryId: string) => void;
}

const EntryTreeSection = (props: EntryTreeSectionProps) => {
	const { categoryNodes, selectedCategoryId, onCategorySelect } = props;
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [treeSearchKeyword, setTreeSearchKeyword] = useState("");

	const filteredCategoryNodes = getFilteredCategoryNodes(
		categoryNodes,
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

		onCategorySelect(selectedKey.replace("category:", ""));
	};

	return (
		<section className="entry-layout__sidebar">
			<UiInput
				value={treeSearchKeyword}
				onChange={(event) => setTreeSearchKeyword(event.target.value)}
			/>

			<Activity mode={filteredCategoryNodes.length > 0 ? "visible" : "hidden"}>
				<UiTree
					treeData={filteredCategoryNodes.map(mapEntryNodeToTreeData)}
					expandedKeys={expandedKeys}
					selectedKeys={selectedCategoryId ? [`category:${selectedCategoryId}`] : []}
					onExpand={(keys) => setExpandedKeys(keys.map(String))}
					onSelect={handleTreeSelect}
				/>
			</Activity>

			<Activity mode={filteredCategoryNodes.length > 0 ? "hidden" : "visible"}>
				<UiEmpty description="No matching results" />
			</Activity>
		</section>
	);
};
```

**Correct (route entry가 흐름 제어를 계속 소유):**

```tsx
export const RouteComponent = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	/**
	 * tree sidebar 조회 API
	 */
	const responseEntryTreeSuspense = useEntryTreeSuspense<EntryTreeSelectData>();

	/**
	 * entry 목록 조회 API
	 */
	const responseEntryListSuspense = useEntryListSuspense<EntryListSelectData>();

	/**
	 * tree에서 선택한 category로 route search를 갱신
	 */
	const handleCategorySelect: EntryTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/entries",
			search: { page: search.page, size: search.size, categoryId },
		});
	};

	return (
		<div className="entry-layout">
			<EntryTreeSection
				categoryNodes={responseEntryTreeSuspense.data.categoryNodes}
				selectedCategoryId={search.categoryId}
				onCategorySelect={handleCategorySelect}
			/>
			<EntryTableSection
				entries={responseEntryListSuspense.data?.entries}
			/>
		</div>
	);
};
```
