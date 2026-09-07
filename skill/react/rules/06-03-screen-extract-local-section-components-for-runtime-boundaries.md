---
title: Extract Local Section Components Only for Runtime Boundaries
titleKo: 런타임 경계가 있는 섹션만 화면 지역 컴포넌트로 추출합니다
impact: HIGH
impactDescription: 화면 흐름을 유지하면서 자체 책임이 있는 섹션만 분리합니다
appliesWhen:
  - 화면 지역 섹션 컴포넌트를 새로 추출할 때
  - 기존 섹션에 비동기, 지역 상태, 프로바이더, 상호작용, 외부 위젯, 성능 처리를 넣거나 뺄 때
tags: screen, routes
---

## Extract Local Section Components Only for Runtime Boundaries

**Impact: HIGH (화면 흐름을 유지하면서 자체 책임이 있는 섹션만 분리합니다)**

라우트 진입의 지역 컴포넌트는 아래 책임 중 하나를 **직접 소유할 때만** 추출합니다.
단순 래퍼·`className` 묶음·들여쓰기 감소는 추출 근거가 아닙니다.

| 책임 | 예 |
| --- | --- |
| 비동기 | `Suspense`·스켈레톤·로딩·오류·빈 상태 |
| 상태와 프로바이더 | 지역 상태·이펙트 동기화·폼 프로바이더·컨텍스트·범위를 좁힌 스토어 |
| 상호작용 | 팝오버·모달·선택·인라인 편집·드래그·펼치는 트리 |
| 라이브러리와 성능 | 외부 위젯 생명주기 어댑터·가상 스크롤·전환·지연 값 |

화면 흐름 제어는 `screen-keep-route-flow-visible`에 따라 라우트 진입에 남깁니다.
추출한 파일의 배치는 `ownership-place-owner-files-in-role-folders`를 따릅니다.
진입 파일의 JSX에 나타나지 않는 섹션을 다른 섹션 파일 안에서 렌더하면 과하게 나눈 것입니다.

**Incorrect (감싸기만 하는 래퍼를 섹션으로 추출합니다):**

```tsx
const PgProductSidebarPanel = (props: PgProductSidebarPanelProps) => {
	return <section className={clsx("pg_products__sidebar")}>{props.children}</section>;
};

const PgProductDetailPanel = (props: PgProductDetailPanelProps) => {
	return <section className={clsx("pg_products__detail")}>{props.children}</section>;
};
```

**Correct (데이터·상태·상호작용을 소유한 섹션만 추출하고 자신의 쿼리 키로 읽습니다):**

```tsx
// page/products/_pg-product-tree-section.tsx
export const PgProductTreeSection = () => {
	const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	/**
	 * 사이드바가 그릴 분류 노드만 남긴다. 트리 펼침 상태는 이 섹션이 따로 들고 있다
	 */
	const responseProductTreeSuspense = useProductTreeSuspense(
		{},
		{query: {select: (response) => ({categoryNodes: response.data.nodes.map(toTreeData)})}},
	);

	/**
	 * UiTree가 넘기는 key 타입이 넓어서 문자열로 좁혀 담는다
	 */
	const handleTreeExpand: UiTreeProps["onExpand"] = (keys) => {
		setExpandedKeys(keys.map(String));
	};

	/**
	 * 고른 분류를 URL에 적어 두어 새로 고침해도 같은 화면이 열리게 한다
	 */
	const handleTreeSelect: UiTreeProps["onSelect"] = (keys) => {
		const selectedKey = keys[0];

		if (selectedKey === undefined) {
			return;
		}

		void setUrlParams({categoryId: String(selectedKey)});
	};

	return (
		<section className={clsx("pg_products__sidebar")}>
			{responseProductTreeSuspense.data.categoryNodes.length > 0 && (
				<UiTree
					items={responseProductTreeSuspense.data.categoryNodes}
					expandedKeys={expandedKeys}
					selectedKeys={urlParams.categoryId ? [urlParams.categoryId] : []}
					onExpand={handleTreeExpand}
					onSelect={handleTreeSelect}
				/>
			)}
			{responseProductTreeSuspense.data.categoryNodes.length === 0 && <UiEmpty description="분류가 없습니다" />}
		</section>
	);
};
```
