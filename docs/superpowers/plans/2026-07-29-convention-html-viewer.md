# Convention HTML Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `skill/*/rules/*.md` 212개를 정본 그대로 두고, 사람이 skill 드롭다운·검색·필터로 조회하는 단일 HTML 한 장을 생성 파이프라인으로 만든다.

**Architecture:** `parser.ts`의 기존 로더를 재사용해 8개 skill을 읽고, rule 본문을 prose와 Incorrect/Correct 예시로 분해한 뒤, 데이터를 JSON으로 인라인한 자기완결 HTML 한 장(`docs/conventions.html`)을 낸다. 출력은 결정적이며 `check-handbooks.ts`와 같은 방식으로 신선도를 강제한다. 사람이 읽는 한국어 제목은 `titleKo` frontmatter 필드를 추가해 채우고, 기존 영어 `title`은 앵커·헤딩 식별자로 그대로 둔다.

**Tech Stack:** TypeScript (ESM, tsx), node:test, Biome, 의존성 없는 vanilla JS/CSS

---

## 읽는 순서

Task 1-5가 코드다. **Task 5까지 하면 212개 규칙이 전부 검색·필터되는 화면이 뜬다.** 한 번 앉아서 끝나는 분량이고, 한국어 제목을 하나도 안 채워도 동작한다 (`titleKo`가 비면 영어 제목으로 대체 표시).

Task 6-7은 한국어 제목 212개를 채우는 **콘텐츠 작업**이다. 코드가 아니고 블로커도 아니다. skill별로 쪼개서 아무 때나 해도 된다.

Task 8-9는 마감이다. Task 8은 Task 6-7이 **전부** 끝난 뒤에만 한다.

## 배경: 왜 생성 파이프라인이어야 하는가

`docs/react-rules-preview.html`(커밋 `ab9518e`)은 스크래치패드 스크립트로 한 번 떠낸 스냅샷이다. 만든 당일에 이미 낡았다.

커밋 `397407d`("react State 섹션을 세 갈래로 나눈다")가 병행 세션에서 `state` 섹션을 `data`/`state`/`perf`로 쪼갰다. 그 결과:

| | 스냅샷 HTML | 현재 정본 |
| --- | --- | --- |
| 섹션 수 | 8 | **10** |
| prefix 분포 | `state: 13` | **`data: 4`, `state: 5`, `perf: 4`** |
| 규칙 ID | 8개가 구 이름 | 8개가 `data-*`/`perf-*`로 개명 |

**손으로 뜬 HTML은 몇 시간 만에 정본과 어긋났다.** 이 계획의 핵심은 예쁜 화면이 아니라 **어긋날 수 없게 만드는 것**이고, 그래서 Task 5의 신선도 검사가 선택 사항이 아니다.

## 설계 결정

아래 7개는 확정 사항이다. 구현 중 뒤집지 말 것.

**1. 출력은 8개 skill을 합친 한 장 (`docs/conventions.html`)**

skill별 파일로 쪼개지 않는다. 이유:
- 교차참조가 skill 경계를 넘는다(`typescript/types-reuse-existing-contracts-before-new-types`, `css/naming-separate-local-and-route-style-scopes` 등). 한 파일 안에서는 전부 `#anchor`라 경로 해석이 없고 링크가 깨질 수 없다.
- 전체 콘텐츠가 358KB(gzip 107KB)라 한 장에 들어간다.
- 파일이 하나면 열기·북마크·공유가 하나다.

**2. skill 이동은 단일선택 드롭다운**

상단에 `<select>` 하나. 항목은 `전체(212)` + skill 8개. 한 번에 한 scope만 본다.

동반 관계(react → typescript `required`, css `conditional`)와는 상충하지만, 아래 두 가지로 왕복 비용을 없앤다. **컨트롤을 추가하지 않는다.**

- **교차참조 칩이 드롭다운을 자동 전환한다.** `typescript/…` 칩을 누르면 드롭다운이 `typescript`로 바뀌고 대상 규칙으로 스크롤·펼침된다. 실제로 다른 skill 규칙이 필요한 순간이 정확히 이 지점이므로, 두 skill을 동시에 띄울 필요가 없어진다.
- **선택한 skill의 동반 관계를 헤더에 한 줄로 보여준다.** `동반 typescript 필수 · css 조건` 형태이고, 각 항목이 드롭다운을 그 skill로 바꾸는 버튼이다. 정보 표시 + 한 번 클릭 이동일 뿐 필터가 아니다.

전역 검색이 필요하면 `전체`를 고른다. 선택은 `localStorage`에 기억시킨다(`file://`에서 실패할 수 있으므로 `try/catch`로 조용히 무시).

**3. 출력은 결정적이어야 한다 — 타임스탬프·난수 금지**

Task 5의 신선도 검사가 재렌더 결과를 바이트 비교한다(`check-handbooks.ts`와 동일 전략). 생성 시각을 넣으면 검사가 항상 실패한다. 페이로드에 `generatedAt` 같은 필드를 넣지 말 것.

**4. 완전한 HTML 문서로 낼 것 — `<!doctype>` + `<meta charset="utf-8">` 필수**

이게 실제로 터진 버그다. 선언이 없으면 `file://`로 열 때 브라우저가 Latin-1로 추측해 한글이 전부 깨진다(`한국어` → `í\x95\x9cêµ\xadì\x96´`). Task 4에 회귀 테스트를 둔다.

**5. 인라인 JSON은 `<`를 `<`로 이스케이프**

`<script type="application/json">` 안에 규칙 본문이 들어간다. 코드 예시에 `</script`가 있으면 문서가 깨진다. `JSON.stringify` 결과에서 `<`를 전부 `<`로 바꾼다. `JSON.parse`가 원복한다.

**6. `titleKo`는 추가만 한다 — 기존 `title`을 뒤집지 않는다**

영어 `title` 220개는 놀고 있는 게 아니다. `HANDBOOK.md` 헤딩이고 `buildRuleAnchor()` 슬러그 기반이며 grep 대상이다. 뒤집으면 앵커와 링크가 전부 흔들린다. `titleKo`를 새로 추가하고 화면에만 쓴다. 영어는 규칙 ID·태그·섹션 키로 남아 검색에도 계속 걸린다.

**7. CSS grid는 `minmax(0, 1fr)`이어야 한다**

`1fr`만 쓰면 grid item이 콘텐츠 intrinsic min-width 아래로 줄지 못한다. 긴 코드 한 줄이 컬럼을 밀어내 박스가 행 밖으로 나가고, `pre`는 넓어지기만 하고 스크롤이 안 걸린다. 헤드리스 측정 수치: 수정 전 112개 코드 박스 중 **29개가 최대 351px 이탈**, 스크롤되는 `pre` **0개** → 수정 후 이탈 **0개**. `.diff`(좌우 2단)와 `.pane`(rail/본문 2단) 둘 다 해당한다. Task 4에 문자열 가드 테스트를 둔다.

## 대상 규모

| skill | 규칙 | 섹션 | 모드 | 동반 |
| --- | --- | --- | --- | --- |
| astro | 42 | 11 | plain | — |
| css | 21 | 5 | progressive | typescript(조건) |
| figma-visual-parity | 15 | 6 | plain | — |
| nestjs | 21 | 7 | plain | — |
| playwright-test | 25 | 7 | plain | — |
| react | 42 | 10 | progressive | typescript(필수), css(조건) |
| tanstack-route | 24 | 6 | plain | — |
| typescript | 22 | 6 | progressive | — |
| **합계** | **212** | **58** | | |

`plain` skill은 `contracts/`도 `RULES_INDEX.md`도 없다. viewer는 두 모드를 구분하지 않고 `rules/*.md`만 읽으므로 8개 전부 동일하게 처리된다.

---

## File Structure

**신규 (`package/src/`)**

| 파일 | 책임 |
| --- | --- |
| `rule-body.ts` | `SkillRule.body` 원문 → `{prose, examples}` 구조화. 순수 함수, I/O 없음 |
| `viewer-payload.ts` | 8개 skill 로드 → 화면용 `ViewerPayload` 조립. 정렬·결정성 담당 |
| `viewer-template.ts` | CSS·마크업·클라이언트 스크립트 문자열 + 완전한 문서 조립 |
| `viewer.ts` | CLI 진입점. payload → HTML → 파일 쓰기 |
| `check-viewer.ts` | 재렌더 후 바이트 비교로 신선도 강제 |

**신규 (`package/test/`)**

| 파일 | 책임 |
| --- | --- |
| `viewer.test.ts` | 위 5개 모듈 전체 테스트 |

**수정**

| 파일 | 변경 |
| --- | --- |
| `package/src/types.ts` | `SkillRule.titleKo`, `SkillSection.titleKo` 추가 |
| `package/src/parser.ts` | `titleKo` 파싱 (rule frontmatter, `_sections.md`) |
| `package/src/config.ts` | `viewerOutputPath` 추가 |
| `package/src/validate.ts` | `titleKo` 필수 검증 (Task 8에서 활성화) |
| `package/package.json` | `viewer`, `check:viewer` 스크립트 + 검사 체인 편입 |
| `skill/*/rules/*.md` | `titleKo` frontmatter 212개 |
| `skill/*/rules/_sections.md` | `**TitleKo:**` 58개 |
| `README.md`, `CONTRIBUTING.md` | viewer 사용법·기여 절차 |

**삭제**

| 파일 | 이유 |
| --- | --- |
| `docs/react-rules-preview.html` | 스냅샷 초안. Task 9에서 생성물로 대체 |

---

### Task 1: rule 본문을 prose와 예시로 분해한다

**Files:**
- Create: `package/src/rule-body.ts`
- Create: `package/test/viewer.test.ts`

**전제로 삼아도 되는 것:** `validate.ts:143`이 이미 모든 규칙에 `**Incorrect`와 `**Correct`가 있어야 한다고 강제한다. 즉 212개 전부 예시 쌍을 갖는 것은 우연이 아니라 검증된 불변이다. 파서가 예시를 못 찾으면 파서 버그다.

**새 소스 파일이 지켜야 하는 것:** `test/documentation.test.ts`가 `package/src/**`의 JSDoc 규약을 검사한다. interface는 `@summary`와 필드별 `@field`, 함수는 역할에 따라 `@api`/`@helper`/`@description` 태그, named function 선언 대신 arrow function. 아래 코드는 이 규약을 따른 상태다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`package/test/viewer.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {parseRuleBody} from "../src/rule-body.js";

test("parseRuleBody splits prose from Incorrect and Correct examples", () => {
	const body = [
		"## Use Named Handlers",
		"",
		"**Impact: HIGH (설명)**",
		"",
		"핸들러는 명명해서 노출합니다.",
		"",
		"**Incorrect (로직을 JSX에 숨김):**",
		"",
		"```tsx",
		"<Button onClick={() => void run()} />",
		"```",
		"",
		"**Correct (핸들러로 노출):**",
		"",
		"```tsx",
		"const handleClick = () => {};",
		"```",
	].join("\n");

	const parsed = parseRuleBody(body);

	assert.deepEqual(parsed.prose, [{type: "line", text: "핸들러는 명명해서 노출합니다."}]);
	assert.equal(parsed.examples.length, 2);
	assert.deepEqual(parsed.examples[0], {
		kind: "incorrect",
		label: "로직을 JSX에 숨김",
		blocks: [{lang: "tsx", code: "<Button onClick={() => void run()} />"}],
	});
	assert.equal(parsed.examples[1]?.kind, "correct");
	assert.equal(parsed.examples[1]?.label, "핸들러로 노출");
});

test("parseRuleBody keeps multiple blocks under one Correct label", () => {
	const body = ["**Correct:**", "", "```ts", "export const a = 1;", "```", "", "```tsx", "export const B = () => null;", "```"].join("\n");

	const parsed = parseRuleBody(body);

	assert.equal(parsed.examples.length, 1);
	assert.equal(parsed.examples[0]?.label, "");
	assert.deepEqual(parsed.examples[0]?.blocks.map((block) => block.lang), ["ts", "tsx"]);
});

