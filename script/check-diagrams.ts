import {checkDiagrams, maxDiagramColumns} from "../src/check-diagrams.js";
import type {DiagramReport} from "../src/check-diagrams.js";

/*
 * 규칙의 mermaid 흐름도가 격자 폭 안에 그려지는지. 넘치거나 깨지면 종료 코드 1
 */
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
