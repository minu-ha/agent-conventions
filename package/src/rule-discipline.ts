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
 * 이 저장소가 지어냈던 역어와 그 대체어.
 * 기준은 하나다 — MDN·React·TypeScript 한국어 문서에 역어가 있으면 그것, 없으면 통용 외래어.
 * 그 낱말로 검색할 사람이 있는데 저장소 밖 어디에도 없는 말이면 규칙을 못 찾는다.
 * `쌓임 맥락`, `단언`, `좁히기`는 표준 역어라 목록에 없다.
 */
const bannedTerms: ReadonlyArray<readonly [string, string]> = [
	["분기점", "브레이크포인트"],
	["감속 곡선", "이징"],
	["쌓임 층", "`z-index` 층"],
	["스스로 접히는", "내재적 크기"],
	["지역 사용자 정의 속성", "지역 변수"],
	["화면 낭독기", "스크린 리더"],
	["머리말", "헤더"],
	["꼬리말", "푸터"],
	["늦춘 값", "지연 값"],
	["갱신자", "업데이터"],
	["사용자 동작", "사용자 액션"],
	["검색 매개변수", "search 파라미터"],
	["읽히는 이름", "접근 가능한 이름"],
	["리액트 Query", "React Query"],
	["재대입", "재할당"],
	["미사용 매개변수", "쓰지 않는 매개변수"],
	["써드파티", "서드파티"],
	["비-널", "`null` 아님"],
	["값 묶음", "값 집합"],
];

/**
 * 받침 유무로 갈리는 조사 짝. 같은 식별자가 파일마다 다른 쪽을 쓰면 둘 중 하나가 틀린 것이다.
 */
const josaPairs = [
	["이", "가"],
	["은", "는"],
	["을", "를"],
	["과", "와"],
] as const;

/**
 * 백틱으로 감싼 규칙 ID·식별자와 바로 뒤에 붙은 조사.
 */
const backtickedIdentifierJosa = /`([a-z][a-z0-9/-]{6,})`(이|가|은|는|을|를|과|와)(?![가-힣])/g;

/**
 * 이름 붙여 선언한 화살표 함수와 `=>` 뒤에 남은 꼬리.
 * 꼬리가 비었으면 다음 줄로 이어지는 선언이고, `{`로 시작하면 블록 본문이다.
 */
const namedArrowBody = /^\s*(?:export\s+)?const\s+\w+(?:\s*:\s*[^=]+?)?\s*=\s*(?:async\s+)?\([^)]*\)(?:\s*:\s*[^=]+?)?\s*=>\s*(.*)$/;

/**
 * 커링의 바깥 화살표. 안쪽 함수를 그대로 돌려주는 자리라 블록 본문을 요구하지 않는다.
 */
const curriedTail = /^\([^)]*\)(?:\s*:\s*[^=]+?)?\s*=>/;

/**
 * 객체 리터럴의 메서드 축약형. `this`가 묶여서 떼어 내면 동작이 달라진다.
 */
const objectLiteralMethod = /^\t+[a-z]\w*\([^)]*\)\s*(?::\s*[^{]+?)?\s*\{\s*$/;

/**
 * 선언 좌변의 객체 구조분해. `const [a, b] =` 같은 배열·튜플은 잡지 않는다.
 */
const objectDestructuringDeclaration = /^\s*(?:const|let|var)\s*\{/;

/**
 * 매개변수 자리의 객체 구조분해. `({a, b}: T)`와 `({a, b})` 둘 다 본다.
 */
const objectDestructuringParameter = /=\s*(?:async\s*)?\(\s*\{[^}]*\}\s*(?::|\))/;

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

			// 클래스 메서드는 축약형이 규범이라, 클래스가 든 펜스에서는 축약형 검사를 끈다
			const hasClass = /^\s*(?:export\s+)?(?:abstract\s+)?class\s/m.test(block.code);

			for (const line of block.code.split("\n")) {
				if (/\/\*\*.*\*\//.test(line)) {
					violations.push(`Correct 예제의 문서 주석은 여러 줄 블록이다: "${line.trim()}"`);
				}

				if (/^\s*(?:export\s+)?function\s/.test(line)) {
					violations.push(`Correct 예제는 함수를 화살표 const로 선언한다: "${line.trim()}"`);
				}

				const tail = namedArrowBody.exec(line)?.[1].trim() ?? "";

				if (tail.length > 0 && !tail.startsWith("{") && !curriedTail.test(tail)) {
					violations.push(`Correct 예제의 이름 붙인 함수는 {} 블록 본문이다: "${line.trim()}"`);
				}

				if (!hasClass && objectLiteralMethod.test(line)) {
					violations.push(`Correct 예제의 객체 멤버는 화살표 프로퍼티다: "${line.trim()}"`);
				}

				if (objectDestructuringDeclaration.test(line) || objectDestructuringParameter.test(line)) {
					violations.push(`Correct 예제는 객체를 구조분해하지 않고 체인으로 읽는다: "${line.trim()}"`);
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

	for (const [banned, replacement] of bannedTerms) {
		if (searchableText(rule).includes(banned)) {
			violations.push(`"${banned}"은 이 저장소만 쓰는 말이다. "${replacement}"로 쓴다`);
		}
	}

	return violations;
};

/**
 * @helper 금칙어를 찾을 때 훑는 텍스트. 본문과 라우팅·표시에 쓰이는 frontmatter 를 함께 본다
 */
const searchableText = (rule: SkillRule): string => {
	return [rule.titleKo, rule.impactDescription, ...(rule.appliesWhenBullets ?? []), rule.body].join("\n");
};

/**
 * @helper 같은 백틱 식별자가 규칙마다 다른 조사를 달고 있는지 모은다
 * @description 받침은 식별자마다 하나로 정해지므로 표기가 갈리면 한쪽은 반드시 틀렸다.
 *   어느 쪽이 맞는지는 기계가 모르지만 갈렸다는 사실은 셀 수 있다.
 */
const collectJosaConflicts = (document: LoadedSkillDocument): string[] => {
	const seen = new Map<string, Map<string, string>>();
	const conflicts: string[] = [];

	for (const rule of document.rules) {
		for (const match of rule.body.matchAll(backtickedIdentifierJosa)) {
			const [, identifier, josa] = match;
			const byJosa = seen.get(identifier) ?? new Map<string, string>();
			byJosa.set(josa, rule.fileName);
			seen.set(identifier, byJosa);
		}
	}

	for (const [identifier, byJosa] of seen) {
		for (const pair of josaPairs) {
			const used = pair.filter((josa) => byJosa.has(josa));

			if (used.length > 1) {
				const where = used.map((josa) => `"${josa}"(${byJosa.get(josa)})`).join(" vs ");
				conflicts.push(`  \`${identifier}\` 뒤 조사가 갈린다: ${where}`);
			}
		}
	}

	return conflicts;
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

	failures.push(...collectJosaConflicts(document));

	if (failures.length > 0) {
		throw new Error(`${document.skillName}: rule discipline 위반 ${failures.length}건\n${failures.join("\n")}`);
	}
};
