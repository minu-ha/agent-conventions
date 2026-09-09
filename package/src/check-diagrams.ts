import {renderMermaidASCII} from "beautiful-mermaid";
import {getSkillPaths, isBuildableSkill, listSkillNames} from "./config.js";
import {readSkillRules} from "./parser.js";
import {parseRuleBody} from "./rule-body.js";

/**
 * 뷰어가 카드 폭(약 900px, 칸 7.2px)에 줄이지 않고 그릴 수 있는 문자 격자 폭. 125칸 × 7.2px = 900px
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
 * 뷰어와 같은 옵션으로 그린다. 한글은 전각이라 폭 0 문자를 덧붙여 두 칸을 예약한다
 */
const wideCharacter = /[ᄀ-ᇿ　-〿㄰-㆏가-힯一-鿿぀-ヿ＀-｠]/g;
const widenCjk = (source: string): string => source.replace(wideCharacter, (character) => `${character}​`);

/**
 * @api 모든 규칙의 mermaid 펜스를 문자 격자로 그려 폭 · 높이 · 오류를 모은다
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

const isEntryPoint = process.argv[1]?.endsWith("check-diagrams.ts") === true;

if (isEntryPoint) {
	const reports = await checkDiagrams();
	let failed = false;

	const statusWidth = 8;
	const statusOf = (report: DiagramReport): string => {
		if (report.error) {
			return `ERROR ${report.error}`;
		}

		return report.columns > maxDiagramColumns ? "TOO WIDE" : "ok";
	};

	for (const report of reports) {
		const status = statusOf(report);
		failed = failed || status !== "ok";
		console.log(
			`${status.padEnd(statusWidth)} ${report.skill}/${report.ruleId} #${report.index + 1}  ${report.columns}칸 × ${report.rows}줄`,
		);
	}

	console.log(
		`diagrams: ${reports.length}, over ${maxDiagramColumns} columns or broken: ${reports.filter((r) => r.error || r.columns > maxDiagramColumns).length}`,
	);
	process.exitCode = failed ? 1 : 0;
}
