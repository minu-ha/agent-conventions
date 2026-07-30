---
title: Review Route Structure Before Finishing
titleKo: 마무리 전에 route 구조 점검
impact: MEDIUM
impactDescription: route 변경을 완료로 선언하기 전에 그룹·가드·소유 어긋남을 잡음
tags: review, workflow, checklist
---

## Review Route Structure Before Finishing

**Impact: MEDIUM (route 변경을 완료로 선언하기 전에 그룹·가드·소유 어긋남을 잡음)**

라우트 작업을 끝냈다고 보기 전에 구조 체크리스트를 다시 확인합니다.
화면이 보인다는 이유만으로 마무리하지 말고, 그룹 구조, support code 배치, guard 위치,
generated artifact 처리까지 함께 점검해야 합니다.

**Incorrect (렌더링만 확인하고 구조 검토를 생략):**

```txt
- 페이지가 뜨는지만 확인한다
- redirect와 guard 위치는 나중에 정리한다
- support code가 route 파일 안에 과하게 남아 있어도 그대로 둔다
- generated route tree를 직접 고쳐서 통과시킨다
```

**Correct (마무리 전에 route 체크리스트를 순회):**

```txt
- 최상위 라우트 분리가 기능명이 아니라 레이아웃 셸 기준인가
- 폴더 전용 구조와 플랫 전용 구조 중 하나로 치우치지 않았는가
- URL에 반영되는 상위는 일반 폴더로 두었는가
- 하위 route 묶음은 () 그룹 폴더로 분리했는가
- 하위 route라면 feature.css, feature.ts, feature.layout.tsx, feature.index.tsx 4-file set을 갖췄는가
- 그룹 폴더 안의 엔트리 파일명이 feature.index.tsx처럼 검색 가능한가
- 화면 전용 순수 support code가 route 파일 안에 누적되지 않았고, 추출했다면 generic helper 파일 대신 owner-named sibling `*.ts`에 named export로 두었는가
- 인증/권한 가드를 컴포넌트 본문이 아니라 beforeLoad에 두었는가
- 쿼리스트링을 읽는 화면에 validateSearch가 선언되어 있는가
- route 전용 보조 모듈이 -local/에 정리되어 있는가
- <generated-route-tree-path>를 수동 수정하지 않았는가
```
