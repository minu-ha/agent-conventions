import {readFileSync} from "node:fs";
import path from "node:path";

/**
 * 규칙 본문의 스니펫 줄. for-humanity 와 같은 문법 `<<< ./path.ext#region 메타`
 */
export const snippetLinePattern = /^<<<\s+(\S+?)(?:#([\w-]+))?(?:\s+(.+?))?\s*$/;

/**
 * 파일 안의 region 표시 줄. 주석 모양은 자유
 */
const regionLinePattern = /^\s*\S*\s*#(?:end)?region\s+[\w-]+/;

/**
 * Shiki 줄 표기만 있는 주석 줄. 사람용 사이트에서만 뜻이 있어 에이전트 산출물에서는 지움
 */
const notationOnlyLinePattern = /^\s*(?:\/\/|#|\/\*|<!--)\s*\[!code [^\]]*\]\s*(?:\*\/|-->)?\s*$/;

/**
 * 줄 끝에 붙은 Shiki 줄 표기
 */
const notationSuffixPattern = /\s*(?:(?:\/\/|#)\s*\[!code [^\]]*\]|\/\*\s*\[!code [^\]]*\]\s*\*\/)\s*$/;

/**
 * 확장자와 다른 펜스 언어 이름. 나머지는 확장자 그대로
 */
const fenceLanguageByExtension: Record<string, string> = {".mjs": "js", ".cjs": "js", ".mts": "ts", ".yml": "yaml"};

/**
 * @summary 스니펫 줄 하나를 읽은 결과
 */
export interface Snippet {
	/**
	 * @field 규칙 파일 기준 상대 경로. 원문 그대로
	 */
	reference: string;
	/**
	 * @field 읽은 파일의 절대 경로
	 */
	filePath: string;
	/**
	 * @field 펜스 메타 원문. 없으면 빈 문자열
	 */
	meta: string;
}

/**
 * @helper 파일 확장자로 펜스 언어 이름
 */
export const fenceLanguageOf = (filePath: string): string => {
	const extension = path.extname(filePath).toLowerCase();

	return fenceLanguageByExtension[extension] ?? extension.slice(1);
};

/**
 * @helper 스니펫 파일 본문을 에이전트용 펜스 내용으로. region 표시 줄과 줄 표기 주석을 지우고 끝 빈 줄을 뗌
 */
export const toFenceBody = (source: string): string => {
	const lines = source
		.replace(/\r\n/g, "\n")
		.split("\n")
		.filter((line) => !regionLinePattern.test(line) && !notationOnlyLinePattern.test(line))
		.map((line) => line.replace(notationSuffixPattern, ""));

	while (lines.length > 0 && (lines.at(-1) ?? "").trim() === "") {
		lines.pop();
	}

	return lines.join("\n");
};

/**
 * @api 본문의 `<<<` 줄을 코드 펜스로 바꿈. 없는 파일은 오류. 코드 펜스 안은 건드리지 않음
 * @description 규칙 산출물(핸드북, 계약, 인덱스, 검사)은 전부 이 결과를 보므로 예제가 파일로 가도 아무것도 달라지지 않음
 */
export const inlineSnippets = (body: string, baseDir: string): {body: string; snippets: Snippet[]} => {
	const out: string[] = [];
	const snippets: Snippet[] = [];
	let inFence = false;

	for (const line of body.split("\n")) {
		if (line.startsWith("```")) {
			inFence = !inFence;
			out.push(line);
			continue;
		}

		const match = inFence ? null : snippetLinePattern.exec(line);

		if (match === null) {
			out.push(line);
			continue;
		}

		const [, reference = "", , meta = ""] = match;
		const filePath = path.resolve(baseDir, reference);
		let source: string;

		try {
			source = readFileSync(filePath, "utf8");
		} catch {
			throw new Error(`Snippet "${reference}" does not exist (resolved to ${filePath}).`);
		}

		snippets.push({reference, filePath, meta});
		out.push(`\`\`\`${fenceLanguageOf(filePath)}`, toFenceBody(source), "```");
	}

	return {body: out.join("\n"), snippets};
};
