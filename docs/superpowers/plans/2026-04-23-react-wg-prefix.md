# React Wg Prefix Naming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React structured skill 문서에서 widget 레이어의 파일명/심볼명을 `wg` 규칙으로 통일한다.

**Architecture:** `widget`은 레이어 이름으로 유지하고, source-of-truth인 `rules/*.md`와 pressure scenario를 먼저 수정한 뒤 build로 generated `AGENTS.md`를 재생성한다. 정본이 아닌 deprecated 문서는 이번 범위에서 제외한다.

**Tech Stack:** Markdown, structured skill build tooling, npm CLI

---

### Task 1: Update React source-of-truth naming rules

**Files:**
- Modify: `skill/react/rules/ownership-layer-component-boundaries.md`
- Modify: `skill/react/rules/strategy-avoid-boolean-prop-proliferation.md`
- Modify: `skill/react/rules/strategy-choose-single-composition-compound-and-variants.md`
- Modify: `skill/react/rules/screen-extract-utilities-selectively.md`
- Modify: `skill/react/pressure-tests.md`

- [ ] **Step 1: Update the ownership rule wording**

```md
`ui`는 순수 view, `widget`은 여러 화면에서 재사용되는 공용 조합, `-local`은 특정 route 맥락을 아는 화면 전용 코드로 유지합니다. `widget` 레이어 폴더명은 유지하되, widget-owned 파일과 심볼은 `wg-*`, `Wg*` 규칙으로 소유자를 바로 드러냅니다.
```

- [ ] **Step 2: Rename widget-owned examples to `wg` / `Wg`**

```tsx
export interface WgEntryToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
	const { isCompact, isEditing, showSearch } = props;

	return (
		<header>
			{showSearch ? <EntrySearchField /> : null}
			{isEditing ? <EntryEditActions compact={isCompact} /> : <EntryBrowseActions compact={isCompact} />}
		</header>
	);
};
```

- [ ] **Step 3: Update screen support code examples that reference widget-owned types**

```ts
export const buildEntryPayload = (
	formValues: EntryFormValues,
	files: WgMediaUploaderFile[],
) => {
	return {
		// ...
	};
};
```

- [ ] **Step 4: Update pressure-test expectations for owner naming**

```md
- widget 레이어 폴더는 `widget/`으로 유지함
- widget-owned 파일명은 `wg-*`, symbol은 `Wg*`로 맞춤
- `ui`, `widget`, `-local`, sibling `.ts` owner 경계를 지킴
```

### Task 2: Rebuild and verify the React compiled guide

**Files:**
- Modify: `skill/react/AGENTS.md`

- [ ] **Step 1: Run validation**

```bash
npm --prefix package run validate -- --skill=react
```

Expected: exit code `0`

- [ ] **Step 2: Rebuild the compiled guide**

```bash
npm --prefix package run build -- --skill=react
```

Expected: `skill/react/AGENTS.md` regenerated without errors

- [ ] **Step 3: Verify no stale widget-owned naming remains in source documents**

```bash
rg -n "widget-\\*|Widget[A-Z]|widget-[a-z]" skill/react/SKILL.md skill/react/README.md skill/react/rules skill/react/pressure-tests.md -S
```

Expected: no matches in source-of-truth files for widget-owned file/symbol naming
