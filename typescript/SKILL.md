---
name: convention-typescript
description: TypeScript 파일을 수정할 때, 네이밍, import 구조, 타입 선언, helper 분리, 결측값 처리, JSDoc 규칙을 함께 적용해야 하면 사용합니다.
---

# TypeScript 컨벤션

## 사용할 때
- 일반 TypeScript 모듈, 유틸 파일, 설정 파일, React가 아닌 `*.ts` 파일을 수정할 때 사용합니다.
- 네이밍, import 구조, 타입 재사용, helper 분리, 옵셔널 값 처리 규칙이 중요한 변경에 사용합니다.

## 함께 읽을 것
- 상세 규칙은 `./typescript.md`를 읽습니다.
- React, TanStack Route, NestJS 같은 프레임워크 영역이라면 해당 전용 skill을 함께 사용합니다.

## 중점 확인 항목
- 네이밍과 import 구조
- 함수 타입과 콜백 시그니처
- 타입 중복 제거
- helper 분리 기준
- 결측값의 명시적 처리
- JSDoc 및 주석 규칙

## 리뷰 체크리스트
- import가 직접적이고 추적 가능한가
- 기존 타입을 복제하지 않고 재사용하는가
- helper 분리가 계약이나 재사용을 근거로 이루어졌는가
- 결측값을 의도적으로 처리하는가
- 주석이 문법 설명이 아니라 경계와 의도를 설명하는가
