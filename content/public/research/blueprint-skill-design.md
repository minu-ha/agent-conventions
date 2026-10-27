---
name: Blueprint skill design
label: 2026-10-27 설계 문서. sk-ax-gas-pp 의 블루프린트 과정을 skill/blueprint 와 for-humanity 문서로 옮기는 설계
group: Research
order: 50
---

:::note[기록 시점]
2026-10-27. sk-ax-gas-pp 구현이 끝나 가는 시점에 `.ignore/blueprint/` 일곱 문서와 README, 세션 기억, for-humanity 0.23.1 의 부품과 로드맵을 읽고 정한 설계다.
대상 저장소는 셋이다. 문서 도구 for-humanity, 스킬 저장소 agent-conventions, 그리고 이 과정을 처음 적용할 다음 프로젝트.
:::

다음 프로젝트부터 팀이 같은 방식으로 화면을 설계하고 구현하기 위한 과정을 스킬로 만든다.
sk-ax-gas-pp 에서는 손으로 짠 HTML 문서 일곱 장으로 했고, 다음부터는 for-humanity 사이트로 한다.

## 결정 셋

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| 독자와 자리 | 팀 공유 사이트. git 에 넣고 for-humanity build 로 사내 배포 | 기획과 BE 가 링크로 질문을 읽고 답한다. 질문 추적이 문서 한 곳으로 끝난다 |
| 스킬 자리 | agent-conventions `skill/blueprint`, 다른 skill 과 같은 구조화 스킬 | 단계마다 규칙을 `appliesWhen` 으로 라우팅하고, 문서 틀을 예제로 싣고, `validate` 가 낱말과 문체를 막는다. 09-29 에 독립 폴더로 기울었던 이유는 CSS 와 JS 였고 그 둘은 for-humanity 가 흡수했다 |
| 문서 체계 | 살아 있는 화면 문서 하나와 짧은 변경 문서 | 지금 문서가 읽기 힘들어진 원인은 변경을 본문에 날짜 꼬리표 절로 흡수한 것이다. 본문은 늘 지금의 정답만 담고, 변경은 따로 받아 끝나면 본문을 고쳐 쓴다 |

산출물은 셋이다. for-humanity 파츠 셋, `skill/blueprint`, 다음 프로젝트의 첫 문서 네 장.

::part[배경]

## 지금 블루프린트

| 항목 | 값 |
| --- | --- |
| 문서 | 7 (overview, 화면 4, open-items, fix-1015) |
| 전체 크기 | 1.2MB |
| 가장 큰 문서 | seasonal-detail 472KB, 17절, 소제목 60 이상 |
| 공용 CSS 와 JS | 90KB, 부품 30종 |
| 끝낼 때 확인 | 문서 × 네 조합, 스크립트 하나 |

살릴 것은 짜임과 규칙이다.

- 짜임의 순서. 한눈에 → 화면 → 결정 → 구조 → 접힌 구현 참고. 사람은 위만 읽고 에이전트는 접힌 절까지 읽는다.
- 재료 정답표. Figma 는 모양과 배치와 문구, 데모는 기능과 데이터, spec 은 API, 코드는 재사용, 캡처는 실제 값. 어긋나면 질문.
- 질문 체계. D, Q, B, R 번호. 선택지와 ★ 추천 하나, Why 한 줄, 막는 단계. 풀리면 결과 알약 한 줄.
- 거르는 규칙. FE 코드 0줄은 Follow-up, BE 미완은 mock 으로 먼저, FE 만의 결정은 Dev decision 으로 닫는다. FE 영향 없는 것은 묻지 않는다.
- 문체. 개조식, 라벨 영어, 내용 한국어, 한 줄 한 사실, 경위 금지.

과했던 것과 대체.

