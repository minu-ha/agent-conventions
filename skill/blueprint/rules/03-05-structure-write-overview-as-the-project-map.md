---
title: Write Overview as the Project Map
titleKo: overview는 프로젝트 지도로 씁니다
impact: HIGH
impactDescription: 화면 문서마다 되풀이될 라우트, 계층, 규약을 한 곳에 두고 규약 본문은 베끼지 않게 합니다
appliesWhen:
  - overview 문서를 쓸 때
  - 화면 문서에 프로젝트 전체의 라우트, 계층, 규약을 적으려 할 때
tags: structure, overview, map
---

## Write Overview as the Project Map

**Impact: HIGH (화면 문서마다 되풀이될 라우트, 계층, 규약을 한 곳에 두고 규약 본문은 베끼지 않게 합니다)**

`overview.md`는 모든 화면 문서의 바닥입니다. 화면 문서에 되풀이될 것을 여기 한 번만 적습니다.

| 절 | 담는 것 |
| --- | --- |
| `Overview` | 화면 지도 표. 화면, 라우트, 문서 링크, 상태. 지금 단계 |
| `Routes` | 라우트 나무와 공통 틀 |
| `Layers` | 폴더 계층과 소유자 규칙 가운데 프로젝트 예외 |
| `Data and API` | spec 판, 생성 명령, endpoint 수, 앱이 부르는 것과 안 부르는 것 |
| `Materials` | 재료 정답표 |
| `Conventions` | 적용하는 skill 이름과 프로젝트 예외만 |
| `Site` | 문서 사이트 주소와 빌드 명령 |

skill이 정한 규약은 베끼지 않고 skill 이름으로 가리킵니다. 프로젝트가 다르게 정한 예외만 적습니다.
화면 문서가 라우트, 계층, 규약을 적으려 하면 여기로 링크합니다.

**Incorrect 1 (skill 규약 본문을 overview에 베껴 규약이 두 곳에서 다르게 늙습니다):**

<<< ../examples/structure-write-overview-as-the-project-map/01-incorrect.markdown

**Correct 1 (지도와 정답표, skill 링크와 프로젝트 예외만 적는 overview 틀입니다):**

<<< ../examples/structure-write-overview-as-the-project-map/02-correct.markdown
