import {renderMermaidASCII} from "beautiful-mermaid";
import {getSkillPaths, isBuildableSkill, listSkillNames} from "./config.js";
import {readSkillRules} from "./parser.js";
import {parseRuleBody} from "./rule-body.js";

/**
 * 사이트 본문에서 가로 스크롤 없이 읽히는 문자 격자 폭 상한. 넘으면 흐름도가 본문 밖으로 넘침
 */
export const maxDiagramColumns = 125;

/**
 * @summary 규칙 하나의 mermaid 펜스 하나를 격자로 그린 결과
 */
export interface DiagramReport {
	skill: string;
	ruleId: string;
	index: number;
	columns: number;
	rows: number;
	error?: string;
}

/**
 * 사이트와 같은 격자 렌더러로 그림. 한글은 전각이라 폭 0 문자를 덧붙여 두 칸 확보
 */
const wideCharacter = /[ᄀ-ᇿ　-〿㄰-㆏가-힯一-鿿぀-ヿ＀-｠]/g;
const widenCjk = (source: string): string => source.replace(wideCharacter, (character) => `${character}​`);

/**
 * @api 모든 규칙의 mermaid 펜스를 문자 격자로 그려 폭, 높이, 오류 수집
 */
export const checkDiagrams = async (): Promise<DiagramReport[]> => {
	const reports: DiagramReport[] = [];

	for (const skillName of await listSkillNames()) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		for (const rule of await readSkillRules(getSkillPaths(skillName))) {
			const fences = parseRuleBody(rule.body).prose.filter((node) => node.type === "code" && node.lang === "mermaid");

			fences.forEach((fence, index) => {
				if (fence.type !== "code") {
					return;
				}

				// 격자 렌더러는 라벨 안 괄호에서 글을 자름. 라벨에 괄호가 있으면 오류
				const parenthesizedLabel = [...fence.code.matchAll(/(?<=[[({])"([^"\n]*)"/g)].find((match) => /[()]/.test(match[1] ?? ""));

				if (parenthesizedLabel) {
					reports.push({
						skill: skillName,
						ruleId: rule.fileName,
						index,
						columns: 0,
						rows: 0,
						error: `라벨에 괄호: ${parenthesizedLabel[0]}`,
					});
					return;
				}

				try {
					const grid = renderMermaidASCII(widenCjk(fence.code), {paddingX: 3, paddingY: 2, boxBorderPadding: 1, colorMode: "none"});
					const lines = grid.replace(/\s+$/, "").split("\n");
					reports.push({
						skill: skillName,
						ruleId: rule.fileName,
						index,
						columns: Math.max(...lines.map((line) => line.length)),
						rows: lines.length,
					});
				} catch (error) {
					reports.push({
						skill: skillName,
						ruleId: rule.fileName,
						index,
						columns: 0,
						rows: 0,
						error: error instanceof Error ? error.message : String(error),
					});
				}
			});
		}
	}

	return reports;
};
