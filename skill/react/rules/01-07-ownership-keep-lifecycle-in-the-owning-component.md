---
title: Keep Library Lifecycle in the Owning Component
titleKo: 라이브러리 생명주기는 소유 컴포넌트에서 관리합니다
impact: MEDIUM
impactDescription: 외부 라이브러리의 생명주기와 실행 흐름을 소유 컴포넌트에서 확인할 수 있습니다
appliesWhen:
  - 외부 라이브러리 인스턴스 생성, 크기 변경, 구독, 정리를 한 컴포넌트가 소유할 때
  - 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때
  - 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우
reviewWith: ownership-prefer-plain-ts-for-local-react-helpers
tags: ownership, hooks
---

## Keep Library Lifecycle in the Owning Component

**Impact: MEDIUM (외부 라이브러리의 생명주기와 실행 흐름을 소유 컴포넌트에서 확인할 수 있습니다)**

외부 라이브러리의 인스턴스 생성, 크기 변경, 이벤트 구독, 정리는 하위 트리를 소유한 컴포넌트에 둡니다.
파일 분량을 줄이려고 생명주기를 커스텀 훅으로 옮기지 않습니다.

| 상황 | 처리 |
| --- | --- |
| 한 소유자만 쓰는 생명주기 | 해당 컴포넌트의 이펙트에 둡니다 |
| 여러 소유자가 같은 생명주기 계약을 실제로 호출함 | 훅으로 추출합니다 |
| 파일이 길어짐 | 생명주기 대신 도메인 계산을 `_function`으로 분리합니다 |
| 이펙트 정리, 재설치 | 정리할 때 인스턴스 참조를 비우고 다시 설치할 때 새로 만듭니다. 상태에 남은 폐기된 인스턴스를 재사용하지 않습니다 |

**Incorrect 1 (파일 분량을 줄이려고 생명주기를 훅으로 옮깁니다):**

<<< ../examples/ownership-keep-lifecycle-in-the-owning-component/01-incorrect.tsx

**Correct 1 (생명주기를 소유 컴포넌트가 직접 가집니다):**

<<< ../examples/ownership-keep-lifecycle-in-the-owning-component/02-correct.tsx
