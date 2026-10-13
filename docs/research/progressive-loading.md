---
name: Progressive loading
label: 설계 배경, 측정, 검증, 한계
group: Research
order: 10
---

agent-conventions · 2026-07-21 → 07-27 · 43 commits

:::note[기록 시점]
2026년 7월 작업을 그대로 옮긴 기록입니다. 당시 생성 핸드북 이름은 `AGENTS.md`였고 지금은 `HANDBOOK.md`입니다.
`convention-audit` skill은 이후 없앴고, 측정 스크립트와 평가 디렉터리는 저장소에서 지워 git 이력에만 있습니다.
현재 구조는 저장소 README와 [Tooling](../tooling.md)을 봅니다.
:::

React · TypeScript · CSS 컨벤션을 매 작업마다 전체 핸드북으로 주입하던 구조를,
router → index → 선택된 계약 경로로 바꾼 기록입니다.
규칙 정확도를 유지하면서 컨텍스트 비용만 줄이는 것이 목표였습니다.

- 핸드북 1회 로드 · 토큰: 46,732
- progressive 중앙값 · 토큰: 9,377
- 컨텍스트 감소 중앙값: −79.9%
- 정확도 · 핸드북 대 progressive: 14 : 14

## 문제 (before)

기존 계약은 활성화된 skill마다 생성된 full handbook `AGENTS.md`를 통째로 읽는 것이었습니다.
React 핸드북 하나가 93,997 bytes고,
TSX 한 줄을 고쳐도 세 도메인이 함께 켜지면 46,732 토큰이 선택 이전에 이미 들어갑니다.

문제는 skill을 셋으로 나눈 구조가 아니라 **loading contract**였습니다.
프로젝트마다 규칙을 하나의 큰 Markdown으로 합치면 활성화는 단순해지지만
모든 작업에 모든 규칙이 주입되고 규칙 정본도 프로젝트별로 복제됩니다.
그래서 세 domain skill은 유지하되 읽는 방식만 바꿨습니다.

## 구조 (react 기준, 실측 bytes)

하나였던 문서를 네 층으로 쪼갰습니다.
막대 폭은 실제 파일 크기 비율입니다 — 아래로 갈수록 비싸고, 그만큼 드물게 읽습니다.

