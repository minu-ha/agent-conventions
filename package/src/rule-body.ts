/**
 * 코드 펜스를 여닫는 표시. 뒤에 붙은 언어 이름은 이 길이만큼 잘라 낸다
 */
const fenceMarker = "```";

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

/**
 * 라벨 본문에 `clsx()`, `:is()`처럼 괄호가 들어가므로 마지막 `)`까지 greedy 로 잡는다.
 * `[^)]*`로 잡으면 첫 `)`에서 끊겨 라벨이 인식되지 않고 예시가 앞 카드에 병합된다.
 */
const examplePattern = /^\*\*(Incorrect|Correct)\s*(?:\((.+)\))?\s*:?\*\*/;

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

		if (line.startsWith(fenceMarker)) {
			const lang = line.slice(fenceMarker.length).trim() || "text";
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
