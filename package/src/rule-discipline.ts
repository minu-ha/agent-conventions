import {parseRuleBody} from "./rule-body.js";
import type {LoadedSkillDocument, SkillRule} from "./types.js";

/**
 * 한글은 두 칸으로 세는 최대 산문 폭. `docs/semantic-wrap.py`의 MAX와 같아야 한다.
 */
const maxProseWidth = 120;

/**
 * 인덴트를 탭으로 강제하는 코드 펜스 언어. `text`·`md`는 디렉터리 트리와 목록에 공백을 쓴다.
 */
const tabIndentedFenceLanguages = new Set(["ts", "tsx", "css", "js", "json"]);

/**
 * @helper 한글·전각 문자를 두 칸으로 세어 표시 폭을 구한다
 */
const displayWidth = (text: string): number => {
	let width = 0;

	for (const character of text) {
		const codePoint = character.codePointAt(0) ?? 0;
		const isWide =
			(codePoint >= 0x1100 && codePoint <= 0x115f) ||
			(codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
			(codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
			(codePoint >= 0xf900 && codePoint <= 0xfaff) ||
			(codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
			(codePoint >= 0xff00 && codePoint <= 0xff60) ||
			(codePoint >= 0xffe0 && codePoint <= 0xffe6);
		width += isWide ? 2 : 1;
	}

	return width;
};

/**
 * @helper 규칙 하나의 오류 목록을 모은다. 첫 위반에서 던지지 않고 한 번에 보여 준다
 */
const collectRuleViolations = (rule: SkillRule): string[] => {
	const violations: string[] = [];
	const parsed = parseRuleBody(rule.body);

	for (const bullet of rule.appliesWhenBullets ?? []) {
		const trimmed = bullet.trim();

		if (trimmed.startsWith("제외:")) {
			if (!trimmed.endsWith("경우")) {
				violations.push(`appliesWhen 제외 불렛은 "경우"로 끝맺는다: "${trimmed}"`);
			}
		} else if (!trimmed.endsWith("때")) {
			violations.push(`appliesWhen 불렛은 "때"로 끝맺는다: "${trimmed}"`);
		}
	}

	for (const node of parsed.prose) {
		if (node.type !== "line" || node.text.startsWith("|")) {
			continue;
		}

		if (displayWidth(node.text) > maxProseWidth) {
			violations.push(`산문 ${maxProseWidth}칸 초과(${displayWidth(node.text)}칸): "${node.text.slice(0, 40)}…"`);
		}
	}

	let sawCorrect = false;

	// 라벨 괄호 설명은 검사하지 않는다. 실제 규칙 108개는 모두 갖췄고,
	// 테스트 fixture 는 다른 검사를 확인하려고 라벨만 최소로 쓴다.
	for (const example of parsed.examples) {
		if (example.kind === "correct") {
			sawCorrect = true;
		} else if (sawCorrect) {
			violations.push(`Incorrect 예시는 Correct 앞에 모은다: "${example.label}"`);
		}

		for (const block of example.blocks) {
			if (tabIndentedFenceLanguages.has(block.lang)) {
				const spaceIndented = block.code.split("\n").filter((line) => line.startsWith(" ") && !/^ \*/.test(line));

				if (spaceIndented.length > 0) {
					violations.push(`코드 펜스 인덴트는 탭이다(${block.lang}, ${spaceIndented.length}줄)`);
				}
			}

			if (example.kind !== "correct" || (block.lang !== "ts" && block.lang !== "tsx")) {
				continue;
			}

			for (const line of block.code.split("\n")) {
				if (/\/\*\*.*\*\//.test(line)) {
					violations.push(`Correct 예제의 문서 주석은 여러 줄 블록이다: "${line.trim()}"`);
				}

				if (/^\s*(?:export\s+)?function\s/.test(line)) {
					violations.push(`Correct 예제는 함수를 화살표 const로 선언한다: "${line.trim()}"`);
				}

				if (line.includes('className="')) {
					violations.push(`Correct 예제의 className은 clsx()로 조립한다: "${line.trim()}"`);
				}

				if (line.includes("(props: {")) {
					violations.push(`Correct 예제의 프롭스 타입은 컴포넌트 위에 선언한다: "${line.trim()}"`);
				}
			}
		}
	}

	return violations;
};

/**
 * @api 규칙 본문이 이 저장소가 스스로 정한 형식·예제 규율을 지키는지 검증
 * @description 문장 검토는 사람이 하지만 기계가 셀 수 있는 것은 여기서 막는다.
 *   과거에 표본만 본 검토가 위반 4곳을 지목했을 때 실제로는 13곳이었다.
 *   `Correct` 예제만 규칙 위반으로 본다. `Incorrect`는 일부러 어기는 자리다.
 */
export const assertRuleDiscipline = (document: LoadedSkillDocument): void => {
	const failures: string[] = [];

	for (const rule of document.rules) {
		for (const violation of collectRuleViolations(rule)) {
			failures.push(`  ${rule.fileName}: ${violation}`);
		}
	}

	if (failures.length > 0) {
		throw new Error(`${document.skillName}: rule discipline 위반 ${failures.length}건\n${failures.join("\n")}`);
	}
};
