---
name: convention-springboot
description: Use when editing Spring Boot controllers, services, modules, entities or DTOs, repositories, API design, or backend architecture and review flow.
---

# Springboot 컨벤션

## 사용할 때

다음 상황에서 반드시 참고한다:

- 신규 API / 도메인 / 모듈 개발 시
- 기존 코드 리팩토링 시
- 코드 리뷰 수행 시 (리뷰 기준으로 활용)
- 아키텍처 / 레이어 구조 변경 시
- 공통 모듈 또는 인프라 코드 작성 시

---

## 활성화 체크리스트

- 변경 범위가 Controller, Service, Repository, DTO/Entity, 트랜잭션, 예외 처리, API 설계, 모듈 구조에 걸리는지 먼저 확인한다.
- 이 skill이 활성화되면 상세 규칙 문서인 [springboot.md](./springboot.md)를 먼저 읽고, HTTP 계약이나 요청/응답 설계가 바뀌면 [api.md](./api.md)도 반드시 함께 읽는다.
- 프론트엔드와 공유하는 API 계약이나 테스트 경계가 같이 바뀌면, 해당 프로젝트의 프론트엔드 또는 테스트 skill도 함께 참고한다.

---

## 함께 읽을 것

- 상세 규칙은 [springboot.md](./springboot.md)를 읽습니다.
- API 설계 규칙은 [api.md](./api.md)를 참고합니다.

---

## 마무리 전 셀프 리뷰

- Controller에 비즈니스 로직이 새어 들어가지 않았는지, DTO/Entity 분리와 트랜잭션 범위가 적절한지 다시 확인한다.
- API 계약을 바꿨는데 [api.md](./api.md) 검토를 빼먹지 않았는지, 프론트엔드와 공유하는 계약 변경이 있다면 관련 skill을 함께 참고했는지 점검한다.

---

## 리뷰 체크리스트

코드 리뷰 시 아래 항목을 기준으로 반드시 확인한다:

- Controller에 비즈니스 로직이 들어가 있지 않은가
- DTO / Entity 분리가 되어 있는가
- 트랜잭션 범위가 적절한가
- 예외 처리 방식이 일관적인가
- 네이밍이 도메인 의미를 정확히 표현하는가
- 불필요한 추상화 / 인터페이스가 존재하지 않는가
- N+1 또는 성능 이슈 가능성이 없는가
- null 처리 및 Optional 사용이 안전한가
- 코드 상에 수준에 맞는 로깅 레벨을 지정하였는가
- TODO / FIXME가 방치되어 있지 않은가
