---
title: Match Route Paths to File Structure
titleKo: route 경로를 파일 구조와 일치시키기
impact: HIGH
impactDescription: route 문자열이 그것을 소유한 파일 트리에서 벗어나는 것을 막음
tags: createfileroute, paths, file-structure
---

## Match Route Paths to File Structure

**Impact: HIGH (route 문자열이 그것을 소유한 파일 트리에서 벗어나는 것을 막음)**

`createFileRoute()` 문자열은 실제 파일 구조와 대응되게 작성합니다.
일반 폴더, pathless group, 동적 세그먼트,
trailing slash 규칙을 문자열에 그대로 반영해야 route tree와 파일 위치를 함께 추적할 수 있습니다.

**Incorrect (경로 문자열이 파일 구조와 어긋남):**

```tsx
// file: <route-root>/app/(settings)/settings.index.tsx
export const Route = createFileRoute("/settings")({
	component: SettingsIndex,
});
```

**Correct (경로 문자열이 실제 파일 구조를 반영):**

```tsx
createFileRoute("/app")({...});
createFileRoute("/app/")({...});
createFileRoute("/app/(settings)/settings/")({...});
```
