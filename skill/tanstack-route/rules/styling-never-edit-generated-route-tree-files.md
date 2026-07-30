---
title: Never Edit Generated Route Tree Files
titleKo: 생성된 route tree 파일은 절대 손대지 않기
impact: MEDIUM-HIGH
impactDescription: preserves generated router output as a build artifact derived from route sources
tags: generated-files, route-tree, safety
---

## Never Edit Generated Route Tree Files

**Impact: MEDIUM-HIGH (preserves generated router output as a build artifact derived from route sources)**

라우트 추가나 변경 결과로 생성되는 `<generated-route-tree-path>`는 수동 수정하지 않습니다.
라우트 소스만 수정하고, 생성 파일은 결과물로만 다루어야 source of truth가 명확하게 유지됩니다.

**Incorrect (생성 파일을 직접 수정해 동작을 맞춤):**

```txt
// Bad
<generated-route-tree-path>에 수동으로 route node를 추가
<generated-route-tree-path>에서 import 경로를 직접 수정
```

**Correct (라우트 소스를 고치고 생성물은 다시 생성):**

```txt
// Good
route source file을 수정한다
router generator를 다시 실행한다
<generated-route-tree-path>는 결과물로만 확인한다
```
