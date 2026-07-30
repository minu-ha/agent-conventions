/**
 * @summary 빌드 패키지와 `skill/` 루트 기준 경로 묶음
 */
export interface PackagePaths {
	/**
	 * @field 현재 모듈 파일이 위치한 디렉터리 경로
	 */
	currentDir: string;
	/**
	 * @field standalone build package 루트 디렉터리 경로
	 */
	packageDir: string;
	/**
	 * @field 저장소 루트 디렉터리 경로
	 */
	repoDir: string;
	/**
	 * @field build 대상 skill 폴더가 모여 있는 루트 디렉터리 경로
	 */
	skillRootDir: string;
}

/**
 * @summary CLI 인자 해석 결과
 */
export interface CliArgs {
	/**
	 * @field buildable skill 전체를 대상으로 실행할지 여부
	 */
	all: boolean;
	/**
	 * @field 단일 skill만 대상으로 실행할 때의 skill 이름
	 */
	skill?: string;
	/**
	 * @field fixture나 별도 checkout을 대상으로 할 absolute skill root
	 */
	skillRootDir?: string;
}

/**
 * @summary 단일 skill build/validate 작업용 경로 묶음
 */
export interface SkillPaths {
	/**
	 * @field 대상 skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field 대상 skill 루트 디렉터리 경로
	 */
	skillDir: string;
	/**
	 * @field 대상 skill의 rule markdown 디렉터리 경로
	 */
	rulesDir: string;
	/**
	 * @field 대상 skill metadata.json 파일 경로
	 */
	metadataPath: string;
	/**
	 * @field activation entrypoint인 SKILL.md 파일 경로
	 */
	skillEntrypointPath: string;
	/**
	 * @field 대상 skill rules/_sections.md 파일 경로
	 */
	sectionsPath: string;
	/**
	 * @field compiled HANDBOOK.md 출력 파일 경로
	 */
	outputPath: string;
	/**
	 * @field compact RULES_INDEX.md 출력 파일 경로
	 */
	rulesIndexPath: string;
	/**
	 * @field selected rule별 generated compact contract 디렉터리 경로
	 */
	ruleContractsDir: string;
	/**
	 * @field routing evaluation manifest 파일 경로
	 */
	routingEvalsPath: string;
}

/**
 * @summary companion skill 활성화 방식
 */
export type CompanionMode = "required" | "conditional";

/**
 * @summary progressive skill이 선언한 companion skill 관계
 */
export interface SkillCompanion {
	/**
	 * @field companion skill 디렉터리 이름
	 */
	skill: string;
	/**
	 * @field companion skill을 항상 또는 조건부로 활성화할지 여부
	 */
	mode: CompanionMode;
	/**
	 * @field conditional companion 활성화 조건
	 */
	appliesWhen?: string;
}

/**
 * @summary compiled guide 헤더용 skill 메타데이터
 */
export interface SkillMetadata {
	/**
	 * @field compiled guide 최상단 제목
	 */
	title: string;
	/**
	 * @field 문서 버전 문자열
	 */
	version: string;
	/**
	 * @field 문서 발행 주체 이름
	 */
	organization: string;
	/**
	 * @field 문서 갱신 날짜 문자열
	 */
	date?: string;
	/**
	 * @field 문서 목적과 적용 범위를 설명하는 abstract 본문
	 */
	abstract: string;
	/**
	 * @field 현재 skill이 함께 로드할 companion skill 디렉터리 이름 목록
	 */
	extends?: string[];
	/**
	 * @field compiled guide 마지막에 노출할 참고 링크 목록
	 */
	references?: string[];
	/**
	 * @field compact routing index를 사용하는 progressive skill 여부
	 */
	progressiveDisclosure?: boolean;
	/**
	 * @field 현재 skill이 직접 선언한 companion skill 관계 목록
	 */
	companions?: SkillCompanion[];
}

/**
 * @summary 단일 skill의 metadata, sections, rules를 함께 읽은 결과
 */
export interface LoadedSkillDocument {
	/**
	 * @field 로드한 skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field 로드한 skill의 metadata.json 내용
	 */
	metadata: SkillMetadata;
	/**
	 * @field 로드한 skill의 section 메타데이터 목록
	 */
	sections: SkillSection[];
	/**
	 * @field 로드한 skill의 개별 rule 목록
	 */
	rules: SkillRule[];
}

/**
 * @summary build 단계에서 최종 markdown 순서대로 정렬된 section 단위 결과
 */
