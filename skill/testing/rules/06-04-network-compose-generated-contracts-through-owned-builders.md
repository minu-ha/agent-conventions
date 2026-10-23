---
title: Compose Generated Contracts through Owned Builders
titleKo: 생성 계약 위에 도메인 mock과 endpoint handler를 조립합니다
impact: HIGH
impactDescription: API 재생성에 맞춰 타입과 응답 형식을 유지하고 시나리오 값을 일관되게 만듭니다
appliesWhen:
  - API 생성기의 DTO, faker, MSW 산출물을 연결하거나 그 위의 소유 mock을 조립할 때
requiresSelected: data-build-small-valid-typed-fixtures
tags: testing, network, kubb, faker, msw
---

## Compose Generated Contracts through Owned Builders

**Impact: HIGH (API 재생성에 맞춰 타입과 응답 형식을 유지하고 시나리오 값을 일관되게 만듭니다)**

### 작성 순서와 소유 경계

생성기를 사용하는 프로젝트에서는 다음 순서로 실제 산출물의 계약을 조립합니다.
생성하지 않는 프로젝트는 기존의 타입 기반 fixture와 handler를 사용합니다.

1. OpenAPI와 생성 설정에서 DTO, status별 factory, handler signature를 확인합니다.
2. 소유 domain builder에서 DTO faker를 호출하고 관찰되는 값과 관계를 고정합니다.
3. 소유 endpoint handler에서 요청을 읽고 상태와 해당 status의 응답 factory를 선택합니다.
4. registry에서 소유 handler를 생성 fallback 앞에 둡니다.
5. 브라우저와 Node에 같은 registry를 연결한 뒤 story와 spec에서 필요한 차이만 덮습니다.

생성 폴더는 재생성으로 갱신하고 손으로 보정하지 않습니다.
도메인 builder는 값과 관계를 계산하고 Response, handler, HTTP 상태를 가져오지 않습니다.
endpoint handler는 요청과 상태를 맡고 표, 정렬, 수치 계산은 builder에 둡니다.
입력 파싱을 handler가 먼저 하거나 URL을 builder에 넘기는 방식은 프로젝트 계약에 맞춥니다.

### 결정적인 응답과 재생성

실제 화면이 호출하는 endpoint는 소유 handler에서 관찰되는 값을 결정합니다.
생성 fallback이 존재한다는 이유로 난수 응답을 정상 시나리오에 그대로 사용하지 않습니다.
정상 fixture에는 성공 status factory를 쓰고 오류 사례에는 그 오류 status factory를 씁니다.
여러 상태의 union을 만드는 범용 Response factory가 기본값을 합쳐 준다고 가정하지 않습니다.

재사용할 정상 본문은 builder에 두고 빈 목록, 401, 500 등 사례의 차이는 spec에서 덮습니다.
spec에서 같은 정상 본문이나 endpoint URL을 반복 작성하지 않습니다.
스펙 밖 API만 직접 handler를 만들고 생성된 endpoint와 그 이유를 구분합니다.

재생성 뒤에는 생성물 diff, 소유 builder의 타입, handler의 응답, 실제 소비 테스트를 확인합니다.
factory 이름과 합치기 방식은 설치 버전과 산출물에서 확인하며 예제 이름을 그대로 추측하지 않습니다.

참고: [Kubb MSW](https://docs.kubb.dev/extensions/kubb-labs/plugin-msw/options),
[Kubb Faker](https://docs.kubb.dev/extensions/kubb-labs/plugin-faker/options).

**Incorrect 1 (spec에서 생성 계약과 무관한 정상 본문을 직접 작성합니다):**

<<< ../examples/network-compose-generated-contracts-through-owned-builders/01-incorrect.test.ts

**Correct 1 (생성 DTO, 성공 응답, handler를 소유 경계별 파일에서 조립합니다):**

<<< ../examples/network-compose-generated-contracts-through-owned-builders/02-correct.ts
<<< ../examples/network-compose-generated-contracts-through-owned-builders/03-correct.ts
<<< ../examples/network-compose-generated-contracts-through-owned-builders/04-correct.ts

**Correct (오류 상태만 생성된 status factory로 덮고 story의 실제 화면을 확인합니다):**

<<< ../examples/network-compose-generated-contracts-through-owned-builders/05-correct.test.ts