test("parseRuleBody keeps prose tables and fenced blocks that precede examples", () => {
	const body = ["| 레이어 | 책임 |", "| --- | --- |", "| ui | 순수 view |", "", "```txt", "tree", "```"].join("\n");

	const parsed = parseRuleBody(body);

	assert.equal(parsed.examples.length, 0);
	assert.deepEqual(parsed.prose.at(-1), {type: "code", lang: "txt", code: "tree"});
	assert.equal(parsed.prose.filter((node) => node.type === "line" && node.text.startsWith("|")).length, 3);
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: FAIL — `Cannot find module '../src/rule-body.js'`

- [ ] **Step 3: 최소 구현을 쓴다**

`package/src/rule-body.ts` (탭 들여쓰기, `bracketSpacing: false`, lineWidth 140):

```ts
/**
 * @summary rule 본문 코드 블록 하나
 */
export interface RuleCodeBlock {
	/**
	 * @field 코드 펜스에 적힌 언어. 없으면 "text"
	 */
	lang: string;
	/**
	 * @field 펜스 내부 원문
	 */
	code: string;
}

/**
 * @summary Incorrect 또는 Correct 라벨 하나와 딸린 코드 블록 묶음
 */
export interface RuleExample {
	/**
	 * @field 잘못된 예시인지 올바른 예시인지
	 */
	kind: "incorrect" | "correct";
	/**
	 * @field 라벨 괄호 안 부연 설명. 없으면 빈 문자열
	 */
	label: string;
	/**
	 * @field 라벨 아래 이어지는 코드 블록 목록
	 */
	blocks: RuleCodeBlock[];
}

/**
 * @summary 첫 예시 이전 본문을 이루는 줄 또는 코드 블록
 */
export type RuleProseNode = {type: "line"; text: string} | {type: "code"; lang: string; code: string};

/**
 * @summary rule 본문 분해 결과
 */
export interface ParsedRuleBody {
	/**
	 * @field 첫 예시 이전 산문. 표와 코드 블록을 포함한다
	 */
	prose: RuleProseNode[];
	/**
	 * @field 문서 순서를 유지한 예시 목록
	 */
	examples: RuleExample[];
}

const examplePattern = /^\*\*(Incorrect|Correct)\s*(?:\(([^)]*)\))?\s*:?\*\*/;

/**
 * @helper 본문 선두의 `## 제목`과 `**Impact: …**` 줄 제거
 */
const stripLeadingHeading = (prose: RuleProseNode[]): RuleProseNode[] => {
	let headingDropped = false;

	return prose.filter((node) => {
		if (node.type !== "line") {
			return true;
		}

		if (!headingDropped && node.text.startsWith("## ")) {
			headingDropped = true;
			return false;
		}

		return !node.text.startsWith("**Impact:");
	});
};

/**
 * @helper 앞뒤 빈 줄 정리
 */
const trimBlankEdges = (prose: RuleProseNode[]): RuleProseNode[] => {
	const isBlank = (node: RuleProseNode): boolean => node.type === "line" && node.text.trim() === "";
	let start = 0;
	let end = prose.length;

	while (start < end && isBlank(prose[start] as RuleProseNode)) {
		start += 1;
	}

	while (end > start && isBlank(prose[end - 1] as RuleProseNode)) {
		end -= 1;
	}

	return prose.slice(start, end);
};

/**
 * @api rule markdown 본문을 화면용 prose와 예시로 분해
 */
export const parseRuleBody = (body: string): ParsedRuleBody => {
	const lines = body.replace(/\r\n/g, "\n").split("\n");
	const prose: RuleProseNode[] = [];
	const examples: RuleExample[] = [];
	let current: RuleExample | undefined;
	let index = 0;

	while (index < lines.length) {
		const line = lines[index] ?? "";
		const matched = examplePattern.exec(line);

		if (matched) {
			current = {kind: matched[1] === "Incorrect" ? "incorrect" : "correct", label: (matched[2] ?? "").trim(), blocks: []};
			examples.push(current);
			index += 1;
			continue;
		}

		if (line.startsWith("```")) {
			const lang = line.slice(3).trim() || "text";
			const buffer: string[] = [];
			index += 1;

			while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
				buffer.push(lines[index] ?? "");
				index += 1;
			}

			const block = {lang, code: buffer.join("\n")};

			if (current === undefined) {
				prose.push({type: "code", ...block});
			} else {
				current.blocks.push(block);
			}

			index += 1;
			continue;
		}

		if (current === undefined) {
			prose.push({type: "line", text: line});
		}

		index += 1;
	}

	return {prose: trimBlankEdges(stripLeadingHeading(prose)), examples};
};
```

- [ ] **Step 4: 통과를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: PASS — 3 tests

- [ ] **Step 5: 실데이터 212개 회귀 테스트를 추가한다**

`package/test/viewer.test.ts` 끝에 추가:

```ts
import {getSkillPaths, isBuildableSkill, listSkillNames} from "../src/config.js";
import {readSkillRules} from "../src/parser.js";

test("parseRuleBody handles every rule in the repository", async () => {
	const skillNames = await listSkillNames();
	let ruleCount = 0;
	let blockCount = 0;

	for (const skillName of skillNames) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		for (const rule of await readSkillRules(getSkillPaths(skillName))) {
			const parsed = parseRuleBody(rule.body);
			ruleCount += 1;
			blockCount += parsed.examples.reduce((total, example) => total + example.blocks.length, 0);

			assert.ok(parsed.examples.length > 0, `${skillName}/${rule.fileName} has no Incorrect/Correct example`);

			for (const example of parsed.examples) {
				assert.ok(example.blocks.length > 0, `${skillName}/${rule.fileName} ${example.kind} example has no code block`);
			}
		}
	}

	assert.equal(ruleCount, 212);
	assert.ok(blockCount > 400, `expected 400+ code blocks, found ${blockCount}`);
});
```

- [ ] **Step 6: 실데이터 테스트를 돌린다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: PASS — 4 tests. 실패하면 메시지가 어느 skill의 어느 파일이 규약을 벗어났는지 지목한다. 규칙 파일을 고칠 것이 아니라 파서를 그 형식에 맞출 것.

- [ ] **Step 7: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add package/src/rule-body.ts package/test/viewer.test.ts
git commit -m "feat: rule 본문을 산문과 Incorrect/Correct 예시로 분해한다"
```

---

### Task 2: `titleKo`를 rule과 section 스키마에 선택 필드로 추가한다

**Files:**
- Modify: `package/src/types.ts`
- Modify: `package/src/parser.ts` (`readSkillRules`, `parseSections`)
- Modify: `package/test/viewer.test.ts`

**주의:** `parseSections`의 description 정규식은 `^\*\*Description:\*\*\s+([\s\S]+)$`로 **탐욕적**이다. `**TitleKo:**`를 `**Description:**` 뒤에 놓으면 description 값으로 삼켜진다. 반드시 헤더와 `**Impact:**` 사이에 놓는다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`package/test/viewer.test.ts` 끝에 추가:

```ts
import {parseFrontmatter, parseSections} from "../src/parser.js";

test("readSkillRules exposes titleKo and tolerates its absence", async () => {
	const rules = await readSkillRules(getSkillPaths("react"));
	const sample = rules.find((rule) => rule.fileName === "composition-named-handlers-over-inline.md");

	assert.ok(sample, "expected react composition-named-handlers-over-inline.md");
	assert.equal(typeof sample.titleKo, "string");
});

test("parseFrontmatter reads titleKo as a plain scalar", () => {
	const {frontmatter} = parseFrontmatter(["---", "title: Use Named Handlers", "titleKo: 명명된 핸들러를 쓴다", "---", "", "본문"].join("\n"));

	assert.equal(frontmatter.titleKo, "명명된 핸들러를 쓴다");
});

test("parseSections reads TitleKo placed before Description", () => {
	const source = [
		"# 섹션",
		"",
		"## 1. Ownership and Boundaries (ownership)",
		"**TitleKo:** 소유와 경계",
		"**Impact:** CRITICAL",
		"**Description:** 소유 경계가 분명해야 배치를 예측할 수",
		"  있습니다.",
	].join("\n");

	const [section] = parseSections(source);

	assert.equal(section?.titleKo, "소유와 경계");
	assert.equal(section?.title, "Ownership and Boundaries");
	assert.equal(section?.prefix, "ownership");
	assert.equal(section?.impact, "CRITICAL");
	assert.equal(section?.description, "소유 경계가 분명해야 배치를 예측할 수 있습니다.");
});

test("parseSections leaves titleKo empty when the line is absent", () => {
	const source = ["## 1. Naming (naming)", "**Impact:** HIGH", "**Description:** 설명."].join("\n");

	assert.equal(parseSections(source)[0]?.titleKo, "");
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: FAIL — `titleKo`가 `SkillRule`·`SkillSection`에 없어 타입 오류

- [ ] **Step 3: 타입에 필드를 추가한다**

`package/src/types.ts`의 `SkillRule` 안, `title` 필드 바로 아래:

```ts
	/**
	 * @field 사람이 읽는 화면에 노출할 한국어 rule 제목
	 */
	titleKo: string;
```

같은 파일 `SkillSection` 안, `title` 필드 바로 아래:

```ts
	/**
	 * @field 사람이 읽는 화면에 노출할 한국어 section 제목
	 */
	titleKo: string;
```

- [ ] **Step 4: rule 파서가 필드를 채우게 한다**

`package/src/parser.ts`의 `readSkillRules` 안 `rules.push({...})`에서 `title` 다음 줄에 추가:

```ts
			title: frontmatter.title ?? "",
			titleKo: frontmatter.titleKo ?? "",
```

- [ ] **Step 5: section 파서가 필드를 읽게 한다**

`package/src/parser.ts`의 `parseSections` 안 `impactMatch` 선언 다음 줄에 추가:

```ts
		const titleKoMatch = block.match(/^\*\*TitleKo:\*\*\s+(.+)$/m);
```

같은 함수의 반환 객체를 다음으로 바꾼다:

```ts
		return {
			order: Number(order),
			title,
			titleKo: titleKoMatch === null ? "" : titleKoMatch[1].trim(),
			prefix,
			impact: impactMatch[1].trim(),
			description,
		};
```

- [ ] **Step 6: 통과와 기존 생성물 무손상을 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts && npm run typecheck && npm run check:handbooks:all`
Expected: PASS — 8 tests, 타입 오류 없음. `check:handbooks:all`은 8개 skill 전부 "Checked …/HANDBOOK.md" 출력. `titleKo`는 `HANDBOOK.md` 렌더링에 쓰이지 않으므로 기존 생성물이 바뀌지 않아야 한다.

- [ ] **Step 7: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add package/src/types.ts package/src/parser.ts package/test/viewer.test.ts
git commit -m "feat: rule과 section frontmatter에서 한국어 제목을 읽는다"
```

---

### Task 3: viewer 페이로드를 조립한다

**Files:**
- Create: `package/src/viewer-payload.ts`
- Modify: `package/test/viewer.test.ts`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`package/test/viewer.test.ts` 끝에 추가:

```ts
import {buildViewerPayload} from "../src/viewer-payload.js";

test("buildViewerPayload collects every skill, section, and rule", async () => {
	const payload = await buildViewerPayload();

	assert.equal(payload.skills.length, 8);
	assert.equal(payload.rules.length, 212);
	assert.equal(payload.sections.length, 58);

	const react = payload.skills.find((skill) => skill.name === "react");
	assert.equal(react?.title, "React 컨벤션");
	assert.equal(react?.progressive, true);
	assert.equal(react?.ruleCount, 42);

	const astro = payload.skills.find((skill) => skill.name === "astro");
	assert.equal(astro?.progressive, false);
	assert.deepEqual(astro?.companions, []);
});

test("buildViewerPayload carries companion declarations for the header hint", async () => {
	const payload = await buildViewerPayload();
	const react = payload.skills.find((skill) => skill.name === "react");

	assert.deepEqual(react?.companions, [
		{skill: "typescript", mode: "required"},
		{skill: "css", mode: "conditional"},
	]);

	const css = payload.skills.find((skill) => skill.name === "css");
	assert.deepEqual(css?.companions, [{skill: "typescript", mode: "conditional"}]);
});

test("buildViewerPayload gives every rule a resolvable section and parsed examples", async () => {
	const payload = await buildViewerPayload();
	const sectionKeys = new Set(payload.sections.map((section) => `${section.skill}/${section.prefix}`));

	for (const rule of payload.rules) {
		assert.ok(sectionKeys.has(`${rule.skill}/${rule.sectionPrefix}`), `${rule.skill}/${rule.id} has unmapped section ${rule.sectionPrefix}`);
		assert.ok(rule.examples.length > 0, `${rule.skill}/${rule.id} has no example`);
		assert.ok(rule.impact.length > 0, `${rule.skill}/${rule.id} has no impact`);
	}
});

test("buildViewerPayload is deterministic and carries no timestamp", async () => {
	const [first, second] = await Promise.all([buildViewerPayload(), buildViewerPayload()]);

	assert.equal(JSON.stringify(first), JSON.stringify(second));
	assert.ok(!JSON.stringify(first).includes("generatedAt"), "payload must not embed a timestamp");
});

