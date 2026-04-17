---
title: Extract Route-local Section Components Only for Runtime Boundaries
impact: HIGH
impactDescription: route entry의 orchestration은 보이게 유지하면서도 async, state, interaction처럼 실제 경계가 있는 subtree는 안전하게 분리할 수 있게 함
tags: screen, routes, local-components, boundaries
---

## Extract Route-local Section Components Only for Runtime Boundaries

**Impact: HIGH (route entry의 orchestration은 보이게 유지하면서도 async, state, interaction처럼 실제 경계가 있는 subtree는 안전하게 분리할 수 있게 함)**

route entry에서 local component 추출 여부는 "한 구역처럼 보이느냐"가 아니라 `runtime boundary`를 소유하느냐로 판단합니다.  
단순 layout wrapper, className grouping, 들여쓰기 감소만을 위한 local component는 만들지 않습니다.  
반대로 아래 중 하나를 자기 subtree 안에서 직접 소유하면 route-local section component로 추출할 수 있습니다.

- async boundary: `Suspense`, skeleton, loading, error, empty state
- state boundary: `useState`, `useReducer`, `useEffect` 같은 로컬 state와 동기화
- provider boundary: form provider, context, scoped store
- interaction boundary: popover, modal, selection, inline edit, drag, expandable tree
- library boundary: `UiTable`, `UiTree`, editor, chart처럼 props와 render adapter가 빽빽한 위젯
- performance boundary: virtualization, transition, deferred value, heavy memoized subtree

route entry는 여전히 화면 orchestration owner로 남습니다.  
search param, navigation, page-level query/mutation, cross-section effect, invalidate, redirect, 여러 section에 걸친 파생값은 route entry에 둡니다.

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
	const responseContentFolderGetListSuspense = useContentFolderGetListSuspense();
	const responseContentManagerSearchContents = useContentManagerSearchContents();

	return (
		<div className="entry-layout">
			<EntrySidebarPanel />
			<EntryDetailPanel />
		</div>
	);
};
```

이 구조는 route entry가 어떤 data와 interaction을 오케스트레이션하는지 숨기고, local component도 runtime boundary 없이 layout wrapper 역할만 합니다.

**Correct (runtime boundary를 소유하는 section만 route-local component로 추출):**

```tsx
interface EntryTreeSectionProps {
	sidebarNodes: EntrySidebarNode[];
	selectedTableName?: string;
	onTableSelect: (tableName: string) => void;
}

const EntryTreeSection = (props: EntryTreeSectionProps) => {
	const { sidebarNodes, selectedTableName, onTableSelect } = props;
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [treeSearchKeyword, setTreeSearchKeyword] = useState("");

	const filteredSidebarNodes = getFilteredSidebarNodes(
		sidebarNodes,
		treeSearchKeyword,
	);

	/**
	 * @event tree에서 선택한 table key를 route search용 tableName으로 변환
	 */
	const handleTreeSelect: UiTreeProps["onSelect"] = (keys, _info) => {
		const selectedKey = keys[0];
		if (typeof selectedKey !== "string" || !selectedKey.startsWith("table:")) {
			return;
		}

		onTableSelect(selectedKey.replace("table:", ""));
	};

	return (
		<section className="entry-layout__sidebar">
			<UiInput
				value={treeSearchKeyword}
				onChange={(event) => setTreeSearchKeyword(event.target.value)}
			/>

			<Activity mode={filteredSidebarNodes.length > 0 ? "visible" : "hidden"}>
				<UiTree
					treeData={filteredSidebarNodes.map(mapEntryNodeToTreeData)}
					expandedKeys={expandedKeys}
					selectedKeys={selectedTableName ? [`table:${selectedTableName}`] : []}
					onExpand={(keys) => setExpandedKeys(keys.map(String))}
					onSelect={handleTreeSelect}
				/>
			</Activity>

			<Activity mode={filteredSidebarNodes.length > 0 ? "hidden" : "visible"}>
				<UiEmpty description="No matching results" />
			</Activity>
		</section>
	);
};
```

이 `EntryTreeSection`은 tree search state, expand interaction, empty state, `UiTree` adapter라는 runtime boundary를 실제로 소유하므로 local component로 승격할 가치가 있습니다.

**Correct (route entry는 orchestration을 계속 소유):**

```tsx
export const RouteComponent = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	const responseContentFolderGetListSuspense =
		useContentFolderGetListSuspense<EntryTreeSelectData>();
	const responseContentManagerSearchContents =
		useContentManagerSearchContents<ContentListSelectData>();

	/**
	 * @event tree에서 선택한 테이블로 route search를 갱신
	 */
	const handleTableSelect: EntryTreeSectionProps["onTableSelect"] = (tableName) => {
		void navigate({
			to: "/project/content-manager/entries",
			search: { page: search.page, size: search.size, table: tableName },
		});
	};

	return (
		<div className="entry-layout">
			<EntryTreeSection
				sidebarNodes={responseContentFolderGetListSuspense.data.sidebarNodes}
				selectedTableName={search.table}
				onTableSelect={handleTableSelect}
			/>
			<EntryTableSection
				contents={responseContentManagerSearchContents.data?.contents}
			/>
		</div>
	);
};
```

요약하면 route-local section component는 "화면의 한 덩어리처럼 보이기 때문"이 아니라, async, state, provider, interaction, library, performance 중 하나의 runtime boundary를 실제로 소유할 때만 추출합니다.
