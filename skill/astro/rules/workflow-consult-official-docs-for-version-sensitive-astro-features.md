---
title: Consult Official Docs for Version-sensitive Astro Features
titleKo: 버전 민감한 Astro 기능은 공식 문서 확인
impact: MEDIUM
impactDescription: reduces stale assumptions around fast-moving Astro features and directives
impactDescriptionKo: 빠르게 바뀌는 Astro 기능과 지시자에 대한 낡은 가정을 줄임
tags: workflow, docs, astro-docs
---

## Consult Official Docs for Version-sensitive Astro Features

**Impact: MEDIUM (reduces stale assumptions around fast-moving Astro features and directives)**

`client:*`, `server:defer`, Actions, content collections,
adapters처럼 버전과 host 조건에 민감한 Astro 기능은 공식 문서를 먼저 확인합니다.
`astro-docs` MCP가 연결돼 있다면 그 경로를 우선 사용하고,
없더라도 최소한 공식 문서 기준으로 최신 동작을 확인한 뒤 규칙을 적용합니다.

**Incorrect (다른 framework 기억이나 오래된 Astro 예시를 그대로 적용):**

```text
- "이전 프로젝트에서 봤던 예시니까 확인 없이 그대로 `client:only`를 모든 interactive widget에 붙인다."
- "content collections 예전 API 기억으로 page 파일 안에서 직접 glob 처리한다."
```

**Correct (버전 민감한 기능은 공식 문서를 먼저 대조하고 난 뒤 적용):**

```text
- "이번 변경은 Actions와 server islands를 함께 쓰므로 공식 Astro 문서나 astro-docs MCP에서 현재 API 제약을 먼저 확인한다."
- "확인 후 adapter requirement, serializable props, action 호출 방식에 맞춰 구현한다."
```
