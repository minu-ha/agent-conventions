---
title: Choose Actions vs. Endpoints by Caller and Response Needs
impact: HIGH
impactDescription: >-
  keeps mutation boundaries aligned with who is calling them and what kind of response they must control
tags: actions, endpoints, forms
---

## Choose Actions vs. Endpoints by Caller and Response Needs

**Impact: HIGH (keeps mutation boundaries aligned with who is calling them and what kind of response they must
control)**

브라우저 UI가 직접 호출하는 form submit이나 mutation은 기본적으로 Actions를 먼저 검토합니다.
Actions는 input validation, error shape,
client/server 호출 계약을 한 경계에서 다루기 쉬워 UI와 가까운 write flow에 잘 맞습니다.
반대로 public API, webhook, binary 응답, 세밀한 header/status 제어,
non-UI consumer가 필요한 경우에는 endpoint가 더 자연스럽습니다.
static mode에서 HTML form 기반 action을 쓰면 on-demand rendering 전제도 함께 확인합니다.

**Incorrect (모든 서버 쓰기 흐름을 같은 방식으로 처리함):**

```text
- UI form submit도 무조건 ad-hoc /api fetch로 처리한다
- public webhook도 action처럼 취급한다
- 파일 다운로드 응답도 action 안에서 우겨 넣는다
```

**Correct (caller와 response shape에 맞는 경계를 고른다):**

```text
- page form이나 button mutation: Actions 우선
- 외부 서비스 webhook, public JSON API, 이미지/파일 응답: endpoint 우선
- static mode에서 request-time form 처리: adapter와 prerender 전제를 함께 확인
```