export interface CompiledSkillSection {
	/**
	 * @field section을 제공한 원본 skill 디렉터리 이름
	 */
	sourceSkillName: string;
	/**
	 * @field section을 제공한 원본 skill 문서 제목
	 */
	sourceSkillTitle: string;
	/**
	 * @field compiled guide에 표시할 section 제목
	 */
	title: string;
	/**
	 * @field compiled guide에 표시할 section 중요도
	 */
	impact: string;
	/**
	 * @field compiled guide에 표시할 section 설명
	 */
	description: string;
	/**
	 * @field section 안에 포함할 정렬된 rule 목록
	 */
	rules: SkillRule[];
}

/**
 * @summary `rules/_sections.md` 기반 section 메타데이터
 */
export interface SkillSection {
	/**
	 * @field compiled guide에서 사용할 section 순번
	 */
	order: number;
	/**
	 * @field section 표시 제목
	 */
	title: string;
	/**
	 * @field 사람이 읽는 화면에 노출할 한국어 section 제목
	 */
	titleKo: string;
	/**
	 * @field rule 파일명과 연결되는 section prefix
	 */
	prefix: string;
	/**
	 * @field section 전체 중요도 레벨
	 */
	impact: string;
	/**
	 * @field section 목적과 범위를 설명하는 본문
	 */
	description: string;
}

/**
 * @summary 개별 rule markdown 파싱 결과
 */
export interface SkillRule {
	/**
	 * @field 원본 rule markdown 파일명
	 */
	fileName: string;
	/**
	 * @field section 매핑에 사용할 파일명 prefix
	 */
	prefix: string;
	/**
	 * @field rule 제목
	 */
	title: string;
	/**
	 * @field 사람이 읽는 화면에 노출할 한국어 rule 제목
	 */
	titleKo: string;
	/**
	 * @field rule 중요도 레벨
	 */
	impact: string;
	/**
	 * @field rule 중요도 부연 설명. 본문 Impact 줄과 일치해야 한다
	 */
	impactDescription?: string;
	/**
	 * @field rule 탐색과 분류용 태그 목록
	 */
	tags: string[];
	/**
	 * @field 작업 범위에 rule을 선택해야 하는 한 줄 조건. block list면 불렛을 이어 붙인 문장이다
	 */
	appliesWhen?: string;
	/**
	 * @field appliesWhen을 block list로 썼을 때의 불렛 원문 목록. 사람이 읽는 화면에 노출한다
	 */
	appliesWhenBullets?: string[];
	/**
	 * @field 이 rule이 Selected이면 함께 Selected여야 하는 local 또는 companion rule stable ID 목록
	 */
	requiresSelected: string[];
	/**
	 * @field 활성 skill의 완료 receipt에서 항상 선택해야 하는 rule인지 여부
	 */
	requiredOnCompletion: boolean;
	/**
	 * @field 함께 검토할 local 또는 companion rule stable ID 목록
	 */
	reviewWith: string[];
	/**
	 * @field frontmatter를 제외한 markdown 본문
	 */
	body: string;
}

/**
 * @summary routing fixture가 기대하는 activated skill별 exact rule partition
 */
export interface RoutingExpectedPartition {
	/**
	 * @field fixture evidence로 활성화해야 하는 skill 이름 목록
	 */
	expectedSkills: string[];
	/**
	 * @field activated progressive skill별 선택 rule stable ID 목록
	 */
	expectedSelected: Record<string, string[]>;
}

/**
 * @summary 최초 selection 뒤 작업 범위가 확장될 때의 monotonic routing oracle
 */
export interface RoutingScopeDrift extends RoutingExpectedPartition {
	/**
	 * @field 범위 확장을 입증하는 구체적인 변경 근거
	 */
	evidence: string;
	/**
	 * @field 범위 확장 뒤 최종 변경 파일 목록
	 */
	files: string[];
}

/**
 * @summary 한 작업 surface의 exact progressive routing oracle
 */
export interface RoutingEvalScenario extends RoutingExpectedPartition {
	/**
	 * @field 전체 manifest에서 고유한 scenario 식별자
	 */
	id: string;
	/**
	 * @field agent에게 전달할 작업 요청과 scope evidence
	 */
	prompt: string;
	/**
	 * @field 최초 selection 시점의 변경 파일 목록
	 */
	files: string[];
	/**
	 * @field 작업 중 범위 확장이 있는 경우의 최종 routing oracle
	 */
	scopeDrift?: RoutingScopeDrift;
}

/**
 * @summary progressive skill 하나가 소유하는 routing evaluation manifest
 */
export interface RoutingEvalManifest {
	/**
	 * @field manifest schema version
	 */
	version: 1;
	/**
	 * @field manifest를 소유하는 skill 디렉터리 이름
	 */
	skill: string;
	/**
	 * @field exact selection과 N/A partition을 검증할 scenario 목록
	 */
	scenarios: RoutingEvalScenario[];
}
