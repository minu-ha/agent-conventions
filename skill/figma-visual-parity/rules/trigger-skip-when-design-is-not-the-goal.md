---
title: Skip This Skill When Design Parity Is Not the Goal
titleKo: 디자인 일치가 목표가 아니면 이 skill을 건너뛰기
impact: HIGH
impactDescription: Figma와 무관한 기능/API 작업에 visual parity 절차를 과잉 적용하지 않게 함
tags: trigger, scope, exclusions
---

## Skip This Skill When Design Parity Is Not the Goal

**Impact: HIGH (Figma와 무관한 기능/API 작업에 visual parity 절차를 과잉 적용하지 않게 함)**

Figma 댓글 CSV 추출, API/데이터 로직 수정, 디자인 기준 없는 기능 구현, 사용자가 명시한 "대략만", "구조만",
"디자인 말고 동작만" 요청은 이 skill을 적용하지 않습니다.
Figma link가 있어도 사용 목적이 comment extraction이나 metadata export라면 visual parity workflow로 바꾸지 않습니다.

**Incorrect (디자인 기준이 아닌 작업에 parity 절차를 강제):**

```md
사용자: Figma 댓글을 CSV로 뽑아줘.
에이전트: visual diff 표와 브라우저 screenshot 검증을 요구함.
```

**Correct (사용 목적을 기준으로 제외):**

```md
사용자: Figma 댓글을 CSV로 뽑아줘.
에이전트: 댓글 추출 작업으로 처리하고 visual parity skill은 사용하지 않음.
```
