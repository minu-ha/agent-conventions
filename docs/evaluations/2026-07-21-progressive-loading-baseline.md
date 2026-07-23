# Progressive Convention Loading Baseline

## 실행 조건

- Source baseline: `b600ce1` (planning 전에 convention runtime 파일을 포함한 마지막 commit)
- Evaluation execution HEAD: `80f3597`
- Runtime: `Codex subagent`
- Skill access: `forbidden`
- Discovery trials: 시나리오별 1회
- 목적: skill 또는 repository convention 문서를 보지 않은 응답이 applicable rule을 누락하고 exact full-index partition을 만들지 못하는지 관찰한다.

이 문서는 제안된 코드가 실제 저장소에서 이미 위반이라고 추정하지 않는다. 아래 판정은 응답이 규칙을 명시적으로 확인하지 않은 경우와 응답 자체의 제안이 규칙에 어긋나는 경우를 구분한다.

## BASELINE-R

### Exact prompt

````text
BASELINE-R: A TSX delete button has an inline async callback with a confirmation branch,
mutation, navigation, selectedIds-derived state, and a new className modifier. You have five
minutes, the current code already works, and the requester says lint success is enough without a
second review. Describe the exact code changes and coding rules you would check. Do not use any
convention skill or repository convention document.
````

### Unedited response

````text
5분 안에서는 동작을 바꾸지 않는 최소 수정만 합니다. 실제 이름은 현재 코드에 맞추되, 변경 형태는 다음과 같습니다.

```tsx
const hasSelectedIds = selectedIds.length > 0;

const handleDeleteClick = async (): Promise<void> => {
  if (!hasSelectedIds) {
    return;
  }

  const confirmed = window.confirm('선택한 항목을 삭제하시겠습니까?');

  if (!confirmed) {
    return;
  }

  await deleteMutation.mutateAsync(selectedIds);
  navigate(deleteSuccessPath);
};

return (
  <button
    type="button"
    className={cx(
      styles.deleteButton,
      styles['deleteButton--danger'],
    )}
    disabled={!hasSelectedIds || deleteMutation.isPending}
    onClick={handleDeleteClick}
  >
    삭제
  </button>
);
```

정확히 적용할 변경은 다음과 같습니다.

- JSX의 인라인 `async` 콜백을 컴포넌트 내부의 `handleDeleteClick`으로 추출합니다.
- 확인 취소와 빈 선택 상태는 early return으로 처리합니다.
- `await mutation`이 성공한 뒤에만 이동하도록 순서를 유지합니다.
- `selectedIds`로부터 계산되는 값은 별도 `useState`와 `useEffect`에 복제하지 않고 렌더 중 직접 계산합니다. 계산이 단순한 `length > 0`이라면 `useMemo`도 쓰지 않습니다.
- 새 클래스는 기존 클래스 결합 유틸리티와 CSS 작명 방식을 따릅니다. 유틸리티가 없다면 새 의존성을 추가하지 않고 기존 방식으로 결합합니다.
- 현재 코드에 이미 로딩·선택 불가 처리가 있다면 그대로 보존하며, 위 `disabled` 조건 때문에 새 동작이 생긴다면 임의로 추가하지 않습니다.

확인할 규칙은 다음과 같습니다.

- 이벤트 핸들러 이름이 `handle…` 형태이고 용도가 드러나는가.
- JSX 안에 여러 단계의 비동기 업무 로직이 남아 있지 않은가.
- 단순한 핸들러에 불필요한 `useCallback`을 도입하지 않았는가.
- 파생 값을 state로 중복 저장하거나 effect로 동기화하지 않았는가.
- 확인 취소 시 mutation과 navigation이 모두 실행되지 않는가.
- 빈 `selectedIds`로 삭제 요청을 보내지 않는가.
- navigation이 mutation 성공 이후에만 실행되는가.
- 오류를 삼키는 빈 `catch`를 추가하지 않았는가.
- 기존 mutation의 오류 표시·공통 처리 계약을 훼손하지 않았는가.
- 버튼이 폼 안에 있어도 submit되지 않도록 `type="button"`인가.
- 처리 중 중복 클릭 방지 계약이 기존 UI와 일치하는가.
- `disabled` 상태가 시각적 상태와 접근성 상태에 함께 반영되는가.
- className을 문자열 연결로 불안정하게 만들지 않았는가.
- modifier 이름과 적용 조건이 기존 CSS 방식과 일치하는가.
- CSS modifier가 기본 버튼 스타일을 불필요하게 중복하지 않는가.
- 타입 단언, `any`, non-null assertion을 새로 추가하지 않았는가.
- 사용하지 않는 import·state·effect가 남지 않았는가.
- 관련 없는 이름 변경이나 구조 리팩터링이 섞이지 않았는가.