| 과했던 것 | 증거 | 대체 |
| --- | --- | --- |
| 증분을 본문에 흡수 | "02.F 09-29", "02.G 10-01", 12절 A~L 같은 날짜 꼬리표 절. 문서가 지금의 정답이 아니라 이력이 됐다 | 변경 문서를 따로 두고, 끝나면 본문을 고쳐 쓴다 |
| 구현 참고 가름 | CSS 실측, 더미 데이터, 테스트 목록, 설계 근거 표. realtime-list 테스트 절 혼자 12k 자 | 코드와 테스트가 정본. 출처 몇 줄과 단계 표의 확인 명령만 남긴다 |
| 풀린 질문 표와 개정 절 | 55줄짜리 표와 날짜별 개정이 문서 안에 영구 보존 | 풀린 것은 접힌 표 한 줄, 이력은 git 과 변경 문서와 `revised` |
| 손으로 그린 HTML 목업 | 구역마다 인라인 SVG 와 표를 손으로 짰다 | Figma 프레임 캡처나 앱 캡처에 번호를 구워 넣는다 |
| 자체 문서 도구 | 부품 30종, 질문 대화상자, 검사 20조합 | for-humanity 의 부품과 build 검사 |

## for-humanity 현황

있는 것. Note, Details, `::part`, Mermaid 12 (flowchart, sequence, state, er, treeView), `<<<` 스니펫, 이미지 figure, 상태 배지 (verified, unverified), 색 견본, `created` 와 `revised`, private 폴더, `init` 과 배포 템플릿.

빠진 것. 질문 칩, 캡처 위 번호 표식, 배지 종류, hash 앵커 검증, Figma 노드 링크 축약.

로드맵은 "별도 Blueprint 문서 타입을 추가하지 않는다" 와 "질문 대화상자, 역참조, 의존성 자동 집계는 데이터 모델이 필요한 별도 후보" 로 적혀 있다. 이 설계는 그 선을 지킨다. 로드맵 7번 Writing skill 의 자리를 이 스킬이 채운다.

::part[문서 체계]

## 문서 네 종류

다음 프로젝트의 `content/` 는 네 종류만 둔다.

```mermaid
treeView-beta
content/
├── README.md
└── public/
    ├── overview.md
    ├── questions.md
    ├── screen/
    │   ├── realtime-list.md
    │   └── seasonal-detail.md
    ├── change/
    │   └── 1015-figma.md
    └── img/
        └── realtime-list/
```

| 문서 | 역할 | 사이드바 group |
| --- | --- | --- |
| `README.md` | 홈. 프로젝트 한 줄, 문서 지도, 지금 단계 | 없음 |
| `overview.md` | 프로젝트 지도. 라우트, 계층, API 정답, 재료 정답표, 규약 링크, 사이트 주소 | Project |
| `questions.md` | 결정과 질문 전부. D, Q, B, R | Project |
| `screen/<화면>.md` | 화면 문서. 늘 지금의 정답 | Screen |
| `change/<MMDD>-<주제>.md` | 변경 문서. 전달, Figma 수정, spec 갱신 한 건 | Change |
| `img/<화면>/*.png` | 캡처. Figma 프레임과 앱 화면. 번호는 캡처에 굽는다 | 없음 |

화면 하나는 문서 하나다. 증분도 그 문서 안에서 지금의 정답으로 고쳐 쓴다.

## 질문은 한 자리에

D, Q, B, R 전부 `questions.md` 에 산다. 화면 문서 본문은 걸리는 자리에 링크만 둔다.

| 번호 | 뜻 | 답하는 사람 |
| --- | --- | --- |
| D | 개발 결정 | 개발자. Dev decision 으로 닫는다 |
| Q | 기획과 디자인 질문 | 기획 |
| B | BE 질문 | BE |
| R | 다시 정할 것. 앞선 답과 새 재료가 어긋난 것 | 사용자 |

`questions.md` 의 짜임.

- `## <화면>` 절. 화면마다 하나.
- `### Q3` 소제목. 제목은 번호 하나라 슬러그가 `q3` 로 안정된다. 본문 첫 줄이 질문 한 줄.
- 카드 몸. 선택지 A, B 와 ★ 하나, Why, Ask 또는 Request, Impact, Figure. 7줄 안팎.
- 절 끝 `:::details[Resolved]`. 풀린 것은 번호, 결정, 결과 알약, 날짜 한 줄.

