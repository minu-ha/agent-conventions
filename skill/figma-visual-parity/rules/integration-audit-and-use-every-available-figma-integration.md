---
title: Audit and Use Every Available Figma Integration Layer
impact: CRITICAL
impactDescription: MCP만 쓰고 끝내지 않고 사용 가능한 integration을 모두 조합하게 함
tags: integration, mcp, rest-api, code-connect
---

## Audit and Use Every Available Figma Integration Layer

**Impact: CRITICAL (MCP만 쓰고 끝내지 않고 사용 가능한 integration을 모두 조합하게 함)**

Figma visual parity 작업을 시작하면 먼저 사용 가능한 integration을 audit합니다.
Figma MCP,
Code Connect,
Figma REST API token,
variables/components/styles metadata,
repo design system inventory,
browser screenshot diff 중 접근 가능한 것은 모두 사용합니다.
접근할 수 없는 계층은 조용히 생략하지 말고 "없음",
"권한 없음",
"scope 부족",
"rate limit",
"tool unavailable"처럼 이유를 기록합니다.

**Incorrect (MCP 한 계층만 보고 바로 구현):**

```md
Figma MCP screenshot을 봤으니 바로 CSS를 수정한다.
Code Connect, REST API token, variables metadata, browser diff 가능 여부는 확인하지 않는다.
```

**Correct (가능한 evidence layer를 먼저 정리):**

```md
Integration audit:
- Figma MCP: 사용 가능, design context와 screenshot 확보
- Code Connect: 사용 가능, Button/Table snippet 확인
- Figma REST API: FIGMA_TOKEN 있음, node JSON과 reference PNG 확보
- Variables API: 403 file_variables:read scope 없음, repo token inventory로 fallback
- Browser diff: Playwright screenshot 확인 가능
```
