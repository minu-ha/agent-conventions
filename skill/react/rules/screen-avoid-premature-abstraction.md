---
title: Avoid Premature Abstraction in Screen Code
impact: HIGH
impactDescription: 추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함
tags: screen, abstraction, reuse
---

## Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함)**

반복이 보인다는 이유만으로 즉시 공용 hook, 공용 컴포넌트, 공용 helper로 올리지 않습니다. 같은 화면, 같은 support module, 같은 exported 함수 안에서 비슷한 단계가 반복되더라도 기본은 한 함수 안에 유지합니다.
같은 이름의 계약으로 여러 화면이나 모듈이 직접 호출해야 하는 경계가 분명해질 때만 공용화를 검토합니다. 그 전에는 section comment, 단계 구분 변수, 내부 블록으로 먼저 정리합니다. route-local component 추출도 예외가 아니며, 단순 layout wrapper가 아니라 실제 runtime boundary를 소유할 때만 검토합니다.
custom hook도 예외가 아닙니다. hook 이름을 붙일 수 있다는 이유만으로 추출하지 말고, state/effect/context/form/store처럼 실제 React orchestration을 묶을 때만 hook 경계를 만듭니다.

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const usePermissionA = () => {
  // 유사 로직
};

const usePermissionB = () => {
  // 유사 로직
};
```

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * @summary form state, 저장 mutation, 오류 노출을 함께 오케스트레이션하는 editor contract
 */
export const useContentEditor = () => {
  const form = useForm<ContentEditorFormValues>();
  const mutationContentSave = useContentSave();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  return { form, mutationContentSave, setSubmitErrorMessage, submitErrorMessage };
};
```

**Correct (같은 화면 안 반복은 먼저 한 함수 안에서 local 정리로 해결):**

```ts
export const buildEntryPayload = (formValues: EntryFormValues) => {
	// 1. 공통 문자열 값 정규화
	// 2. API payload 형태로 조립
	// 3. 결과 반환
};
```