번호는 프로젝트 안에서 하나다. 화면 문서에서는 `[Q3](../questions.md#q3)` 로 가리킨다.
사용자가 앞서 답한 것은 새 재료가 달라도 자동으로 뒤집지 않는다. R 로 올린다.

## 화면 문서

세 가름이다. 절마다 제목 아래 한 줄이 그 절의 결론이고, 그 줄만 읽고 넘어가도 되게 쓴다.

| 가름 | 절 | 담는 것 |
| --- | --- | --- |
| Overview | Screen | 캡처 한 장과 번호 설명 목록. 값은 자리 예시, 모양 정답은 Figma |
| Overview | Decisions | 큰 결정 셋. 표 한 줄씩, `questions.md` 링크 |
| Overview | Remaining | 단계 표. 단계, 내용, 막는 질문, 확인 명령, 상태. 열린 질문 수와 링크 |
| Screen | 구역마다 절 | 흐름 Mermaid, 모양 표, 대기와 빈과 오류 상태. `:::details[구현 상세]` 에 치수와 계약 |
| Structure | Reuse | 가져올 것 표. 경로, 무엇, 쓰는 곳 |
| Structure | Data and API | endpoint 표, 조회 흐름 Mermaid. `:::details` 에 응답 필드 |
| Structure | State | URL, 서버, 지역 상태 표. 경계 Mermaid |
| Structure | Tree | `treeView-beta` 컴포넌트와 파일 나무. 바뀌는 줄은 ★ |
| Structure | Sources | 읽은 출처 몇 줄. Figma 노드 링크, 데모 판, spec 커밋. `:::details` |

`:::details` 에는 치수, 계약, 규칙 근거만 둔다. CSS 실측, 더미 데이터, 테스트 목록, 개정 이력은 문서에 두지 않는다.
frontmatter 의 `created` 와 `revised` 가 날짜를 쥔다. 본문에 날짜 꼬리표 절을 만들지 않는다.

## 변경 문서

fix-1015 문서의 꼴을 그대로 정형화한다.

| 절 | 담는 것 |
| --- | --- |
| Overview | 무엇이 왔나. 전달문, Figma 판, spec 커밋. 수 (반영, 제외, 질문). 상태 |
| Items | 표. 화면, 항목, 지금 → 바뀜, 처리 (반영, 제외, 질문 링크) |
| Figures | 캡처와 번호 |
| Done | 반영 커밋, 화면 문서 갱신 확인 목록 |

새 질문은 `questions.md` 에 쓰고 여기서는 링크한다.
반영이 끝나면 화면 문서 본문을 고쳐 쓰고, 변경 문서는 상태만 Done 으로 바꾼다. 이력은 git 과 이 문서가 쥔다.

## 단계와 상태 어휘

단계는 준비 → 구역 → 연동 → 검증 꼴로 나눈다. 막는 질문이 있는 단계만 Blocked 다.
BE 가 아직 안 준 것은 지금 spec 위 mock 으로 먼저 가고, 들어올 때마다 연동 단계에서 켠다.

상태 어휘는 영어 고정 목록이다. 새 말을 만들기 전에 이 목록에서 고른다.

| 쓰임 | 어휘 | 배지 종류 |
| --- | --- | --- |
| 질문 | Needs answer, Waiting on BE, Waiting on plan, User decides, Follow-up | unverified |
| 결과 | As recommended, Per Figma, Per demo, Per spec, Kept, Rejected, N/A | neutral, 날짜 포함 |
| 단계 | Ready, Done | verified, Done 은 날짜 포함 |
| 단계 | Blocked | blocked |
| 문서 | Design, Implemented, Paused | neutral |

배지 종류는 프로젝트의 `for-humanity.config.ts` 의 `status` 로 묶는다. 링크와 제목 안의 문구는 배지가 되지 않으므로 Blocked 뒤의 질문 번호는 링크 칩으로 따로 선다.

::part[스킬]

## 자리와 이름

