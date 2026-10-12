import {getSkillPaths, isBuildableSkill, listSkillNames} from "./config.js";
import {readSkillDocument} from "./parser.js";
import {getRuleId, getRulesForSection} from "./routing.js";
import {parseRuleBody} from "./rule-body.js";
import type {RuleCodeBlock, RuleExample} from "./rule-body.js";
import type {CompanionMode} from "./types.js";

/**
 * 섹션 하나에 둘 수 있는 규칙 수의 상한. 섹션 순서를 앞자리로 밀어 정렬 키 생성
 */
const sectionOrderStride = 1_000;

/**
 * @summary 화면용 산문 노드. 일반 줄은 문자열, 코드 블록은 객체
 * @description `{"type":"line","text":…}` 래퍼를 벗겨 인라인 JSON 크기 절감. 산문 줄이 1,500개라 래퍼 비용이 큼
 */
export type ViewerProseNode = string | RuleCodeBlock;

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
 * @summary 화면에 나열할 규칙 하나
 */
export interface ViewerRule {
	/**
	 * @field 이 규칙을 소유한 skill 이름
	 */
	skill: string;
	/**
	 * @field 확장자를 뗀 규칙 파일명. 규칙 stable ID
	 */
	id: string;
	/**
	 * @field `<section order>.<section 내 순번>` 형식의 고정 규칙 번호. `HANDBOOK.md` 헤딩 번호와 같음
	 */
	number: string;
	/**
	 * @field 영어 규칙 제목. 화면 제목이 아니라 식별자와 검색용
	 */
	title: string;
	/**
	 * @field 화면에 노출할 한국어 제목. 비면 영어 제목으로 대체
	 */
	titleKo: string;
	/**
	 * @field 중요도 등급
	 */
	impact: string;
	/**
	 * @field 화면에 노출할 중요도 설명
	 */
	impactDescription: string;
	/**
	 * @field 이 규칙이 걸리는 작업 조건
	 */
	appliesWhen: string;
	/**
	 * @field 사람이 읽는 화면에 노출할 적용 조건 불렛 목록. 비면 appliesWhen 원문 표시
	 */
	appliesWhenBullets: string[];
	/**
	 * @field 탐색용 태그 목록
	 */
	tags: string[];
	/**
	 * @field 함께 적용해야 하는 규칙 stable ID 목록
	 */
	requiresSelected: string[];
	/**
	 * @field 함께 검토할 규칙 stable ID 목록
	 */
	reviewWith: string[];
	/**
	 * @field 소속 섹션 접두사
	 */
	sectionPrefix: string;
	/**
	 * @field 첫 예시 이전 산문. 일반 줄은 문자열, 코드 블록은 객체
	 */
	prose: ViewerProseNode[];
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
	 * @field 규칙 파일명과 연결되는 접두사
	 */
	prefix: string;
	/**
	 * @field 영어 section 제목
	 */
	title: string;
	/**
	 * @field 한국어 section 제목. 비면 영어로 대체
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
	 * @field 전체 규칙 목록. skill 이름, 규칙 ID 순
	 */
	rules: ViewerRule[];
}

/**
 * @api `skill/` 전체를 읽어 화면용 페이로드로 조립
 * @description 출력은 결정적이어야 함. 신선도 검사가 재렌더 결과를 바이트 비교해 타임스탬프 금지
 */
export const buildViewerPayload = async (): Promise<ViewerPayload> => {
	const skills: ViewerSkill[] = [];
	const sections: ViewerSection[] = [];
	const rules: ViewerRule[] = [];
	// `skill/id` -> section order와 section 내 순번을 합친 정렬 키
	const orderKey = new Map<string, number>();

	for (const skillName of await listSkillNames()) {
		if (!(await isBuildableSkill(skillName))) {
			continue;
		}

		const document = await readSkillDocument(getSkillPaths(skillName));

		// 핸드북은 완성된 progressive skill만 노출. 나머지는 작성 중
		if (document.metadata.progressiveDisclosure !== true) {
			continue;
		}

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

		// `HANDBOOK.md`와 같은 번호. build.ts와 같은 정렬을 재사용해야
		// 두 문서의 `1.1`, `3.2`가 같은 규칙을 가리킴
		const numberByFileName = new Map<string, string>();

		for (const section of document.sections) {
			getRulesForSection(section, document.rules).forEach((rule, index) => {
				numberByFileName.set(rule.fileName, `${section.order}.${index + 1}`);
				orderKey.set(`${document.skillName}/${getRuleId(rule)}`, section.order * sectionOrderStride + index);
			});
		}

		for (const rule of document.rules) {
			const parsed = parseRuleBody(rule.body);

			rules.push({
				skill: document.skillName,
				id: getRuleId(rule),
				number: numberByFileName.get(rule.fileName) ?? "",
				title: rule.title,
				titleKo: rule.titleKo,
				impact: rule.impact,
				impactDescription: rule.impactDescription ?? "",
				appliesWhen: rule.appliesWhen ?? "",
				appliesWhenBullets: rule.appliesWhenBullets ?? [],
				tags: rule.tags,
				requiresSelected: rule.requiresSelected,
				reviewWith: rule.reviewWith,
				sectionPrefix: rule.prefix,
				prose: parsed.prose.map((node) => (node.type === "line" ? node.text : {lang: node.lang, code: node.code})),
				examples: parsed.examples,
			});
		}
	}

	// skill 순 → 규칙 번호 순. `HANDBOOK.md`의 나열 순서와 같음
	rules.sort((left, right) => {
		if (left.skill !== right.skill) {
			return left.skill.localeCompare(right.skill, "en-US");
		}

		const leftKey = orderKey.get(`${left.skill}/${left.id}`) ?? Number.MAX_SAFE_INTEGER;
		const rightKey = orderKey.get(`${right.skill}/${right.id}`) ?? Number.MAX_SAFE_INTEGER;

		return leftKey - rightKey || left.id.localeCompare(right.id, "en-US");
	});

	return {skills, sections, rules};
};
