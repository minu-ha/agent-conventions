---
title: Do Not Confuse Static Labels with Server Data
impact: HIGH
impactDescription: Figma의 고정 라벨과 섹션 제목을 데이터라는 이유로 방치하지 않게 함
tags: data, labels, copy
---

## Do Not Confuse Static Labels with Server Data

**Impact: HIGH (Figma의 고정 라벨과 섹션 제목을 데이터라는 이유로 방치하지 않게 함)**

Figma static label을 서버 데이터라고 착각해서 맞추지 않는 것도 오류입니다.
버튼 텍스트,
column header,
tab label,
empty state,
section heading은 제품 copy이므로 Figma 또는 사용자 지시를 기준으로 맞춥니다.
애매하면 먼저 "static copy 후보"와 "dynamic data 후보"로 분류해 보고합니다.

**Incorrect (고정 라벨을 데이터라고 보고 방치):**

```md
Figma: "활성 포지션"
현재 구현: "운영중"
판단: 서버에서 내려오는 것 같으니 변경하지 않음.
```

**Correct (visible static label은 Figma 기준으로 맞춤):**

```md
Figma: "활성 포지션"
현재 구현: "운영중"
판단: 탭 라벨은 static UI copy이므로 Figma 기준으로 "활성 포지션"에 맞춤.
```
