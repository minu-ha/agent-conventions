/**
 * @summary 빌드 패키지와 `skill/` 루트 기준 경로 묶음
 */
export interface PackagePaths {
	/**
	 * @field 현재 모듈 파일이 위치한 디렉터리 경로
	 */
	currentDir: string;
	/**
	 * @field 독립 build 패키지 루트 디렉터리 경로
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
	 * @field build 가능한 skill 전체를 대상으로 실행할지 여부
	 */
	all: boolean;
	/**
	 * @field 단일 skill만 대상으로 실행할 때의 skill 이름
	 */
	skill?: string;
	/**
	 * @field fixture나 별도 체크아웃을 대상으로 할 skill 루트 절대 경로
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
	 * @field 대상 skill의 규칙 Markdown 디렉터리 경로
	 */
	rulesDir: string;
	/**
	 * @field 대상 skill metadata.json 파일 경로
	 */
	metadataPath: string;
	/**
	 * @field 활성화 진입점인 SKILL.md 파일 경로
	 */
	skillEntrypointPath: string;
	/**
	 * @field 대상 skill rules/_sections.md 파일 경로
	 */
	sectionsPath: string;
	/**
	 * @field 컴파일 HANDBOOK.md 출력 파일 경로
	 */
	outputPath: string;
	/**
	 * @field compact RULES_INDEX.md 출력 파일 경로
	 */
	rulesIndexPath: string;
	/**
	 * @field 선택 규칙별 생성 compact contract 디렉터리 경로
	 */
	ruleContractsDir: string;
	/**
	 * @field 라우팅 평가 매니페스트 파일 경로
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
 * @summary 컴파일 가이드 헤더용 skill 메타데이터
 */
export interface SkillMetadata {
	/**
	 * @field 컴파일 가이드 최상단 제목
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
	 * @field 컴파일 가이드 마지막에 노출할 참고 링크 목록
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
	 * @field 로드한 skill의 개별 규칙 목록
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
	 * @field 컴파일 가이드에 표시할 섹션 제목
	 */
	title: string;
	/**
	 * @field 컴파일 가이드에 표시할 섹션 중요도
	 */
	impact: string;
	/**
	 * @field 컴파일 가이드에 표시할 섹션 설명
	 */
	description: string;
	/**
	 * @field 섹션 안에 포함할 정렬된 규칙 목록
	 */
	rules: SkillRule[];
}

/**
 * @summary `rules/_sections.md` 기반 섹션 메타데이터
 */
export interface SkillSection {
	/**
	 * @field 컴파일 가이드에서 쓸 섹션 순번
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
	 * @field 규칙 파일명과 연결되는 섹션 접두사
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
 * @summary 개별 규칙 Markdown 파싱 결과
 */
export interface SkillRule {
	/**
	 * @field 원본 규칙 Markdown 파일명
	 */
	fileName: string;
	/**
	 * @field 섹션 매핑에 쓸 파일명 접두사
	 */
	prefix: string;
	/**
	 * @field 규칙 제목
	 */
	title: string;
	/**
	 * @field 사람이 읽는 화면에 노출할 한국어 규칙 제목
	 */
	titleKo: string;
	/**
	 * @field 규칙 중요도 단계
	 */
	impact: string;
	/**
	 * @field 규칙 중요도 부연 설명. 본문 Impact 줄과 일치 필수
	 */
	impactDescription?: string;
	/**
	 * @field 규칙 탐색과 분류용 태그 목록
	 */
	tags: string[];
	/**
	 * @field 규칙을 선택하는 한 줄 조건. block list면 불렛을 이어 붙인 문장
	 */
	appliesWhen?: string;
	/**
	 * @field appliesWhen을 block list로 썼을 때의 불렛 원문 목록. 사람이 읽는 화면에 노출
	 */
	appliesWhenBullets?: string[];
	/**
	 * @field 이 규칙이 Selected면 함께 Selected여야 하는 local 또는 companion 규칙 stable ID 목록
	 */
	requiresSelected: string[];
	/**
	 * @field 활성 skill의 마무리 때 항상 선택해야 하는 규칙인지 여부
	 */
	requiredOnCompletion: boolean;
	/**
	 * @field 함께 검토할 local 또는 companion 규칙 stable ID 목록
	 */
	reviewWith: string[];
	/**
	 * @field frontmatter를 제외한 markdown 본문
	 */
	body: string;
}

/**
 * @summary 라우팅 fixture가 기대하는 활성 skill별 정확한 규칙 분할
 */
export interface RoutingExpectedPartition {
	/**
	 * @field fixture 근거로 활성화해야 하는 skill 이름 목록
	 */
	expectedSkills: string[];
	/**
	 * @field 활성 progressive skill별 선택 규칙 stable ID 목록
	 */
	expectedSelected: Record<string, string[]>;
}

/**
 * @summary 최초 선택 뒤 작업 범위가 넓어질 때의 단조 라우팅 오라클
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
 * @summary 작업 하나의 정확한 progressive 라우팅 오라클
 */
export interface RoutingEvalScenario extends RoutingExpectedPartition {
	/**
	 * @field 전체 매니페스트에서 고유한 시나리오 식별자
	 */
	id: string;
	/**
	 * @field 에이전트에게 전달할 작업 요청과 범위 근거
	 */
	prompt: string;
	/**
	 * @field 최초 선택 시점의 변경 파일 목록
	 */
	files: string[];
	/**
	 * @field 작업 중 범위가 넓어진 경우의 최종 라우팅 오라클
	 */
	scopeDrift?: RoutingScopeDrift;
}

/**
 * @summary progressive skill 하나가 소유하는 라우팅 평가 매니페스트
 */
export interface RoutingEvalManifest {
	/**
	 * @field 매니페스트 스키마 버전
	 */
	version: 1;
	/**
	 * @field 매니페스트를 소유하는 skill 디렉터리 이름
	 */
	skill: string;
	/**
	 * @field 정확한 선택과 N/A 분할을 검증할 시나리오 목록
	 */
	scenarios: RoutingEvalScenario[];
}
