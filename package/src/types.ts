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
	 * @field 대상 skill rules/_sections.md 파일 경로
	 */
	sectionsPath: string;
	/**
	 * @field compiled AGENTS.md 출력 파일 경로
	 */
	outputPath: string;
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
	 * @field 현재 skill이 함께 compile할 base skill 디렉터리 이름 목록
	 */
	extends?: string[];
	/**
	 * @field compiled guide 마지막에 노출할 참고 링크 목록
	 */
	references?: string[];
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
	 * @field rule 중요도 레벨
	 */
	impact: string;
	/**
	 * @field rule 중요도 부연 설명
	 */
	impactDescription?: string;
	/**
	 * @field rule 탐색과 분류용 태그 목록
	 */
	tags: string[];
	/**
	 * @field frontmatter를 제외한 markdown 본문
	 */
	body: string;
}
