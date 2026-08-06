---
title: Keep Route Entry Files Focused on Screen Flow
titleKo: 화면 진입 파일에는 화면 흐름만 남깁니다
impact: MEDIUM-HIGH
impactDescription: 진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다
appliesWhen:
  - 라우트 진입의 search 파라미터, 화면 이동, 쿼리, 뮤테이션, 화면 전체 이펙트를 옮기거나 나눌 때
  - page 섹션 조립의 순서나 소유자를 바꿀 때
  - 제외: 같은 소유자 안에서 표현만 바꾸는 경우
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries,
  ownership-place-owner-files-in-role-folders
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: MEDIUM-HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입이 소유하는 것은 다음 다섯입니다.
다른 규칙이 이 목록을 가리킬 때는 여기가 정본입니다.

- search 파라미터와 화면 이동
- 화면 단위 쿼리와 뮤테이션, 그 무효화
- 화면 전체 이펙트
- 여러 섹션에 걸친 파생값
- 섹션 렌더 조립

비동기, 상태, 상호작용 경계를 가진 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` 형태, 바인딩·별칭 정리, 파생 상태 이펙트를 렌더 계산으로 옮기는 것
- 순수 타입·전송 값 조립 함수·기본 설정의 형제 `.ts` 이동.
  `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가 담당합니다.

**Incorrect (흐름보다 분해 자체가 목적이 됨):**

```tsx
return (
	<PgProductShell>
		<PgProductHeaderSection />
		<PgProductContentSection />
		<PgProductFooterSection />
	</PgProductShell>
);
```

**Correct (라우트 진입에서 흐름이 보이고, 실제 경계가 있는 섹션만 분리):**

```tsx
const navigate = useNavigate();
const search = Route.useSearch();

/**
 * 표에 그릴 product를 route search의 page로 읽는다
 */
const responseProductListSuspense = useProductListSuspense(
	{page: search.page},
	{query: {select: (response) => ({products: response.data.list})}},
);

/**
 * 저장에 성공하면 첫 페이지로 돌려 새로 저장한 product가 목록 맨 앞에 오게 한다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void navigate({to: "/products", search: {...search, page: 1}});
		},
	},
});

/**
 * 폼 값을 전송 형태로 바꿔 저장만 부르고, 저장 뒤 흐름은 mutation 콜백이 이어 간다
 */
const handleProductSave: PgProductListSectionProps["onSubmit"] = () => {
	mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
};

return (
	<Fragment>
		<PgProductFilterSection />
		<PgProductListSection
			products={responseProductListSuspense.data.products}
			onSubmit={handleProductSave}
		/>
	</Fragment>
);
```
