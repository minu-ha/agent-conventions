---
name: convention-playwright-test
description: Playwright 브라우저 테스트를 작성하거나 수정할 때, integration과 e2e 경계, locator 선택, waiting, mocking, 데이터 고립 규칙을 함께 적용해야 하면 사용합니다.
---

# Playwright 테스트 컨벤션

## 사용할 때
- Playwright spec, 테스트 helper, 공용 support 파일을 수정할 때 사용합니다.
- Integration과 E2E 범위를 의도적으로 나눠야 할 때 사용합니다.
- locator, wait, seed, cleanup 방식이 바뀔 때 사용합니다.

## 함께 읽을 것
- 상세 규칙은 `./playwright-test.md`를 읽습니다.
- 테스트가 화면 동작이나 라우팅 규칙과 강하게 묶이면 `convention-react`나 `convention-tanstack-route`를 함께 사용합니다.

## 중점 확인 항목
- Integration과 E2E 경계
- 테스트 파일명과 배치
- setup과 cleanup 가시성
- web-first locator와 assertion
- 상태 기반 waiting

## 리뷰 체크리스트
- 한 파일 안에 하나의 테스트 레벨만 들어 있는가
- mocking과 실제 백엔드 사용이 선언한 테스트 레벨과 맞는가
- setup이 숨지 않고 명시적으로 드러나는가
- wait가 시간 기반이 아니라 상태 기반인가
- 공유 데이터를 파괴적으로 건드리지 않는가
