# Read Props Through the Props Object Without Destructuring

**Impact: MEDIUM (값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다)**

컴포넌트는 `props` 전체를 받고, 사용하는 곳에서 `props.id`처럼 읽습니다.
시그니처·본문·중첩 함수 어디에서도 구조분해하지 않습니다.
객체 출처를 유지하는 기본 기준은 `typescript/values-read-objects-through-chains`를 따릅니다.

| 상황 | 처리 |
| --- | --- |
| `{...props}`로 그대로 전달함 | 구조분해가 아니며 출처도 유지됩니다. 허용 조건은 `typing-choose-wrapper-shape-and-forwarding`을 따릅니다 |
| 선택 프롭에 기본값이 필요함 | `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다. 사용하는 곳에서 값을 직접 비교하면 기본값이 필요하지 않습니다 |

**Incorrect (시그니처에서 구조분해합니다):**

```tsx
const WgUserCard = ({ label, onSave }: WgUserCardProps) => {
	return <button onClick={onSave}>{label}</button>;
};
```

**Incorrect (본문 첫 줄에서 구조분해합니다):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	const { label, onSave } = props;
	return <button onClick={onSave}>{label}</button>;
};
```

**Correct (`props`로 읽어 출처를 남깁니다):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	return <button onClick={props.onSave}>{props.label}</button>;
};
```

> 나머지 예시·예외는 [full rule](../rules/05-01-composition-read-props-without-destructuring.md)에 있습니다.
