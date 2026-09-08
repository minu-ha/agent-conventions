# 등급별 읽기 깊이 측정 (2026-09-08)

`impact` 를 읽기 깊이로 재정의한 커밋 `4d7c012`·`3574e92` 가 실제 세션에서 어떻게 작동하는지 잰 기록이다.
측정은 `measure-skill-reads.py` 로 한다. 옛 프로토콜의 기준선은 이미 남아 있는 sk-ax-gas-pp 세션 기록에서, 새 프로토콜은 읽기 전용 헤드리스 세션 한 건에서 뽑았다.

## 기준선: 옛 프로토콜 (sk-ax-gas-pp 계열 39개 세션, 2026-08-12 ~ 09-04)

옛 프로토콜은 CRITICAL 만 원문 필수였고, 나머지는 "형태를 정하면 Correct 예제도 읽는다" 는 판단 문장이었다.
원문 읽기는 전부 Bash 의 `cat`·`sed` 였고 Read 도구는 쓰지 않았다. `sed -n '/^## /,/^\*\*Incorrect/p'` 로 예제를 스스로 잘라 낸 세션도 있다.

```text
| project | session | Skill calls | index | contracts | rules | full | partial | to-Incorrect | skill-file kchars |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sk-ax-gas-pp | 09dfcf3e | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 7 |
| sk-ax-gas-pp | 13696443 | 9 | 6 | 2 | 7 | 5 | 2 | 0 | 196 |
| sk-ax-gas-pp | 16bda4db | 3 | 5 | 11 | 23 | 10 | 13 | 0 | 138 |
| sk-ax-gas-pp | 1a19b4ac | 3 | 6 | 4 | 6 | 5 | 0 | 0 | 42 |
| sk-ax-gas-pp | 36ca66a5 | 3 | 2 | 6 | 0 | 0 | 0 | 0 | 25 |
| sk-ax-gas-pp | 3ebc1b9b | 3 | 8 | 6 | 18 | 10 | 8 | 0 | 78 |
| sk-ax-gas-pp | 47b1c494 | 1 | 5 | 6 | 3 | 3 | 0 | 0 | 52 |
| sk-ax-gas-pp | 66578175 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 21 |
| sk-ax-gas-pp | 75e00217 | 2 | 4 | 0 | 11 | 0 | 4 | 7 | 29 |
| sk-ax-gas-pp | 84d65142 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 27 |
| sk-ax-gas-pp | 85ad3a9c | 0 | 3 | 7 | 0 | 0 | 0 | 0 | 45 |
| sk-ax-gas-pp | 8ee142e4 | 1 | 1 | 12 | 9 | 9 | 0 | 0 | 45 |
| sk-ax-gas-pp | 8eea1df1 | 3 | 7 | 4 | 0 | 0 | 0 | 0 | 31 |
| sk-ax-gas-pp | 9274d3c6 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| sk-ax-gas-pp | 9b26443f | 3 | 4 | 0 | 6 | 4 | 2 | 0 | 60 |
| sk-ax-gas-pp | 9cb30f15 | 1 | 0 | 0 | 22 | 4 | 15 | 3 | 38 |
| sk-ax-gas-pp | a0bbafab | 3 | 2 | 10 | 1 | 1 | 0 | 0 | 35 |
| sk-ax-gas-pp | d212af17 | 3 | 3 | 5 | 0 | 0 | 0 | 0 | 11 |
| sk-ax-gas-pp | da8c783e | 0 | 3 | 11 | 3 | 3 | 0 | 0 | 47 |
| sk-ax-gas-pp | de792981 | 0 | 0 | 0 | 11 | 7 | 4 | 0 | 28 |
| sk-ax-gas-pp-chart-readability-v2 | 002c337f | 3 | 9 | 19 | 9 | 7 | 2 | 0 | 119 |
| sk-ax-gas-pp-chart-readability-v2 | c00d7de1 | 0 | 2 | 0 | 6 | 3 | 3 | 0 | 18 |
| sk-ax-gas-pp-css-convention | 1ec155d7 | 1 | 2 | 5 | 1 | 1 | 0 | 0 | 24 |
| sk-ax-gas-pp-css-convention | 71fd7dbe | 3 | 4 | 29 | 6 | 5 | 1 | 0 | 84 |

규칙 원문 읽기 방식: {'full': 77, 'partial': 54, 'to_incorrect': 10}
현재 등급별 (세션, 규칙) 쌍: 연 수 / 끝까지 읽은 수
  CRITICAL: 31 / 27
  HIGH: 39 / 23
  MEDIUM: 29 / 18
```

