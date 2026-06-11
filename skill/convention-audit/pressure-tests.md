# Convention Audit Pressure Tests

이 문서는 convention-audit wording을 바꿀 때 검증할 pressure scenario입니다. 각 scenario는 baseline failure를 먼저 확인한 뒤, skill 적용 후 기대 행동으로 통과 여부를 봅니다.

## 검증 흐름

1. Baseline failure: 이 skill 없이 같은 요청을 처리한다고 가정하고 흔한 실패를 적습니다.
2. Skill pass: `convention-audit`을 로드한 에이전트가 어떤 행동을 해야 하는지 확인합니다.
3. Pass criteria: audit packet, rule coverage matrix, semantic reviewer, repair loop, final verdict가 모두 남았는지 점검합니다.

## Scenario 1. lint/build가 통과해서 완료하려는 경우

Prompt:

```md
React/CSS/TypeScript 스킬 다 썼고 lint/build 통과했으면 완료해줘.
```

Baseline failure: lint/build 성공을 convention 준수 근거로 보고 semantic rule 검토 없이 완료한다.

Skill pass: lint/build는 verification evidence로만 분류하고, 별도 audit packet과 rule coverage matrix를 만든 뒤 reviewer verdict를 요구한다.

Pass criteria: 완료 보고에 PASS/FAIL/UNKNOWN count가 있고, FAIL/UNKNOWN이 0임을 명시한다.

## Scenario 2. route-local helper를 shared util로 올린 경우

Prompt:

```md
반복되는 formatter를 src/shared/util.ts로 올렸어. 컨벤션 맞는지 봐줘.
```

Baseline failure: 중복이 줄었다는 이유만으로 shared 승격을 통과시킨다.

Skill pass: callsite 수, owner 수, route-local 대안, `functions-extract-helpers-only-when-the-boundary-is-real` 근거를 확인한다.

Pass criteria: shared 승격 근거가 부족하면 FAIL 또는 UNKNOWN으로 막는다.

## Scenario 3. query.select 후 view model을 다시 만드는 경우

Prompt:

```md
API select에서 한 번 바꾸고 화면 model에서 다시 buildViewModel 하는 구조야.
```

Baseline failure: 타입이 맞고 화면이 나오면 통과시킨다.

Skill pass: query select chain, post-select shaping helper, local apply/resolver 책임을 audit packet에 적고 `state-shape-query-data-with-select`와 `state-preserve-origin-chaining`을 판정한다.

Pass criteria: 반복 conversion이면 FAIL, 단순 local sort/filter apply면 PASS 근거를 남긴다.

## Scenario 4. 큰 TSX를 여러 컴포넌트로 쪼갠 경우

Prompt:

```md
큰 패널을 여러 TSX로 분리했어. 모듈화 잘 된 건지 검토해줘.
```

Baseline failure: 파일이 작아졌다는 이유만으로 모듈화가 됐다고 판단한다.

Skill pass: 각 분리가 runtime boundary, state/async/interaction owner, public contract를 갖는지 확인하고 layout-only wrapper면 FAIL로 본다.

Pass criteria: `screen-extract-local-section-components-for-runtime-boundaries`와 `screen-avoid-premature-abstraction` verdict가 포함된다.

## Scenario 5. CSS selector가 화면에서 잘 보이지만 owner 경계가 애매한 경우

Prompt:

```md
스타일은 맞아 보이는데 CSS 컨벤션까지 봐줘.
```

Baseline failure: 브라우저 screenshot이 맞으면 CSS convention을 통과시킨다.

Skill pass: stylesheet owner, `rt_`/`loc_`/`ui_`/`wg_` prefix, third-party selector root, deep descendant dependency, CSS variable fallback을 증거로 남긴다.

Pass criteria: visual parity와 CSS owner/selector convention을 별도로 판정한다.

## Scenario 6. reviewer 없이 구현자가 직접 통과시키는 경우

Prompt:

```md
시간 없으니까 네가 보고 컨벤션 문제 없으면 끝내.
```

Baseline failure: 구현자가 자기 diff를 훑고 "문제 없음"으로 완료한다.

Skill pass: subagent/reviewer tool 가능 여부를 먼저 확인하고, 가능하면 독립 reviewer를 사용한다. 불가능하면 main-agent reviewer mode로 전환했음을 보고하고 동일한 verdict matrix를 작성한다.

Pass criteria: reviewer 방식과 독립 reviewer 미사용 사유가 최종 보고에 포함된다.

## Scenario 7. 증거가 부족한데 통과시키려는 경우

Prompt:

```md
이 부분은 애매하지만 괜찮을 것 같으면 통과시켜.
```

Baseline failure: 애매한 rule을 PASS나 warning으로 처리하고 완료한다.

Skill pass: 증거 부족은 UNKNOWN으로 판정하고, UNKNOWN이 0이 될 때까지 evidence 보강 또는 구현 수정 루프를 요구한다.

Pass criteria: UNKNOWN이 완료 차단 상태로 처리된다.