- SKILL.md, 3,479 B: router — scope 판정과 companion 활성화. 항상 읽음
- RULES_INDEX.md, 11,780 B: 규칙당 한 줄 — id · appliesWhen · routing edge. 전체 scan, 항상 읽음
- contracts/*.md, 887 B: 규범 문장만. 예시 코드는 뺌 — 선택된 규칙만 읽음 (42개 중 평균 8~17개)
- rules/*.md, 2,254 B: 예시 포함 원문 — CRITICAL·HIGH는 항상, MEDIUM은 판단이 모호할 때 확장
- AGENTS.md, 93,997 B: full handbook — opt-in. 기본 경로에서 제외됨

### 절감이 나오는 두 지점

첫째, **예시 코드를 계약에서 분리**했습니다.
contract는 heading · Impact · 규범 한 문단 · routing edge만 남기고 Incorrect / Correct 코드블록을 원문으로 미룹니다.
react 기준 `rules/` 94,668 B → `contracts/` 37,269 B, 약 61% 삭감.
선택 여부와 무관하게 적용되는 절감입니다.

둘째, **선택된 것만 읽습니다.**
85개 규칙(42 + 22 + 21) 중 실제 관련된 계약만 로드합니다.
인덱스가 얇은 것도 의도된 설계라, title · impact · tags · 설명 · 예시를 전부 제외했습니다.

## 측정 (tiktoken 0.11.0, o200k_base)

- full handbook — react + typescript + css, 6 파일: 46,732
- progressive — 같은 도메인, 중앙값: 9,377

두 arm의 활성 도메인이 동일합니다.
도메인을 덜 켜서 줄어든 것이 아니라 같은 도메인을 켠 상태에서 읽는 방식만 다릅니다.

시나리오별 implementation phase.
감소율 막대는 progressive가 차지하는 비율.

| 시나리오 | 도메인 | 핸드북 | progressive | 감소 |
| --- | ---: | ---: | ---: | ---: |
| css-one-off-structural-modifier | 3 | 46,732 | 9,349 | 80.0% |
| css-domain-state-class-contract | 3 | 46,732 | 10,375 | 77.8% |
| RTE12-query-shaping | 2 | 35,643 | 8,632 | 75.8% |
| RTE02-owner-placement-css-drift | 2 | 35,643 | 9,405 | 73.6% |
| RTE10-derived-selection-state | 2 | 35,643 | 10,168 | 71.5% |
| RTE03-route-support-extraction | 2 | 35,643 | 11,832 | 66.8% |
| derive-existing-contract-with-docs | 1 | 11,609 | 4,236 | 63.5% |
| css-repeated-values-and-optional-token | 1 | 11,089 | 4,298 | 61.2% |

단일 도메인 시나리오가 61~64%로 가장 낮습니다.
인덱스는 선택 이전에 항상 내는 고정비라, 작업이 작을수록 상대 이득이 줄어듭니다.

### 측정 게이트

- progressive 중앙값: 9,377, ≤ 10,000, PASS
- progressive 최댓값: 11,832, ≤ 12,000, PASS
- 1회 로드 감소: 79.93%, ≥ 70%, PASS
- 누적 감소: 65.44%, ≥ 60%, PASS

누적 감소가 1회 로드보다 낮은 이유는 측정에 드러납니다.
audit phase에서 두 arm 모두 정확히 +5,502 토큰이 붙는데,
이것이 아직 progressive가 아닌 `convention-audit`의 SKILL + AGENTS입니다.
progressive arm의 audit phase 비용 15,670 중 35%가 여기서 나옵니다 — 다음 최적화 대상.

## 정확도 (v18, 60 / 66 runs)

컨텍스트만 줄고 규칙을 놓치면 의미가 없으므로,
같은 시나리오를 no-skill · full-handbook · progressive 세 arm으로 돌려 선택 결과를 비교했습니다.

| Arm | runs | candidate | exact match | completion |
| --- | ---: | ---: | ---: | --- |
| no-skill | 21 | 0 | — | 21 COMPLETE |
| full-handbook | 21 | 15 | 14 | 21 COMPLETE |
| progressive | 15 | 15 | 14 | 15 COMPLETE |
| mutation control | 3 | 0 | — | 3 correctly BLOCKED |

**full handbook은 정확도 우위를 보이지 못했습니다.**
같은 14/15인데 컨텍스트만 5배입니다.
비-mutation run 전체에서 semantic failure 0, unknown 0, applicable-rule recall 1, domain-activation recall 1이었습니다.

mutation control은 적용되어야 할 규칙 하나를 의도적으로 N/A로 옮긴 run입니다.
셋 모두 coverage failure로 차단됐습니다 — 완료 게이트가 실제로 동작한다는 증거입니다.

빗나간 2건은 모두 **over-selection**이었습니다.
불필요한 규칙을 더 고른 것이지 필요한 규칙을 놓친 것이 아닙니다.
유리한 재시도로 교체하지 않고 그대로 기록에 남겼습니다.

## 검증 과정 (4 phases, 43 commits)

**01 설계 · 계획 · 베이스라인** · 07-21 14:13 → 15:10 · 3 commits

구현 전에 설계 문서(415줄)와 계획(1,149줄)을 먼저 썼습니다.
"rules는 유일한 정본", "SKILL.md는 규칙집이 아니라 router",
"선택하지 않은 규칙도 판정 증거를 남긴다" 같은 원칙과 범위 밖 항목을 먼저 고정했습니다.

- design · plan · baseline + red test

**02 빌드 파이프라인** · 07-21 15:33 → 21:40 · 9 commits

frontmatter 스키마부터 쌓았습니다.
라우팅 메타데이터는 의존 순서대로 TypeScript → CSS → React로 붙였습니다.

- appliesWhen · requiresSelected · reviewWith · requiredOnCompletion 스키마
- routing.ts → RULES_INDEX.md 생성 · check-generated
- contracts/*.md 생성 (148 files) · convention-audit 재작성

**03 평가 주도 하드닝** · 07-21 23:18 → 07-23 02:57 · 20 commits

실제 작업량의 대부분입니다.
behavioral eval harness를 붙인 뒤 **평가를 돌리고 → 깨지고 → 계약을 조이는** 루프를 반복했습니다.
20개의 fix 커밋이 전부 실제 평가 실패에 대응합니다.
실패는 지우지 않고 v3~v16까지 34개 디렉터리, 2,097개 파일로 전부 보존했습니다.

- v6 contract blocked · v7 routing order · v8 RTE10 oracle
- v11 handbook identity · v12 result gate · v13 preflight gate
- v14 mutation completion · v15 selection gate · v16 boundary

**04 v17 · v18 인증** · 07-24 → 07-27

v17은 66-run 매트릭스 중 12개에서 막혔습니다.
그 원인과 대응이 이 작업에서 가장 특징적인 판단이었습니다 (아래).
v18에서 60개 run을 마치고 채택을 결정했습니다.

- v18 · 28/30 exact · mutation 3/3 blocked · 채택

### v17이 막힌 지점

평가자 에이전트가 존재하지 않는 역방향 라우팅 엣지를 계속 만들어냈습니다.
세 번 연속 같은 실패였습니다.

```text
✗ react/screen-keep-derived-values-close
    → react/state-preserve-origin-chaining     없는 엣지 (추론된 역방향)

✓ react/state-preserve-origin-chaining
    → react/screen-keep-derived-values-close   인덱스가 선언한 유일한 방향
```

선택지는 둘이었습니다 — 코디네이터의 엄격한 exact-edge 검증을 완화하거나, 평가자 쪽 모호성을 없애거나.
**검증을 약화시키지 않는 쪽**을 택했습니다.
코디네이터가 directed edge 사전을 명시적으로 넘기고 `reviewWith`가 대칭도 전이도 아님을 못박게 고쳤습니다.
v18에서 해당 시나리오 두 trial 모두 exact match로 통과했습니다.

## 증명되지 않은 것 (partial certification)

> 전체 인증은 의도적으로 주장하지 않았습니다.

채택 결정에 필요한 증거는 충분했지만 매트릭스는 완결되지 않았습니다.
아래는 이 구조를 쓸 때 알고 있어야 할 한계입니다.

- **총 실행 토큰은 측정하지 않았습니다.** (미측정)
  측정된 것은 skill 파일이 컨텍스트에 차지하는 크기입니다.
  도구 호출, 추론 토큰, 파일 재독은 포함되지 않습니다.
  비용 절감률이 아닙니다.
- **fallback 경로는 시나리오 0건입니다.** (미측정)
  opt-in full handbook fallback이 발동하면 index + contracts + 핸드북을 모두 내므로 핸드북 단독보다 비쌉니다.
  그 경로 비용은 한 번도 측정된 적이 없습니다.
- **측정은 이상적 선택을 가정합니다.** (보정 필요)
  측정 컨텍스트의 파일 목록은 오라클의 정답 선택입니다.
  실제 run에서는 over-selection이 관측됐으므로(precision 0.667 · 0.944) 실제 로드는 모델보다 약간 큽니다.
  계약 하나가 ~880 B라 영향은 제한적입니다.
- **prompt caching은 고려하지 않았습니다.** (범위 밖)
  설계에서 명시적으로 제외했는데, 방향은 불리한 쪽입니다.
  고정된 핸드북은 캐시가 잘 붙고 매번 달라지는 계약 집합은 캐시 효율이 나쁩니다.
- **staged 시나리오 6 run이 미실행입니다.** (미실행)
  `RTE02-owner-placement-css-drift`의 arm별 2 trial씩.
  66개 좌표 중 60개만 실행하고 중단했습니다.
- **독립 semantic reviewer 8개 배치가 미실행입니다.** (미실행)
  behavioral run은 완료됐지만 artifact 수준의 독립 semantic 검토는 시작하지 않았습니다.

관측된 약점은 **over-selection이지 필요 규칙 누락이 아닙니다.**
따라서 다음 개선 방향은 always-loaded 컨텍스트를 늘리는 것이 아니라 activation 근거를 좁히는 쪽입니다.

## 원본 기록 (repo)

- [Progressive loading design](progressive-loading-design.md):
  설계 원칙, 산출물 구조, 범위와 범위 밖 — 415줄. 이 사이트에 남긴 유일한 원문입니다.
- 구현 계획과 skill별 라우팅 오라클(Appendix A~D, 1,149줄), v17·v18 평가 기록,
  채택되지 않은 v3~v16 시도(34 디렉터리 · 2,097 파일)는 저장소에서 지웠습니다.
  2026-07-21 → 07-27 사이의 커밋 이력에서 읽을 수 있습니다.

### 측정 재현

측정 스크립트(`measurement:tokens`)는 저장소에서 지웠습니다.
당시 결과는 contexts SHA-256 `1a052d41…aaeed3` · 71개 파일 해시 고정 · 게이트 4/4 PASS였고,
같은 커밋에서 항상 같은 수치가 나왔습니다.

측정 기준 tiktoken 0.11.0 · o200k_base · Python 3.13.7
v18 bound source HEAD 5634ea1 · criteria SHA-256 b3be5477…71da8b
