---
name: convention-react
description: React 또는 TSX 파일을 수정할 때, 컴포넌트 경계, props 타입, 이벤트 핸들러 흐름, 파생값 위치, 원격 데이터 처리 규칙을 함께 적용해야 하면 사용합니다.
---

# React 컨벤션

## 사용할 때
- React 컴포넌트, 화면 파일, TSX 렌더링 흐름, React 인접 `*.ts` 파일을 수정할 때 사용합니다.
- 컴포넌트 경계, props 타입, 이벤트 핸들러 형태, 파생값 위치, React Query 스타일의 데이터 흐름이 중요한 변경에 사용합니다.

## 함께 읽을 것
- 상세 규칙은 `./react.md`를 읽습니다.
- 일반 TypeScript 규칙은 `convention-typescript`를 함께 사용합니다.
- 스타일, `className`, CSS import가 바뀌면 `convention-css`를 함께 사용합니다.
- route 파일이나 router API가 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- Playwright 테스트 범위가 바뀌면 `convention-playwright-test`를 함께 사용합니다.

## 중점 확인 항목
- 공용 컴포넌트와 화면 전용 코드의 소유 경계
- 함수 타입과 콜백 시그니처 선언 방식
- JSX 가독성과 핸들러 분리
- 파생 데이터 위치와 원본 추적성
- helper 분리 기준
- JSDoc 및 주석 규칙

## 리뷰 체크리스트
- 공용 컴포넌트와 화면 전용 코드의 책임이 섞이지 않았는가
- 핵심 핸들러 로직이 JSX 안에 숨지 않고 읽기 쉬운가
- 파생값이 실제 사용하는 렌더링 위치 가까이에 있는가
- 원격 데이터와 store 값의 출처가 여전히 드러나는가
- 결측값이 무심코 숨겨지지 않고 의도적으로 처리되는가
