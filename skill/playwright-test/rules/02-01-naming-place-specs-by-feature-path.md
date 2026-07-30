---
title: Place Specs by Feature Path
titleKo: spec은 기능 경로에 맞춰 배치
impact: HIGH
impactDescription: 테스트 트리가 실제 route·기능 경로를 반영하게 해 테스트 소유를 찾을 수 있게 함
tags: spec-placement, features, paths
---

## Place Specs by Feature Path

**Impact: HIGH (테스트 트리가 실제 route·기능 경로를 반영하게 해 테스트 소유를 찾을 수 있게 함)**

테스트는 `<test-root>/<기능 경로>/...` 아래에 두고, 디렉터리 구조는 실제 화면이나 도메인 구조를 따라갑니다.
그래야 feature를 찾을 때 구현 파일과 테스트 파일이 비슷한 경로 감각으로 탐색됩니다.

**Incorrect (기능 구조와 무관한 한 폴더에 spec를 몰아넣음):**

```txt
<test-root>/
  all/
    login.spec.ts
    members.spec.ts
    project.spec.ts
```

**Correct (기능 경로를 반영해 배치):**

```txt
<test-root>/login/login.spec.ts
<test-root>/login/login.e2e.spec.ts
<test-root>/project/members/members.form.{-$mid}.spec.ts
<test-root>/project/members/members.e2e.spec.ts
```
