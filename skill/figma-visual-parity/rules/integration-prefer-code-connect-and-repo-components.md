---
title: Prefer Code Connect and Repo Components Over Rebuilding UI
impact: CRITICAL
impactDescription: 실제 디자인 시스템 컴포넌트를 무시하고 raw JSX/CSS를 새로 만드는 일을 막음
tags: integration, code-connect, components
---

## Prefer Code Connect and Repo Components Over Rebuilding UI

**Impact: CRITICAL (실제 디자인 시스템 컴포넌트를 무시하고 raw JSX/CSS를 새로 만드는 일을 막음)**

Code Connect context가 있으면 import statement,
component snippet,
prop mapping,
variant value,
custom instruction을 우선 구현 기준으로 사용합니다.
Code Connect가 없으면 repo의 `src/components`,
`src/shared`,
design system docs,
existing route usage를 검색해 Figma component와 code component mapping table을 먼저 작성합니다.
새 컴포넌트나 raw CSS는 기존 컴포넌트로 표현할 수 없을 때만 만듭니다.

**Incorrect (연결된 component snippet을 무시):**

```tsx
// Figma Button에 Code Connect snippet이 있는데도 새 버튼 markup을 만듦
<button className="primary-blue-rounded-button">저장</button>
```

**Correct (Code Connect 또는 repo component mapping을 구현 기준으로 사용):**

```tsx
import {Button} from "@/components/ui/button";

<Button variant="primary" size="sm">
  저장
</Button>
```