## 새 프로토콜: 헤드리스 검토 세션 한 건

sk-ax-gas-pp 에서 `src/component/ui/chart/_type/` 의 타입 파일 셋을 convention-typescript 기준으로 검토만 하게 했다.
명령은 `claude -p "<검토 지시>" --permission-mode plan --output-format stream-json --verbose --max-turns 40` 이다.

```text
도구 호출: {'skill_calls': 1, 'index': 1, 'contract': 12, 'rule': 9} | 원문 읽기 방식: {'full': 9} | 스킬 파일 글자 수: 45085 (≈15028 토큰)
링크만 남은 계약 7개 중 원문까지 따라간 것 7개
연 원문: ['typescript/01-01-types-reuse-existing-contracts-before-new-types [HIGH]', 'typescript/01-02-types-derive-subsets-with-indexed-access [HIGH]', 'typescript/01-04-types-document-custom-types-and-shapes [MEDIUM]', 'typescript/01-08-types-choose-interface-for-object-contracts-and-type-for-composition [MEDIUM]', 'typescript/02-03-naming-use-consistent-file-and-symbol-naming [HIGH]', 'typescript/02-05-naming-import-by-absolute-path [CRITICAL]', 'typescript/02-07-naming-name-types-by-role-and-lifetime [HIGH]', 'typescript/03-05-functions-order-declarations-top-down [HIGH]', 'typescript/06-03-docs-write-concise-korean-comments-about-purpose-and-constraints [HIGH]']
turns=40 duration=328s cost=$3.33 cache_create=103284 cache_read=467081 out=22977
```

- 링크만 남은 HIGH·CRITICAL 계약은 전부 원문까지 따라갔고, 원문은 모두 끝까지 읽었다.
- MEDIUM 계약 다섯 중 셋은 계약에서 끝냈고 둘(01-04·01-08)은 판단이 필요해 원문을 열었다. 표가 허용하는 행동이다.
- 검토 결과는 확정 위반 2건(01-08 `interface extends Omit`, 02-07 소유자 이름 반복)과 해석 여지 2건(03-05 선언 순서, 01-02 `paneId`·`labelValues` 원시 타입 재선언)이었다. 넷 다 실제 코드와 맞는 지적이었다.
- 스킬 파일 읽기는 약 45k 글자, 15k 토큰 안팎이다. 계약 한 묶음보다 원문 아홉 개가 더 컸다.

## 새 프로토콜: 편집이 있는 헤드리스 세션 한 건

검토 세션이 찾은 위반 셋을 실제로 고치게 했다. sk-ax-gas-pp 의 worktree(브랜치 `tier-probe`)에서 도구를 Read·Edit·Grep·Glob·Skill 과 `npx tsc` 로 제한하고 `--permission-mode acceptEdits` 로 돌렸다.

```text
도구 호출: {'skill_calls': 1, 'index': 1, 'contract': 5, 'rule': 4} | 원문 읽기 방식: {'full': 4} | 스킬 파일 글자 수: 27007 (≈9002 토큰)
링크만 남은 계약 3개 중 원문까지 따라간 것 3개
연 원문: ['typescript/01-01-types-reuse-existing-contracts-before-new-types [HIGH]', 'typescript/01-02-types-derive-subsets-with-indexed-access [HIGH]', 'typescript/01-08-types-choose-interface-for-object-contracts-and-type-for-composition [MEDIUM]', 'typescript/02-07-naming-name-types-by-role-and-lifetime [HIGH]']
turns=35 duration=133s cost=$2.05 cache_create=73704 cache_read=509135 out=8945
```

