---
name: convention-css
description: CSS 파일이나 TSX 클래스 조합을 수정할 때, 네이밍, selector 깊이, wrapper 기반 스타일링, 상태 modifier 규칙을 함께 적용해야 하면 사용합니다.
---

# CSS 컨벤션

## 사용할 때
- CSS 파일을 수정할 때 사용합니다.
- TSX의 클래스 조합, wrapper 스타일링, selector 구조가 바뀔 때 사용합니다.
- 디자인 시스템 래퍼나 서드파티 DOM을 제어된 방식으로 스타일링해야 할 때 사용합니다.

## 함께 읽을 것
- 상세 규칙은 `./css.md`를 읽습니다.
- JSX 구조와 스타일 조합이 함께 바뀌면 `convention-react`를 함께 사용합니다.
- route 레벨 스타일이나 route 로컬 스타일이 바뀌면 `convention-tanstack-route`를 함께 사용합니다.

## 중점 확인 항목
- 소유자 기반 네이밍
- TSX 안의 클래스 조합 방식
- 플랫한 selector 구조
- 서드파티 DOM에 대한 wrapper 기반 스타일링
- 토큰 및 CSS 변수 사용

## 리뷰 체크리스트
- 클래스명이 소유자를 기준으로 추적 가능하게 지어졌는가
- 구조 차이를 임의 modifier로 표현하지 않았는가
- selector 깊이가 얕고 예측 가능한가
- 서드파티 스타일링이 명시적인 wrapper 아래에서 제한되는가
- 재사용되는 값은 토큰이나 변수로 관리되는가