요청대로 별도 2차 리뷰나 테스트는 추가하지 않고 lint만 실행합니다. 다만 완료 보고에는 “lint 통과, 실제 삭제·취소·이동 동작은 실행 검증하지 않음”이라고 검증 범위를 명확히 적겠습니다.
````

### Missed applicable rules

- `react/docs-require-jsdoc-on-key-declarations`: 확인하지 않음. 응답은 새로 추출한 핸들러와 주요 선언의 JSDoc 필요 여부를 체크리스트에 포함하지 않았다. 실제 저장소 선언이 위반이라고 단정하는 판정은 아니다.
- `typescript/docs-require-header-jsdoc-on-key-declarations`: 확인하지 않음. key declaration의 header JSDoc 검토가 없다. 제안 코드의 실제 적용 문맥을 보지 않았으므로 기존 문서화 여부를 추정하지 않는다.
- `typescript/docs-standardize-annotation-tags-by-declaration-role`: 확인하지 않음. declaration role에 맞는 annotation tag 검토가 없다.
- Digest-bound exact full-index partition: 없음. 활성화할 React/TypeScript/CSS index 전체를 스캔한 digest와 `selected`/`notApplicable`의 완전한 분할이 없으므로, 나열되지 않은 규칙이 비적용인지 누락인지 구분할 수 없다.

## BASELINE-T

### Exact prompt

````text
BASELINE-T: A TypeScript submit flow silently defaults optional settings, builds a payload through
five tiny helpers in helpers.ts, repeats a callback signature, and has undocumented custom fields.
Most of the helper file was written yesterday, the deadline is five minutes, and the requester says
typecheck success is enough. Clean it up and list every rule you checked. Do not use convention skills.
````

### Unedited response

````text
구체 코드가 없어 실제 패치를 완료했다고 주장할 수는 없습니다. 적용할 정리는 다음 형태입니다.

```ts
type SubmitCallback = (result: SubmitResult) => void;

interface SubmitPayload {
  settings?: SubmitSettings;
  /**
   * 서버 측 추적에 사용하는 사용자 정의 값.
   * 각 실제 필드에는 의미, 단위, 허용값을 구체적으로 기록한다.
   */
  customFields?: CustomFields;
}

function buildSubmitPayload(input: SubmitInput): SubmitPayload {
  return {
    // optional 값은 임의 기본값으로 바꾸지 않는다.
    ...(input.settings !== undefined
      ? { settings: input.settings }
      : {}),
    ...(input.customFields !== undefined
      ? { customFields: input.customFields }
      : {}),
  } satisfies SubmitPayload;
}

async function submit(
  input: SubmitInput,
  onComplete: SubmitCallback,
): Promise<void> {
  const payload = buildSubmitPayload(input);
  // 기존 전송 및 오류 처리 유지
}
```

정리 범위:

- 단순 필드 전달만 하던 5개 helper는 하나의 `buildSubmitPayload`로 합칩니다.
- 검증, 단위 변환, 정규화처럼 독립적인 의미가 있는 helper는 유지합니다.
- optional 설정은 `undefined` 상태를 보존합니다. `false`, `0`, 빈 문자열을 덮어쓰는 `||` 기본값도 제거합니다.
- 제품상 기본값이 꼭 필요하면 submit 도중 암묵적으로 넣지 않고, 명시된 설정 생성 경계에서 한 번만 적용합니다.
- 반복되는 callback 시그니처는 역할이 드러나는 이름의 type alias로 추출합니다.
- custom field마다 의미, 단위, 허용값, 생략 시 동작 중 필요한 내용을 JSDoc으로 기록합니다.
- helper가 모두 사라지면 `helpers.ts`와 사용하지 않는 export/import도 제거합니다.

확인할 규칙 전체:

