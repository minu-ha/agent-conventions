---
title: Separate Static Copy from Server Data
titleKo: 고정 문구와 서버 데이터를 나눠 글자의 출처를 정합니다
impact: HIGH
impactDescription: Figma 샘플 값을 코드에 박지 않고, 고정 문구를 응답 필드에서 찾지도 않습니다
appliesWhen:
  - Figma 텍스트 노드의 글자를 JSX나 문구 리소스에 넣을 때
  - 화면의 숫자, 이름, 날짜가 샘플인지 고정 문구인지 가려야 할 때
tags: source, copy, data
---

## Separate Static Copy from Server Data

**Impact: HIGH (Figma 샘플 값을 코드에 박지 않고, 고정 문구를 응답 필드에서 찾지도 않습니다)**

Figma 화면의 글자에는 고정 문구와 샘플 데이터가 섞여 있습니다.
샘플을 코드에 박으면 모든 사용자에게 같은 값이 보이고, 고정 문구를 데이터로 오해하면 없는 응답 필드를 찾게 됩니다.
그래서 글자마다 출처를 먼저 정하고 구현합니다.

| 글자 | 출처 |
| --- | --- |
| 컬럼명, 버튼명, 탭명, 라벨, placeholder, 빈 상태 문구 | 고정 문구입니다. 프로젝트가 문구를 두는 자리에 스크린샷 글자 그대로 적습니다 |
| 행 값, 개수, 금액, 날짜, 사용자 이름 | 서버 데이터입니다. 응답 필드에서 읽습니다 |
| 단위나 접두어가 붙은 값. `128건`, `₩12,000` | 단위는 고정 문구, 숫자는 서버 데이터로 나눕니다 |
| 어느 쪽인지 모르는 글자 | 먼저 분류해 보고에 적고, 맞는 응답 필드가 없으면 질문합니다 |

프로젝트에 문구 리소스가 있으면 고정 문구는 리소스에 둡니다.
글자 자체는 `read-take-copy-from-the-render-not-layer-names`에 따라 스크린샷에서 읽습니다.

**Incorrect 1 (샘플 행과 개수를 화면에 박습니다):**

```tsx
<Fragment>
	<UiTable rows={[{id: 1, name: "기본 티셔츠", price: 12000}]} />
	<p className={clsx("pg_products__count")}>총 128건</p>
</Fragment>
```

**Correct 1 (행과 개수는 응답에서, 단위는 고정 문구로 둡니다):**

```tsx
<Fragment>
	<UiTable rows={responseProductListSuspense.data.products} />
	<p className={clsx("pg_products__count")}>총 {responseProductListSuspense.data.total}건</p>
</Fragment>
```