test("buildViewerPayload keeps cross-skill references resolvable", async () => {
	const payload = await buildViewerPayload();
	const keys = new Set(payload.rules.map((rule) => `${rule.skill}/${rule.id}`));
	const crossSkill = payload.rules.flatMap((rule) => [...rule.reviewWith, ...rule.requiresSelected].filter((target) => target.includes("/")));

	assert.ok(crossSkill.length > 0, "expected cross-skill targets");

	for (const target of crossSkill) {
		assert.ok(keys.has(target), `target ${target} does not resolve to a known rule`);
	}
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: FAIL — `Cannot find module '../src/viewer-payload.js'`

- [ ] **Step 3: 최소 구현을 쓴다**

`package/src/viewer-payload.ts`:

```ts
import {getSkillPaths, isBuildableSkill, listSkillNames} from "./config.js";
import {readSkillDocument} from "./parser.js";
import {parseRuleBody} from "./rule-body.js";
import type {RuleExample, RuleProseNode} from "./rule-body.js";
import type {CompanionMode} from "./types.js";

/**
 * @summary 헤더 동반 안내에 쓰는 companion 요약
 */
export interface ViewerCompanion {
	/**
	 * @field companion skill 디렉터리 이름
	 */
	skill: string;
	/**
	 * @field 항상 동반인지 조건부인지
	 */
	mode: CompanionMode;
}

/**
 * @summary 드롭다운 항목이 되는 skill
 */
export interface ViewerSkill {
	/**
	 * @field skill 디렉터리 이름
	 */
	name: string;
	/**
	 * @field metadata.json의 표시 제목
	 */
	title: string;
	/**
	 * @field progressive disclosure 사용 여부
	 */
	progressive: boolean;
	/**
	 * @field 드롭다운에 표시할 규칙 개수
	 */
	ruleCount: number;
	/**
	 * @field 이 skill이 선언한 동반 skill 목록
	 */
	companions: ViewerCompanion[];
}

/**
 * @summary 화면에 나열할 단일 rule
 */
export interface ViewerRule {
	/**
	 * @field 이 rule을 소유한 skill 이름
	 */
	skill: string;
	/**
	 * @field 확장자를 뗀 rule 파일명. 규칙 stable ID이다
	 */
	id: string;
	/**
	 * @field 영어 rule 제목. 화면 제목이 아니라 식별자와 검색에 쓴다
	 */
	title: string;
	/**
	 * @field 화면에 노출할 한국어 제목. 비어 있으면 영어 제목으로 대체된다
	 */
	titleKo: string;
	/**
	 * @field 중요도 등급
	 */
	impact: string;
	/**
	 * @field 중요도 부연 설명
	 */
	impactDescription: string;
	/**
	 * @field 이 rule이 걸리는 작업 조건
	 */
	appliesWhen: string;
	/**
	 * @field 탐색용 태그 목록
	 */
	tags: string[];
	/**
	 * @field 함께 적용해야 하는 rule stable ID 목록
	 */
	requiresSelected: string[];
	/**
	 * @field 함께 검토할 rule stable ID 목록
	 */
	reviewWith: string[];
	/**
	 * @field 소속 section prefix
	 */
	sectionPrefix: string;
	/**
	 * @field 첫 예시 이전 산문
	 */
	prose: RuleProseNode[];
	/**
	 * @field Incorrect/Correct 예시 목록
	 */
	examples: RuleExample[];
}

/**
 * @summary 화면 section 메타데이터
 */
export interface ViewerSection {
	/**
	 * @field section을 소유한 skill 이름
	 */
	skill: string;
	/**
	 * @field skill 안에서의 section 순번
	 */
	order: number;
	/**
	 * @field rule 파일명과 연결되는 prefix
	 */
	prefix: string;
	/**
	 * @field 영어 section 제목
	 */
	title: string;
	/**
	 * @field 한국어 section 제목. 비어 있으면 영어로 대체된다
	 */
	titleKo: string;
	/**
	 * @field section 중요도
	 */
	impact: string;
}

/**
 * @summary HTML에 인라인할 전체 데이터
 */
export interface ViewerPayload {
	/**
	 * @field 드롭다운 항목. skill 이름 오름차순
	 */
	skills: ViewerSkill[];
	/**
	 * @field 전체 section 목록
	 */
	sections: ViewerSection[];
	/**
	 * @field 전체 rule 목록. skill 이름, rule ID 순
	 */
	rules: ViewerRule[];
}

/**
 * @api `skill/` 전체를 읽어 화면용 페이로드로 조립
 */
export const buildViewerPayload = async (): Promise<ViewerPayload> => {
	const skills: ViewerSkill[] = [];
	const sections: ViewerSection[] = [];
	const rules: ViewerRule[] = [];

	for (const skillName of await listSkillNames()) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		const document = await readSkillDocument(getSkillPaths(skillName));

		skills.push({
			name: document.skillName,
			title: document.metadata.title,
			progressive: document.metadata.progressiveDisclosure === true,
			ruleCount: document.rules.length,
			companions: (document.metadata.companions ?? []).map((companion) => ({skill: companion.skill, mode: companion.mode})),
		});

		for (const section of document.sections) {
			sections.push({
				skill: document.skillName,
				order: section.order,
				prefix: section.prefix,
				title: section.title,
				titleKo: section.titleKo,
				impact: section.impact,
			});
		}

		for (const rule of document.rules) {
			const parsed = parseRuleBody(rule.body);

			rules.push({
				skill: document.skillName,
				id: rule.fileName.replace(/\.md$/, ""),
				title: rule.title,
				titleKo: rule.titleKo,
				impact: rule.impact,
				impactDescription: rule.impactDescription ?? "",
				appliesWhen: rule.appliesWhen ?? "",
				tags: rule.tags,
				requiresSelected: rule.requiresSelected,
				reviewWith: rule.reviewWith,
				sectionPrefix: rule.prefix,
				prose: parsed.prose,
				examples: parsed.examples,
			});
		}
	}

	rules.sort((left, right) => {
		if (left.skill !== right.skill) {
			return left.skill.localeCompare(right.skill, "en-US");
		}

		return left.id.localeCompare(right.id, "en-US");
	});

	return {skills, sections, rules};
};
```

`metadata.companions`가 `SkillMetadata`에 선언되어 있지 않아 타입 오류가 나면, `package/src/types.ts`의 `SkillMetadata`에 다음을 추가한다.

```ts
	/**
	 * @field 이 skill이 함께 활성화하는 companion 선언 목록
	 */
	companions?: SkillCompanion[];
```

- [ ] **Step 4: 통과를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts && npm run typecheck`
Expected: PASS — 13 tests, 타입 오류 없음

- [ ] **Step 5: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add package/src/viewer-payload.ts package/src/types.ts package/test/viewer.test.ts
git commit -m "feat: 8개 skill을 읽어 viewer 페이로드로 조립한다"
```

---

### Task 4: 화면과 클라이언트 동작을 담은 완전한 문서를 낸다

**Files:**
- Create: `package/src/viewer-template.ts`
- Modify: `package/src/config.ts`
- Modify: `package/test/viewer.test.ts`

화면 요구는 "문서처럼 보이지 않는 것"이다. 상단에 skill 드롭다운과 검색, 코드가 중앙, 산문은 접힘.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`package/test/viewer.test.ts` 끝에 추가:

```ts
import {encodeViewerPayload, renderViewerHtml} from "../src/viewer-template.js";

const emptyPayload = {skills: [], sections: [], rules: []};

test("encodeViewerPayload escapes angle brackets so inline JSON cannot break out", () => {
	const encoded = encodeViewerPayload({
		skills: [],
		sections: [],
		rules: [{
			skill: "react",
			id: "sample",
			title: "Sample",
			titleKo: "샘플",
			impact: "HIGH",
			impactDescription: "설명",
			appliesWhen: "조건",
			tags: ["a"],
			requiresSelected: [],
			reviewWith: [],
			sectionPrefix: "sample",
			prose: [],
			examples: [{kind: "correct", label: "", blocks: [{lang: "html", code: "</script><script>alert(1)</script>"}]}],
		}],
	});

	assert.ok(!encoded.includes("</script"), "encoded payload must not contain a literal closing script tag");
	assert.ok(encoded.includes("\\u003c"), "encoded payload must escape '<'");
	assert.equal(JSON.parse(encoded).rules[0].examples[0].blocks[0].code, "</script><script>alert(1)</script>");
});

test("renderViewerHtml emits a complete document with a utf-8 charset", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.ok(html.startsWith("<!doctype html>"), "document must start with a doctype");
	assert.match(html.slice(0, 400), /<meta charset="utf-8">/);
	assert.match(html, /<html lang="ko">/);
	assert.ok(html.trimEnd().endsWith("</html>"), "document must close html");
	assert.equal(Buffer.from(html, "utf8").toString("utf8"), html);
});

test("viewer markup exposes a single-select skill dropdown and a companion slot", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.match(html, /<select id="skill"/);
	assert.equal(/<select id="skill"[^>]*multiple/.test(html), false, "skill selector must stay single-select");
	assert.match(html, /id="companion"/);
	assert.equal(/id="f-skill"/.test(html), false, "skill chip group must be gone; the dropdown replaces it");
});

test("viewer styles use minmax(0, 1fr) on both two-column grids", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	// 1fr 만 쓰면 grid item이 콘텐츠 intrinsic min-width 아래로 줄지 못해
	// 긴 코드 한 줄이 컬럼을 밀어내고 박스가 행 밖으로 삐져나간다.
	assert.equal(/grid-template-columns:\s*1fr\s+1fr/.test(html), false, "two-column grid must not use bare 1fr");
	assert.match(html, /\.diff\s*\{[^}]*minmax\(0,\s*1fr\)/);
	assert.match(html, /\.pane\s*\{[^}]*minmax\(0,\s*1fr\)/);
	assert.match(html, /min-width:\s*0/);
});

test("viewer styles define both themes and respect reduced motion", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.match(html, /@media \(prefers-color-scheme: dark\)/);
	assert.match(html, /:root\[data-theme="dark"\]/);
	assert.match(html, /:root:not\(\[data-theme="light"\]\)/);
	assert.match(html, /prefers-reduced-motion/);
	assert.match(html, /:focus-visible/);
});

test("viewer client script indexes both languages plus code, and switches skill on cross-skill jumps", () => {
	const html = renderViewerHtml(encodeViewerPayload(emptyPayload));

	assert.match(html, /titleKo/);
	assert.match(html, /appliesWhen/);
	assert.match(html, /data-goto/);
	assert.match(html, /state\.skill\s*=/);
	assert.match(html, /localStorage/);
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: FAIL — `Cannot find module '../src/viewer-template.js'`

- [ ] **Step 3: 출력 경로를 설정에 추가한다**

`package/src/config.ts`의 `packagePaths` 선언 다음에 추가:

```ts
/**
 * @summary 사람이 읽는 생성 viewer 문서 경로
 */
export const viewerOutputPath = path.join(repoDir, "docs", "conventions.html");
```

- [ ] **Step 4: 템플릿 모듈의 공개 함수를 쓴다**

`package/src/viewer-template.ts` 선두:

```ts
import type {ViewerPayload} from "./viewer-payload.js";

/**
 * @api 인라인 JSON으로 안전하게 삽입할 수 있게 페이로드를 인코딩
 * @description `<`를 `<`로 바꿔 본문 코드의 `</script`가 문서를 끊지 못하게 한다. `JSON.parse`가 원복한다.
 */
export const encodeViewerPayload = (payload: ViewerPayload): string => {
	return JSON.stringify(payload).replace(/</g, "\\u003c");
};

/**
 * @api 인코딩된 페이로드를 담은 완전한 자기완결 HTML 문서 생성
 * @description `file://`로 열리므로 charset 선언이 없으면 브라우저가 Latin-1로 추측해 한글이 전부 깨진다.
 */
export const renderViewerHtml = (encodedPayload: string): string => {
	return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>팀 컨벤션 — 규칙 조회</title>
<style>
${viewerStyles}
</style>
</head>
<body>
${viewerBodyMarkup}
<script id="viewer-data" type="application/json">${encodedPayload}</script>
<script>
${viewerClientScript}
</script>
</body>
</html>
`;
};
```

- [ ] **Step 5: 스타일을 같은 파일에 추가한다**

토큰은 `:root`에 두고 다크는 미디어쿼리와 `[data-theme]` 양쪽에서 재정의한다. 액센트(petrol)와 diff 의미색(brick/pine)을 분리하고, impact는 순서 있는 등급이라 단일 색상 램프를 형태로 인코딩한다.

```ts
const viewerStyles = `*, *::before, *::after { box-sizing: border-box; }
h1, h2, p, ul, li, pre, button, input, select { margin: 0; padding: 0; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }

:root {
	--paper: #eef1f3; --card: #fff; --sunk: #e3e8eb;
	--ink: #141a1d; --ink-2: #47545a; --muted: #77868c;
	--rule: #d5dcdf; --rule-2: #b4bfc4;
	--accent: #0d5c7a; --accent-bg: #0d5c7a14; --on-accent: #fff;
	--bad: #b3312a; --bad-bg: #b3312a0f;
	--good: #1f6d4d; --good-bg: #1f6d4d0f;
	--ember: #a8501c; --ember-2: #a8501c1f; --on-ember: #fff;
	--mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
	--sans: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif;
}

@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
		--paper: #12171a; --card: #1a2024; --sunk: #0d1114;
		--ink: #e4eaec; --ink-2: #a9b6bb; --muted: #7b898f;
		--rule: #293237; --rule-2: #3d4950;
		--accent: #5eb3d6; --accent-bg: #5eb3d61f; --on-accent: #0d1114;
		--bad: #e0897f; --bad-bg: #e0897f14;
		--good: #5cb98d; --good-bg: #5cb98d14;
		--ember: #d18a4e; --ember-2: #d18a4e26; --on-ember: #14181a;
	}
}

:root[data-theme="dark"] {
	--paper: #12171a; --card: #1a2024; --sunk: #0d1114;
	--ink: #e4eaec; --ink-2: #a9b6bb; --muted: #7b898f;
	--rule: #293237; --rule-2: #3d4950;
	--accent: #5eb3d6; --accent-bg: #5eb3d61f; --on-accent: #0d1114;
	--bad: #e0897f; --bad-bg: #e0897f14;
	--good: #5cb98d; --good-bg: #5cb98d14;
	--ember: #d18a4e; --ember-2: #d18a4e26; --on-ember: #14181a;
}

body { background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 14px; line-height: 1.65; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.topbar { position: sticky; top: 0; z-index: 40; background: var(--paper); border-bottom: 1px solid var(--rule); }
.topbar-in { max-width: 1440px; margin: 0 auto; padding: .7rem clamp(.75rem, 2vw, 1.5rem); display: flex; align-items: center; gap: .8rem; flex-wrap: wrap; }
.brand { font-family: var(--mono); font-size: .72rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); }
.skill-select { font-family: var(--mono); font-size: .78rem; font-weight: 600; color: var(--ink); background: var(--card); border: 1px solid var(--rule-2); border-radius: 2px; padding: .42rem .5rem; }
.skill-select:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-bg); }
.companion { flex-basis: 100%; display: flex; align-items: baseline; gap: .35rem; flex-wrap: wrap; font-family: var(--mono); font-size: .64rem; color: var(--muted); }
.companion:empty { display: none; }
.search-wrap { position: relative; flex: 1 1 280px; min-width: 180px; }
.search { width: 100%; font-family: var(--mono); font-size: .84rem; color: var(--ink); background: var(--card); border: 1px solid var(--rule-2); border-radius: 2px; padding: .5rem; }
.search:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-bg); }
.count { font-family: var(--mono); font-size: .72rem; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.tbtn { font-family: var(--mono); font-size: .68rem; color: var(--ink-2); border: 1px solid var(--rule-2); border-radius: 2px; padding: .25rem .5rem; }
.tbtn:hover { color: var(--ink); border-color: var(--ink-2); }

.shell { max-width: 1440px; margin: 0 auto; padding: 0 clamp(.75rem, 2vw, 1.5rem); }
.pane { display: grid; grid-template-columns: 232px minmax(0, 1fr); gap: clamp(1rem, 2.5vw, 2rem); padding: 1.25rem 0 4rem; }
/* 여기도 minmax(0,…) 이어야 한다. 1fr 이면 main 이 못 줄어 페이지가 가로로 늘어난다. */
@media (max-width: 900px) { .pane { grid-template-columns: minmax(0, 1fr); } }
.pane > main { min-width: 0; }

.rail { align-self: start; position: sticky; top: 5rem; display: flex; flex-direction: column; gap: 1.35rem; }
@media (max-width: 900px) { .rail { position: static; } }
.rail-hd { font-family: var(--mono); font-size: .64rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); display: flex; justify-content: space-between; gap: .5rem; }
.chips { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .45rem; }
.chip { font-family: var(--mono); font-size: .68rem; color: var(--ink-2); background: var(--card); border: 1px solid var(--rule); border-radius: 2px; padding: .18rem .42rem; }
.chip:hover { border-color: var(--rule-2); color: var(--ink); }
.chip[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.n { font-variant-numeric: tabular-nums; opacity: .6; font-size: .92em; }

.imp { font-family: var(--mono); font-size: .62rem; font-weight: 600; letter-spacing: .06em; padding: .1rem .34rem; border-radius: 2px; border: 1px solid transparent; display: inline-flex; gap: .3rem; white-space: nowrap; }
.imp-CRITICAL { background: var(--ember); color: var(--on-ember); }
.imp-HIGH { background: var(--ember-2); color: var(--ember); }
.imp-MEDIUM-HIGH { border-color: var(--ember); color: var(--ember); }
.imp-MEDIUM { border-color: var(--rule-2); color: var(--muted); }

.list { display: flex; flex-direction: column; gap: .3rem; }
.row { background: var(--card); border: 1px solid var(--rule); border-left-width: 3px; border-left-color: var(--rule); border-radius: 2px; overflow: hidden; }
.row[data-imp="CRITICAL"] { border-left-color: var(--ember); }
.row[data-imp="HIGH"] { border-left-color: color-mix(in srgb, var(--ember) 55%, var(--rule)); }
.row[data-imp="MEDIUM-HIGH"] { border-left-color: color-mix(in srgb, var(--ember) 28%, var(--rule)); }
.row-hd { width: 100%; text-align: left; display: grid; grid-template-columns: 2.4rem minmax(0, 1fr) auto; align-items: baseline; gap: .1rem .7rem; padding: .6rem .75rem; }
.row-hd:hover { background: var(--sunk); }
@media (max-width: 640px) { .row-hd { grid-template-columns: 2rem minmax(0, 1fr); } .row-meta { grid-column: 2; margin-top: .3rem; } }
.row-main { display: flex; flex-direction: column; gap: .18rem; min-width: 0; }
.row-t1 { display: flex; gap: .5rem; flex-wrap: wrap; align-items: baseline; }
.row-title { font-size: .92rem; font-weight: 600; }
.row-id { font-family: var(--mono); font-size: .64rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-when { font-size: .8rem; color: var(--ink-2); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.row[data-open="1"] .row-when { display: block; }
.row-meta { display: flex; align-items: center; gap: .4rem; }
.row-ex { font-family: var(--mono); font-size: .64rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.row-body { display: none; border-top: 1px solid var(--rule); padding: .85rem .75rem 1rem; }
.row[data-open="1"] .row-body { display: block; }

.ex { display: flex; flex-direction: column; gap: .55rem; min-width: 0; }
.ex + .ex { margin-top: .9rem; }
.ex-hd { font-family: var(--mono); font-size: .66rem; font-weight: 600; display: flex; align-items: baseline; gap: .45rem; }
.ex-bad .ex-hd { color: var(--bad); }
.ex-good .ex-hd { color: var(--good); }
.ex-hd em { font-style: normal; font-weight: 400; color: var(--ink-2); font-family: var(--sans); font-size: .76rem; }

/* minmax(0,1fr): 1fr 이면 긴 코드 줄이 컬럼을 밀어내 박스가 행 밖으로 나간다. */
.diff { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: .7rem; align-items: start; }
@media (max-width: 860px) { .diff { grid-template-columns: minmax(0, 1fr); } }

.cbox { min-width: 0; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
.ex-bad .cbox { border-color: color-mix(in srgb, var(--bad) 30%, var(--rule)); background: var(--bad-bg); }
.ex-good .cbox { border-color: color-mix(in srgb, var(--good) 30%, var(--rule)); background: var(--good-bg); }
.cbox-hd { font-family: var(--mono); font-size: .62rem; color: var(--muted); padding: .28rem .5rem; border-bottom: 1px solid var(--rule); display: flex; justify-content: space-between; }
pre.code { font-family: var(--mono); font-size: .715rem; line-height: 1.6; padding: .55rem .65rem; color: var(--ink); background: var(--card); tab-size: 2; overflow-x: auto; scrollbar-width: thin; }
pre.code::-webkit-scrollbar { height: 8px; }
pre.code::-webkit-scrollbar-track { background: var(--sunk); }
pre.code::-webkit-scrollbar-thumb { background: var(--rule-2); border-radius: 4px; }
.t-c { color: var(--muted); font-style: italic; }
.t-s { color: var(--good); }
.t-k { color: var(--accent); font-weight: 600; }
.t-g { color: var(--ember); }

.why { margin-top: .9rem; border-top: 1px dashed var(--rule); padding-top: .6rem; }
.why-btn { font-family: var(--mono); font-size: .66rem; color: var(--accent); display: flex; gap: .4rem; text-align: left; }
.why-body { display: none; max-width: 68ch; margin-top: .5rem; color: var(--ink-2); font-size: .84rem; }
.why[data-open="1"] .why-body { display: block; }
.why-body p { margin: 0 0 .5rem; }
.why-body code { font-family: var(--mono); font-size: .9em; background: var(--sunk); border: 1px solid var(--rule); border-radius: 2px; padding: 0 .22em; }
.why-body .tw { overflow-x: auto; margin: 0 0 .6rem; }
.why-body table { border-collapse: collapse; font-size: .8rem; min-width: 100%; }
.why-body th, .why-body td { border: 1px solid var(--rule); padding: .25rem .5rem; text-align: left; vertical-align: top; }
.why-body th { background: var(--sunk); font-family: var(--mono); font-size: .68rem; }
.why-body pre.code { border: 1px solid var(--rule); border-radius: 2px; margin: 0 0 .6rem; }

.xr { display: flex; flex-wrap: wrap; gap: .35rem; align-items: baseline; margin-top: .75rem; }
.xr-lb { font-family: var(--mono); font-size: .62rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.xr-a { font-family: var(--mono); font-size: .66rem; color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 2px; padding: .1rem .35rem; background: var(--accent-bg); }
.xr-a:hover { border-color: var(--accent); }
.xr-a[data-ext="1"] { border-style: dashed; }
.tagrow { display: flex; flex-wrap: wrap; gap: .25rem; margin-top: .6rem; }
.tag { font-family: var(--mono); font-size: .62rem; color: var(--muted); border: 1px solid var(--rule); border-radius: 2px; padding: .05rem .3rem; }
.tag:hover { color: var(--accent); border-color: var(--accent); }
.empty { font-family: var(--mono); font-size: .78rem; color: var(--muted); text-align: center; padding: 3rem 1rem; border: 1px dashed var(--rule); }
mark { background: color-mix(in srgb, var(--ember) 35%, transparent); color: inherit; }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }`;
```

- [ ] **Step 6: 본문 마크업을 추가한다**

skill 칩 그룹은 없다. 드롭다운이 그 역할을 한다.

```ts
const viewerBodyMarkup = `<header class="topbar">
	<div class="topbar-in">
		<div class="brand">팀 컨벤션</div>
		<select id="skill" class="skill-select" aria-label="조회할 skill"></select>
		<div class="search-wrap">
			<input id="q" class="search" type="search" autocomplete="off" spellcheck="false"
				placeholder="규칙·상황·코드 검색  (handler, barrel, useEffect …)" aria-label="규칙 검색">
		</div>
		<div class="count" id="count"></div>
		<button class="tbtn" id="expand">전체 펼침</button>
		<button class="tbtn" id="theme">테마</button>
		<div class="companion" id="companion"></div>
	</div>
</header>
<div class="shell">
	<div class="pane">
		<aside class="rail">
			<div>
				<div class="rail-hd"><span>Impact</span><button class="tbtn" data-clear="impact">해제</button></div>
				<div class="chips" id="f-impact"></div>
			</div>
			<div>
				<div class="rail-hd"><span>섹션</span><button class="tbtn" data-clear="section">해제</button></div>
				<div class="chips" id="f-section"></div>
			</div>
			<div>
				<div class="rail-hd"><span>태그</span><button class="tbtn" data-clear="tags">해제</button></div>
				<div class="chips" id="f-tags"></div>
			</div>
		</aside>
		<main><div class="list" id="list"></div></main>
	</div>
</div>`;
```

- [ ] **Step 7: 클라이언트 스크립트를 추가한다**

하이라이터 자리표시자는 **NUL 문자**여야 한다. 공백+숫자를 쓰면 `arr.length > 0 ?`의 `" 0 "`과 충돌해 코드가 깨진다.

```ts
const viewerClientScript = `(() => {
	"use strict";

	const DATA = JSON.parse(document.getElementById("viewer-data").textContent);
	const RULES = DATA.rules;
	const IMPACTS = ["CRITICAL", "HIGH", "MEDIUM-HIGH", "MEDIUM"];
	const keyOf = (r) => r.skill + "/" + r.id;
	const byKey = new Map(RULES.map((r) => [keyOf(r), r]));
	const titleOf = (r) => r.titleKo || r.title;
	const secOf = (r) => DATA.sections.find((s) => s.skill === r.skill && s.prefix === r.sectionPrefix);
	const secLabel = (s) => s.titleKo || s.title;

	const state = {q: "", skill: "", impact: new Set(), section: "", tags: new Set(), open: new Set()};

	// 선택 기억. file:// 에서 막힐 수 있으므로 조용히 무시한다.
	const remember = (v) => { try { localStorage.setItem("viewer-skill", v); } catch (e) {} };
	try { state.skill = localStorage.getItem("viewer-skill") || ""; } catch (e) {}
	if (state.skill && !DATA.skills.some((s) => s.name === state.skill)) state.skill = "";

	const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	const KW = /\\b(const|let|var|function|return|if|else|for|while|export|import|from|type|interface|as|await|async|new|void|null|undefined|true|false|extends|default|typeof|in|of)\\b/g;

	function hl(code, lang) {
		let s = esc(code);
		const hold = [];
		// 자리표시자는 코드에 절대 없는 NUL 이어야 한다.
		const park = (t) => "\\u0000" + (hold.push(t) - 1) + "\\u0000";
		s = s.replace(/\\/\\/[^\\n]*/g, (m) => park('<span class="t-c">' + m + "</span>"));
		s = s.replace(/\\/\\*[\\s\\S]*?\\*\\//g, (m) => park('<span class="t-c">' + m + "</span>"));
		s = s.replace(/(&#39;|'|"|\`)(?:\\\\.|(?!\\1)[\\s\\S])*?\\1/g, (m) => park('<span class="t-s">' + m + "</span>"));
		if (lang === "tsx" || lang === "astro") {
			s = s.replace(/&lt;\\/?([A-Za-z][\\w.-]*)/g, (m, n) => m.replace(n, '<span class="t-g">' + n + "</span>"));
		}
		s = s.replace(KW, '<span class="t-k">$&</span>');
		return s.replace(/\\u0000(\\d+)\\u0000/g, (_, i) => hold[+i]);
	}

	const inline = (t) => esc(t).replace(/\`([^\`]+)\`/g, "<code>$1</code>").replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");

	function renderProse(prose) {
		let out = "", para = [], tbl = null;
		const flushP = () => { if (para.length) { out += "<p>" + inline(para.join(" ")) + "</p>"; para = []; } };
		const flushT = () => {
			if (!tbl) return;
			const head = tbl[0], body = tbl.slice(1);
			out += '<div class="tw"><table><thead><tr>' + head.map((c) => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>";
			out += body.map((r) => "<tr>" + r.map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("");
			out += "</tbody></table></div>";
			tbl = null;
		};
		for (const p of prose) {
			if (p.type === "code") { flushP(); flushT(); out += '<pre class="code">' + hl(p.code, p.lang) + "</pre>"; continue; }
			const t = p.text;
			if (/^\\s*\\|/.test(t)) {
				flushP();
				const cells = t.trim().replace(/^\\||\\|$/g, "").split("|").map((c) => c.trim());
				if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
				tbl = tbl || []; tbl.push(cells);
				continue;
			}
			flushT();
			if (!t.trim()) { flushP(); continue; }
			para.push(t.trim());
		}
		flushP(); flushT();
		return out;
	}

	function haystack(r) {
		if (r._h) return r._h;
		const code = r.examples.flatMap((e) => e.blocks.map((b) => b.code)).join("\\n");
		// 한국어·영어 제목을 모두 색인해 어느 언어로 검색해도 걸린다.
		return (r._h = [r.titleKo, r.title, r.id, r.skill, r.appliesWhen, r.impactDescription, r.tags.join(" "), code].join("\\n").toLowerCase());
	}

	function matches(r) {
		if (state.skill && r.skill !== state.skill) return false;
		if (state.section && r.sectionPrefix !== state.section) return false;
		if (state.impact.size && !state.impact.has(r.impact)) return false;
		if (state.tags.size && !r.tags.some((t) => state.tags.has(t))) return false;
		if (state.q) {
			const h = haystack(r);
			return state.q.toLowerCase().split(/\\s+/).filter(Boolean).every((t) => h.includes(t));
		}
		return true;
	}

	function hi(text) {
		const t = esc(text);
		if (!state.q) return t;
		const terms = state.q.split(/\\s+/).filter(Boolean).map((x) => x.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&"));
		return terms.length ? t.replace(new RegExp("(" + terms.join("|") + ")", "gi"), "<mark>$1</mark>") : t;
	}

	const xrHtml = (target) => {
		const ext = target.includes("/");
		const resolvable = ext && byKey.has(target);
		return '<button class="xr-a" data-ext="' + (ext ? 1 : 0) + '"' +
			(resolvable ? ' data-goto="' + esc(target) + '"' : " disabled") + ">" + esc(target) + "</button>";
	};

	function ruleHtml(r, n) {
		const open = state.open.has(keyOf(r));
		const sec = secOf(r);
		const exCount = r.examples.reduce((t, e) => t + e.blocks.length, 0);
		const pairs = [];
		for (let i = 0; i < r.examples.length; i++) {
			const e = r.examples[i];
			if (e.kind === "incorrect" && r.examples[i + 1] && r.examples[i + 1].kind === "correct") { pairs.push([e, r.examples[i + 1]]); i++; }
			else pairs.push([e]);
		}
		const cbox = (b, i, total) => '<div class="cbox"><div class="cbox-hd"><span>' + esc(b.lang) + "</span>" +
			(total > 1 ? "<span>" + (i + 1) + "/" + total + "</span>" : "") + '</div><pre class="code">' + hl(b.code, b.lang) + "</pre></div>";
		const exBlock = (e) => '<div class="ex ' + (e.kind === "incorrect" ? "ex-bad" : "ex-good") + '"><div class="ex-hd"><span aria-hidden="true">' +
			(e.kind === "incorrect" ? "\\u2715" : "\\u2713") + "</span><span>" + (e.kind === "incorrect" ? "Incorrect" : "Correct") + "</span>" +
			(e.label ? "<em>" + esc(e.label) + "</em>" : "") + "</div>" + e.blocks.map((b, i) => cbox(b, i, e.blocks.length)).join("") + "</div>";

		const body = !open ? "" : '<div class="row-body">' +
			pairs.map((p) => p.length === 2 ? '<div class="diff">' + exBlock(p[0]) + exBlock(p[1]) + "</div>" : exBlock(p[0])).join("") +
			(r.prose.length ? '<div class="why" data-open="0"><button class="why-btn" data-why="1"><span aria-hidden="true">\\u25b8</span><span>왜 이 규칙인가' +
				(r.impactDescription ? " \\u2014 " + esc(r.impactDescription) : "") + '</span></button><div class="why-body">' + renderProse(r.prose) + "</div></div>" : "") +
			(r.requiresSelected.length ? '<div class="xr"><span class="xr-lb">함께 적용</span>' + r.requiresSelected.map(xrHtml).join("") + "</div>" : "") +
			(r.reviewWith.length ? '<div class="xr"><span class="xr-lb">함께 검토</span>' + r.reviewWith.map(xrHtml).join("") + "</div>" : "") +
			'<div class="tagrow">' + r.tags.map((t) => '<button class="tag" data-tag="' + esc(t) + '">#' + esc(t) + "</button>").join("") + "</div></div>";

		return '<article class="row" data-imp="' + r.impact + '" data-open="' + (open ? 1 : 0) + '" id="r-' + r.skill + "--" + r.id + '">' +
			'<button class="row-hd" data-rule="' + keyOf(r) + '" aria-expanded="' + open + '">' +
			'<span class="row-ex">' + String(n).padStart(3, "0") + "</span>" +
			'<span class="row-main"><span class="row-t1"><span class="row-title">' + hi(titleOf(r)) + "</span>" +
			'<span class="row-id">' + hi(state.skill ? r.id : keyOf(r)) + "</span></span>" +
			'<span class="row-when">' + hi(r.appliesWhen || r.impactDescription) + "</span></span>" +
			'<span class="row-meta">' + (sec ? '<span class="row-ex">\\u00a7' + sec.order + "</span>" : "") +
			'<span class="row-ex">예시 ' + exCount + '</span><span class="imp imp-' + r.impact + '">' + r.impact + "</span></span></button>" + body + "</article>";
	}

	function renderSkillSelect() {
		const sel = document.getElementById("skill");
		sel.innerHTML = '<option value="">전체 (' + RULES.length + ")</option>" +
			DATA.skills.map((s) => '<option value="' + s.name + '">' + s.name + " (" + s.ruleCount + ")</option>").join("");
		sel.value = state.skill;
	}

	function renderCompanion() {
		const el = document.getElementById("companion");
		const skill = DATA.skills.find((s) => s.name === state.skill);
		if (!skill || skill.companions.length === 0) { el.innerHTML = ""; return; }
		el.innerHTML = "<span>동반</span>" + skill.companions.map((c) =>
			'<button class="xr-a" data-switch="' + c.skill + '">' + c.skill + (c.mode === "required" ? " 필수" : " 조건") + "</button>").join("");
	}

	function renderRail() {
		const scoped = RULES.filter((r) => !state.skill || r.skill === state.skill);
		const count = (fn) => scoped.filter(fn).length;

		document.getElementById("f-impact").innerHTML = IMPACTS.map((k) =>
			'<button class="chip imp imp-' + k + '" data-impact="' + k + '" aria-pressed="' + state.impact.has(k) + '">' + k +
			' <span class="n">' + count((r) => r.impact === k) + "</span></button>").join("");

		const secs = DATA.sections.filter((s) => !state.skill || s.skill === state.skill)
			.sort((a, b) => a.skill.localeCompare(b.skill, "en-US") || a.order - b.order);
		document.getElementById("f-section").innerHTML = secs.map((s) =>
			'<button class="chip" data-section="' + s.prefix + '" aria-pressed="' + (state.section === s.prefix) + '">' +
			(state.skill ? s.order + ". " : s.skill + " ") + secLabel(s) + ' <span class="n">' + count((r) => r.sectionPrefix === s.prefix) + "</span></button>").join("");

		const tally = new Map();
		for (const r of scoped) for (const t of r.tags) tally.set(t, (tally.get(t) || 0) + 1);
		document.getElementById("f-tags").innerHTML = [...tally.entries()].filter((e) => e[1] > 1)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.map((e) => '<button class="chip" data-tag="' + e[0] + '" aria-pressed="' + state.tags.has(e[0]) + '">' + e[0] + ' <span class="n">' + e[1] + "</span></button>").join("");
	}

	function render() {
		const hits = RULES.filter(matches);
		document.getElementById("list").innerHTML = hits.length
			? hits.map((r, i) => ruleHtml(r, i + 1)).join("")
			: '<div class="empty">일치하는 규칙이 없습니다 \\u2014 검색어나 필터를 줄여보세요</div>';
		const scopeTotal = RULES.filter((r) => !state.skill || r.skill === state.skill).length;
		document.getElementById("count").innerHTML = "<b>" + hits.length + "</b> / " + scopeTotal +
			(hits.length ? " \\u00b7 코드 <b>" + hits.reduce((n, r) => n + r.examples.reduce((m, e) => m + e.blocks.length, 0), 0) + "</b>" : "");
		const allOpen = hits.length > 0 && hits.every((r) => state.open.has(keyOf(r)));
		document.getElementById("expand").textContent = allOpen ? "전체 접기" : "전체 펼침";
		renderCompanion();
		renderRail();
	}

	function selectSkill(name) {
		state.skill = name;
		state.section = "";
		remember(name);
		document.getElementById("skill").value = name;
		render();
	}

	document.getElementById("skill").addEventListener("change", (e) => selectSkill(e.target.value));
	document.getElementById("q").addEventListener("input", (e) => { state.q = e.target.value.trim(); render(); });

	document.getElementById("expand").addEventListener("click", () => {
		const hits = RULES.filter(matches);
		const allOpen = hits.length && hits.every((r) => state.open.has(keyOf(r)));
		for (const r of hits) { const k = keyOf(r); allOpen ? state.open.delete(k) : state.open.add(k); }
		render();
	});

	document.getElementById("theme").addEventListener("click", () => {
		const cur = document.documentElement.dataset.theme;
		const dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
		document.documentElement.dataset.theme = dark ? "light" : "dark";
	});

	document.addEventListener("click", (ev) => {
		const t = ev.target.closest("[data-rule],[data-impact],[data-section],[data-tag],[data-why],[data-goto],[data-switch],[data-clear]");
		if (!t) return;
		const toggle = (set, key) => { set.has(key) ? set.delete(key) : set.add(key); render(); };

		if (t.dataset.rule) return toggle(state.open, t.dataset.rule);
		if (t.dataset.impact) return toggle(state.impact, t.dataset.impact);
		if (t.dataset.tag) return toggle(state.tags, t.dataset.tag);
		if (t.dataset.section) { state.section = state.section === t.dataset.section ? "" : t.dataset.section; return render(); }
		if (t.dataset.switch) return selectSkill(t.dataset.switch);

		if (t.dataset.why) {
			const w = t.closest(".why");
			const on = w.dataset.open === "1";
			w.dataset.open = on ? "0" : "1";
			t.firstElementChild.textContent = on ? "\\u25b8" : "\\u25be";
			return;
		}

		if (t.dataset.goto) {
			// 단일선택이라 다른 skill 규칙으로 가려면 드롭다운을 그 skill 로 전환한다.
			const key = t.dataset.goto;
			const target = byKey.get(key);
			if (!target) return;
			state.q = ""; state.impact.clear(); state.tags.clear();
			document.getElementById("q").value = "";
			state.open.add(key);
			selectSkill(target.skill);
			const el = document.getElementById("r-" + target.skill + "--" + target.id);
			if (el) el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center"});
			return;
		}

		if (t.dataset.clear) {
			if (t.dataset.clear === "impact") state.impact.clear();
			if (t.dataset.clear === "tags") state.tags.clear();
			if (t.dataset.clear === "section") state.section = "";
			render();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "/" && e.target.tagName !== "INPUT") { e.preventDefault(); document.getElementById("q").focus(); }
		if (e.key === "Escape" && e.target.id === "q") { e.target.value = ""; state.q = ""; render(); e.target.blur(); }
	});

	renderSkillSelect();
	render();
})();`;
```

- [ ] **Step 8: 통과와 형식을 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts && npm run typecheck && npm run biome:check:all`
Expected: PASS — 19 tests, 타입 오류 없음, Biome 위반 없음

- [ ] **Step 9: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add package/src/viewer-template.ts package/src/config.ts package/test/viewer.test.ts
git commit -m "feat: skill 드롭다운과 검색·필터를 갖춘 viewer 화면을 낸다"
```

---

### Task 5: 생성과 신선도 검사를 CLI로 묶는다

**Files:**
- Create: `package/src/viewer.ts`
- Create: `package/src/check-viewer.ts`
- Modify: `package/package.json`
- Modify: `package/test/viewer.test.ts`

**이 태스크가 끝나면 화면이 뜬다.** 한국어 제목이 하나도 없어도 영어 제목으로 대체되어 212개 규칙이 전부 조회된다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`package/test/viewer.test.ts` 끝에 추가:

```ts
import {readFile} from "node:fs/promises";

import {checkGeneratedViewer} from "../src/check-viewer.js";
import {viewerOutputPath} from "../src/config.js";
import {generateViewerHtml} from "../src/viewer.js";

test("generateViewerHtml embeds every rule and stays byte-stable", async () => {
	const [first, second] = await Promise.all([generateViewerHtml(), generateViewerHtml()]);

	assert.equal(first, second, "viewer output must be deterministic");
	assert.ok(first.startsWith("<!doctype html>"));
	assert.match(first.slice(0, 400), /<meta charset="utf-8">/);

	const encoded = /<script id="viewer-data" type="application\/json">(.*?)<\/script>/s.exec(first)?.[1];
	assert.ok(encoded, "expected an inline payload");

	const payload = JSON.parse(encoded);
	assert.equal(payload.rules.length, 212);
	assert.equal(payload.skills.length, 8);
	assert.equal(payload.sections.length, 58);
});

test("checkGeneratedViewer rejects a stale committed document", async () => {
	const committed = await readFile(viewerOutputPath, "utf8");
	const expected = await generateViewerHtml();

	assert.equal(committed, expected, "docs/conventions.html is stale. Run: npm run viewer");
	await checkGeneratedViewer();
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: FAIL — `Cannot find module '../src/viewer.js'`

- [ ] **Step 3: 생성 CLI를 쓴다**

`package/src/viewer.ts`:

```ts
import path from "node:path";

import {packagePaths, viewerOutputPath} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {replaceGeneratedFiles} from "./generated-files.js";
import {buildViewerPayload} from "./viewer-payload.js";
import {encodeViewerPayload, renderViewerHtml} from "./viewer-template.js";

/**
 * @description 현재 source 기준 viewer 문서를 write 없이 렌더링
 */
export const generateViewerHtml = async (): Promise<string> => {
	return renderViewerHtml(encodeViewerPayload(await buildViewerPayload()));
};

/**
 * @description viewer 문서를 생성해 `docs/conventions.html`에 기록
 */
export const buildViewer = async (): Promise<void> => {
	await replaceGeneratedFiles([{targetPath: viewerOutputPath, content: await generateViewerHtml()}]);
	console.log(`Wrote ${path.relative(packagePaths.repoDir, viewerOutputPath)}`);
};

/**
 * @description CLI 진입점
 */
export const main = async (): Promise<void> => {
	await buildViewer();
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
```

- [ ] **Step 4: 신선도 검사를 쓴다**

`package/src/check-viewer.ts` — `check-handbooks.ts`와 같은 전략이다.

```ts
import path from "node:path";

import {packagePaths, viewerOutputPath} from "./config.js";
import {isDirectExecution} from "./entrypoint.js";
import {readGeneratedRegularFile} from "./generated-files.js";
import {generateViewerHtml} from "./viewer.js";

/**
 * @description 생성된 viewer 문서가 현재 source renderer와 일치하는지 write 없이 확인
 */
export const checkGeneratedViewer = async (): Promise<void> => {
	const expected = await generateViewerHtml();
	let actual: string;

	try {
		actual = await readGeneratedRegularFile(viewerOutputPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(`missing generated viewer at ${viewerOutputPath}. Run the viewer build.`);
		}

		throw error;
	}

	if (actual !== expected) {
		throw new Error(`stale generated viewer at ${viewerOutputPath}. Run the viewer build.`);
	}
};

/**
 * @description CLI 진입점
 */
export const main = async (): Promise<void> => {
	await checkGeneratedViewer();
	console.log(`Checked ${path.relative(packagePaths.repoDir, viewerOutputPath)}`);
};

if (await isDirectExecution(import.meta.url)) {
	await main();
}
```

- [ ] **Step 5: npm 스크립트를 추가한다**

`package/package.json`의 `scripts`에 추가한다.

```json
		"viewer": "tsx src/viewer.ts",
		"check:viewer": "tsx src/check-viewer.ts",
```

그리고 기존 검사 체인을 바꾼다.

```json
		"check:measurement-artifacts": "npm run check:generated:all && npm run check:handbooks:all && npm run check:viewer",
```

- [ ] **Step 6: 문서를 처음 생성한다**

Run: `cd package && npm run viewer`
Expected: `Wrote docs/conventions.html`

- [ ] **Step 7: 검사와 테스트를 돌린다**

Run: `cd package && npm run check:viewer && npx tsx --test test/viewer.test.ts`
Expected: `Checked docs/conventions.html` 후 PASS — 21 tests

- [ ] **Step 8: 신선도 검사가 실제로 낡음을 잡는지 확인한다**

```bash
cd /Users/l-20220017/workspace/agent-conventions
printf '\n<!-- 인위적 오염 -->\n' >> docs/conventions.html
cd package && npm run check:viewer
```

Expected: FAIL — `stale generated viewer at …/docs/conventions.html. Run the viewer build.`

되돌린다.

```bash
cd package && npm run viewer && npm run check:viewer
```

Expected: `Wrote docs/conventions.html` 후 `Checked docs/conventions.html`

- [ ] **Step 9: 브라우저에서 실제로 확인한다**

```bash
cd /Users/l-20220017/workspace/agent-conventions && open docs/conventions.html
```

눈으로 확인할 것:
- 한글이 깨지지 않는다
- 드롭다운에 `전체 (212)` + skill 8개가 보이고, 고르면 목록과 카운트가 그 skill로 좁혀진다
- `react`를 고르면 헤더에 `동반 typescript 필수 · css 조건`이 뜬다. 누르면 드롭다운이 그 skill로 바뀐다
- 규칙을 펼치면 Incorrect / Correct가 좌우로 나란히 나오고, 코드 박스가 행 밖으로 삐져나가지 않는다
- 다른 skill 교차참조 칩(점선)을 누르면 드롭다운이 자동 전환되고 대상 규칙이 펼쳐진다
- 창을 좁혀도 페이지가 가로로 스크롤되지 않는다
- 새로고침하면 마지막에 고른 skill이 유지된다
- 이 시점에는 제목이 영어다. 정상이다 — Task 6부터 한국어로 바뀐다

- [ ] **Step 10: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add package/src/viewer.ts package/src/check-viewer.ts package/package.json package/test/viewer.test.ts docs/conventions.html
git commit -m "feat: viewer 생성과 신선도 검사를 CLI로 묶는다"
```

---

### Task 6: react 규칙 42개에 `titleKo`를 채운다

**Files:**
- Modify: `skill/react/rules/*.md` (42개)
- Modify: `skill/react/rules/_sections.md`

아래 값은 초안 검토를 거친 제안이다. 규칙 본문을 읽고 어긋나는 것이 있으면 고쳐서 넣을 것.

- [ ] **Step 1: 섹션 10개에 한국어 제목을 넣는다**

`skill/react/rules/_sections.md`의 각 `## N. …` 헤더 **바로 아래, `**Impact:**` 위**에 한 줄씩 넣는다. description 정규식이 탐욕적이라 Description 뒤에 놓으면 삼켜진다.

| prefix | 넣을 줄 |
| --- | --- |
| ownership | `**TitleKo:** 소유와 경계` |
| typing | `**TitleKo:** 타입과 계약` |
| strategy | `**TitleKo:** 조립 전략` |
| composition | `**TitleKo:** 컴포넌트 구조와 JSX` |
| screen | `**TitleKo:** 화면 파일 규율` |
| events | `**TitleKo:** 이벤트와 상호작용 흐름` |
| data | `**TitleKo:** 서버 데이터 흐름` |
| state | `**TitleKo:** 로컬 상태` |
| perf | `**TitleKo:** 렌더 성능` |
| docs | `**TitleKo:** 문서화와 주석` |

예시:

```md
## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** Shared UI, widget, route-local 코드는 소유 경계가 분명해야 에이전트가 코드를 예측 가능하게 배치할 수
  있습니다.
```

- [ ] **Step 2: 규칙 42개에 `titleKo`를 넣는다**

각 파일 frontmatter의 `title:` 바로 아래에 넣는다.

| 파일 (`skill/react/rules/`) | `titleKo` |
| --- | --- |
| `composition-destructure-props-inside.md` | props는 통째로 받고 컴포넌트 안에서 구조분해 |
| `composition-do-not-define-components-inside-components.md` | 컴포넌트 안에 컴포넌트를 정의하지 않기 |
| `composition-named-handlers-over-inline.md` | 로직을 JSX에 숨기지 말고 명명된 핸들러로 |
| `composition-prefer-arrow-functions-and-object-params.md` | 복잡한 시그니처는 화살표 함수와 객체 매개변수로 |
| `composition-use-activity-for-render-branches.md` | 표시·숨김 분기는 visibility primitive를 의도적으로 선택 |
| `composition-use-ref-prop-instead-of-forwardref-in-react-19.md` | React 19에서는 새 forwardRef 대신 ref prop |
| `data-avoid-fallback-defaults-and-loading-flags.md` | 조용한 fallback 기본값과 임시 loading 분기 피하기 |
| `data-name-query-and-mutation-bindings-consistently.md` | query·mutation 바인딩 이름을 일관되게 |
| `data-preserve-origin-chaining.md` | 넓은 스코프에서는 응답·store 출처를 보존 |
| `data-shape-query-data-with-select.md` | React Query 데이터는 query.select에서 가공 |
| `docs-document-compound-parts-with-part-and-description.md` | compound part는 @part와 @description으로 문서화 |
| `docs-limit-inline-comments-to-non-obvious-logic.md` | 인라인 주석은 자명하지 않은 로직에만 |
| `docs-require-jsdoc-on-key-declarations.md` | hook·handler·핵심 선언에는 JSDoc 필수 |
| `events-keep-handler-flow-inline.md` | 화면 전용 핸들러 흐름은 진짜 유틸이 될 때까지 로컬에 |
| `events-name-and-curry-handlers.md` | 핸들러 이름은 예측 가능하게, 추가 인자는 커링으로 |
| `events-run-user-actions-in-handlers-not-effects.md` | 사용자 동작은 effect가 아니라 handler에서 |
| `ownership-avoid-barrel-and-react-namespace-imports.md` | barrel export와 React namespace 타입 피하기 |
| `ownership-layer-component-boundaries.md` | ui·widget·-local 소유 레이어를 섞지 않기 |
| `ownership-place-route-local-files-by-scope.md` | route-local 파일은 시각적 범위에 따라 배치 |
| `ownership-prefer-plain-ts-for-local-react-helpers.md` | 순수 로직에 화면 전용 custom hook 만들지 않기 |
| `ownership-shared-config-entry-points.md` | 공용 상수는 shared/config.ts를 거치게 |
| `ownership-use-consistent-file-and-symbol-naming.md` | 파일·심볼 이름을 일관되게 |
| `perf-compiler-first-memoization.md` | 수동 memoization보다 React Compiler 기본값 |
| `perf-use-lazy-state-initializers-for-expensive-defaults.md` | 비싼 기본값은 lazy state initializer로 |
| `perf-use-starttransition-for-non-urgent-updates.md` | 급하지 않은 시각 갱신은 startTransition으로 |
| `perf-use-usedeferredvalue-for-heavy-derived-renders.md` | 무거운 파생 렌더에는 useDeferredValue |
| `screen-avoid-premature-abstraction.md` | 화면 코드의 조급한 추상화 피하기 |
| `screen-extract-local-section-components-for-runtime-boundaries.md` | route-local 섹션 컴포넌트는 런타임 경계일 때만 추출 |
| `screen-extract-utilities-selectively.md` | 화면 support 코드는 경계가 실재할 때만 추출 |
| `screen-keep-derived-values-close.md` | 파생 값은 쓰는 곳 가까이 |
| `screen-keep-route-flow-visible.md` | route entry 파일은 화면 흐름에만 집중 |
| `screen-move-pure-support-code-out-of-entry-files.md` | 화면 소유 순수 코드는 더 쪼개기 전에 page.ts로 |
| `state-calculate-derived-values-during-render.md` | 파생 값은 렌더 중에 계산 |
| `state-choose-state-tools-by-source-of-truth.md` | state 도구는 source of truth 기준으로 선택 |
| `state-store-derived-authority.md` | 공유 파생 결정은 진짜 공유될 때만 store에 |
| `state-use-effectevent-for-non-reactive-effect-callbacks.md` | 비반응성 effect 콜백에는 useEffectEvent |
| `state-use-functional-setstate-updates.md` | 이전 state 기반 갱신은 함수형 setState로 |
| `strategy-avoid-boolean-prop-proliferation.md` | 공용 컴포넌트에 boolean prop 남발하지 않기 |
| `strategy-choose-single-composition-compound-and-variants.md` | 단일·compound·variant 조립 구조를 의도적으로 선택 |
| `strategy-prefer-children-over-render-props.md` | 정적 조립에는 render prop보다 children |
| `typing-function-type-first.md` | 이벤트 매개변수 인라인 타입보다 React handler alias |
| `typing-reuse-existing-contracts.md` | 새 타입 만들기 전에 기존 prop·API 계약 재사용 |

예시 (`composition-named-handlers-over-inline.md` 선두):

```md
---
title: Use Named Handlers Instead of Hiding Logic in JSX
titleKo: 로직을 JSX에 숨기지 말고 명명된 핸들러로
impact: HIGH
impactDescription: 부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 함
```

- [ ] **Step 3: 누락이 없는지 기계로 확인한다**

```bash
cd /Users/l-20220017/workspace/agent-conventions
for f in skill/react/rules/*.md; do
  case "$(basename "$f")" in _*) continue;; esac
  /usr/bin/grep -q '^titleKo:' "$f" || echo "누락: $f"
done
echo "섹션 TitleKo: $(/usr/bin/grep -c '^\*\*TitleKo:\*\*' skill/react/rules/_sections.md)"
```

Expected: "누락:" 줄이 없고 `섹션 TitleKo: 10`

- [ ] **Step 4: 기존 생성물 무손상과 화면을 확인한다**

```bash
cd package && npm run validate:react && npm run check:handbooks:all && npm run viewer
cd /Users/l-20220017/workspace/agent-conventions
python3 -c "
import json, re, pathlib
h = pathlib.Path('docs/conventions.html').read_text(encoding='utf-8')
d = json.loads(re.search(r'<script id=\"viewer-data\" type=\"application/json\">(.*?)</script>', h, re.S).group(1))
react = [r for r in d['rules'] if r['skill'] == 'react']
filled = [r for r in react if r['titleKo']]
print(f'react {len(react)}개 중 titleKo 채움 {len(filled)}개')
assert len(filled) == 42, '42개가 아니다'
print('샘플:', filled[0]['titleKo'])
"
```

Expected: `check:handbooks:all` 통과 후 `react 42개 중 titleKo 채움 42개`

- [ ] **Step 5: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add skill/react/rules docs/conventions.html
git commit -m "docs: react 규칙과 섹션에 한국어 제목을 넣는다"
```

---

### Task 7: 남은 7개 skill에 `titleKo`를 채운다

**Files:**
- Modify: `skill/<skill>/rules/*.md`, `skill/<skill>/rules/_sections.md` (skill별로 하나씩)

**이 태스크는 코드가 아니라 콘텐츠 작업이다.** 한국어 제목 170개를 계획서가 대신 지어낼 수 없다 — 규칙 본문을 읽은 사람이 쓰고 리뷰해야 하는 값이고, 잘못된 제목은 정본에 남는다. 그래서 채울 목록·형식·검증 명령·완료 기준만 확정해 둔다.

**skill 하나를 한 커밋으로 한다.** 7개를 한 번에 하지 말 것. 순서는 아래 표대로 — `typescript`와 `css`가 react의 동반이라 가장 먼저다.

| 순서 | skill | 규칙 | 섹션 | 첫 파일의 영어 `title` (Step 1 결과 대조용) |
| --- | --- | --- | --- | --- |
| 1 | `typescript` | 22 | 6 | Expose Optional Values Instead of Silent Fallbacks |
| 2 | `css` | 21 | 5 | Compose Classes With `clsx()` |
| 3 | `astro` | 42 | 11 | Compose Page-level Documents Through `_document.astro` and `_head.astro` |
| 4 | `tanstack-route` | 24 | 6 | Export `Route` at the Top of the File |
| 5 | `nestjs` | 21 | 7 | Keep Inline Comments for Domain Rules and Library Caveats |
| 6 | `playwright-test` | 25 | 7 | Follow the Declared Integration or E2E Writing Sequence |
| 7 | `figma-visual-parity` | 15 | 6 | Classify Static UI Copy and Dynamic Values |

**각 skill마다 아래 6단계를 반복한다.** `SKILL` 변수만 바꾼다.

- [ ] **Step 1: 채울 목록을 뽑는다**

```bash
cd /Users/l-20220017/workspace/agent-conventions
SKILL=typescript   # 표의 순서대로 바꿔가며 실행
for f in skill/$SKILL/rules/*.md; do
  case "$(basename "$f")" in _*) continue;; esac
  printf '%-72s %s\n' "$(basename "$f")" "$(/usr/bin/grep -m1 '^title:' "$f" | /usr/bin/sed 's/^title: //')"
done
echo "--- 섹션 ---"
/usr/bin/grep '^## ' skill/$SKILL/rules/_sections.md
```

- [ ] **Step 2: 규칙마다 `titleKo:` 를 넣는다**

`title:` 바로 아래 한 줄. 작성 기준:

- 코드 식별자는 영어로 남긴다 (`forwardRef`, `query.select`, `clsx()`, `Route`, `_document.astro`). 한국 개발자가 실제로 말하는 방식이다.
- 명사구보다 **동작 지시**로 쓴다. "핸들러 명명" 대신 "명명된 핸들러로".
- 40자 이내. 행 목록에서 한 줄로 읽혀야 한다.
- 영어 `title`의 직역이 아니라 같은 뜻의 자연스러운 한국어.

- [ ] **Step 3: 섹션에 `**TitleKo:**` 를 넣는다**

`skill/$SKILL/rules/_sections.md`의 각 `## N. …` 아래, **`**Impact:**` 위**에 넣는다.

- [ ] **Step 4: 누락을 기계로 확인한다**

```bash
cd /Users/l-20220017/workspace/agent-conventions
SKILL=typescript
missing=0
for f in skill/$SKILL/rules/*.md; do
  case "$(basename "$f")" in _*) continue;; esac
  /usr/bin/grep -q '^titleKo:' "$f" || { echo "누락: $f"; missing=1; }
done
echo "섹션 TitleKo: $(/usr/bin/grep -c '^\*\*TitleKo:\*\*' skill/$SKILL/rules/_sections.md)"
test $missing -eq 0 && echo "규칙 전부 채움"
```

Expected: `규칙 전부 채움`, 섹션 수가 표와 일치

- [ ] **Step 5: 검증과 재생성**

```bash
cd package && npm run validate:typescript && npm run check:handbooks:all && npm run viewer
```

Expected: 전부 통과. `check:handbooks:all`이 깨지면 `titleKo`가 `HANDBOOK.md`에 새는 것이므로 렌더러를 확인할 것.

- [ ] **Step 6: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add skill/typescript/rules docs/conventions.html
git commit -m "docs: typescript 규칙과 섹션에 한국어 제목을 넣는다"
```

- [ ] **Step 7: 7개 skill 전부 반복했는지 확인한다**

```bash
cd /Users/l-20220017/workspace/agent-conventions
total=0; missing=0
for f in skill/*/rules/*.md; do
  case "$(basename "$f")" in _*) continue;; esac
  total=$((total+1))
  /usr/bin/grep -q '^titleKo:' "$f" || missing=$((missing+1))
done
echo "규칙 $total개 중 누락 $missing개"
echo "섹션 TitleKo 합계: $(/usr/bin/grep -hc '^\*\*TitleKo:\*\*' skill/*/rules/_sections.md | paste -sd+ - | bc)"
```

Expected: `규칙 212개 중 누락 0개`, `섹션 TitleKo 합계: 58`

---

### Task 8: `titleKo`를 필수로 전환한다

**Files:**
- Modify: `package/src/validate.ts`
- Modify: `package/test/viewer.test.ts`

Task 6·7이 **모두** 끝난 뒤에만 진행한다. 하나라도 비어 있으면 8개 skill 전체 validate가 깨진다.

- [ ] **Step 1: 212개가 모두 채워졌는지 먼저 확인한다**

Task 7 Step 7의 명령을 다시 돌린다.
Expected: `규칙 212개 중 누락 0개`, `섹션 TitleKo 합계: 58`. 누락이 있으면 여기서 멈추고 Task 7로 돌아간다.

- [ ] **Step 2: 실패하는 테스트를 쓴다**

`package/test/viewer.test.ts` 끝에 추가:

```ts
test("every rule and section in the repository carries a Korean title", async () => {
	const payload = await buildViewerPayload();

	for (const rule of payload.rules) {
		assert.ok(rule.titleKo.length > 0, `${rule.skill}/${rule.id} is missing titleKo`);
	}

	for (const section of payload.sections) {
		assert.ok(section.titleKo.length > 0, `${section.skill}/${section.prefix} section is missing TitleKo`);
	}
});
```

- [ ] **Step 3: 테스트가 통과하는지 확인한다**

Run: `cd package && npx tsx --test test/viewer.test.ts`
Expected: PASS — 22 tests. 실패하면 Step 1로 돌아간다.

- [ ] **Step 4: rule 검증을 추가한다**

`package/src/validate.ts`의 `title` 검증 블록 바로 아래에 넣는다.

```ts
		if (!rule.titleKo) {
			throw new Error(`${skillPaths.skillName}: ${rule.fileName} is missing frontmatter key "titleKo".`);
		}
```

- [ ] **Step 5: section 검증을 추가한다**

**기존 `for (const section of sections)` 루프(약 69행)를 쓰지 말 것** — 그 루프는 `if (metadata.progressiveDisclosure === true)` 안에 있어서 8개 중 3개 skill에만 돈다. `titleKo`는 전부 필요하므로 별도 루프를 둔다.

`sections.length === 0` 검사 블록(약 64-66행) 바로 **다음**, `if (metadata.progressiveDisclosure === true)` 블록 **앞**에 넣는다.

```ts
	for (const section of sections) {
		if (!section.titleKo) {
			throw new Error(`${skillPaths.skillName}: section "${section.title}" is missing "**TitleKo:**" in rules/_sections.md.`);
		}
	}
```

- [ ] **Step 6: 8개 skill 전부 validate를 돌린다**

Run: `cd package && npm run validate:all`
Expected: 8개 skill 전부 통과

- [ ] **Step 7: 검증이 실제로 누락을 잡는지 확인한다**

```bash
cd /Users/l-20220017/workspace/agent-conventions
cp skill/react/rules/typing-function-type-first.md /tmp/titleko-backup.md
/usr/bin/sed -i '' '/^titleKo:/d' skill/react/rules/typing-function-type-first.md
cd package && npm run validate:react
```

Expected: FAIL — `react: typing-function-type-first.md is missing frontmatter key "titleKo".`

되돌린다.

```bash
cp /tmp/titleko-backup.md /Users/l-20220017/workspace/agent-conventions/skill/react/rules/typing-function-type-first.md
rm /tmp/titleko-backup.md
cd package && npm run validate:react
```

Expected: 통과

- [ ] **Step 8: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add package/src/validate.ts package/test/viewer.test.ts
git commit -m "feat: titleKo와 섹션 TitleKo를 필수로 검증한다"
```

---

### Task 9: 문서를 갱신하고 전체를 검증한다

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Delete: `docs/react-rules-preview.html`

- [ ] **Step 1: 스냅샷 초안을 지운다**

커밋 `ab9518e`의 `docs/react-rules-preview.html`은 react 42개만 담은 손뜬 스냅샷이고 이미 정본과 어긋났다. `docs/conventions.html`이 대체한다.

```bash
cd /Users/l-20220017/workspace/agent-conventions
git rm docs/react-rules-preview.html
```

- [ ] **Step 2: README의 핸드북 안내를 바꾼다**

`README.md`의 "1.3 담당 영역 핸드북" 절 도입부를 다음으로 교체한다. 기존 skill별 `HANDBOOK.md` 표는 그대로 두고 앞에 문단만 넣는다.

```md
### 1.3 담당 영역 핸드북

사람이 규칙을 찾을 때는 [docs/conventions.html](./docs/conventions.html) 을 먼저 연다.
8개 skill 212개 규칙이 한 장에 들어 있고, 상단 드롭다운으로 담당 skill만 남긴다.
브라우저로 파일을 그냥 열면 된다. 서버가 필요 없다.

규칙마다 Incorrect / Correct 코드가 나란히 나오고 근거 산문은 접혀 있다.
`CRITICAL` 부터 훑으려면 왼쪽 Impact 필터에서 `CRITICAL` 만 켠다.
다른 skill 규칙을 가리키는 점선 칩을 누르면 드롭다운이 그 skill로 자동 전환된다.

`HANDBOOK.md` 는 에이전트가 전체 검토를 요청받았을 때 읽는 생성물이다.
사람이 통독할 문서로 만들어진 것이 아니다.
```

- [ ] **Step 3: CONTRIBUTING에 새 필드와 재생성 절차를 넣는다**

`CONTRIBUTING.md`에 절을 추가한다. 삽입 위치는 규칙 추가 절차를 설명하는 절 다음이다.

````md
## 한국어 제목

규칙마다 `title`(영어)과 `titleKo`(한국어) 둘 다 필수다.

- `title` 은 `HANDBOOK.md` 헤딩과 앵커 슬러그의 기반이다. 바꾸면 링크가 깨지니 함부로 손대지 않는다.
- `titleKo` 는 사람이 보는 화면에 노출된다. 코드 식별자는 영어로 남기고 40자 이내로 쓴다.

```md
---
title: Use Named Handlers Instead of Hiding Logic in JSX
titleKo: 로직을 JSX에 숨기지 말고 명명된 핸들러로
impact: HIGH
```

섹션도 같다. `rules/_sections.md` 의 각 헤더 아래, **`**Impact:**` 위**에 넣는다.
`**Description:**` 뒤에 놓으면 description 값으로 삼켜진다.

```md
## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** …
```

## 생성물 재생성

규칙을 고쳤으면 생성물을 다시 만든다.

```bash
cd package
npm run build:all      # HANDBOOK.md, RULES_INDEX.md, contracts/
npm run viewer         # docs/conventions.html
npm run validate:all
npm run check:measurement-artifacts
```

`docs/conventions.html` 은 생성물이다. 직접 편집하지 않는다.
낡은 채로 커밋하면 `npm run check:viewer` 가 막는다.
````

- [ ] **Step 4: 죽은 링크가 없는지 확인한다**

`documentation.test.ts`는 `package/src/**`의 JSDoc 규약을 검사하는 테스트이고 markdown 링크는 보지 않는다. 링크는 직접 확인한다.

```bash
cd /Users/l-20220017/workspace/agent-conventions
for f in README.md CONTRIBUTING.md AGENTS.md; do
  /usr/bin/grep -o '](\./[^)]*)' "$f" | /usr/bin/sed 's/](\.\///;s/)$//' | while read -r p; do
    test -e "$p" || echo "죽은 링크: $f -> $p"
  done
done
test -f docs/react-rules-preview.html && echo "초안이 아직 있다 (실패)" || echo "초안 제거됨"
```

Expected: "죽은 링크:" 줄이 없고 `초안 제거됨`

- [ ] **Step 5: 전체 테스트·타입·형식**

Run: `cd package && npm test && npm run typecheck && npm run biome:check:all`
Expected: 전부 PASS, 오류 0, 위반 0

- [ ] **Step 6: 생성물 전체 재생성과 신선도**

```bash
cd package
npm run build:all
npm run viewer
npm run validate:all
npm run check:measurement-artifacts
```

Expected: 마지막 명령이 `check:generated:all`, `check:handbooks:all`, `check:viewer` 세 단계를 모두 통과

- [ ] **Step 7: 재생성이 파일을 바꾸지 않는지 확인한다 (결정성)**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git status --short
```

Expected: 문서 변경 외에는 출력 없음. 생성물이 계속 바뀌면 결정적이지 않다는 뜻이다. 타임스탬프나 정렬 불안정을 찾을 것.

- [ ] **Step 8: 이탈을 기계로 재확인한다**

Chrome이 있으면 수치로 확인한다.

```bash
cd /Users/l-20220017/workspace/agent-conventions
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
python3 - <<'PY'
import pathlib
h = pathlib.Path("docs/conventions.html").read_text(encoding="utf-8")
probe = """
<div id="probe-out"></div>
<script>
document.getElementById("expand").click();
let over = 0, worst = 0;
for (const row of document.querySelectorAll(".row")) {
  const rb = row.getBoundingClientRect();
  for (const b of row.querySelectorAll(".cbox")) {
    const d = Math.round(b.getBoundingClientRect().right - rb.right);
    if (d > 1) { over++; if (d > worst) worst = d; }
  }
}
const de = document.documentElement;
document.getElementById("probe-out").textContent = "PROBE " + JSON.stringify({
  overflowing: over, worstPx: worst, bodySideways: de.scrollWidth > de.clientWidth});
</script>
</body>"""
pathlib.Path("/tmp/viewer-probe.html").write_text(h.replace("</body>", probe), encoding="utf-8")
PY
for w in 1600 1200 900 700 420; do
  printf "%5spx  " "$w"
  "$CHROME" --headless --disable-gpu --window-size=$w,1000 \
    --dump-dom "file:///tmp/viewer-probe.html" 2>/dev/null | /usr/bin/grep -o 'PROBE {[^<]*'
done
rm -f /tmp/viewer-probe.html
```

Expected: 모든 폭에서 `"overflowing":0`, `"bodySideways":false`

- [ ] **Step 9: 브라우저 최종 확인**

```bash
cd /Users/l-20220017/workspace/agent-conventions && open docs/conventions.html
```

Task 5 Step 9의 항목을 다시 확인한다. 이번에는 제목이 전부 한국어여야 한다.

- [ ] **Step 10: 커밋**

```bash
cd /Users/l-20220017/workspace/agent-conventions
git add README.md CONTRIBUTING.md
git commit -m "docs: 사람 동선을 생성 viewer로 바꾸고 스냅샷 초안을 걷는다"
```

---

## Self-Review

**스펙 커버리지**

| 요구 | 태스크 |
| --- | --- |
| 8개 skill 212개 규칙 전부 한 장에 | Task 3 (payload), Task 4 (렌더), Task 5 Step 9 |
| skill 이동은 단일선택 드롭다운 | Task 4 Step 6·7, 설계 결정 2 |
| 동반 왕복 비용 완화 | Task 4 Step 7 (`data-goto` 자동 전환, `data-switch` 동반 칩) |
| 사람은 `.md` 를 안 본다 | Task 9 (README 동선 변경) |
| 한국어 제목 우선 | Task 2 (스키마), 6·7 (값), 8 (강제) |
| 영어는 식별자로 유지 | Task 4 (`row-id`, 검색 색인), 설계 결정 6 |
| 검색이 코드까지 훑는다 | Task 4 (`haystack`) |
| Incorrect/Correct 나란히 | Task 4 (`.diff`), Task 9 Step 8 |
| 산문은 접힘 | Task 4 (`.why`) |
| 정본과 어긋날 수 없다 | Task 5 (신선도 검사 + 검사 체인 편입) |
| 서버 불필요 | Task 4 (완전 문서 + charset) |
| 인코딩 깨짐 재발 방지 | Task 4 Step 1 (charset 회귀 테스트) |
| diff 레이아웃 깨짐 재발 방지 | Task 4 Step 1 (minmax 가드 테스트) |

**의도적으로 넣지 않은 것**

- **한국어 제목 170개의 실제 값** (Task 7). 규칙 본문을 읽은 사람이 써야 하는 콘텐츠이고, 계획서가 지어내면 잘못된 값이 정본에 박힌다. 대신 목록·형식·검증 명령·완료 기준을 확정했다. react 42개는 초안이 있어 전량 수록했다.
- **skill 다중선택.** 단일선택 드롭다운으로 결정됐다. react가 typescript를 `required`로 동반하는 것과 상충하지만, 교차참조 자동 전환과 동반 칩으로 왕복을 한 번 클릭으로 줄였다. 실제로 두 skill을 나란히 봐야 하면 드롭다운에서 `전체`를 고른다.
- **영어 번역본 세트.** 실측 결과 에이전트 1회 호출 비용이 약 6,056 tok이고 영어 전환 절감은 1,000 tok 미만(컨텍스트의 0.5% 미만)이다. 그 이득으로 정본 이원화와 "에이전트는 낡은 규칙을 집행하고 사람은 새 규칙을 읽는" 실패 모드를 살 수 없다.
- **프레임워크 도입** (Astro/Starlight 등). 전체 콘텐츠 358KB가 한 장에 들어가고, Pagefind 같은 검색 인덱스는 `fetch`를 쓰기 때문에 `file://`에서 CORS로 죽는다. 서버를 띄워야 하는 문서는 "안 띄우는 사람은 안 본다".
- **mermaid/PlantUML 다이어그램.** 212개 규칙 전부가 이미 Incorrect/Correct 코드 쌍을 갖고 있다. 이 콘텐츠의 시각 형태는 코드 diff다. 다이어그램이 값을 내는 두 곳(skill 동반 그래프, 라우팅 흐름)은 `overview.html`에 이미 SVG로 있다.

**타입 일관성 확인**

`RuleCodeBlock` / `RuleExample` / `RuleProseNode` / `ParsedRuleBody` (Task 1) → `ViewerRule.prose`·`examples` (Task 3)에서 그대로 재사용. `ViewerCompanion` / `ViewerSkill` / `ViewerSection` / `ViewerRule` / `ViewerPayload` (Task 3) → `encodeViewerPayload(payload)` 인자, `renderViewerHtml(encodedPayload)` 은 인코딩된 **문자열**을 받는다 (Task 4). `generateViewerHtml` (Task 5)이 셋을 잇는다. `viewerOutputPath` 는 `config.ts` 한 곳에만 정의하고 `viewer.ts`·`check-viewer.ts`·테스트가 공유한다. `titleKo` 는 rule과 section 양쪽에서 같은 필드명이고, `_sections.md` 안에서만 `**TitleKo:**` 표기다. 클라이언트에서 규칙 키는 항상 `keyOf(r) = skill + "/" + id` 이고, DOM id만 `r-<skill>--<id>` 로 구분자를 바꿔 쓴다(`/`는 id에 부적합).

## 실행 순서 요약

```
── 코드. 한 번 앉아서 끝난다 ────────────────────────
1  rule-body.ts              본문 분해
2  titleKo 스키마             rule + section
3  viewer-payload.ts          데이터 조립
4  viewer-template.ts         문서 + 화면 + 동작
5  viewer.ts / check-viewer.ts / npm scripts
   └─ 여기서 화면이 뜬다. 한국어 제목 0개여도 동작 (영어로 대체)

── 콘텐츠. 나눠서 아무 때나 ──────────────────────────
6  react 42
7  typescript 22 → css 21 → astro 42 → tanstack-route 24
   → nestjs 21 → playwright-test 25 → figma-visual-parity 15
   └─ skill 하나가 커밋 하나

── 마감. 6·7 전부 끝난 뒤에만 ────────────────────────
8  titleKo 필수 전환
9  문서 갱신 + 초안 제거 + 전체 검증
```
