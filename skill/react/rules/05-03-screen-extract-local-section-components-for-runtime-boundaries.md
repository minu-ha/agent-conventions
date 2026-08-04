---
title: Extract Route-local Section Components Only for Runtime Boundaries
titleKo: 실행 경계가 있는 부분만 섹션 컴포넌트로 뺍니다
impact: HIGH
impactDescription: 화면 흐름은 보이게 두고 실제 실행 경계가 있는 부분만 떼어 냅니다
appliesWhen:
  - 화면 지역 섹션 컴포넌트를 새로 추출할 때
  - 기존 섹션이 비동기·상태·프로바이더·상호작용·라이브러리·성능 경계를 소유하는지 바꿀 때
tags: screen, routes
---

## Extract Route-local Section Components Only for Runtime Boundaries

**Impact: HIGH (화면 흐름은 보이게 두고 실제 실행 경계가 있는 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 `runtime boundary`가 있을 때만 추출합니다.
단순 레이아웃 래퍼, `className` 묶기, 들여쓰기 감소만으로는 추출하지 않습니다.

추출 가능한 경계:

- 비동기: `Suspense`, 스켈레톤, 로딩, 오류, 비었을 때 상태
- 상태, 프로바이더: 지역 상태, 이펙트 동기화, 폼 프로바이더, 컨텍스트, 범위를 좁힌 스토어
- 상호작용: 팝오버, 모달, 선택, 인라인 편집, 드래그, 펼치는 트리
- 라이브러리, 성능: 촘촘한 위젯 어댑터, 가상 스크롤, 전환, 지연 값

검색 매개변수, 화면 이동, 화면 단위 쿼리/뮤테이션, 화면 전체 이펙트, 무효화, 이동,
여러 섹션에 걸친 파생값은 라우트 진입에 둡니다.

호출 계층은 폴더 깊이가 아니라 진입 파일의 조립이 드러냅니다.
"어느 컴포넌트가 이걸 쓰는지"를 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.
진입의 JSX와 가져오기 목록을 위에서 아래로 읽으면 답이 나와야 하고, 그러지 않으면 섹션을 과하게 쪼갠 것입니다.

**Incorrect (레이아웃 래퍼만 분리해 라우트 흐름을 숨김):**

```tsx
const PgEntrySidebarPanel = () => {
	return (
		<section className="entry-layout__sidebar">
			<SidebarStats />
			<SearchField />
			<EntryTree />
		</section>
	);
};

const PgEntryDetailPanel = () => {
	return (
		<section className="entry-layout__detail">
			<DetailHeader />
			<EntryTable />
		</section>
	);
};

export const PgEntries = () => {
	const responseEntryTreeSuspense = useEntryTreeSuspense();
	const responseEntryListSuspense = useEntryListSuspense();

	return (
		<div className="pg_entries__layout">
			<PgEntrySidebarPanel />
			<PgEntryDetailPanel />
		</div>
	);
};
```

**Correct (실행 환경 경계를 소유하는 섹션만 화면 지역 컴포넌트로 추출):**

```tsx
interface PgEntryTreeSectionProps {
	categoryNodes: EntryCategoryNode[];
	selectedCategoryId?: string;
	onCategorySelect: (categoryId: string) => void;
}

const PgEntryTreeSection = (props: PgEntryTreeSectionProps) => {
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

**Correct (라우트 진입이 흐름 제어를 계속 소유):**

```tsx
export const PgEntries = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	/**
	 * tree sidebar 조회 API
	 */
	const responseEntryTreeSuspense = useEntryTreeSuspense({}, {
		query: {select: (response) => ({categoryNodes: response.data.nodes})},
	});

	/**
	 * entry 목록 조회 API
	 */
	const responseEntryListSuspense = useEntryListSuspense({}, {
		query: {select: (response) => ({entries: response.data.list})},
	});

	/**
	 * tree에서 선택한 category로 route search를 갱신
	 */
	const handleCategorySelect: PgEntryTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/entries",
			search: { page: search.page, size: search.size, categoryId },
		});
	};

	return (
		<div className="pg_entries__layout">
			<PgEntryTreeSection
				categoryNodes={responseEntryTreeSuspense.data.categoryNodes}
				selectedCategoryId={search.categoryId}
				onCategorySelect={handleCategorySelect}
			/>
			<PgEntryTableSection
				entries={responseEntryListSuspense.data.entries}
			/>
		</div>
	);
};
```
