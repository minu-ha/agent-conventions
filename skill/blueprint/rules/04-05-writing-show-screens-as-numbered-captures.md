---
title: Show Screens as Numbered Captures
titleKo: 화면은 번호 붙인 캡처로 보여 줍니다
impact: HIGH
impactDescription: 손으로 그린 목업을 유지하는 비용을 없애고 질문 자리를 캡처 위 번호로 바로 가리키게 합니다
appliesWhen:
  - 설계 문서에서 화면 모양이나 질문 자리를 보여 줄 때
  - 화면 목업을 HTML이나 표로 손수 그리려 할 때
tags: writing, capture, figure, playwright
---

## Show Screens as Numbered Captures

**Impact: HIGH (손으로 그린 목업을 유지하는 비용을 없애고 질문 자리를 캡처 위 번호로 바로 가리키게 합니다)**

화면은 캡처 한 장과 번호 설명 목록으로 보여 줍니다. 목업을 HTML이나 표로 손수 그리지 않습니다.

| 캡처 | 방법 |
| --- | --- |
| Figma 프레임 | REST `GET /v1/images/{key}?ids=…&scale=1&format=png`. 토큰은 git 밖 파일, 출력에 찍지 않음 |
| 앱 화면 | preview 빌드 위에 Playwright. 세션을 심고 구역을 clip |

번호는 캡처에 굽습니다. Playwright가 구역 위에 번호 배지를 DOM으로 꽂은 뒤 찍으면 이미지 후처리가 없습니다.
캡처는 `img/<화면>/`에 두고 설명은 번호 목록으로 씁니다. 값은 자리 예시이고 모양 정답은 Figma입니다.
앱 캡처 폭은 1600입니다. 긴 화면은 구역마다 찍습니다.

**Incorrect 1 (목업을 표와 HTML로 손수 그려 화면이 바뀔 때마다 다시 그립니다):**

<<< ../examples/writing-show-screens-as-numbered-captures/01-incorrect.markdown

**Correct 1 (캡처 한 장과 번호 목록으로 보여 줍니다):**

<<< ../examples/writing-show-screens-as-numbered-captures/02-correct.markdown

**Correct (Figma 프레임을 REST로 받아 캡처 폴더에 둡니다):**

<<< ../examples/writing-show-screens-as-numbered-captures/03-correct.mjs

**Correct (preview 빌드 위에서 구역에 번호 배지를 꽂고 찍습니다):**

<<< ../examples/writing-show-screens-as-numbered-captures/04-correct.mjs