- 링크만 남은 HIGH 계약 셋(01-01·01-02·02-07)은 전부 원문까지 따라갔고 끝까지 읽었다. MEDIUM 01-08 은 `Omit` 을 `type` 으로 적는 형태가 필요해 원문을 열었다.
- 결과 diff 는 두 파일 8줄 추가·6줄 삭제로, 지시한 셋을 정확히 고쳤고 `npx tsc -p tsconfig.app.json --noEmit` 이 0 으로 끝났다.
- `Omit<NonNullable<…>>` 의 `NonNullable` 은 남겼고 이유를 댔다. `Omit<T | undefined, K>` 는 `keyof` 가 `never` 가 되어 빈 객체가 된다. 맞는 판단이다.
- 범위 밖에서 같은 필드를 원시 타입으로 다시 적은 위젯 두 곳을 찾아 보고만 했다. 규칙 01-02 의 후속 후보다.
- 스킬 파일 읽기는 약 27k 글자, 9k 토큰 안팎이다. 검토 세션(15k)보다 적다. 걸린 규칙이 다섯으로 좁았기 때문이다.

## 새 프로토콜: 편집이 있는 헤드리스 세션 둘째 건

측정이 찾아낸 후속 셋을 시켰다. 위젯 두 곳의 `labelValues`·`paneId` 를 ui/chart 계약에서 파생, 두 파일에 각각 선언된 `Extract<ChartAxis['labelFormat'], …>` 를 `_type/date-axis-label-format.ts` 하나로 합치기, `tsc` 확인이다. 같은 worktree 에 `hooks/check-critical-rules.sh` 를 Stop 훅으로 걸어 두었다.

```text
도구 호출: {'skill_calls': 2, 'index': 2, 'contract': 13, 'rule': 9} | 원문 읽기 방식: {'full': 9} | 스킬 파일 글자 수: 60130 (≈20043 토큰)
링크만 남은 계약 8개 중 원문까지 따라간 것 8개
연 원문: ['react/01-02-ownership-prefix-layer-names-on-files-and-symbols [MEDIUM]', 'react/01-03-ownership-place-owner-files-in-role-folders [HIGH]', 'typescript/01-01-types-reuse-existing-contracts-before-new-types [HIGH]', 'typescript/01-02-types-derive-subsets-with-indexed-access [HIGH]', 'typescript/02-03-naming-use-consistent-file-and-symbol-naming [HIGH]', 'typescript/02-05-naming-import-by-absolute-path [CRITICAL]', 'typescript/02-07-naming-name-types-by-role-and-lifetime [HIGH]', 'typescript/03-05-functions-order-declarations-top-down [HIGH]', 'typescript/06-03-docs-write-concise-korean-comments-about-purpose-and-constraints [HIGH]']
turns=63 duration=219s cost=$3.20 cache_create=110262 cache_read=611883 out=16796
```

- typescript 와 react 두 스킬을 불렀고, 링크만 남은 계약 여덟(HIGH 7·CRITICAL 1)을 전부 원문까지 끝까지 읽었다. MEDIUM 은 react 01-02 하나만 원문을 열었다.
- 결과 diff 는 다섯 파일에 새 타입 파일 하나로, 지시한 셋을 정확히 고치고 `paneId` 를 필수로 두는 이유를 필드 주석에 적었다. `tsc` 0.
- 스킬 파일 읽기는 약 60k 글자, 20k 토큰 안팎이다. 두 스킬을 부르니 검토 세션(15k)보다 커졌다. 한 작업 15k 라는 문턱은 스킬 하나 기준으로 두고, 둘을 부르면 25k 로 보는 것이 맞겠다.
- Stop 훅은 위반이 없어 조용히 0 으로 끝났다. 훅이 실제로 도는지는 별도로 확인했다. `?? ""` 가 있는 임시 저장소에서 헤드리스 세션을 돌리자 "Stop hook feedback" 으로 위반 1건이 Claude 에게 전달되고, Claude 가 그것을 보고한 뒤 두 번째 마무리는 `stop_hook_active` 로 통과했다.

## 판정

읽기 깊이를 계약 파일 모양으로 강제한 뒤로는 "몇 줄 보고 끝내기" 가 기록에서 사라졌다. 기준선에서는 HIGH 로 올린 규칙을 열어도 절반가량은 잘라 읽었다.
표본은 검토 한 건과 편집 두 건이다. 셋 다 링크만 남은 계약을 100% 원문까지 따라갔고(18/18) 스킬 파일 토큰은 9k~20k 였다. 사용자가 직접 진행하는 실제 작업 세션 두세 건을 같은 파서로 더 재고, 한 작업이 15k 를 넘기면 HIGH 를 일부 내린다.

