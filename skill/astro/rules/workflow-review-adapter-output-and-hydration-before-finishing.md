---
title: Review Adapter, Output Mode, and Hydration Before Finishing
impact: MEDIUM
impactDescription: catches Astro-specific deployment and rendering mismatches before they ship
tags: workflow, adapters, hydration
---

## Review Adapter, Output Mode, and Hydration Before Finishing

**Impact: MEDIUM (catches Astro-specific deployment and rendering mismatches before they ship)**

Astro 변경을 마무리할 때는 코드 diff만 보지 말고 adapter,
`output`,
prerender/on-demand 전제,
build-time/live collection 선택,
hydration 경계를 함께 점검합니다.
Actions나 server islands를 추가했는데 adapter가 없거나, 정적 shell이 과하게 hydrate되는 상태로 끝내지 않습니다.

**Incorrect (Astro 전용 전제를 확인하지 않고 기능만 붙이고 마무리):**

```text
- `server:defer`를 추가했지만 adapter 설치 여부를 확인하지 않음
- UI mutation을 Actions로 옮겼지만 static/on-demand 전제는 보지 않음
- dynamic route인데 `getStaticPaths()`와 `prerender` 선택이 현재 mode와 맞는지 확인하지 않음
- 정적 page section까지 `client:load`나 `client:only`가 퍼졌는지 점검하지 않음
```

**Correct (Astro-specific review checklist로 배포 전제를 같이 검토):**

```text
- adapter와 `output` 설정이 Actions/live collections/server islands 요구사항과 맞는지 확인
- prerender 경로와 on-demand 경로가 섞일 때 page boundary 의도가 유지되는지 확인
- dynamic route의 `getStaticPaths()` 유무와 current mode가 서로 모순되지 않는지 확인
- hydrate된 island가 진짜 interactive leaf만 남았는지, `client:only`가 꼭 필요한 곳만 남았는지 마지막으로 점검
```
