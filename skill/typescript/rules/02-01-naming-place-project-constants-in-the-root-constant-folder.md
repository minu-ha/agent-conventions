---
title: Place Project-wide Constants in the Root `constant` Folder
titleKo: 프로젝트 전반의 상수는 루트 `constant` 폴더에 주제별 파일로 둡니다
impact: HIGH
impactDescription: 프로젝트 전반의 상수를 주제별로 모아 위치와 이름을 일관되게 유지합니다
appliesWhen:
  - 프로젝트 전반이 쓰는 URL 경로, 페이지 크기, 표시 문구, 기준값을 추가, 이동, 중복 정의할 때
  - 루트 `constant` 폴더의 파일이나 상수 이름을 바꿀 때
reviewWith: naming-place-owner-constants-in-the-owner-constant-folder, naming-use-direct-imports-and-public-entry-points
tags: naming, constant
---

## Place Project-wide Constants in the Root `constant` Folder

**Impact: HIGH (프로젝트 전반의 상수를 주제별로 모아 위치와 이름을 일관되게 유지합니다)**

### 상수 자리 고르기

상수 위치는 사용처 수가 아니라 소유자로 정합니다.
소유자를 지워도 값이 남는지 먼저 보고, 남으면 배포 환경마다 달라지는지에 따라 자리를 고릅니다.

```mermaid
flowchart LR
	q1{"소유자를 지워도<br>값이 남는가?"} -- 예 --> q2{"배포 환경마다<br>달라지는가?"} -- 예 --> r3("config 폴더")
	q1 -- 아니요 --> r1("소유자 _constant 폴더")
	q2 -- 아니요 --> r2("루트 constant 폴더")
```

| 소유 범위 | 파일 | 이름 |
| --- | --- | --- |
| 프로젝트 전반 | `constant/<주제>.ts` | `<주제>_<이름>` |
| 한 소유자 | `<owner>/_constant/<주제>.ts` | `<주제>_<이름>` |

`chart_axis_tick_count`는 화면과 함께 사라지고, `api_request_timeout_ms`는 서버 통신에 남습니다.
사용처가 늘거나 줄어도 이 기준은 바뀌지 않습니다.
소유자 전용 배치는 `naming-place-owner-constants-in-the-owner-constant-folder`를 따릅니다.

### 선언과 내보내기

| 선언 대상 | 규범 |
| --- | --- |
| 파일, 상수 이름 | 파일마다 주제를 하나 정하고 상수에 주제 접두사를 붙입니다. 한 단어 상수는 만들지 않습니다 |
| 내보내기 | 모듈 스코프에서 상수마다 이름 붙여 내보냅니다. `config` 같은 색인 객체로 묶지 않습니다 |
| 객체, 배열 값 | 함께 읽히는 값이면 상수 하나로 둡니다. 펼치는 것은 내보낼 이름이지 값의 구조가 아닙니다 |
| 사용자에게 보이는 문장 | `copy_empty_value_text`처럼 `copy` 주제로 모아 번역 파일로 옮기기 쉽게 둡니다 |
| 환경마다 달라지는 값, 기능 플래그 | `naming-read-environment-values-through-config-env`에 따라 `config`에 둡니다 |
| 색상, 간격 등 디자인 토큰 | 스타일시트의 CSS 변수를 단일 출처로 둡니다 |

파일, 심볼 표기는 `naming-use-consistent-file-and-symbol-naming`을 따릅니다.
색인 객체는 수동 관리가 필요하고 번들러의 미사용 속성 제거도 어려워질 수 있습니다.
`constant`에는 코드와 함께 바뀌는 값만 둡니다.

**Incorrect 1 (프로젝트 전반의 값을 쓰는 자리에서 선언합니다):**

<<< ../examples/naming-place-project-constants-in-the-root-constant-folder/01-incorrect-1.ts

<<< ../examples/naming-place-project-constants-in-the-root-constant-folder/01-incorrect-2.ts

**Correct 1 (루트 `constant` 폴더에 둔 이름을 쓰는 자리에서 가져옵니다):**

<<< ../examples/naming-place-project-constants-in-the-root-constant-folder/02-correct-1.ts

<<< ../examples/naming-place-project-constants-in-the-root-constant-folder/02-correct-2.ts

**Incorrect 2 (객체 하나에 모아 색인을 손으로 유지합니다):**

<<< ../examples/naming-place-project-constants-in-the-root-constant-folder/03-incorrect.ts

**Correct 2 (주제 파일에 상수를 하나씩 이름 붙여 내보냅니다):**

<<< ../examples/naming-place-project-constants-in-the-root-constant-folder/04-correct.ts
