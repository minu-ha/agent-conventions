---
title: Describe One Observable Behavior
titleKo: 조건과 결과로 테스트 하나를 설명하고 GIVEN, WHEN, THEN으로 구간을 나눕니다
impact: HIGH
impactDescription: 실패한 제목만으로 깨진 동작과 필요한 사전조건을 찾을 수 있습니다
appliesWhen:
  - 테스트 제목, 본문 구간, describe, step을 추가하거나 시나리오를 나눌 때
  - GIVEN, WHEN, THEN 블록 주석을 새로 쓰거나 그 형식을 바꿀 때
tags: testing, case
---

## Describe One Observable Behavior

**Impact: HIGH (실패한 제목만으로 깨진 동작과 필요한 사전조건을 찾을 수 있습니다)**

제목은 조건과 관찰 가능한 결과를 설명하고 테스트 하나는 그 동작에 필요한 준비, 실행, 검증을 담습니다.
하나의 표시 계약에 속한 여러 필드나 부수효과는 같은 테스트에서 함께 단언할 수 있습니다.

### 시나리오 표기

실행 사례의 기본 표기는 GIVEN, WHEN, THEN 블록 주석입니다.
라벨 다음 줄에 그 사례의 조건, 행동, 결과를 한국어 명사구로 적습니다.
짧은 unit, integration, E2E, 골든 예제에도 같은 표기를 보여 줍니다.

| 구간 | 담는 것 |
| --- | --- |
| GIVEN | 입력, 응답 덮어쓰기, 세션 등 사전조건 |
| WHEN | 검증할 함수 호출, mount, 사용자 조작 |
| THEN | 반환값, DOM, URL 등 관찰 가능한 결과의 단언 |

리터럴 호출에 별도 준비가 없으면 WHEN, THEN만 남길 수 있습니다.
이미 그려진 상태만 확인하면 GIVEN, THEN만 남길 수 있습니다.
짧다는 이유로 실제 존재하는 구간을 숨기거나 빈 구간을 채우려고 불필요한 코드를 만들지 않습니다.
fixture와 test.each가 준비한 조건도 출처를 설명하고 주석을 위해 별칭을 만들지 않습니다.
fixture, handler, story 선언과 러너 설정 자체에는 실행 사례처럼 세 구간을 붙이지 않습니다.

### 여러 단계와 결과서

독립적인 실패 원인이면 테스트를 나누거나 입력별로 이름이 남는 매개변수화를 사용합니다.
같은 여정의 여러 바퀴는 시나리오 문장이 있는 test.step으로 나눕니다.
trace에 단계가 필요하면 step에도 GIVEN, WHEN, THEN과 의미를 적고 주석과 중복하지 않습니다.
주석과 step을 결과서로 읽는 프로젝트에서는 파서가 지원하는 형식을 유지합니다.
GWT 주석을 위해 Cucumber나 별도 BDD 러너를 추가하지 않습니다.

참고: [Gherkin의 조건, 행동, 결과](https://cucumber.io/docs/gherkin/reference/).

**Incorrect 1 (이름만으로 어떤 조건이 깨졌는지 알 수 없습니다):**

<<< ../examples/case-describe-one-observable-behavior/01-incorrect.test.ts

**Correct 1 (제목과 본문이 같은 표시 동작을 설명합니다):**

<<< ../examples/case-describe-one-observable-behavior/02-correct.test.ts