## 다시 재는 법

```sh
python3 docs/evaluations/measure-skill-reads.py '*sk-ax-gas-pp*'        # 기록 전체
python3 docs/evaluations/measure-skill-reads.py --probe run.jsonl         # 헤드리스 세션 한 건
```

## 부수 감사: MEDIUM 계약에서 빠지는 규범

MEDIUM 계약은 첫 Incorrect·Correct 짝까지만 싣는다. 첫 짝 뒤에 예제가 더 있는 MEDIUM 규칙 33개(css 14·react 10·ts 9)를 읽어, 뒤쪽 예제에만 있고 산문에는 없는 규범을 찾았다.

| 규칙 | 예제에만 있던 규범 | 처리 |
| --- | --- | --- |
| css 01-04 | 덧붙이는 부모 식별자는 충돌한 화면의 라우트 세그먼트 하나이고 `pg_` 바로 뒤. 중간 컴포넌트 이름은 넣지 않음 | 산문 두 문장 추가 |
| css 04-02 | `stylelint-disable` 주석의 사유는 규칙 이름 뒤 `-- <마크업 출처>` 형태 | 산문 한 문장 교체 |
| css 08-01 | 리뷰 항목을 `docs/css-review.md` 문서로 둔다 | 규칙이 정할 일이 아니라 넣지 않고, 예제의 경로 주석도 뺐다 |
| react 04-01 | 합성 진입 파일은 `{Root, Header, Body} as const` 하나로 내보내고 `Root`가 상태를 소유해 컨텍스트로 내린다 | 산문 두 문장 추가 |
| react 08-06 | 파싱 결과 필드는 별칭 없이 체인으로 읽는다 | HIGH 인 ts 04-03 이 덮어 그대로 둠 |

나머지 28개는 산문과 표를 코드로 되풀이하는 예제라 계약 손실이 없다. 덤으로 ts 03-01 둘째 Correct 가 객체 상수 키에 문서 주석을 달아 ts 01-04 와 어긋나던 것을 헤더 주석으로 옮겼다.

## 다섯 작업 회차 (2026-09-08 오후, opus·fable)

sk-ax 커밋 이력의 문투로 작업 다섯 건을 만들어 worktree 마다 헤드리스로 돌렸다. 도구는 편집·`tsc`·lint 로 제한하고 Stop 훅을 걸었다.
fable 로 돌린 첫 회차는 사용량 한도로 1·2·3 이 끊겨 opus 로 다시 돌렸다(4·5 는 fable 로 완주). 결과 diff 는 `review-diff.sh` 가 opus 로 검토했다.

| 작업 | 모델 | 링크 계약 → 완독 | 스킬 토큰 | 턴 · 비용 | tsc · 훅 | 검토 확정 · 해석여지 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 diagram 부품 이름·구역 주석 | opus | 1 / 1 | 13k | 51 · $3.06 | 0 · 0 | 9 · 6 |
| 2 spike-chart 부품 이름·구역 주석 | opus | 6 / 6 | 18k | 55 · $2.57 | 0 · 0 | 1 · 4 |
| 3 chatbot 구역 주석·부품 판정 | opus | 3 / 3 | 11k | 43 · $3.22 | 0 · 0 | 6 · 14 |
| 4 chart Params 문서화·타입 보장 | fable | 3 / 3 | 8k | 58 · $2.78 | 0 · 0 | 0 · 1 |
| 5 두 차트 위젯 판정 | fable | 2 / 2 | 12k | 23 · $1.77 | 0 · 0 | 변경 없음 |

