---
title: Choose the Node Each Tool Reads
titleKo: 스크린샷은 화면 프레임에, 메타데이터는 메모 래퍼에 부릅니다
impact: HIGH
impactDescription: 같은 비용으로 화면 글자와 메모를 놓치지 않고 읽습니다
appliesWhen:
  - Figma URL의 노드가 화면 프레임인지 메모를 감싼 래퍼인지 가려야 할 때
  - URL에 `node-id`가 없거나 `/branch/` 경로가 들어 있을 때
tags: mcp, node, url
---

## Choose the Node Each Tool Reads

**Impact: HIGH (같은 비용으로 화면 글자와 메모를 놓치지 않고 읽습니다)**

공유받은 URL은 화면 하나가 아니라 화면과 메모, 변경 이력을 함께 감싼 래퍼를 가리키는 경우가 많습니다.
래퍼를 스크린샷으로 찍으면 메모까지 한 장에 줄어들어 화면의 글자가 읽히지 않습니다.
반대로 화면 프레임에 메타데이터를 부르면 옆에 붙은 UX 메모와 이력을 놓칩니다.

### 노드별 도구

| 노드 | 메타데이터에서 알아보는 법 | 부를 도구 |
| --- | --- | --- |
| 메모 래퍼 | 화면 프레임, 메모 프레임, 이력 표를 형제로 품은 바깥 `frame` | `get_metadata` |
| 화면 프레임 | 1920, 1440, 375 같은 기기 폭이고 GNB 같은 공통 인스턴스를 품은 `frame` | `get_screenshot`, `get_variable_defs` |
| 반복 단위, 컴포넌트 | 같은 `name`과 크기로 여러 번 나오는 `frame`, `instance` | 대응물이 없을 때만 `get_design_context` |

래퍼 id만 받았으면 메타데이터에서 화면 프레임 id를 찾아 스크린샷을 그 id로 부릅니다.
화면 프레임이 둘 이상이면 요청이 가리키는 상태의 프레임을 고르고, 나머지는 상태 목록에 적습니다.

### URL 읽기

| URL | 처리 |
| --- | --- |
| `node-id=1-2` | 노드 id는 `1:2`입니다 |
| `/design/:fileKey/branch/:branchKey/` | `branchKey`를 `fileKey`로 씁니다 |
| `node-id`가 없음 | 추측하지 않고 노드 URL을 요청합니다. `get_metadata`를 노드 없이 부르면 페이지 목록만 옵니다 |

**Incorrect 1 (래퍼에 스크린샷을 불러 화면이 메모와 함께 줄어듭니다):**

```text
get_screenshot  12:340 상품 목록_전체  원본 2834x2403 → 1600x1357  표 글자가 읽히지 않음
```

**Correct 1 (메타데이터로 화면 프레임을 찾아 그 프레임만 찍습니다):**

```text
get_metadata    12:340 상품 목록_전체  화면 프레임 12:341, 메모 12:395, 이력 12:401
get_screenshot  12:341 상품 목록       원본 1920x2169 → 1416x1600  표 글자가 읽힘
```
