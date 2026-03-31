---
name: convention-nestjs
description: NestJS module, controller, service, DTO, Prisma 접근 코드, NestJS 테스트를 수정할 때 레이어 경계와 API 계약 규칙을 적용해야 하면 사용합니다.
---

# NestJS 컨벤션

## 사용할 때
- NestJS module, controller, service, DTO, Prisma 접근 계층, NestJS 테스트를 수정할 때 사용합니다.
- controller/service 경계, DTO 재사용, 에러 처리, 백엔드 테스트 범위를 일관되게 유지해야 할 때 사용합니다.

## 함께 읽을 것
- 상세 규칙은 `./nestjs.md`를 읽습니다.
- 일반 TypeScript 규칙은 `convention-typescript`를 함께 사용합니다.

## 중점 확인 항목
- 모듈 및 파일 구조
- controller와 service의 책임 경계
- DTO 경계와 타입 재사용
- 에러 처리와 결측값 처리
- unit/e2e 백엔드 테스트

## 리뷰 체크리스트
- controller가 얇게 유지되고 비즈니스 로직을 가지지 않는가
- service가 도메인 로직과 데이터 접근 orchestration을 담당하는가
- DTO와 Prisma 타입을 의도적으로 재사용하는가
- 에러와 결측 상태를 명시적으로 처리하는가
- 테스트 레벨과 파일 배치가 변경된 동작과 맞는가
