import assert from "node:assert/strict";

/**
 * router SKILL.md 와 규칙 본문을 검사하는 공용 어서션.
 *
 * 한국어 서술을 문자 단위로 고정하지 않는다. 문구를 다듬어도 계약이 그대로면 통과해야 한다.
 * 대신 다시 써도 살아남는 것만 본다. 절 번호, 코드 식별자, 문장의 극성이다.
 */

/**
 * @helper 문서를 frontmatter 와 본문으로 가른다
 */
export const splitFrontmatter = (source: string): {frontmatter: string; body: string} => {
	return {frontmatter: source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "", body: source.replace(/^---\n[\s\S]*?\n---\n?/, "")};
};

/**
 * @helper `## <번호>.` 절 하나를 다음 절 직전까지 잘라낸다
 */
export const extractSection = (body: string, ordinal: number): string => {
	// `m` 아래의 `$` 는 줄 끝마다 걸린다. 문서 끝은 `(?![\s\S])` 로 잡아야 절 전체가 담긴다
	const section = new RegExp(`^## ${ordinal}\\. [^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m").exec(body);

	assert.notEqual(section, null, `router에 "## ${ordinal}." 절이 없다`);

	return section?.[1] ?? "";
};

/**
 * @helper needle 이 들어 있는 문단이나 불릿 항목 하나를 돌려준다. 극성 판정의 단위다.
 *
 * 문장 단위로 자르면 `<id>.md` 의 마침표에 걸리고, 줄 단위로 자르면 120칸 wrap 에 걸린다.
 * 블록은 둘 다 피한다.
 */
export const blockContaining = (text: string, needle: string): string => {
	const blocks: string[] = [];

	for (const line of text.split("\n")) {
		const startsBlock = blocks.length === 0 || line.trim() === "" || /^\s*[-*]\s/.test(line);

		if (startsBlock) {
			blocks.push(line);
			continue;
		}

		blocks[blocks.length - 1] += ` ${line}`;
	}

	const block = blocks.find((candidate) => candidate.includes(needle));

	assert.notEqual(block, undefined, `"${needle}" 언급이 없다`);

	return (block ?? "").replace(/\s+/g, " ").trim();
};

/**
 * @helper 부정문인지 본다. 서술어를 바꿔도 "하지 않는다"는 뜻이면 통과한다
 */
export const isNegated = (sentence: string): boolean => /않는다|않고|아니다|아니라|없다|말고|금지|제외/.test(sentence);

/**
 * @helper 개념이 다뤄지는지 확인한다. 순서를 보지 않아 문단을 재배치해도 살아남는다.
 *
 * 문자열은 그대로 찾고, 정규식은 같은 뜻의 여러 표현을 받을 때 쓴다.
 * `/A[\s\S]*B/` 처럼 순서를 박아 두면 규칙을 표나 목록으로 바꿀 때마다 깨진다.
 */
export const assertMentions = (text: string, needles: ReadonlyArray<string | RegExp>, label: string): void => {
	const flat = text.replace(/\s+/g, " ");
	const missing = needles.filter((needle) => (typeof needle === "string" ? !flat.includes(needle) : !needle.test(flat)));

	assert.deepEqual(missing.map(String), [], `${label}: ${missing.map(String).join(" · ")} 누락`);
};

/**
 * router 가 반드시 설명해야 하는 라우팅 key 와 그 극성.
 *
 * `reviewWith` 만 부정이다. 자동 적용이 아니라 재판단 대상이라는 뜻을 잃으면 라우팅이 무너진다.
 */
const routingKeyPolarity = [
	{key: "requiresSelected", negated: false},
	{key: "reviewWith", negated: true},
	{key: "completionGate", negated: false},
] as const;

/**
 * @helper progressive router 5개 절의 계약. skill 과 무관하게 같아야 한다
 */
export const assertRouterProtocol = (body: string): void => {
	// 1. 변경 범위 판정. 스스로 범위를 넓히지 않는다는 제약이 남아 있어야 한다
	assert.equal(isNegated(extractSection(body, 1)), true, "1절에 범위 확장 억제가 없다");

	// 2. 인덱스는 끝까지 훑는다. 첫 match 에서 멈추면 안 된다
	const scan = extractSection(body, 2);

	assertMentions(scan, ["RULES_INDEX.md", "appliesWhen"], "2절");
	assert.equal(isNegated(blockContaining(scan, "match")), true, "2절에 조기 종료 금지가 없다");

	// 3. 규칙 본문 확장 기준과 라우팅 key 3종의 의미
	const apply = extractSection(body, 3);

	// full rule 파일명은 사람용 번호 prefix(`NN-MM-`)가 붙은 skill 과 아닌 skill 이 공존한다
	assertMentions(apply, ["contracts/<id>.md", /rules\/(?:NN-MM-)?<id>\.md/, "CRITICAL"], "3절");

	for (const {key, negated} of routingKeyPolarity) {
		assert.equal(isNegated(blockContaining(apply, key)), negated, `3절 \`${key}\` 극성이 뒤집혔다`);
	}

	// 4. 범위가 바뀌면 1절부터 다시 판정한다
	assertMentions(extractSection(body, 4), ["1번부터"], "4절");

	// 5. 위반 보고 형식. 도구 통과는 근거가 아니다
	const finish = extractSection(body, 5);

	assertMentions(finish, ["file/line"], "5절");
	assert.equal(isNegated(blockContaining(finish, "통과")), true, "5절에 도구 통과 부정이 없다");

	// 전체 handbook 은 opt-in 링크로만 노출한다
	assertMentions(body, ["[HANDBOOK.md](./HANDBOOK.md)"], "router");
};

/**
 * @helper 걷어낸 강제 장치가 되살아나지 않았는지 본다
 */
export const assertRemovedApparatusStaysGone = (body: string): void => {
	for (const banned of [/digest|sha256/i, /exact partition|ordinal/i, /receipt/i, /convention-audit/, /Excluded groups|exclusion group/i]) {
		assert.doesNotMatch(body, banned);
	}
};

/**
 * @helper router frontmatter 와 크기 예산
 */
export const assertRouterShape = (source: string, skillName: string): void => {
	const {frontmatter, body} = splitFrontmatter(source);
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

	assert.match(frontmatter, new RegExp(`^name: ${skillName}$`, "m"));
	assert.match(frontmatter, /^description: Use when /m);
	assert.doesNotMatch(frontmatter, /scan|read|load/i);
	assert.equal(wordCount < 400, true, `router has ${wordCount} words`);
	assert.equal(Buffer.byteLength(source, "utf8") < 5_000, true);
};
