---
title: Rule Title Here
titleKo: 사람이 화면에서 읽을 한국어 제목
impact: MEDIUM
impactDescription: 영향도 설명. ~합니다 로 끝나는 한 문장
appliesWhen:
  - 이 규칙이 걸리는 변경 항목. 결론이 아니라 관찰 가능한 조건을 ~할 때 로 끝맺는다
  - 제외: 로 시작하면 걸리지 않는 조건을 뜻하고 ~경우 로 끝맺는다
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (영향도 설명. ~합니다 로 끝나는 한 문장)**

첫 한두 문장에 결론과 이유를 `~합니다`로 쓴다.
조건별 선택은 2~3열 표로 비교하고, 같은 내용을 문단으로 반복하지 않는다.
예외는 해당 조건과 함께 적는다. 긴 설명의 압축 · 분리 기준은 CONTRIBUTING.md 3.4절을 따른다.

규범과 예외는 첫 `Incorrect` 앞에서 끝낸다. 이후에는 예시 라벨과 코드 펜스, 빈 줄만 둔다.
판단 순서나 폴더 구조는 `Correct` 예제의 `text` 코드 블록으로 보여 준다.
흐름도의 판단 조건은 위 본문에도 남겨 `contracts/*.md`에서 빠지지 않게 한다.
같은 판단을 보여 주는 `Incorrect`와 `Correct`는 한 쌍으로 붙인다.

<!--
frontmatter 키와 appliesWhen 작성 기준은 CONTRIBUTING.md 3절 참고.
  appliesWhen           걸리는 조건 항목 목록. 규칙의 결론이 아니라 diff에서 관찰 가능한 것.
                        라우팅용 문장은 항목을 이어 붙여 자동 생성되고 합쳐서 160자 이내
  requiresSelected      이 규칙이 걸리면 반드시 함께 적용할 규칙
  reviewWith            함께 다시 판단해 볼 규칙. 자동 적용 아님
  requiredOnCompletion  마무리 시 항상 적용하는 규칙에만
대상이 없는 키는 생략한다.
같은 target을 두 키에 넣지 않는다.
이 주석은 새 규칙을 만든 뒤 지운다.
-->

**Incorrect (무엇이 문제인지 `~합니다` 로):**

```ts
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지 `~합니다` 로):**

```ts
// 좋은 예시
```
