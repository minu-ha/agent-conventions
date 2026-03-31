# NestJS 컨벤션

## 목적
이 문서는 NestJS 프로젝트에서 모듈 구조, controller/service 경계, DTO 설계, Prisma 접근, 테스트 전략을 일관되게 유지하기 위한 공용 기준입니다.

## 핵심 원칙
- 레이어 책임을 명확히 하고 단방향 의존을 유지합니다.
- DTO와 validation을 통해 API 계약을 드러냅니다.
- controller에서 persistence 접근을 직접 하지 않습니다.
- 기존 타입을 재사용하고 구조가 같은 타입을 중복 선언하지 않습니다.
- 결측값과 도메인 에러를 명시적으로 처리합니다.

## 파일과 네이밍
- 파일명은 `kebab-case`를 사용하고 `.module.ts`, `.controller.ts`, `.service.ts`, `.dto.ts` 같은 역할 suffix를 포함합니다.
- 각 도메인은 자기 모듈 폴더를 가집니다.
- 여러 도메인에서 실제로 재사용되는 코드만 명시적인 shared 모듈로 올립니다.
- barrel export는 피하고 실제 파일 경로를 직접 import 합니다.

## 레이어 경계
- controller는 요청을 받고, validation/parse를 프레임워크 도구에 위임하고, 실제 비즈니스 처리는 service에 넘깁니다.
- controller는 Prisma나 persistence API를 직접 호출하지 않습니다.
- service는 비즈니스 로직, 도메인 규칙, 트랜잭션 orchestration, 에러 매핑을 담당합니다.
- 의존 방향은 controller -> service -> persistence 경계를 유지합니다.

## DTO와 타입 규칙
- 요청 본문, query, param 계약은 request DTO를 사용합니다.
- public API 계약을 persistence shape와 분리해야 하면 response DTO를 사용합니다.
- 생성된 persistence 타입이나 기존 타입을 우선 재사용하고, 구조가 같은 타입을 새로 만들지 않습니다.
- 범위가 작고 지역적인 값 집합은 enum보다 union 또는 객체 리터럴을 먼저 검토합니다.
- 커스텀 타입과 인터페이스는 의도가 이름만으로 충분하지 않으면 문서화합니다.

## 함수와 에러 처리
- service 메서드는 읽기 쉬운 단일 책임으로 유지합니다.
- 비동기 흐름은 실패 경로가 추적 가능하게 작성합니다.
- 미존재 데이터, 잘못된 상태, 도메인 규칙 위반은 넓은 폴백으로 숨기지 않고 명시적으로 드러냅니다.
- controller마다 제각각 처리하지 말고, service 경계에서 프로젝트 일관성에 맞는 예외를 던집니다.

## 주석과 JSDoc
- export service, 중요한 service 메서드, DTO, 계약이 분명하지 않은 helper에는 필요할 때 JSDoc을 추가합니다.
- service 메서드와 내부 계약에는 `@summary`를 사용합니다.
- persistence query block처럼 왜 필요한지 설명이 필요한 경계에는 `@description`을 사용합니다.
- 인라인 주석은 의도와 경계 설명에 집중합니다.

## 테스트 전략
- service와 순수 도메인 로직은 unit test로 검증합니다.
- controller wiring, validation, auth, framework integration은 e2e 또는 slice test로 검증합니다.
- 버그 수정이나 레이어 경계 변경이 있으면 해당 동작을 재현하는 테스트를 추가합니다.

## 리뷰 체크리스트
- controller가 얇게 유지되고 오케스트레이션 중심 로직은 service에 있는가
- DTO가 public contract를 명확하게 드러내는가
- persistence 접근이 service 경계 뒤에 있는가
- 결측값과 에러 처리가 명시적인가
- 변경된 동작에 맞는 테스트가 추가되었는가
