---
title: Fill Undrawn States with Existing Project Parts
titleKo: 그려지지 않은 상태는 프로젝트 기본 컴포넌트로 채우고 보고합니다
impact: HIGH
impactDescription: 디자인에 없는 로딩, 빈 목록, 오류 상태가 흰 화면이나 화면마다 다른 모양으로 남지 않습니다
appliesWhen:
  - 서버 데이터 목록, 입력, 비동기 동작이 있는 Figma 화면을 구현할 때
  - Figma에 로딩, 빈 목록, 오류, 비활성 상태가 그려져 있지 않을 때
tags: intent, states, loading, empty
---

## Fill Undrawn States with Existing Project Parts

**Impact: HIGH (디자인에 없는 로딩, 빈 목록, 오류 상태가 흰 화면이나 화면마다 다른 모양으로 남지 않습니다)**

Figma 화면은 대개 데이터가 가득 찬 한 순간만 그립니다.
빠진 상태를 새로 디자인하면 화면마다 모양이 달라지고, 비워 두면 흰 화면이나 깨진 표가 됩니다.
그래서 그려지지 않은 상태는 프로젝트에 이미 있는 컴포넌트로 채우고, 채웠다는 사실을 보고에 적습니다.

| 상태 | 채우는 것 |
| --- | --- |
| 로딩 | 프로젝트의 로딩 컴포넌트나 스켈레톤. 경계의 자리는 `react/runtime-place-suspense-boundaries-at-the-section-owner`가 정합니다 |
| 빈 목록 | 프로젝트의 빈 상태 표시와 고정 문구 |
| 오류 | 프로젝트의 오류 경계와 오류 표시 컴포넌트 |
| 비활성, 진행 중 | 컴포넌트가 가진 `disabled`, 진행 표시 |
| 긴 문구, 큰 숫자 | 칸 폭 처리는 `intent-treat-frame-sizes-and-sample-text-as-samples`가 정합니다 |

숨긴 레이어에 그 상태가 있으면 `read-collect-hidden-layers-and-annotations`에 따라 그 모양을 먼저 씁니다.
빈 상태 문구처럼 글자가 필요한데 디자인에 없으면 가정한 문구로 구현하고 질문 목록에 올립니다.

**Incorrect 1 (디자인에 없는 로딩 모양을 화면에서 새로 만듭니다):**

```tsx
<Suspense
	fallback={
		<div className="pg_products__loading">
			<img src={loadingGif} />
			<p>불러오는 중</p>
		</div>
	}
>
	<PgProductTableSection />
</Suspense>
```

**Correct 1 (프로젝트의 로딩 컴포넌트를 경계의 대체 화면으로 씁니다):**

```tsx
<Suspense fallback={<UiSpinner />}>
	<PgProductTableSection />
</Suspense>
```

**Correct (채운 상태를 보고에 적습니다):**

```text
디자인 없음 — 상품 목록
로딩     UiSpinner로 채움
빈 목록  "등록된 상품이 없습니다" 가정, 확인 필요
오류     화면 오류 경계의 기본 표시
```
