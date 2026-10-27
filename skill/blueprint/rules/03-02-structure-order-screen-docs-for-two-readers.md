---
title: Order Screen Docs for Two Readers
titleKo: 화면 문서는 두 독자 순서로 짭니다
impact: HIGH
impactDescription: 사람은 위 절만 읽고 결론을 알고 에이전트는 접힌 상세까지 읽어 구현하게 합니다
appliesWhen:
  - 화면 문서를 쓰거나 절을 옮길 때
  - 화면 문서에 새 절을 더할 때
tags: structure, screen, overview
---

## Order Screen Docs for Two Readers

**Impact: HIGH (사람은 위 절만 읽고 결론을 알고 에이전트는 접힌 상세까지 읽어 구현하게 합니다)**

화면 문서는 `::part`로 가른 세 가름입니다. 위는 사람이 먼저 알 것, 아래는 구현할 때만 필요한 것입니다.

| 가름 | 절 | 담는 것 |
| --- | --- | --- |
| `Overview` | `Screen` | 캡처 한 장과 번호 설명 목록 |
| `Overview` | `Decisions` | 큰 결정 셋. 한 줄씩, 번호 링크 |
| `Overview` | `Remaining` | 단계 표와 열린 질문 수 |
| `Screen` | 구역마다 절 | 흐름 Mermaid, 모양 표, 대기와 빈과 오류 상태, 접힌 구현 상세 |
| `Structure` | `Reuse`, `Data and API`, `State`, `Tree`, `Sources` | 가져올 것, endpoint와 조회 흐름, 상태 자리와 경계, 컴포넌트 나무, 읽은 출처 |

절 제목 바로 아래 한 줄이 그 절의 결론입니다. 그 줄만 읽고 넘어가도 되게 씁니다.
구역 절의 치수와 계약은 `:::details[구현 상세]`에 접습니다. 문서 첫 줄은 무슨 화면인지와 상태입니다.
절을 더할 때는 어느 가름에 속하는지 먼저 정합니다. 가름 밖에 절을 두지 않습니다.

**Correct (세 가름과 절 순서를 갖춘 화면 문서 틀입니다. 복사해 시작합니다):**

<<< ../examples/structure-order-screen-docs-for-two-readers/01-correct.markdown
