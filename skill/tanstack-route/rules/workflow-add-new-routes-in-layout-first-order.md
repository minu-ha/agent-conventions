---
title: Add New Routes in Layout-first Order
impact: MEDIUM
impactDescription: reduces cleanup work by establishing shell, grouping, and search boundaries before route files sprawl
tags: workflow, route-creation, checklist
---

## Add New Routes in Layout-first Order

**Impact: MEDIUM (reduces cleanup work by establishing shell, grouping, and search boundaries before route files
sprawl)**

신규 라우트를 추가할 때는 화면 파일부터 급하게 만들지 말고, 레이아웃 셸과 그룹 구조를 먼저 고정하는 순서를 따릅니다.
이 프로젝트에서는 `feature.css`, `feature.ts`, `feature.layout.tsx`,
`feature.index.tsx` 4-file set을 route 기본 단위로 보고, layout file은 최소 tunnel이어도 먼저 자리를 확보합니다.
이렇게 해야 route tree, support code 위치, search 검증 경계가 뒤늦게 흔들리지 않습니다.

**Incorrect (leaf 화면부터 만들고 나중에 구조를 끼워 맞춤):**

```txt
1. 바로 feature.index.tsx부터 만든다
2. 화면이 커진 뒤에 layout, support code, -local 위치를 고민한다
3. search parsing과 redirect를 화면 본문에서 임시로 처리한다
```

**Correct (layout-first 순서로 route를 추가):**

```txt
1. 모든 화면이 같은 레이아웃 셸인지 먼저 판단한다
2. 셸이 다르면 최상위 그룹을 분리하고, 같으면 기존 부모 layout 아래에 둔다
3. URL에 반영되는 상위 계층은 일반 폴더로 만든다
4. 하위 라우트가 생기면 (<feature>) 그룹 폴더를 만든다
5. 기본적으로 feature.css, feature.ts, feature.layout.tsx, feature.index.tsx 4-file set을 준비한다
6. feature.layout.tsx는 shell UI가 아직 없더라도 route tunnel 경계로 두고, support code는 feature.ts에 named export로 모은다
7. 동적 세그먼트가 필요하면 {$param}, {-$param} 규칙을 사용한다
8. search를 읽는 화면이면 validateSearch를 먼저 선언한다
9. route 전용 보조 모듈이 있으면 같은 계층 -local/에 둔다
10. 생성된 <generated-route-tree-path>는 수동 수정하지 않는다
```
