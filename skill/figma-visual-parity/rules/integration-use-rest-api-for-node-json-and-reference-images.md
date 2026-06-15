---
title: Use REST API for Node JSON and Reference Images When Available
impact: CRITICAL
impactDescription: Figma URL에서 구조화된 node 데이터와 비교용 reference image를 확보하게 함
tags: integration, rest-api, screenshot
---

## Use REST API for Node JSON and Reference Images When Available

**Impact: CRITICAL (Figma URL에서 구조화된 node 데이터와 비교용 reference image를 확보하게 함)**

Figma REST API token이 있으면 Figma URL에서 `fileKey`와 `nodeId`를 파싱합니다. URL의 `node-id=1-2`는 API 요청용 `1:2`로 변환합니다. `GET /v1/files/:key/nodes?ids=<nodeId>`로 node JSON과 subtree를 확인하고, 큰 node는 `depth`를 낮춰 구조를 먼저 봅니다. `GET /v1/images/:key?ids=<nodeId>&format=png&scale=2`로 reference image를 확보해 browser screenshot diff 기준으로 사용합니다. token, signed image URL, 원본 응답 전체는 로그나 커밋에 노출하지 않습니다.

**Incorrect (REST API 사용 가능 상태를 무시):**

```md
FIGMA_TOKEN과 node URL이 있지만 MCP screenshot만 보고 구현한다.
reference image 없이 눈대중으로 browser 화면을 비교한다.
```

**Correct (구조와 reference image를 함께 확보):**

```md
Parsed Figma URL:
- fileKey: abc123
- nodeId: 12:34

REST evidence:
- GET /v1/files/:key/nodes?ids=12:34
- GET /v1/images/:key?ids=12:34&format=png&scale=2
```
