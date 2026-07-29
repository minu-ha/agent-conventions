---
title: Match Route Paths to File Structure
impact: HIGH
impactDescription: prevents route strings from drifting away from the file tree that owns them
tags: createfileroute, paths, file-structure
---

## Match Route Paths to File Structure

**Impact: HIGH (prevents route strings from drifting away from the file tree that owns them)**

`createFileRoute()` 문자열은 실제 파일 구조와 대응되게 작성합니다.
일반 폴더, pathless group, 동적 세그먼트, trailing slash 규칙을 문자열에 그대로 반영해야 route tree와 파일 위치를 함께 추적할 수 있습니다.

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
