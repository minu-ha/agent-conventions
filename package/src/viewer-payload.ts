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
 * @description 출력은 결정적이어야 한다. 신선도 검사가 재렌더 결과를 바이트 비교하므로 타임스탬프를 넣지 않는다.
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