- 읽기: 다섯 건 15/15 로 링크만 남은 계약을 원문까지 끝까지 읽었다. 앞선 세 건과 합쳐 33/33, 잘라 읽기 0. 스킬 토큰은 8k~18k.
- CRITICAL 위반은 다섯 건 모두 0 이다(Stop 훅 0, 검토도 CRITICAL 항목 없음).
- 검토 확정 위반은 두 종류로 갈린다. 작업 세션이 새로 만든 것(3 의 `03-08` 지역 변수 둘, 2 의 `as const` 누락 방치, 1 의 Toolbar 이름)과, 개명·인라인으로 선언이 diff 에 들어와 드러난 기존 빚(1 의 props 구조분해·className 조립 7건, 3 의 이름 되풀이 한 줄 주석 4건). 검토는 "바뀐 줄이 속한 선언"을 보므로 개명 작업은 기존 빚을 그대로 끌어올린다. 준수율을 읽을 때 이 둘을 갈라야 한다.
- 규칙 쪽 발견 셋. (1) 01-02 의 "비공개 부품"·"합성 부품" 두 행이 `WgSpikeChart = {Detection, Current}` 에서 부딛혔다 → 합성 부품도 짧게 통일(`450b9ad`). (2) 12-02 로 새로 넣은 구역 주석 둘째 문장이 헤더 JSDoc 이나 마크업을 되풀이하는 사례가 2·1 에서 여섯 건 → 구역 주석은 한 문장으로 짧게 쓰라는 예시가 필요하다. (3) 12-02 를 글자대로 읽으면 group 안 버튼 둘에도 주석이 필요해 `aria-label` 을 되풀이하게 된다는 지적 → "한 줄 요소 제외" 가 그 경우를 덮는지 문장을 손봐야 한다.
- 3 은 05-10 을 문자 그대로 적용해 170줄짜리 header 부품을 진입 파일로 되돌렸다. 규칙(길이는 근거가 아님)과 맞지만, 핸들러 여섯을 가진 부품을 "상호작용 책임 없음" 으로 볼지는 사용자 판단이 필요하다. 남은 `_wg-header.css`·`_wg-launcher.css` 짝과 한 줄 주석 19개는 후속이다.

## 판정 갱신

읽기 깊이 강제는 여덟 세션에서 한 번도 어긋나지 않았다. 남은 변수는 준수율이고, 작업 세션이 새로 만드는 위반은 다섯 건 합쳐 확정 4건 수준이다. 기존 빚이 큰 자리(diagram·chatbot)는 개명·인라인 작업이 그 빚을 diff 로 끌어올리므로, 그런 작업은 검토 결과의 기존 빚을 별도 후속으로 돌린다.

## chatbot 정리 세션 (2026-09-08 밤, opus)

다섯 작업 회차에서 남은 chatbot 후속을 한 세션으로 돌렸다. 하위 소유자 셋 개명, 남은 CSS 짝 병합, 이름만 되풀이하는 주석 삭제, 리터럴 지역 변수 되돌림, 그리고 진입 파일만 있는 폴더 다섯을 부품으로 올리는 지시였다.

| 항목 | 값 |
| --- | --- |
| 링크 계약 → 완독 | 4 / 4 |
| 스킬 토큰 | 17k |
| 턴 · 시간 · 비용 | 141 · 908초 · $13.44 |
| tsc · stylelint · eslint · test:unit · 훅 | 모두 0 |
| 검토(opus) 확정 · 해석여지 | 3 · 3 |

- 지시 다섯 중 넷은 정확했다. 다섯째("진입 파일만 있는 폴더는 부품")는 지시가 틀렸다. 그중 넷은 하위 소유자 둘 이상이 함께 쓰는 컴포넌트라 `_` 파일이 될 수 없고, 세션은 owner-boundary 린트에 막히자 되묻지 않고 `eslint-disable` 8줄로 넘겼다. 사람이 넷을 폴더로 되돌리고 composer 만 chat-ready 의 부품으로 옮겼다. react 01-03 에 이 배치를 적어 빈 자리를 닫았다.
- 검토 확정 셋 중 둘(수정자 이름 조립, 문자열 `className`)은 바로 고쳤고, `--active` 블록 안 `:hover` 는 옮겨 온 기존 CSS 라 이유를 아는 사람이 정하도록 남겼다. 해석 여지는 chat-content 진입 파일이 분기만 한다는 05-10 판정, tooltip 용 `span` 래퍼의 이유 주석, 요소 이름 `top` 셋이다.
- 교훈 둘. 구조를 바꾸는 지시는 "가져오는 곳" 을 먼저 세고 준다. 세션 프롬프트에 "린트가 막으면 disable 대신 보고" 를 넣는다.
