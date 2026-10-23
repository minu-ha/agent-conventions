---
title: Keep Snapshots Stable Small and Reviewed
titleKo: 작고 의미가 남는 기준값을 검토합니다
impact: HIGH
impactDescription: 변경의 의미를 확인할 수 있고 정규화로 중요한 차이를 숨기지 않습니다
appliesWhen:
  - JSON 골든, snapshot, serializer, 기준값 갱신을 추가하거나 바꿀 때
tags: testing, baseline
---

## Keep Snapshots Stable Small and Reviewed

**Impact: HIGH (변경의 의미를 확인할 수 있고 정규화로 중요한 차이를 숨기지 않습니다)**

기준값은 안정된 입력에서 만든 검토 가능한 크기의 결과를 저장합니다.
무작위 값, 생성 시각, 무관한 런타임 정보는 통제하고 계약에 필요한 필드는 비교에 남깁니다.

긴 문자열을 길이로 바꾸거나 필드를 지우면 같은 길이의 잘못된 결과도 통과할 수 있습니다.
정규화는 계약과 무관한 차이만 제거하고 숨겨지는 중요한 속성은 별도 단언으로 보완합니다.
큰 snapshot만으로 핵심 경계값의 구체적인 단언을 대신하지 않습니다.

기준값 변경은 의도한 동작 변경을 확인한 뒤 diff를 검토합니다.
실패를 없애기 위해 일괄 갱신하지 않고 기준값 파일을 관련 변경과 함께 검토 대상으로 남깁니다.

참고: [공식 문서](https://vitest.dev/guide/snapshot).

**Incorrect 1 (결과 문자열의 길이만 비교해 내용 변경을 놓칩니다):**

<<< ../examples/baseline-keep-snapshots-stable-small-and-reviewed/01-incorrect.test.ts

**Correct 1 (계약에 필요한 구조와 값을 기준값에 남깁니다):**

<<< ../examples/baseline-keep-snapshots-stable-small-and-reviewed/02-correct.test.ts
