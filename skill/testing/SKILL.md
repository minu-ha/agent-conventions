---
name: convention-testing
description: Use when planning, writing, modifying, or explicitly reviewing unit, integration, E2E, smoke, sanity, golden, or visual tests, generated API mocks, fixtures, stories, and test-runner configuration.
metadata:
  author: agent-conventions
  version: "1.1.0"
---

# Testing Convention Router

## 1. 변경 범위 판정

요청, 계획, diff에서 테스트 계약의 실제 변경과 명시적인 검토 범위를 가른다.

**범위에 드는 것**

- 단위, 화면 통합, E2E의 설계, smoke와 sanity 선별, 테스트 코드의 시나리오 구간
- fixture, story, page object, 생성 API mock의 조립, 골든과 이미지 기준값
- 테스트 러너 설정과 실행 결과, 결과서의 검증 범위

**범위에 들지 않는 것**

- 테스트 작업이 없는 프로덕션 코드 변경
- 실행 명령만 설명하거나 기존 결과 파일만 읽는 read-only 문맥
- 이름과 계약이 그대로인 단순 이동에 딸려 온 코드

테스트 추가 여부는 요청과 프로젝트 정책을 따른다. 적용되지 않는 규칙으로 범위를 넓히지 않는다.
폴더 번호, 케이스 ID, 제목 언어, 결과서 형식은 프로젝트 계약을 유지한다.

`convention-typescript`는 항상 함께 활성화한다.
story, harness의 React 렌더, 상태, provider를 바꿀 때만 `convention-react`를 켠다.
스타일시트, 클래스 계약, 토큰을 실제로 바꿀 때만 `convention-css`를 켠다.
locator나 CSS 단언만 쓰는 spec에는 React, CSS를 자동으로 켜지 않는다.

## 2. 인덱스 훑기

활성화한 skill마다 그 `SKILL.md`의 로드 계약을 따른다.
이 skill과 companion 각각의 `RULES_INDEX.md`를 끝까지 훑는다.
이 skill의 인덱스는 [RULES_INDEX.md](./RULES_INDEX.md)이다.
각 규칙의 `appliesWhen`을 변경 범위와 대조하고 첫 match에서 멈추지 않는다.
애매하면 적용되는 쪽으로 본다.

## 3. 규칙 읽고 구현

걸리는 규칙의 `contracts/<id>.md`를 읽는다.
등급이 읽는 범위를 정하고, contract 첫머리가 그 범위를 말한다.

| 등급 | 읽는 범위 |
| --- | --- |
| `CRITICAL` | `rules/NN-MM-<id>.md` 원문을 설명과 예제까지 전부 읽는다. 마무리 전에 결과 코드를 원문의 `Correct` 예제와 다시 대조한다 |
| `HIGH` | 원문을 설명과 예제까지 전부 읽는다 |
| `MEDIUM` | contract에 실린 규범과 첫 `Incorrect`, `Correct` 짝을 읽는다. 판단이 모호하면 원문을 읽는다 |

정확한 원문 경로는 contract의 full rule 링크가 가리킨다.

- `requiresSelected` 대상은 함께 적용한다. 다른 skill의 규칙이면 그 companion도 활성화한다.
- `reviewWith` 대상은 변경 범위에 비춰 다시 판단한다. 자동으로 적용하지는 않는다.
- `completionGate` 규칙은 마무리 시 항상 적용한다. 인덱스가 그 표시를 달아 준다.

걸린 규칙은 등급과 무관하게 전부 지킨다.
등급은 지킬지 말지가 아니라 얼마나 깊이 읽는지를 정한다.

규칙이나 companion이 새로 걸리면 인덱스를 다시 훑는다.
더 걸리는 게 없으면 멈춘다.

## 4. 범위 변경

작업 중 범위가 늘거나 바뀌면 1번부터 다시 판정하고 활성 인덱스를 다시 훑는다.
conditional companion도 다시 판정한다.

## 5. 마무리

변경 diff를 적용한 규칙에 비춰 다시 훑고, 위반이 있으면 file/line과 수정안으로 보고한다.
lint, typecheck, build, 테스트 통과는 컨벤션을 지켰다는 근거가 아니다.

전체 검토를 명시적으로 요청받거나 index, contract가 손상됐을 때만 `rules/*.md`를 번호 순서로 읽는다.