| 항목 | 값 |
| --- | --- |
| 폴더 | `skill/blueprint` |
| 라우터 이름 | `convention-blueprint` |
| 규칙 ID 접두 | `P`. `B` 는 BE 질문, `D` 는 개발 결정과 겹친다 |
| companion | `figma` conditional. Figma 파일을 재료로 읽을 때 |
| 계층 | 이 skill 이 `figma` 를 켜므로 `figma` 보다 위다. 코드 skill 은 켜지 않는다. 구현 단계에서 코드 변경이 그쪽을 켠다 |

## 섹션과 규칙

여섯 섹션이 곧 작업 단계다. 규칙 23개.

| ID | 규칙 | 등급 | 걸리는 때 |
| --- | --- | --- | --- |
| P01-01 | material-build-the-truth-table-first | CRITICAL | 새 프로젝트의 overview 를 쓸 때. 재료가 새 판으로 왔을 때 |
| P01-02 | material-compare-sources-item-by-item | CRITICAL | 전달문, 데모, Figma 가 둘 이상 있는 화면 문서나 변경 문서를 쓸 때 |
| P01-03 | material-read-figma-as-ux-not-pixels | CRITICAL | Figma 파일을 설계 문서 재료로 읽을 때 |
| P01-04 | material-confirm-response-shapes-with-captures | CRITICAL | API 응답 필드를 Data and API 절에 적을 때 |
| P02-01 | question-keep-every-number-in-one-page | CRITICAL | 설계 중 결정이나 질문이 생길 때 |
| P02-02 | question-write-cards-with-options-and-one-pick | CRITICAL | `questions.md` 에 항목을 추가하거나 고칠 때 |
| P02-03 | question-filter-what-needs-another-person | CRITICAL | 질문 후보를 카드로 만들지 가를 때. 열린 질문이 단계를 막는지 셀 때 |
| P02-04 | question-give-be-cards-a-figure | CRITICAL | B 카드를 쓸 때. 사용자가 뜻을 모르겠다고 한 카드를 고칠 때 |
| P02-05 | question-close-with-a-result-and-keep-one-line | CRITICAL | 답이 와서 질문을 닫을 때. 새 재료가 앞선 답과 어긋날 때 |
| P03-01 | structure-keep-four-document-kinds | HIGH | 설계 문서를 새로 만들 때. 문서를 나누거나 합칠 때 |
| P03-02 | structure-order-screen-docs-for-two-readers | HIGH | 화면 문서를 쓰거나 절을 옮길 때 |
| P03-03 | structure-fold-only-sizes-and-contracts | HIGH | 화면 문서에 구현용 정보를 넣을 때 |
| P03-04 | structure-keep-the-body-current-and-log-changes-apart | HIGH | 전달, Figma 수정, spec 갱신을 받아 문서를 고칠 때 |
| P03-05 | structure-write-overview-as-the-project-map | HIGH | `overview.md` 를 쓸 때 |
| P04-01 | writing-use-noun-phrases-one-fact-per-line | HIGH | 설계 문서의 본문, 표, 캡션을 쓸 때 |
| P04-02 | writing-label-in-english-and-explain-in-korean | HIGH | 표 머리, 상태, 열쇠말을 정할 때. 새 상태 말을 만들려 할 때 |
| P04-03 | writing-cite-at-the-end-and-link-figma-nodes | HIGH | 출처, Figma 노드, 파일 위치를 적을 때 |
| P04-04 | writing-draw-flows-with-mermaid-and-trees-with-treeview | HIGH | 흐름, 구조, 순서를 그림으로 그릴 때 |
| P04-05 | writing-show-screens-as-numbered-captures | HIGH | 화면 모양이나 질문 자리를 보여 줄 때 |
| P05-01 | stage-split-work-into-gated-stages | HIGH | Remaining 절을 쓸 때. 구현 순서를 정할 때 |
| P05-02 | stage-report-done-with-the-check-command | HIGH | 단계 구현을 끝내고 보고할 때. `requiredOnCompletion` |
| P06-01 | verify-build-the-site-before-handing-over | HIGH | 설계 문서 작업을 마무리하거나 넘길 때. `requiredOnCompletion` |
| P06-02 | verify-diff-facts-when-restyling-or-moving | HIGH | 문서 문체를 바꾸거나 절을 옮길 때 |