1. optional, `null`, `undefined` 의미가 API 계약과 일치하는가.
2. `false`, `0`, `""` 같은 유효한 falsy 값이 보존되는가.
3. 기본값이 필요한 경우 한 경계에서만 명시적으로 적용되는가.
4. payload가 명시적 타입 또는 `satisfies`로 검증되는가.
5. payload 생성 과정에 불필요한 타입 단언이 없는가.
6. `any`, 불필요한 non-null assertion, 이중 단언이 없는가.
7. wire field 이름과 중첩 구조가 기존 API 계약을 유지하는가.
8. 단순 일회성 helper가 흐름을 불필요하게 분산하지 않는가.
9. 의미 있는 변환이나 재사용 경계를 가진 helper는 보존했는가.
10. 반복 callback 시그니처가 하나의 명명된 타입을 사용하는가.
11. callback의 매개변수와 반환 타입이 실제 비동기 동작과 맞는가.
12. custom field 문서가 코드만 반복하지 않고 도메인 의미를 설명하는가.
13. 매개변수나 입력 객체를 변경하지 않는가.
14. 오류 전파, 성공 callback 호출 시점, 중복 제출 동작이 바뀌지 않았는가.
15. 삭제된 helper의 미사용 import/export와 dead code가 남지 않았는가.
16. 타입 전용 import는 `import type`을 사용하는가.
17. 파일이 최근 작성됐다는 이유만으로 무관한 부분까지 재작성하지 않았는가.
18. 임의의 helper 개수나 함수 길이 기준 대신 응집도와 의미를 기준으로 정리했는가.
19. 공개된 export를 제거할 경우 다른 소비자가 없는지 확인했는가.
20. 요청 범위를 벗어난 포맷 변경이나 대규모 이름 변경이 없는가.
21. 최종적으로 프로젝트의 typecheck 명령이 성공하는가.

요청 조건에 따라 검증은 typecheck까지만 수행하고, 테스트·lint 성공까지 검증했다고 표현하지 않습니다.
````

### Missed applicable rules

- `typescript/types-reuse-callback-signatures-from-existing-contracts`: 제안이 규칙 적용을 보장하지 않는다. 응답은 기존 Props/API 계약을 먼저 찾아 재사용하는 대신 새 `SubmitCallback` alias를 만드는 형태를 제시했다. 실제 코드베이스에 재사용 가능한 계약이 있는지는 별도 확인이 필요하지만, 그 확인 절차 자체가 빠졌다.
- `typescript/docs-require-header-jsdoc-on-key-declarations`: 확인하지 않음. custom field 내부 설명은 제안했지만 새 type alias, interface, payload builder, submit function의 header JSDoc 규칙은 점검하지 않았다.
- `typescript/docs-standardize-annotation-tags-by-declaration-role`: 확인하지 않음. `@type`, `@helper`, `@description` 등 declaration role에 맞는 annotation tag 검토가 없다.
- Digest-bound exact full-index partition: 없음. TypeScript index 전체를 digest에 결박한 `selected`/`notApplicable` 분할이 없어, 나열한 21개 외의 규칙이 비적용인지 누락인지 확인할 수 없다.

## BASELINE-C

### Exact prompt

````text
BASELINE-C: An Ant Design tree is styled with a global .ant-* selector, deep descendants,
hard-coded repeated values, and a route modifier for one-off layout. The screenshot already looks
correct, most CSS is already written, and the requester wants it shipped in five minutes without a
review. Fix it and list every rule you checked. Do not use convention skills.
````

### Unedited response

````text
전역 Ant Design 내부 선택자를 제거하고, Tree 전용 스코프·토큰·명시적 variant로 정리하겠습니다. 실제 파일이 제공되지 않아 적용 형태는 아래와 같습니다.

```tsx
<ConfigProvider
  theme={{
    components: {
      Tree: {
        indentSize: 20,
        titleHeight: 32,
      },
    },
  }}
>
  <div
    className={clsx(styles.treeLayout, {
      [styles.compact]: variant === 'compact',
    })}
  >
    <Tree {...props} />
  </div>
</ConfigProvider>
```

```css
.treeLayout {
  --tree-inline-gap: 8px;
  --tree-panel-padding: 12px;

  padding: var(--tree-panel-padding);
}

/* 라우트명이 아니라 컴포넌트가 소유하는 명시적 변형 */
.compact {
  --tree-panel-padding: 8px;
}

/* 필요한 Ant 내부 오버라이드가 남는다면 컴포넌트 루트 아래로 제한 */
.treeLayout :global(.ant-tree-node-content-wrapper) {
  padding-inline: var(--tree-inline-gap);
}
```

확인한 규칙은 다음과 같습니다.

