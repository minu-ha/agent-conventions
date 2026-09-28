---
title: Use Existing Icons or Downloaded Assets
titleKo: 아이콘과 이미지는 기존 글리프나 내려받은 에셋을 씁니다
impact: MEDIUM
impactDescription: 만료되는 에셋 URL과 손으로 그린 도형이 코드에 남지 않습니다
appliesWhen:
  - Figma의 아이콘, 로고, 이미지를 코드에 넣을 때
  - 코드에 `figma.com/api/mcp/asset` URL이나 손으로 쓴 SVG `path`가 들어갈 때
tags: transcription, icons, assets
---

## Use Existing Icons or Downloaded Assets

**Impact: MEDIUM (만료되는 에셋 URL과 손으로 그린 도형이 코드에 남지 않습니다)**

아이콘은 프로젝트 아이콘 세트에서 먼저 찾고, 없으면 Figma 에셋을 내려받아 저장소에 커밋합니다.
MCP가 주는 에셋 URL은 오래가지 않습니다. 스크린샷 URL은 단기, `get_design_context` 에셋은 7일입니다(2026년 9월 관측).
코드에 남기면 배포한 화면에서 그림이 사라집니다.

| 상황 | 처리 |
| --- | --- |
| 프로젝트 아이콘 세트에 모양이 같은 글리프가 있음 | 그 글리프를 씁니다. 이름만 같고 모양이 다르면 같은 글리프가 아닙니다 |
| 같은 글리프가 없음 | 그 노드에 `download_assets`를 불러 `svgAssets` 항목을 받아 저장소에 커밋합니다. `defaultFormat`은 넘기지 않습니다 |
| 사진, 상품 이미지처럼 데이터가 주는 그림 | 에셋으로 두지 않고 응답의 URL을 씁니다 |

아이콘 하나가 필요할 때는 `get_design_context` 대신 `download_assets`를 부릅니다. 코드 없이 에셋만 옵니다.
모양을 보고 SVG `path`를 손으로 그리지 않습니다.
내려받은 SVG의 `width`, `height`는 지우지 않습니다.

**Incorrect 1 (MCP 에셋 URL을 그대로 코드에 둡니다):**

```tsx
/**
 * 고정 상품 표시 아이콘
 */
export const UiPinIcon = () => {
	return <img src="https://www.figma.com/api/mcp/asset/30e68a16/b2ddc.svg" alt="" />;
};
```

**Correct 1 (내려받아 커밋한 에셋을 가져옵니다):**

```tsx
import pinIconUrl from "@/asset/icon/pin.svg";

/**
 * 고정 상품 표시 아이콘
 */
export const UiPinIcon = () => {
	return <img src={pinIconUrl} alt="" />;
};
```

**Incorrect 2 (스크린샷의 모양을 보고 `path`를 손으로 그립니다):**

```tsx
<svg viewBox="0 0 16 16">
	<path d="M3 4h10l-4 5v4l-2-1V9z" />
</svg>
```

**Correct 2 (모양이 같은 기존 글리프를 씁니다):**

```tsx
<UiFilterIcon />
```