규칙 요지.

- P01-01. 정답표는 `overview.md` 에 둔다. Figma 는 모양, 배치, 문구. 데모는 기능과 데이터. spec 은 endpoint 와 응답. 코드는 재사용. 캡처는 실제 값. 전달문은 근거일 뿐 혼자 확정이 아니다.
- P01-02. 항목별 대조표. 항목, 데모, Figma, 지금 코드, 처리. 같으면 확정, 종류별 정답으로 확정, 애매하거나 한쪽에만 있으면 Q. 전달문에 없고 데모에만 바뀐 것은 "전달 밖 변화" 표.
- P01-03. Figma 는 UX 안이다. 폭 급, 정렬, 문구만 참고하고 안쪽 간격은 프로젝트 기본값. 큰 래퍼는 메타데이터를 스크립트로 파싱하고 구역 프레임만 캡처한다. 댓글은 REST. 호출 순서는 `figma` 규칙이 정한다.
- P01-04. 응답 모양은 캡처로 확인한다. mock 만 보면 안 보인다. spec 에 `minItems` 가 없다는 것은 빈 배열이 온다는 근거가 아니다.
- P02-01. 번호는 `questions.md` 한 곳, 본문은 링크. 소제목은 번호 하나.
- P02-02. 카드는 질문 한 줄 → 선택지와 ★ 하나 → Why → Ask, Impact → Figure. 7줄 안팎. 막는 단계를 적는다.
- P02-03. FE 코드 0줄은 Follow-up 으로 닫는다. BE 미완은 mock 으로 먼저 가고 연동 단계로 뺀다. FE 만의 결정은 D 로 닫는다. FE 영향 없는 BE 사항은 묻지 않는다. 서버 문자열과 수치는 그대로 그리고 캡처로 대조한다.
- P02-04. B 카드는 Meaning → 캡처 표식 → Ask. 사용자가 뜻을 모르겠다고 한 카드는 지우고 다시 쓴다.
- P02-05. 닫을 때 결과 알약과 날짜를 한 줄로 접힌 표에 내린다. 본문의 칩은 글로 바꾼다. 앞선 답은 자동으로 뒤집지 않고 R 로 올린다.
- P03-01. 네 종류와 역할. 화면 하나는 문서 하나.
- P03-02. Overview, Screen, Structure 순서. 절 제목 아래 결론 한 줄.
- P03-03. `:::details` 는 치수, 계약, 규칙 근거만. CSS 실측, 더미 데이터, 테스트 목록, 개정 이력은 두지 않는다.
- P03-04. 변경은 변경 문서로 받고, 반영 뒤 화면 문서 본문을 고쳐 쓴다. 날짜 꼬리표 절 금지. `revised` 갱신.
- P03-05. overview 는 지도다. 규약은 skill 링크로 가리키고 베끼지 않는다.
- P04-01. 개조식. 한 줄 한 사실. `→` 바뀜, `·` 한 사실 안의 나열, `=` 같음, `↔` 어긋남. 경위와 속뜻 금지.
- P04-02. 라벨, 열쇠말, 알약, 표 머리는 영어. 제목과 본문은 한국어. 상태 어휘는 고정 목록.
- P04-03. 출처는 줄 끝. 파일 위치는 코드. Figma 노드는 글자 "Figma" 에 노드 URL 을 건 링크. 맨 글에 노드 id 를 두지 않는다.
- P04-04. 흐름은 flowchart 와 sequence, 구조는 treeView. 라벨은 개조식, 괄호 없이, 폭이 넘으면 TD 로. 한글이 든 ASCII 그림 금지.
- P04-05. 목업 대신 캡처. Figma 프레임은 REST images, 앱 화면은 preview 빌드와 Playwright. 번호는 캡처에 굽고 설명은 목록.
- P05-01. 준비 → 구역 → 연동 → 검증. 단계 표의 칸은 내용, 막는 질문, 확인 명령, 상태. 막는 질문만 Blocked.
- P05-02. Done 은 확인 명령의 결과로 보고한다. 단계 알약을 갱신하고 새 질문은 카드로 쓴다.
- P06-01. 넘기기 전에 for-humanity build 통과, 끊긴 링크 0, 번호 유일, 카드마다 ★ 하나, 서술 어미 0, 열린 수와 카드 수 일치, 두 테마와 좁은 폭 캡처.
- P06-02. 문체를 바꾸거나 절을 옮길 때는 파일 위치, 노드, 번호, 숫자, 인용을 옛 판과 대조한다. 절 번호 참조를 grep 한다.