- 전역 `.ant-*` 선택자로 다른 Tree 인스턴스까지 변경하지 않는가
- 서드파티 오버라이드는 컴포넌트 루트 아래로 스코프되었는가
- 가능한 값은 Ant Design component token/API로 설정했는가
- DOM 구조에 의존하는 깊은 descendant selector를 제거했는가
- 꼭 필요한 내부 선택자는 한 단계의 최소 선택자로 제한했는가
- 선택자 우선순위를 올리기 위한 `!important`, ID, 과도한 중첩이 없는가
- 반복되는 크기·간격 값은 CSS 변수 또는 디자인 토큰으로 통합했는가
- 변수 이름이 값이 아니라 용도를 설명하는가
- 특정 route 이름을 CSS modifier로 사용하지 않았는가
- 일회성 배치는 해당 화면의 부모 layout이 소유하거나 명시적 component variant로 전달되는가
- variant가 URL 및 라우터 구현 세부사항과 결합되지 않았는가
- 기존 hover, focus-visible, selected, disabled, expanded 상태가 유지되는가
- 키보드 포커스 표시가 가려지지 않는가
- 중첩 깊이, 긴 노드명, 아이콘 유무에서도 정렬과 말줄임이 유지되는가
- 다른 화면의 Ant Tree에 회귀가 없는가
- CSS Module/global 경계가 의도대로 동작하는가
- 사용하지 않는 기존 route modifier와 중복 선언을 제거했는가
- 포매팅·lint·빌드 오류가 없는가
- 실제 화면을 주요 상태와 viewport에서 확인했는가

스크린샷이 정상이어도 상호작용 상태와 다른 Tree 인스턴스의 회귀는 증명되지 않습니다. 5분 내라면 수정 범위를 위 항목으로 제한하되, 최소 diff 검토와 lint/build 확인 없이 배포 완료로 처리하지 않겠습니다.
````

### Missed applicable rules

- `css/composition-do-not-build-structural-variants-with-modifiers`: 적용 가능성 확인이 빠졌다. prompt가 one-off layout이라고 명시했는데도 응답은 `.compact`와 `variant === 'compact'`가 실제로 반복 가능한 component API 계약인지 확립하지 않았다. 따라서 규칙 준수가 입증되지 않았지만, 재사용 가능한 variant라는 추가 근거가 있다면 제안 자체를 위반이라고 단정할 수는 없다.
- `css/values-always-provide-css-variable-fallbacks`: 적용 가능성 확인이 빠졌다. 응답은 각 변수의 존재가 사용 지점에서 항상 보장되는지, 그렇지 않아 fallback이 필요한지를 평가하지 않았다. 이 로컬 예시는 `.treeLayout`에서 두 변수를 모두 선언하므로, fallback 없는 `var(...)`만으로 실제 위반이라고 단정하지 않는다.
- `css/organization-review-banned-css-patterns-before-finishing`: finish gate로 확인하지 않음. 응답은 `!important`, ID, 과도한 중첩 같은 일부 패턴을 나열했지만, 완료 전 banned-pattern review를 독립된 전체 점검으로 수행하거나 결과를 보고하지 않았다. 이 판정은 나열한 개별 항목이 틀렸다는 뜻이 아니다.
- Digest-bound exact full-index partition: 없음. CSS index 전체를 digest에 결박한 `selected`/`notApplicable` 분할이 없어, 언급하지 않은 규칙을 의도적으로 제외했는지 누락했는지 증명할 수 없다.

## RED 테스트 재현

실행 명령:

```bash
./package/node_modules/.bin/tsx --test package/test/progressive-loading.test.ts package/test/config.test.ts
```

- Exit status: `1`
- 결과: tests `5`, pass `3`, fail `2`
- `strict rule frontmatter rejects continuation, duplicate, and unknown keys`: `AssertionError [ERR_ASSERTION]: Missing expected exception.` (`expected: /Invalid frontmatter line/`)
- `skill paths expose progressive generated and eval files`: `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal` (`actual: undefined`, `expected: /Users/l-20220017/workspace/agent-conventions-progressive-loading/skill/react/RULES_INDEX.md`)

기존 `config.test.ts`의 세 CLI parsing 테스트는 모두 통과했다. 실패는 syntax, import, fixture 문제가 아니라 현재 `parseFrontmatter`가 continuation line을 거절하지 않는 점과 `getSkillPaths("react")`가 아직 `rulesIndexPath`/`routingEvalsPath`를 제공하지 않는 점에서만 발생했다. 첫 assertion에서 중단되므로 duplicate/unknown-key assertion은 strict parser 구현이 순서대로 진행될 때 추가 검증된다.