## 예제

| 예제 | 꼴 | 쓰는 규칙 |
| --- | --- | --- |
| `overview.md` 템플릿 | `.md` | P03-05 Correct |
| `questions.md` 템플릿 | `.md` | P02-01, P02-02 Correct |
| 화면 문서 템플릿 | `.md` | P03-02 Correct |
| 변경 문서 템플릿 | `.md` | P03-04 Correct |
| 재료 대조표 | `.md` | P01-02 Correct |
| 단계 표 | `.md` | P05-01 Correct |
| Figma 프레임 캡처 | `.mjs` | P04-05 Correct |
| 앱 캡처와 번호 굽기 | `.mjs` | P04-05 Correct |
| 날짜 꼬리표 절 | `.md` | P03-04 Incorrect |
| `·` 로 이은 사실 여럿 | `.md` | P04-01 Incorrect |
| 맨 글의 Figma 노드 id | `.md` | P04-03 Incorrect |
| 막지 않는 BE 질문을 Blocked 로 센 단계 표 | `.md` | P02-03 Incorrect |

예제 세계관은 다른 skill 과 같은 관리자 콘솔이다. 에이전트는 계약의 Correct 템플릿을 복사해 문서를 시작한다.
Markdown 예제의 확장자는 `.markdown` 이다. `.md` 면 for-humanity 가 사이트 문서로 읽고 사이트 검사가 절 페이지로 센다.

## 라우터

범위에 드는 것.

- `overview.md`, `questions.md`, 화면 문서, 변경 문서의 작성과 수정
- 전달문, 데모, Figma, spec 을 읽어 결정과 질문으로 옮기는 분석
- 블루프린트의 단계를 구현하고 완료로 보고하는 일

범위에 들지 않는 것.

- 설계 문서 없이 코드만 바꾸는 작업
- 설계 문서를 읽기만 하는 문맥
- 설계 문서가 아닌 일반 문서와 README

Figma 파일을 재료로 읽을 때만 `convention-figma` 를 켠다. 나머지 절은 다른 라우터와 같다.

## routing-evals

| 시나리오 | 기대 |
| --- | --- |
| Figma 와 데모와 spec 으로 새 화면 문서를 쓴다 | P01 전부, P02-01~03, P03-01~02, P04 전부, P05-01, P06-01, companion figma |
| Figma 수정 묶음이 왔다 | P01-02, P01-03, P02-03, P02-05, P03-04, P04-05, P06-01 |
| 기획 답이 와서 Q3 을 닫는다 | P02-05, P06-01 |
| 2단계 구현을 끝내고 보고한다 | P05-02 |
| 설계 문서 없이 버튼 색만 고친다 | 비적용 |

## 저장소 손질

- `src/snippets.ts`. `<<<` 인라이너가 펜스를 세 백틱으로 고정한다. Mermaid 펜스가 든 `.md` 예제가 깨지므로 내용의 가장 긴 백틱 묶음보다 한 칸 긴 펜스를 쓴다. 펜스 토글도 같은 길이를 본다.
- 루트 `README.md`, `CONTRIBUTING.md`, `content/public/tooling.md`, `AGENTS.md` 의 skill 목록에 `blueprint` 를 더한다.
- `lint:examples` 는 `.md` 를 건너뛴다. 추가 설정은 없다.

::part[for-humanity]

## 파츠 셋

| 파츠 | 설정 | 구현 자리 | 왜 |
| --- | --- | --- | --- |
| 배지 종류 | `status[].kind` 에 `blocked` (빨강), `neutral` (회색) | `src/constant/status.ts`, `remark-status.ts`, `token.css`, `wg-article.css` | 두 색으로는 Blocked 와 Per Figma 를 못 가른다 |
| 참조 칩 | `refs: [{prefix: "Q", color: "violet"}, {prefix: "B", color: "amber"}, {prefix: "D"}, {prefix: "R", color: "violet"}]`. 색은 gray, blue, violet, amber | `remark-refs.ts`. 글자가 `<prefix><숫자>` 인 링크에 칩 class | 본문 어디서든 질문 자리가 보이고 눌러 간다 |
| 앵커 검증 | 없음 | `_rehype-anchors.ts` 가 같은 문서는 바로, 다른 문서는 `read-docs.ts` 가 전체 수집 뒤 대조. 없으면 파일과 줄 경고. 홈 제목은 제외 | `questions.md` 로 가는 링크가 전부 hash 다 |

문서는 `settings.md` 의 Status badges 절, `writing.md` 의 Links 절, `CHANGELOG.md` 의 Unreleased 에 적는다.

안 만드는 것.

- 질문 대화상자와 걸린 자리 목록. 칩으로 이동하고 브라우저 찾기로 본다. 로드맵대로 보류.
- 번호 표식 Figure 지시어. 캡처에 번호를 굽는다.
- 제목 명시 id. 소제목을 번호 하나로 두면 슬러그가 그대로다.
- 요약 보드, 관문 막대, 열쇠말 칸, 손 목업. 표로 대신한다.

## 캡처 두 길

- Figma 프레임. REST `GET /v1/images/{key}?ids=…&scale=1&format=png`. 토큰은 `.ignore/figma-token` 에서 읽고 출력에 찍지 않는다. MCP 스크린샷보다 싸고 넓은 프레임도 글자가 읽힌다.
- 앱 화면. preview 빌드 위에 Playwright 로 세션을 심고, 구역 selector 로 clip 하고, 번호 배지를 DOM 에 꽂은 뒤 찍는다. 이미지 후처리가 없다.

둘 다 스킬 예제 `.mjs` 로 두고 프로젝트가 경로만 바꿔 쓴다.

## 배포

`for-humanity init` 으로 `docs:dev`, `docs:build`, `docs:preview` 와 `.gitignore` 를 받는다. 호스팅은 프로젝트가 정한다. 사내 정적 호스트면 `content/dist` 만 올린다.
사이트 주소는 `overview.md` 에 적는다. `.ignore/` 에는 토큰 같은 비밀만 남는다.

::part[진행]

## 순서

1. for-humanity 파츠 셋. 테스트, 문서, Unreleased 기록, 릴리스.
2. agent-conventions `skill/blueprint`. 규칙 23개, 예제, 라우터, evals, 루트 문서. `npm run check` 통과.
3. 다음 프로젝트. `for-humanity init`, `overview.md` 와 `questions.md` 빈 틀, 첫 화면 문서.

스킬 템플릿이 칩과 배지 문법을 쓰므로 파츠가 먼저다.

## 완료 기준

| 저장소 | 기준 |
| --- | --- |
| for-humanity | `pnpm test`, `pnpm check`, `pnpm build` 통과. 세 파츠가 Guide 에서 두 테마와 좁은 폭으로 확인됨 |
| agent-conventions | `npm run check` 통과. 사이트에서 템플릿 넷이 보임. routing-evals 다섯이 기대대로 |
| 적용 | 가상 화면 하나를 템플릿으로 써서 build 가 통과하고, 기획과 BE 가 `questions.md` 만 읽고 답할 수 있음 |

## 남긴 결정

- 변경 문서의 사이드바 순서. `order` 는 0 이상이라 날짜 오름차순으로 둔다. 많아지면 다시 본다.
- 제목 명시 id `{#q3}`. 지금은 불필요. 필요해지면 로드맵 "명시적 ID와 참조의 검증" 에서 같이 본다.
- Figure 지시어와 질문 대화상자. 로드맵대로 보류.
- 호스팅. 프로젝트마다 정한다.
