import assert from "node:assert/strict";
import {access, mkdtemp, mkdir, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

import {
	assertMentions,
	assertRemovedApparatusStaysGone,
	assertRouterProtocol,
	assertRouterShape,
	blockContaining,
	extractSection,
	isNegated,
	splitFrontmatter,
} from "./helpers/router-contract.js";

import {getSkillPaths} from "../src/config.js";
import {readSkillDocument} from "../src/parser.js";
import {readRoutingEvalManifest, validateRoutingEvalManifest, validateRoutingEvalManifests} from "../src/routing-evals.js";
import {generateRulesIndexMarkdown, getRuleId} from "../src/routing.js";
import type {RoutingEvalManifest, RoutingExpectedPartition, SkillCompanion} from "../src/types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");

/**
 * @helper 줄바꿈으로 접힌 본문을 한 줄로 펴서 문구 단위로 비교
 */
const flattenWhitespace = (text: string): string => text.replace(/\s+/g, " ");

/**
 * @helper inline scalar, YAML folded scalar, `- ` block list 를 모두 받아 frontmatter 값만 돌려준다
 */
const readFrontmatterValue = (source: string, key: string): string => {
	const inline = new RegExp(`^${key}: (?!>)(.+)$`, "m").exec(source);

	if (inline?.[1] !== undefined) {
		return inline[1];
	}

	const folded = new RegExp(`^${key}: >-?\\n((?:[ \\t]+\\S.*\\n?)+)`, "m").exec(source);

	if (folded?.[1] !== undefined) {
		return folded[1]
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean)
			.join(" ");
	}

	const blockList = new RegExp(`^${key}:\\n((?:[ \\t]+-[ \\t]+\\S.*\\n?)+)`, "m").exec(source);

	return blockList?.[1] === undefined
		? ""
		: blockList[1]
				.split("\n")
				.map((line) => line.trim().replace(/^-\s+/, ""))
				.filter(Boolean)
				.join(" ");
};

/**
 * @helper appliesWhen 전용 단축
 */
const readAppliesWhen = (source: string): string => readFrontmatterValue(source, "appliesWhen");
const realSkillRootDir = path.join(repoDir, "skill");

/**
 * @helper stable ID로 rule 원문을 읽는다. 파일명에 사람용 번호 prefix(`NN-MM-`)가 붙어 있어도 찾는다
 */
const readRuleSource = async (skillName: string, ruleId: string): Promise<string> => {
	const rulesDir = path.join(realSkillRootDir, skillName, "rules");
	const fileName = (await readdir(rulesDir)).find(
		(candidate) => candidate === `${ruleId}.md` || candidate.replace(/^\d+-\d+-/, "") === `${ruleId}.md`,
	);

	assert.ok(fileName, `${skillName}/${ruleId} rule file not found`);

	return await readFile(path.join(rulesDir, fileName), "utf8");
};

const typescriptRuleUniverse = [
	"types-reuse-existing-contracts-before-new-types",
	"types-prefer-function-variable-types-over-parameter-annotations",
	"types-document-custom-types-and-shapes",
	"types-mark-unused-parameters-with-underscore",
	"types-narrow-unknown-instead-of-asserting",
	"types-replace-enum-with-as-const-objects",
	"naming-centralize-shared-config-namespaces",
	"naming-place-owner-config-in-the-owner-config-folder",
	"naming-preserve-config-origin-with-chained-access",
	"naming-use-consistent-file-and-symbol-naming",
	"naming-use-direct-imports-and-public-entry-points",
	"naming-restrict-absolute-aliases-to-layer-roots",
	"naming-read-environment-values-through-shared-config",
	"functions-declare-functions-as-arrow-consts",
	"functions-use-named-object-params-for-complex-signatures",
	"functions-extract-helpers-only-when-the-boundary-is-real",
	"functions-place-and-promote-support-functions",
	"functions-avoid-imperative-assembly-in-wide-scopes",
	"functions-name-a-value-only-when-it-is-reused",
	"functions-name-functions-by-what-comes-out",
	"values-prefer-immutable-array-sorting",
	"values-use-set-and-map-for-repeated-lookups",
	"absence-expose-optional-values-instead-of-silent-fallbacks",
	"docs-keep-body-comments-for-intent-and-steps",
	"docs-require-header-jsdoc-on-key-declarations",
	"docs-write-concise-korean-comments-about-purpose-and-constraints",
	"docs-write-doc-comments-as-multiline-blocks",
	"docs-justify-convention-exceptions-with-a-reason-comment",
	"tooling-configure-biome-to-enforce-these-rules",
] as const;

const cssRuleUniverse = [
	"naming-default-to-plain-css-when-no-module-convention",
	"naming-use-scope-slug-element-modifier-syntax",
	"naming-name-elements-and-modifiers-by-role",
	"naming-keep-page-slug-traceable",
	"ownership-give-each-file-one-scope-slug",
	"ownership-choose-scope-prefix-by-reuse-range",
	"ownership-use-foreign-classes-only-under-your-own-root",
	"ownership-change-other-owners-through-their-api",
	"composition-compose-classes-with-clsx",
	"composition-do-not-build-structural-variants-with-modifiers",
	"composition-keep-classes-single-purpose",
	"composition-inject-classes-only-at-the-entry-point",
	"composition-do-not-add-wrapper-elements-for-styling",
	"composition-do-not-style-through-the-style-attribute",
	"selector-limit-nesting-block-depth",
	"selector-use-classes-instead-of-element-selectors",
	"selector-do-not-group-classes-with-commas",
	"selector-declare-each-class-in-one-block",
	"selector-use-pseudo-classes-for-dom-owned-states",
	"selector-nest-dom-state-in-the-owning-block",
	"selector-do-not-invert-domain-state-with-not",
	"selector-separate-domain-state-modifiers-from-dom-interaction-states",
	"values-always-provide-css-variable-fallbacks",
	"values-tokenize-repeated-visual-values",
	"values-declare-stacking-layers-as-tokens",
	"values-switch-themes-by-changing-token-values",
	"layout-group-breakpoints-at-the-file-bottom",
	"layout-keep-layout-intent-explicit",
	"layout-reach-for-intrinsic-sizing-before-breakpoints",
	"a11y-always-provide-a-visible-focus-indicator",
	"a11y-namespace-keyframes-and-respect-reduced-motion",
	"tooling-configure-stylelint-to-enforce-these-rules",
] as const;

/**
 * @summary generated React index의 canonical codepoint rule universe
 */
const reactRuleUniverse = [
	"ownership-layer-component-boundaries",
	"ownership-prefix-layer-names-on-files-and-symbols",
	"ownership-place-owner-files-in-role-folders",
	"ownership-keep-component-imports-flowing-downward",
	"ownership-prefer-plain-ts-for-local-react-helpers",
	"ownership-keep-lifecycle-in-the-owning-component",
	"data-name-query-and-mutation-bindings-consistently",
	"data-shape-query-data-with-select",
	"data-combine-multiple-queries-with-combine",
	"data-preserve-origin-chaining",
	"data-handle-mutation-failure-where-it-is-called",
	"data-invalidate-queries-the-mutation-changed",
	"typing-take-handler-types-from-existing-contracts",
	"typing-narrow-library-wrapper-contracts",
	"typing-choose-wrapper-shape-and-forwarding",
	"strategy-choose-single-composition-compound-and-variants",
	"strategy-expose-only-assembled-compound-parts",
	"strategy-avoid-boolean-prop-proliferation",
	"strategy-prefer-children-over-render-props",
	"composition-read-props-without-destructuring",
	"composition-do-not-define-components-inside-components",
	"composition-named-handlers-over-inline",
	"composition-open-ref-props-only-for-imperative-contracts",
	"composition-use-activity-only-to-preserve-mounted-subtrees",
	"composition-declare-props-interface-above-the-component",
	"composition-name-fragments-explicitly",
	"composition-render-one-branch-with-and",
	"screen-keep-route-flow-visible",
	"screen-avoid-premature-abstraction",
	"screen-extract-local-section-components-for-runtime-boundaries",
	"screen-keep-derived-values-close",
	"runtime-place-suspense-boundaries-at-the-section-owner",
	"runtime-avoid-ad-hoc-loading-branches",
	"runtime-place-error-boundaries-by-blast-radius",
	"state-calculate-derived-values-during-render",
	"state-choose-state-tools-by-source-of-truth",
	"state-store-derived-authority",
	"state-use-functional-setstate-updates",
	"state-use-effectevent-for-non-reactive-effect-callbacks",
	"events-name-handlers-predictably",
	"events-curry-extra-handler-arguments",
	"events-run-user-actions-in-handlers-not-effects",
	"perf-avoid-defensive-memoization",
	"perf-use-lazy-state-initializers-for-expensive-defaults",
	"perf-defer-heavy-renders-with-measured-evidence",
	"a11y-give-interactive-elements-an-accessible-name",
	"docs-require-jsdoc-on-key-declarations",
] as const;

/**
 * @summary Appendix A의 TypeScript rule별 exact routing metadata oracle
 */
const typescriptRuleRouting = {
	"types-reuse-existing-contracts-before-new-types": {
		appliesWhen:
			"뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없거나 소유자만 옮긴 경우, 그대로인 계약을 새 자리에서 쓰는 경우. 제외: 고칠 수 없는 형태를 그대로 쓰는 경우.",
		reviewWith: ["types-document-custom-types-and-shapes"],
	},
	"types-prefer-function-variable-types-over-parameter-annotations": {
		appliesWhen:
			"기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때. 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때. 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우.",
		reviewWith: ["types-mark-unused-parameters-with-underscore"],
	},
	"types-document-custom-types-and-shapes": {
		appliesWhen:
			"타입, 인터페이스, 스키마 최상단, 객체 상수, 계약 필드, 파생 별칭을 추가·변경할 때. 이름 붙인 형태에 호출 계약 역할을 새로 얹을 때. 제외: 외부·생성된·읽기 전용·공용 형태를 그대로 쓰거나 반환 타입이 익명으로 추론되는 경우.",
		reviewWith: [],
	},
	"types-mark-unused-parameters-with-underscore": {
		appliesWhen:
			"기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때. 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때.",
		reviewWith: [],
	},
	"types-narrow-unknown-instead-of-asserting": {
		appliesWhen: "`as` 단언, `!` 비-널 단언, `any`, `@ts-expect-error`를 추가할 때. 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때.",
		reviewWith: ["docs-justify-convention-exceptions-with-a-reason-comment", "tooling-configure-biome-to-enforce-these-rules"],
	},
	"types-replace-enum-with-as-const-objects": {
		appliesWhen:
			"`enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 묶음을 추가·변경할 때. 제외: 외부 패키지가 내보낸 `enum` 값을 그대로 읽어 쓰는 경우.",
		reviewWith: [],
	},
	"naming-centralize-shared-config-namespaces": {
		appliesWhen: "여러 모듈이 함께 쓰는 URL, 기능 플래그, 페이지 크기나 상수를 추가·이동·중복 정의할 때. 공용 설정 경계를 바꿀 때.",
		reviewWith: ["naming-preserve-config-origin-with-chained-access", "naming-use-direct-imports-and-public-entry-points"],
	},
	"naming-place-owner-config-in-the-owner-config-folder": {
		appliesWhen: "소유자 하나만 쓰는 선언형 설정을 추가하거나 옮길 때. 전역 설정과 소유자 전용 설정 사이에서 위치를 바꿀 때.",
		reviewWith: ["naming-centralize-shared-config-namespaces"],
	},
	"naming-preserve-config-origin-with-chained-access": {
		appliesWhen: "`config`나 `util` 값을 쓰면서 넓은 스코프 구조분해, 별칭, 기능별 네임스페이스를 추가·변경할 때.",
		reviewWith: ["functions-place-and-promote-support-functions"],
	},
	"naming-use-consistent-file-and-symbol-naming": {
		appliesWhen:
			"TypeScript 파일, 지역 변수, 함수, 타입, 객체·스키마 필드, enum 성격 상수의 이름을 새로 만들거나 바꿀 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.",
		reviewWith: [],
	},
	"naming-use-direct-imports-and-public-entry-points": {
		appliesWhen:
			"가져오기, 내보내기, 배럴, 공용 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.",
		reviewWith: ["naming-restrict-absolute-aliases-to-layer-roots"],
	},
	"naming-restrict-absolute-aliases-to-layer-roots": {
		appliesWhen: "절대경로 별칭으로 다른 모듈을 가져올 때. 별칭이 가리키는 경로 깊이를 바꿀 때.",
		reviewWith: ["naming-use-direct-imports-and-public-entry-points"],
	},
	"naming-read-environment-values-through-shared-config": {
		appliesWhen: "`import.meta.env`나 `process.env`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값을 새로 들여올 때.",
		reviewWith: ["naming-centralize-shared-config-namespaces", "absence-expose-optional-values-instead-of-silent-fallbacks"],
	},
	"functions-declare-functions-as-arrow-consts": {
		appliesWhen:
			"이름 붙인 함수를 새로 만들거나 선언 형태를 바꿀 때. 제외: 클래스 메서드, 제너레이터, 오버로드 선언, 객체 리터럴 메서드인 경우.",
		reviewWith: ["functions-use-named-object-params-for-complex-signatures"],
	},
	"functions-use-named-object-params-for-complex-signatures": {
		appliesWhen:
			"매개변수가 3개를 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수를 어디서 구조분해할지 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받고 구조분해하는 방식만 바꾸는 경우.",
		reviewWith: ["types-reuse-existing-contracts-before-new-types"],
	},
	"functions-extract-helpers-only-when-the-boundary-is-real": {
		appliesWhen:
			"보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때.",
		reviewWith: ["functions-place-and-promote-support-functions", "docs-require-header-jsdoc-on-key-declarations"],
	},
	"functions-place-and-promote-support-functions": {
		appliesWhen: "보조 함수를 둘 파일이나 폴더를 정할 때. `shared/` 아래로 파일을 옮기거나 `util.*`에 항목을 추가할 때.",
		reviewWith: [],
	},
	"functions-avoid-imperative-assembly-in-wide-scopes": {
		appliesWhen: "모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 만들 때.",
		reviewWith: ["functions-extract-helpers-only-when-the-boundary-is-real"],
	},
	"functions-name-a-value-only-when-it-is-reused": {
		appliesWhen: "순수 계산의 결과를 지역 `const`로 받는 줄을 추가·삭제할 때. 식을 그 자리에 적을지 이름을 붙일지 정할 때.",
		reviewWith: ["functions-avoid-imperative-assembly-in-wide-scopes"],
	},
	"functions-name-functions-by-what-comes-out": {
		appliesWhen: "이름 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 외부 패키지가 정한 이름을 별칭 없이 그대로 쓰는 경우.",
		reviewWith: [],
	},
	"values-prefer-immutable-array-sorting": {
		appliesWhen: "프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.",
		reviewWith: [],
	},
	"values-use-set-and-map-for-repeated-lookups": {
		appliesWhen: "같은 목록에 `includes`, `find`, 키 조회를 여러 번 하는 코드를 추가·변경할 때.",
		reviewWith: [],
	},
	"absence-expose-optional-values-instead-of-silent-fallbacks": {
		appliesWhen: "선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.",
		reviewWith: ["naming-centralize-shared-config-namespaces", "naming-place-owner-config-in-the-owner-config-folder"],
	},
	"docs-keep-body-comments-for-intent-and-steps": {
		appliesWhen:
			"함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때.",
		reviewWith: [
			"docs-write-concise-korean-comments-about-purpose-and-constraints",
			"docs-justify-convention-exceptions-with-a-reason-comment",
		],
	},
	"docs-require-header-jsdoc-on-key-declarations": {
		appliesWhen:
			"쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 커스텀 타입, 스토어, 포매터 선언을 추가·변경할 때. 분기나 `await`, 또는 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때. 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때.",
		reviewWith: [],
	},
	"docs-write-concise-korean-comments-about-purpose-and-constraints": {
		appliesWhen: "TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때. 문서 주석에 태그를 붙이거나 뺄 때.",
		reviewWith: [],
	},
	"docs-write-doc-comments-as-multiline-blocks": {
		appliesWhen: "선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때. 한 줄 `/** … */`이나 `//`로 선언을 설명하려 할 때.",
		reviewWith: ["docs-require-header-jsdoc-on-key-declarations"],
	},
	"docs-justify-convention-exceptions-with-a-reason-comment": {
		appliesWhen:
			"규칙이 허용한 예외를 코드에 남길 때. 이미 있는 예외 주석의 내용을 바꿀 때. 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우.",
		reviewWith: ["docs-write-concise-korean-comments-about-purpose-and-constraints"],
	},
	"tooling-configure-biome-to-enforce-these-rules": {
		appliesWhen: "프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json`의 `linter.rules`에 항목을 추가·삭제할 때.",
		reviewWith: [],
	},
} as const;

/**
 * @summary Appendix C의 CSS rule별 exact routing metadata oracle
 */
const cssRuleRouting = {
	"naming-default-to-plain-css-when-no-module-convention": {
		appliesWhen:
			"표준이 정해지지 않은 상태에서 스타일시트 방식(일반 CSS, CSS Modules)을 고르거나 `.module.css`나 `styles.*`로 옮길 때. 제외: 기존 일반 CSS 클래스 이름만 바꾸는 경우.",
		reviewWith: [],
	},
	"naming-use-scope-slug-element-modifier-syntax": {
		appliesWhen:
			"일반 CSS에서 프로젝트가 소유한 클래스를 새로 만들 때. 이름, 범위, 식별자, 요소, 수정자의 구분자나 대소문자 표기를 바꿀 때.",
		reviewWith: [],
	},
	"naming-name-elements-and-modifiers-by-role": {
		appliesWhen: "요소나 수정자 클래스 이름을 새로 지을 때. `container`, `wrapper`, `box`, 치수나 간격 중심 이름을 변경할 때.",
		reviewWith: [],
	},
	"naming-keep-page-slug-traceable": {
		appliesWhen:
			"`pg_*` 소유자의 클래스 식별자를 새로 만들거나 이름을 바꿀 때. 같은 이름 컴포넌트가 여러 화면에 생겨 식별자를 구분해야 할 때.",
		reviewWith: [],
	},
	"ownership-give-each-file-one-scope-slug": {
		appliesWhen: "새 `scope_slug`를 만들거나 기존 식별자를 복사·이름 변경할 때. 서로 다른 컴포넌트가 같은 식별자를 쓸 가능성이 있을 때.",
		reviewWith: [],
	},
	"ownership-choose-scope-prefix-by-reuse-range": {
		appliesWhen: "새 CSS 파일을 만들면서 `pg_`, `wg_`, `ui_` 중 하나를 고를 때. 소유자의 재사용 범위가 바뀌어 접두사를 옮길 때.",
		reviewWith: ["ownership-give-each-file-one-scope-slug", "ownership-use-foreign-classes-only-under-your-own-root"],
	},
	"ownership-use-foreign-classes-only-under-your-own-root": {
		appliesWhen: "`.ant-*`, `.rc-*`, `.Mui-*` 같은 외부 라이브러리 클래스를 쓸 때. 다른 `scope_slug`의 클래스를 겨냥할 때.",
		reviewWith: [
			"ownership-change-other-owners-through-their-api",
			"ownership-give-each-file-one-scope-slug",
			"selector-limit-nesting-block-depth",
		],
	},
	"ownership-change-other-owners-through-their-api": {
		appliesWhen: "다른 컴포넌트의 배치나 내부 표현을 바꿔야 할 때. 컴포넌트에 클래스 관련 프롭을 추가할 때.",
		reviewWith: ["ownership-use-foreign-classes-only-under-your-own-root", "composition-inject-classes-only-at-the-entry-point"],
	},
	"composition-compose-classes-with-clsx": {
		appliesWhen: "TSX의 `className`을 추가·수정할 때. 기본 클래스, 수정자, 선택 클래스를 함께 엮을 때.",
		reviewWith: [],
	},
	"composition-do-not-build-structural-variants-with-modifiers": {
		appliesWhen: "수정자를 추가·변경할 때. 여러 곳에서 반복되는 모양인지 한 곳만의 보정인지 가릴 때.",
		reviewWith: ["naming-name-elements-and-modifiers-by-role"],
	},
	"composition-keep-classes-single-purpose": {
		appliesWhen:
			"한 클래스 이름에 기본 스타일과 상태를 함께 넣을 때. 제외: 처음부터 기본 클래스와 수정자를 나눠 만드는 경우. 제외: 책임이 그대로인 이름 변경만 하는 경우.",
		reviewWith: [],
	},
	"composition-inject-classes-only-at-the-entry-point": {
		appliesWhen:
			"우리가 만든 컴포넌트에 `className`이나 클래스 관련 프롭을 추가할 때. 그 컴포넌트 내부 노드의 모양을 화면마다 다르게 해야 할 때. 제외: 기존 CSS 최상위 블록 아래 외부 라이브러리 선택자만 고치는 경우.",
		reviewWith: ["ownership-use-foreign-classes-only-under-your-own-root", "ownership-change-other-owners-through-their-api"],
	},
	"composition-do-not-add-wrapper-elements-for-styling": {
		appliesWhen: "스타일을 주려고 `div`나 `span`을 새로 감쌀 때. `className`을 받지 않는 컴포넌트에 여백이나 크기를 줘야 할 때.",
		reviewWith: ["composition-inject-classes-only-at-the-entry-point", "naming-name-elements-and-modifiers-by-role"],
	},
	"composition-do-not-style-through-the-style-attribute": {
		appliesWhen: "TSX에 `style={{ … }}`를 추가하거나 그 안의 선언을 바꿀 때. 컴포넌트 프롭으로 `style`을 받아 넘길 때.",
		reviewWith: [
			"composition-inject-classes-only-at-the-entry-point",
			"values-tokenize-repeated-visual-values",
			"values-always-provide-css-variable-fallbacks",
		],
	},
	"selector-limit-nesting-block-depth": {
		appliesWhen: "중첩 `{}` 블록을 추가하거나 기존 블록을 펼치거나 합칠 때. `&`로 조건이나 가상 요소를 붙일 때.",
		reviewWith: ["selector-use-classes-instead-of-element-selectors", "selector-declare-each-class-in-one-block"],
	},
	"selector-use-classes-instead-of-element-selectors": {
		appliesWhen:
			"`p`, `h2`, `span`, `button` 같은 요소 선택자를 쓰려 할 때. `dangerouslySetInnerHTML`이나 Markdown 렌더러 출력을 스타일링할 때.",
		reviewWith: ["naming-name-elements-and-modifiers-by-role"],
	},
	"selector-do-not-group-classes-with-commas": {
		appliesWhen: "여러 클래스가 같은 선언을 반복해 `,`로 묶으려 할 때. 한 대상에 진입 조건을 둘 이상 추가할 때.",
		reviewWith: ["selector-declare-each-class-in-one-block", "values-tokenize-repeated-visual-values"],
	},
	"selector-declare-each-class-in-one-block": {
		appliesWhen: "이미 선언한 클래스에 스타일을 더 추가할 때. 파일 아래쪽에서 위쪽 선언을 덮어쓰려 할 때.",
		reviewWith: ["selector-do-not-group-classes-with-commas", "layout-group-breakpoints-at-the-file-bottom"],
	},
	"selector-use-pseudo-classes-for-dom-owned-states": {
		appliesWhen: "`:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정할 때. 조상의 DOM 상태가 자손 스타일에 영향을 줄 때.",
		reviewWith: [],
	},
	"selector-nest-dom-state-in-the-owning-block": {
		appliesWhen:
			"`:hover`, `:focus-visible`, `:disabled`, `:checked` 스타일을 추가·수정할 때. 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때.",
		reviewWith: [
			"selector-limit-nesting-block-depth",
			"selector-use-pseudo-classes-for-dom-owned-states",
			"selector-do-not-group-classes-with-commas",
		],
	},
	"selector-do-not-invert-domain-state-with-not": {
		appliesWhen: "`:not(.--수정자)`로 앱 상태를 뒤집으려 할 때. 조상 클래스와 자손 클래스를 한 선택자에 함께 쓸 때.",
		reviewWith: ["selector-use-pseudo-classes-for-dom-owned-states"],
	},
	"selector-separate-domain-state-modifiers-from-dom-interaction-states": {
		appliesWhen: "앱 상태 수정자와 hover, focus, disabled 같은 DOM 상호작용 상태를 추가·변경할 때. 포커스 링을 수정할 때.",
		reviewWith: ["composition-do-not-build-structural-variants-with-modifiers"],
	},
	"values-always-provide-css-variable-fallbacks": {
		appliesWhen: "`var(--*)`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때. 공통 토큰 목록에 항목을 넣거나 뺄 때.",
		reviewWith: ["values-tokenize-repeated-visual-values"],
	},
	"values-tokenize-repeated-visual-values": {
		appliesWhen: "여러 파일이 같은 색, 간격, radius, 타이포, 그림자 값을 쓸 때. 새 사용자 정의 속성을 선언할 때.",
		reviewWith: ["values-always-provide-css-variable-fallbacks", "composition-do-not-style-through-the-style-attribute"],
	},
	"values-declare-stacking-layers-as-tokens": {
		appliesWhen: "`z-index`를 새로 넣거나 값을 바꿀 때. 겹쳐 뜨는 요소를 추가할 때.",
		reviewWith: ["layout-keep-layout-intent-explicit", "values-tokenize-repeated-visual-values"],
	},
	"values-switch-themes-by-changing-token-values": {
		appliesWhen:
			"다크 모드나 테마 전환을 넣을 때. 컴포넌트 CSS에 `prefers-color-scheme`이나 `[data-theme]`를 쓰려 할 때. 색이나 그림자 토큰을 새로 만들거나 이름을 바꿀 때.",
		reviewWith: ["values-always-provide-css-variable-fallbacks", "values-tokenize-repeated-visual-values"],
	},
	"layout-group-breakpoints-at-the-file-bottom": {
		appliesWhen: "`@media` 분기점을 추가하거나 옮길 때. 화면 폭에 따라 값이 달라지는 선언을 넣을 때.",
		reviewWith: [
			"layout-reach-for-intrinsic-sizing-before-breakpoints",
			"selector-declare-each-class-in-one-block",
			"values-switch-themes-by-changing-token-values",
		],
	},
	"layout-keep-layout-intent-explicit": {
		appliesWhen:
			"`sticky`·`fixed`, `z-index`, 강제 `width`·`height` 또는 부모·자식 레이아웃 책임을 추가·변경할 때. 대체 화면의 컨테이너나 높이를 정할 때. 제외: 같은 요소를 기본과 수정자로 나누면서 기존 `display`·여백 선언을 값 그대로 옮기는 경우.",
		reviewWith: ["values-declare-stacking-layers-as-tokens"],
	},
	"layout-reach-for-intrinsic-sizing-before-breakpoints": {
		appliesWhen: "`@media` 분기점을 새로 넣으려 할 때. 폭에 따라 줄바꿈, 열 개수, 크기가 달라져야 할 때.",
		reviewWith: ["layout-keep-layout-intent-explicit", "layout-group-breakpoints-at-the-file-bottom"],
	},
	"a11y-always-provide-a-visible-focus-indicator": {
		appliesWhen: "`outline`, `:focus`, `:focus-visible` 스타일을 추가·수정할 때. 상호작용 요소의 기본 포커스 링을 덮어쓸 때.",
		reviewWith: ["selector-separate-domain-state-modifiers-from-dom-interaction-states"],
	},
	"a11y-namespace-keyframes-and-respect-reduced-motion": {
		appliesWhen:
			"`@keyframes` 이름이나 애니메이션 지속 시간, 감속 곡선을 선언하거나 바꿀 때. `animation`이나 `transition`으로 움직임을 새로 넣을 때.",
		reviewWith: ["values-tokenize-repeated-visual-values", "tooling-configure-stylelint-to-enforce-these-rules"],
	},
	"tooling-configure-stylelint-to-enforce-these-rules": {
		appliesWhen: "stylelint 설정을 새로 만들거나 규칙을 추가·수정할 때. 이 컨벤션 중 어디까지 자동으로 잡히는지 확인할 때.",
		reviewWith: [
			"ownership-use-foreign-classes-only-under-your-own-root",
			"selector-limit-nesting-block-depth",
			"naming-use-scope-slug-element-modifier-syntax",
		],
	},
} as const;

/**
 * @summary Appendix B의 React rule별 exact routing metadata oracle
 */
const reactRuleRouting = {
	"ownership-layer-component-boundaries": {
		appliesWhen: "컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때.",
		reviewWith: ["ownership-place-owner-files-in-role-folders", "css/ownership-choose-scope-prefix-by-reuse-range"],
	},
	"ownership-prefix-layer-names-on-files-and-symbols": {
		appliesWhen: "컴포넌트 파일이나 심볼 이름을 새로 지을 때. 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때.",
		reviewWith: ["ownership-layer-component-boundaries", "typescript/naming-use-consistent-file-and-symbol-naming"],
	},
	"ownership-place-owner-files-in-role-folders": {
		appliesWhen:
			"소유자 아래 `component`·`config`·`function`·`hook`·`type` 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우.",
		reviewWith: ["ownership-keep-component-imports-flowing-downward", "css/ownership-choose-scope-prefix-by-reuse-range"],
	},
	"ownership-keep-component-imports-flowing-downward": {
		appliesWhen:
			"`component` 폴더 안의 파일을 다른 파일에서 가져오기할 때. `../`나 `@/page` 경로로 컴포넌트를 가져오려 할 때. 여러 자식이 같은 컴포넌트를 필요로 해 배치를 다시 정할 때. 제외: `function`·`type`·`config` 파일을 가져오는 경우.",
		reviewWith: ["ownership-layer-component-boundaries"],
	},
	"ownership-prefer-plain-ts-for-local-react-helpers": {
		appliesWhen:
			"화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때. 제외: 상태·컨텍스트·다른 훅 호출 순서를 실제로 캡슐화하는 경우.",
		reviewWith: [
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
			"ownership-place-owner-files-in-role-folders",
			"ownership-keep-lifecycle-in-the-owning-component",
			"typescript/naming-use-direct-imports-and-public-entry-points",
		],
	},
	"ownership-keep-lifecycle-in-the-owning-component": {
		appliesWhen:
			"외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때. 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때. 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우.",
		reviewWith: ["ownership-prefer-plain-ts-for-local-react-helpers"],
	},
	"data-name-query-and-mutation-bindings-consistently": {
		appliesWhen:
			"리액트 Query 쿼리·뮤테이션 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때. 쿼리나 뮤테이션 훅의 반환값을 새 지역 변수에 담을 때.",
		reviewWith: ["data-preserve-origin-chaining"],
	},
	"data-shape-query-data-with-select": {
		appliesWhen: "서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. 리액트 Query `select`의 결과 형태를 추가·변경할 때.",
		reviewWith: ["data-name-query-and-mutation-bindings-consistently", "data-preserve-origin-chaining"],
	},
	"data-combine-multiple-queries-with-combine": {
		appliesWhen:
			"쿼리 결과 둘 이상을 하나의 값으로 합치는 코드를 추가·변경할 때. 화면 본문에서 두 `data`를 꺼내 함께 계산하는 코드를 넣거나 뺄 때.",
		reviewWith: ["data-shape-query-data-with-select", "screen-keep-derived-values-close"],
	},
	"data-preserve-origin-chaining": {
		appliesWhen:
			"page, 레이아웃, 화면 넓은 스코프에서 응답, 뮤테이션, 스토어를 구조분해할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때.",
		reviewWith: ["screen-keep-derived-values-close"],
	},
	"data-handle-mutation-failure-where-it-is-called": {
		appliesWhen: "뮤테이션을 부르는 코드를 추가·변경할 때. `mutate`와 `mutateAsync` 사이를 오갈 때.",
		reviewWith: ["data-invalidate-queries-the-mutation-changed", "events-run-user-actions-in-handlers-not-effects"],
	},
	"data-invalidate-queries-the-mutation-changed": {
		appliesWhen: "뮤테이션 성공 뒤 서버 상태를 다시 맞추는 코드를 추가·변경할 때. 캐시를 직접 쓰거나 다시 불러오는 코드를 넣을 때.",
		reviewWith: ["data-handle-mutation-failure-where-it-is-called"],
	},
	"typing-take-handler-types-from-existing-contracts": {
		appliesWhen:
			"커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때. `Ui*` 래퍼 사용처에서 프롭스 타입을 참조할 때. 제외: `query.select` 같은 훅 옵션의 일회성 문맥 콜백인 경우.",
		reviewWith: [],
	},
	"typing-narrow-library-wrapper-contracts": {
		appliesWhen: "라이브러리 컴포넌트를 감싸는 `Ui*` 래퍼의 프롭스 타입을 만들거나 바꿀 때. 래퍼에 프롭을 추가하거나 여는 범위를 넓힐 때.",
		reviewWith: [
			"typing-take-handler-types-from-existing-contracts",
			"typing-choose-wrapper-shape-and-forwarding",
			"css/composition-do-not-style-through-the-style-attribute",
			"typescript/docs-justify-convention-exceptions-with-a-reason-comment",
		],
	},
	"typing-choose-wrapper-shape-and-forwarding": {
		appliesWhen: "래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가·변경할 때. 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때.",
		reviewWith: [],
	},
	"strategy-choose-single-composition-compound-and-variants": {
		appliesWhen:
			"내보낸 공용 컴포넌트에 슬롯, 공개 부품, 공용 컨텍스트나 동작을 추가할 때. 반복되는 기본 설정이나 모드 API를 추가할 때. 공용 컴포넌트의 조립 구조를 재설계할 때.",
		reviewWith: [
			"strategy-expose-only-assembled-compound-parts",
			"strategy-avoid-boolean-prop-proliferation",
			"strategy-prefer-children-over-render-props",
			"screen-avoid-premature-abstraction",
		],
	},
	"strategy-expose-only-assembled-compound-parts": {
		appliesWhen: "합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때. 상태 없는 합성에 상태를 넣으면서 공개 이름을 바꾸려 할 때.",
		reviewWith: ["strategy-choose-single-composition-compound-and-variants", "css/composition-do-not-add-wrapper-elements-for-styling"],
	},
	"strategy-avoid-boolean-prop-proliferation": {
		appliesWhen:
			"`ui`나 `widget` 컴포넌트에 불리언 모드·표시 프롭을 추가할 때. 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때. 제외: 라우트 진입 파일 안에서만 쓰는 일회성 분기인 경우.",
		reviewWith: ["strategy-expose-only-assembled-compound-parts"],
	},
	"strategy-prefer-children-over-render-props": {
		appliesWhen:
			"공용 컴포넌트에 머리말·꼬리말·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때.",
		reviewWith: [],
	},
	"composition-read-props-without-destructuring": {
		appliesWhen:
			"함수 컴포넌트의 시그니처나 본문에서 프롭스를 읽는 코드를 추가·변경할 때. 컴포넌트 안에서 `props`를 구조분해하는 줄을 넣거나 뺄 때.",
		reviewWith: ["screen-keep-derived-values-close", "data-preserve-origin-chaining"],
	},
	"composition-do-not-define-components-inside-components": {
		appliesWhen:
			"컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 재마운트·focus 초기화 징후를 다룰 때.",
		reviewWith: [],
	},
	"composition-named-handlers-over-inline": {
		appliesWhen:
			"TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 읽어서 의도가 안 보이는 상태 전환이 들어갈 때. 제외: 인자 없이 핸들러 참조만 넘기는 경우.",
		reviewWith: ["events-run-user-actions-in-handlers-not-effects", "typescript/functions-extract-helpers-only-when-the-boundary-is-real"],
	},
	"composition-open-ref-props-only-for-imperative-contracts": {
		appliesWhen: "컴포넌트에 `ref` 프롭을 추가하거나 공개할 대상을 바꿀 때. 제외: 이미 있는 `ref` 계약의 타입만 바꾸는 경우.",
		reviewWith: ["typing-narrow-library-wrapper-contracts", "typescript/docs-justify-convention-exceptions-with-a-reason-comment"],
	},
	"composition-use-activity-only-to-preserve-mounted-subtrees": {
		appliesWhen: "조건부 렌더링과 `Activity` 사이를 오갈 때. `<Activity>`를 추가·삭제하거나 `mode`를 계산하는 식을 바꿀 때.",
		reviewWith: ["composition-do-not-define-components-inside-components"],
	},
	"composition-declare-props-interface-above-the-component": {
		appliesWhen:
			"컴포넌트 프롭스 타입을 새로 선언할 때. 프롭스 타입의 위치나 공개 범위를 바꿀 때. 제외: 같은 파일에서만 쓰는 화면 지역 프롭스를 `export` 하지 않는 경우.",
		reviewWith: ["composition-read-props-without-destructuring", "typescript/types-document-custom-types-and-shapes"],
	},
	"composition-name-fragments-explicitly": {
		appliesWhen: "JSX에서 여러 요소를 감쌀 조각 문법을 추가·변경할 때. 조각에 `key`를 붙이거나 떼어 낼 때.",
		reviewWith: [],
	},
	"composition-render-one-branch-with-and": {
		appliesWhen: "JSX 안에 조건부 렌더링을 추가하거나 조건식을 바꿀 때. 기존 `조건 ? … : null`을 넣거나 뺄 때.",
		reviewWith: [],
	},
	"screen-keep-route-flow-visible": {
		appliesWhen:
			"라우트 진입의 search 파라미터, 화면 이동, 쿼리, 뮤테이션, 화면 전체 이펙트를 옮기거나 나눌 때. page 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우.",
		reviewWith: ["screen-extract-local-section-components-for-runtime-boundaries", "ownership-place-owner-files-in-role-folders"],
	},
	"screen-avoid-premature-abstraction": {
		appliesWhen: "화면 코드를 보조 함수, 훅, 컴포넌트, 모듈로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때.",
		reviewWith: [
			"screen-extract-local-section-components-for-runtime-boundaries",
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
		],
	},
	"screen-extract-local-section-components-for-runtime-boundaries": {
		appliesWhen:
			"화면 지역 섹션 컴포넌트를 새로 추출할 때. 기존 섹션에 비동기, 지역 상태, 프로바이더, 상호작용, 외부 위젯, 성능 처리를 넣거나 뺄 때.",
		reviewWith: [],
	},
	"screen-keep-derived-values-close": {
		appliesWhen:
			"화면 진입 파일이나 섹션 최상단에 `const` 별칭, 플래그, 표시값을 추가·이동·제거할 때. 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 `const`로 빼거나 되돌릴 때.",
		reviewWith: ["data-preserve-origin-chaining"],
	},
	"runtime-place-suspense-boundaries-at-the-section-owner": {
		appliesWhen: "`Suspense` 쿼리를 쓰는 화면에서 로딩 대체 화면의 위치를 정할 때. `Suspense` 경계를 추가하거나 옮길 때.",
		reviewWith: [
			"screen-extract-local-section-components-for-runtime-boundaries",
			"runtime-place-error-boundaries-by-blast-radius",
			"css/layout-keep-layout-intent-explicit",
		],
	},
	"runtime-avoid-ad-hoc-loading-branches": {
		appliesWhen:
			"`Suspense` 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때. `isFetching`이나 뮤테이션 `isPending`으로 화면을 가리는 분기를 넣을 때. 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우.",
		reviewWith: [
			"data-preserve-origin-chaining",
			"screen-keep-derived-values-close",
			"typescript/absence-expose-optional-values-instead-of-silent-fallbacks",
		],
	},
	"runtime-place-error-boundaries-by-blast-radius": {
		appliesWhen: "오류 경계를 추가하거나 옮길 때. 화면 본문에 `isError` 분기나 실패 대체 화면 반환을 넣을 때.",
		reviewWith: [],
	},
	"state-calculate-derived-values-during-render": {
		appliesWhen:
			"현재 프롭스·상태·검색 매개변수·응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 파생값 동기화 이펙트를 제거할 때.",
		reviewWith: ["screen-keep-derived-values-close"],
	},
	"state-choose-state-tools-by-source-of-truth": {
		appliesWhen:
			"로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때. 합성 컴포넌트나 컴포넌트 묶음에 공유 상태를 넣을 때. 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때.",
		reviewWith: ["state-store-derived-authority", "strategy-choose-single-composition-compound-and-variants"],
	},
	"state-store-derived-authority": {
		appliesWhen:
			"여러 화면·메뉴·라우트 가드가 쓰는 접근 권한 같은 파생 판단을 스토어에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때.",
		reviewWith: ["docs-require-jsdoc-on-key-declarations", "state-calculate-derived-values-during-render"],
	},
	"state-use-functional-setstate-updates": {
		appliesWhen: "다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때. 핸들러·비동기 콜백·연속 호출에서 `setState` 방식을 바꿀 때.",
		reviewWith: [],
	},
	"state-use-effectevent-for-non-reactive-effect-callbacks": {
		appliesWhen: "구독 이펙트가 최신 프롭·상태 콜백을 읽어야 할 때. ref 동기화 우회, 의존성 재설치, `useEffectEvent`를 추가·변경할 때.",
		reviewWith: [
			"docs-require-jsdoc-on-key-declarations",
			"events-curry-extra-handler-arguments",
			"events-run-user-actions-in-handlers-not-effects",
		],
	},
	"events-name-handlers-predictably": {
		appliesWhen: "이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때.",
		reviewWith: ["typescript/naming-use-consistent-file-and-symbol-naming", "events-curry-extra-handler-arguments"],
	},
	"events-curry-extra-handler-arguments": {
		appliesWhen:
			"DOM 이벤트 프롭에 추가 인자를 넘기는 핸들러를 추가·변경할 때. 인라인 래퍼로 인자를 넘기던 자리를 바꿀 때. 제외: 이벤트 객체를 받지 않는 프롭 콜백인 경우.",
		reviewWith: ["composition-named-handlers-over-inline"],
	},
	"events-run-user-actions-in-handlers-not-effects": {
		appliesWhen:
			"제출, 저장, 삭제, 닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때. 이펙트 안에서 뮤테이션이나 화면 이동을 호출하는 코드를 넣을 때.",
		reviewWith: [],
	},
	"perf-avoid-defensive-memoization": {
		appliesWhen:
			"`useMemo`·`useCallback`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때.",
		reviewWith: ["perf-defer-heavy-renders-with-measured-evidence"],
	},
	"perf-use-lazy-state-initializers-for-expensive-defaults": {
		appliesWhen:
			"`useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때. 제외: 숫자·문자열 같은 단순 값이나 프롭을 그대로 초기값에 넣는 경우.",
		reviewWith: ["perf-avoid-defensive-memoization"],
	},
	"perf-defer-heavy-renders-with-measured-evidence": {
		appliesWhen:
			"`startTransition`·`useTransition`·`useDeferredValue`를 추가·삭제할 때. 목록이나 표가 커져 입력 반응이 늦다는 보고를 받았을 때.",
		reviewWith: ["perf-avoid-defensive-memoization"],
	},
	"a11y-give-interactive-elements-an-accessible-name": {
		appliesWhen: "클릭이나 입력을 받는 요소를 새로 만들 때. 글자 없이 아이콘만 있는 버튼을 추가할 때.",
		reviewWith: [],
	},
	"docs-require-jsdoc-on-key-declarations": {
		appliesWhen:
			"쿼리·뮤테이션이나 읽어서 의도가 안 보이는 핸들러·이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때.",
		reviewWith: ["typescript/types-document-custom-types-and-shapes"],
	},
} as const;

/**
 * @summary 조건부 reviewWith와 달리 Selected가 반드시 닫혀야 하는 exact routing oracle
 */
const mandatoryRuleRouting = {
	react: {
		"ownership-keep-component-imports-flowing-downward": ["typescript/naming-restrict-absolute-aliases-to-layer-roots"],
		"data-name-query-and-mutation-bindings-consistently": [
			"typescript/naming-use-consistent-file-and-symbol-naming",
			"docs-require-jsdoc-on-key-declarations",
		],
		"data-shape-query-data-with-select": ["docs-require-jsdoc-on-key-declarations"],
		"typing-take-handler-types-from-existing-contracts": ["typescript/types-prefer-function-variable-types-over-parameter-annotations"],
		"typing-choose-wrapper-shape-and-forwarding": ["typing-narrow-library-wrapper-contracts"],
		"composition-named-handlers-over-inline": ["docs-require-jsdoc-on-key-declarations", "events-curry-extra-handler-arguments"],
		"runtime-place-suspense-boundaries-at-the-section-owner": ["runtime-avoid-ad-hoc-loading-branches"],
		"runtime-place-error-boundaries-by-blast-radius": ["runtime-place-suspense-boundaries-at-the-section-owner"],
		"events-curry-extra-handler-arguments": ["typing-take-handler-types-from-existing-contracts"],
		"docs-require-jsdoc-on-key-declarations": ["typescript/docs-require-header-jsdoc-on-key-declarations"],
	},
	typescript: {
		"types-document-custom-types-and-shapes": [
			"docs-write-concise-korean-comments-about-purpose-and-constraints",
			"docs-write-doc-comments-as-multiline-blocks",
		],
		"types-replace-enum-with-as-const-objects": ["naming-use-consistent-file-and-symbol-naming", "types-document-custom-types-and-shapes"],
		"naming-place-owner-config-in-the-owner-config-folder": ["naming-use-consistent-file-and-symbol-naming"],
		"functions-place-and-promote-support-functions": ["functions-extract-helpers-only-when-the-boundary-is-real"],
		"docs-require-header-jsdoc-on-key-declarations": [
			"docs-write-concise-korean-comments-about-purpose-and-constraints",
			"docs-write-doc-comments-as-multiline-blocks",
		],
	},
	css: {"selector-use-pseudo-classes-for-dom-owned-states": ["selector-separate-domain-state-modifiers-from-dom-interaction-states"]},
} as const;

const completionGateRouting = {react: [], typescript: [], css: []} as const;

/**
 * @summary Appendix A scenario별 initial exact selected rule oracle
 */
const typescriptSelections = {
	"shared-config-existing-source": [
		"naming-centralize-shared-config-namespaces",
		"naming-place-owner-config-in-the-owner-config-folder",
		"naming-preserve-config-origin-with-chained-access",
		"naming-use-consistent-file-and-symbol-naming",
		"naming-use-direct-imports-and-public-entry-points",
		"naming-restrict-absolute-aliases-to-layer-roots",
		"naming-read-environment-values-through-shared-config",
	],
	"callback-contract-implementation": [
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-mark-unused-parameters-with-underscore",
		"naming-use-consistent-file-and-symbol-naming",
	],
	"derive-existing-contract-with-docs": [
		"types-reuse-existing-contracts-before-new-types",
		"types-document-custom-types-and-shapes",
		"types-narrow-unknown-instead-of-asserting",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	],
	"helper-boundary-scope-drift": [
		"naming-use-consistent-file-and-symbol-naming",
		"functions-extract-helpers-only-when-the-boundary-is-real",
		"functions-place-and-promote-support-functions",
		"functions-name-functions-by-what-comes-out",
	],
	"shared-collection-lookups-and-sort": ["values-prefer-immutable-array-sorting", "values-use-set-and-map-for-repeated-lookups"],
	"enum-like-runtime-contract": [
		"types-document-custom-types-and-shapes",
		"types-replace-enum-with-as-const-objects",
		"naming-use-consistent-file-and-symbol-naming",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
		"tooling-configure-biome-to-enforce-these-rules",
	],
	"wide-scope-assembly": ["functions-avoid-imperative-assembly-in-wide-scopes", "functions-name-a-value-only-when-it-is-reused"],
	"named-object-param": [
		"naming-use-consistent-file-and-symbol-naming",
		"functions-declare-functions-as-arrow-consts",
		"functions-use-named-object-params-for-complex-signatures",
	],
	"explicit-product-fallback": [
		"absence-expose-optional-values-instead-of-silent-fallbacks",
		"docs-keep-body-comments-for-intent-and-steps",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"docs-justify-convention-exceptions-with-a-reason-comment",
	],
} as const;

/**
 * @summary Appendix A scenario별 exact prompt와 file evidence oracle
 */
const typescriptScenarioEvidence = {
	"shared-config-existing-source": {
		prompt:
			"`billing-request.ts` and `audit-request.ts` duplicate URL/page-size constants and read `import.meta.env` directly; move both into the documented `config` namespace and read them through `config.*`.",
		files: ["src/features/billing/billing-request.ts", "src/features/audit/audit-request.ts"],
	},
	"callback-contract-implementation": {
		prompt:
			"implement an existing documented interface callback through its Indexed Access function type and rename the unused contract parameter to `_level`; do not add types, imports, or docs.",
		files: ["src/logging/log-sink.ts"],
	},
	"derive-existing-contract-with-docs": {
		prompt:
			'replace a duplicate `UserPreview` interface with a same-name interface that pulls each field through `UserRecord["id"]` indexed access, drop the `as unknown as` assertion that fed it, and add Korean header and field doc comments.',
		files: ["src/users/user-preview.ts"],
	},
	"helper-boundary-scope-drift": {
		prompt: "inline a single-owner `mapProfileRow` sub-step into `profile-api.ts` and rename the remaining exported builder by its result.",
		files: ["src/profile/profile-api.ts"],
	},
	"shared-collection-lookups-and-sort": {
		prompt:
			"replace repeated `includes` with an existing Set's `has` and replace shared-input `.sort()` with `.toSorted()`; declarations, imports, and docs stay unchanged.",
		files: ["src/search/filter-products.ts"],
	},
	"enum-like-runtime-contract": {
		prompt:
			"replace `enum ProductStatus` with snake_case `product_status as const`, derive `ProductStatus`, and document the object, every key, and derived type in Korean.",
		files: ["src/audit/audit-status.ts"],
	},
	"wide-scope-assembly": {
		prompt:
			"replace an existing top-level `let` plus conditional `push` flow with a declarative calculation assigned to the same `visibleTabs` name and inline the single-use intermediate const; imports and docs stay unchanged.",
		files: ["src/navigation/visible-tabs.ts"],
	},
	"named-object-param": {
		prompt:
			"change a function that destructures `BuildRequestUrlArgs` in the signature to accept `args` and destructure on the first body line; no other contract/docs/import changes.",
		files: ["src/http/to-request-url.ts"],
	},
	"explicit-product-fallback": {
		prompt:
			"replace an ungrounded optional page-size `??` literal with a reference to the declared config default and a Korean constraint comment; helper/header boundaries stay unchanged.",
		files: ["src/search/resolve-page-size.ts"],
	},
} as const;

/**
 * @summary Appendix B와 D의 React scenario별 exact stage oracle
 */
const reactScenarioStages = {
	"RTE01-import-contract-cleanup": {
		initial: {
			prompt:
				"rename UserCard.tsx to user-card.tsx, remove index.ts barrel, replace React.MouseEvent and a duplicate API view type with existing contracts in src/ui/user-card/ui-user-card.tsx and src/ui/index.ts.",
			files: ["src/ui/user-card/ui-user-card.tsx", "src/ui/index.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-prefix-layer-names-on-files-and-symbols",
					"typing-take-handler-types-from-existing-contracts",
					"events-name-handlers-predictably",
					"events-curry-extra-handler-arguments",
				],
				typescript: [
					"types-reuse-existing-contracts-before-new-types",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE02-owner-placement-css-drift": {
		initial: {
			prompt:
				"move a route-only tree renderer from shared UI to src/page/products/component/pg-product-tree.tsx and rename it as owner-private; carry its existing className and style import through unchanged and make no styling change.",
			files: ["src/ui/product-tree/ui-product-tree.tsx", "src/page/products/component/pg-product-tree.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-prefix-layer-names-on-files-and-symbols",
					"ownership-place-owner-files-in-role-folders",
					"composition-read-props-without-destructuring",
					"composition-declare-props-interface-above-the-component",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
		scopeDrift: {
			evidence:
				"in a project without a CSS Modules standard, add directly imported src/page/products/component/pg-product-tree.css, create owner-unique pg_* role-named classes, and compose the changed className contract with the existing direct clsx import; final skills add CSS with no additional React rule.",
			files: [
				"src/ui/product-tree/ui-product-tree.tsx",
				"src/page/products/component/pg-product-tree.tsx",
				"src/page/products/component/pg-product-tree.css",
			],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-prefix-layer-names-on-files-and-symbols",
					"ownership-place-owner-files-in-role-folders",
					"composition-read-props-without-destructuring",
					"composition-declare-props-interface-above-the-component",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"naming-keep-page-slug-traceable",
					"ownership-give-each-file-one-scope-slug",
					"ownership-choose-scope-prefix-by-reuse-range",
					"ownership-use-foreign-classes-only-under-your-own-root",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"selector-separate-domain-state-modifiers-from-dom-interaction-states",
				],
			},
		},
	},
	"RTE03-route-support-extraction": {
		initial: {
			prompt:
				"move one real four-argument multi-line payload boundary out of src/page/products/pg-products.tsx into src/page/products/function/to-product-save-request.ts; do not create a hook, generic utils file, or helper soup.",
			files: ["src/page/products/pg-products.tsx", "src/page/products/function/to-product-save-request.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-place-owner-files-in-role-folders",
					"ownership-prefer-plain-ts-for-local-react-helpers",
					"screen-avoid-premature-abstraction",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"functions-declare-functions-as-arrow-consts",
					"functions-use-named-object-params-for-complex-signatures",
					"functions-extract-helpers-only-when-the-boundary-is-real",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE04-shared-config": {
		initial: {
			prompt:
				"move a duplicated menu key and default page size from two screens into a documented snake_case as const config object in src/shared/config.ts and directly import and use config.* from both route pages.",
			files: ["src/page/products/pg-products.tsx", "src/page/reports/pg-reports.tsx", "src/shared/config.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [],
				typescript: [
					"types-document-custom-types-and-shapes",
					"types-replace-enum-with-as-const-objects",
					"naming-centralize-shared-config-namespaces",
					"naming-preserve-config-origin-with-chained-access",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE05-toolbar-composition": {
		initial: {
			prompt:
				"replace compact/edit/search/focus booleans and static render props on wg-product-toolbar.tsx with stateless compound parts plus repeated explicit variants, give the icon-only buttons accessible names, and document public parts.",
			files: ["src/widget/product-toolbar/wg-product-toolbar.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"strategy-choose-single-composition-compound-and-variants",
					"strategy-expose-only-assembled-compound-parts",
					"strategy-avoid-boolean-prop-proliferation",
					"strategy-prefer-children-over-render-props",
					"composition-read-props-without-destructuring",
					"composition-declare-props-interface-above-the-component",
					"a11y-give-interactive-elements-an-accessible-name",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE06-nested-forwardref": {
		initial: {
			prompt:
				"hoist an existing nested forwardRef search input that resets focus to module scope, convert it to a React 19 ref prop, and narrow UiSearchCardProps so it extends HTMLAttributes and opens only the library props in use in ui-search-card.tsx.",
			files: ["src/ui/search-card/ui-search-card.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"typing-narrow-library-wrapper-contracts",
					"typing-choose-wrapper-shape-and-forwarding",
					"composition-read-props-without-destructuring",
					"composition-do-not-define-components-inside-components",
					"composition-open-ref-props-only-for-imperative-contracts",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE08-delete-handler-flow": {
		initial: {
			prompt:
				"move a row delete inline async branch, mutation, navigation, and state+effect replay into one curried named handler, handle the mutation failure and invalidate the affected list query, keep an unused React event as _event, directly import its reused callback type, and keep screen-only flow inside page.tsx.",
			files: ["src/page/products/pg-products.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"data-handle-mutation-failure-where-it-is-called",
					"data-invalidate-queries-the-mutation-changed",
					"typing-take-handler-types-from-existing-contracts",
					"composition-named-handlers-over-inline",
					"events-name-handlers-predictably",
					"events-curry-extra-handler-arguments",
					"events-run-user-actions-in-handlers-not-effects",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-mark-unused-parameters-with-underscore",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"functions-extract-helpers-only-when-the-boundary-is-real",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE09-route-runtime-section": {
		initial: {
			prompt:
				'extract only the tree section that owns local search and expanded state plus a tree adapter into the owner component folder, implement a named selection handler from ProductTreeSectionProps["onCategorySelect"], and keep search params, navigation, page query, and mutation in the page product.',
			files: ["src/page/products/pg-products.tsx", "src/page/products/component/pg-product-tree-section.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-owner-files-in-role-folders",
					"typing-take-handler-types-from-existing-contracts",
					"composition-read-props-without-destructuring",
					"composition-use-activity-only-to-preserve-mounted-subtrees",
					"screen-keep-route-flow-visible",
					"screen-avoid-premature-abstraction",
					"screen-extract-local-section-components-for-runtime-boundaries",
					"runtime-place-suspense-boundaries-at-the-section-owner",
					"runtime-avoid-ad-hoc-loading-branches",
					"events-name-handlers-predictably",
					"events-curry-extra-handler-arguments",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-reuse-existing-contracts-before-new-types",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"absence-expose-optional-values-instead-of-silent-fallbacks",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE10-derived-selection-state": {
		initial: {
			prompt:
				"extract the inline selection toggle into a named handleSelectionToggle handler, replace selectedIds-derived count and flag effect+state synchronization with render calculation near use, and use a functional updater; do not change navigation or styling.",
			files: ["src/page/products/pg-products.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"typing-take-handler-types-from-existing-contracts",
					"composition-named-handlers-over-inline",
					"screen-keep-derived-values-close",
					"state-calculate-derived-values-during-render",
					"state-use-functional-setstate-updates",
					"events-name-handlers-predictably",
					"events-curry-extra-handler-arguments",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-mark-unused-parameters-with-underscore",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE11-shared-authority": {
		initial: {
			prompt:
				"synchronize shared capability once at the owning layout and store for multiple screens, menu, and guards; do not copy single-screen server fields into the store.",
			files: ["src/routes/_authenticated/layout.tsx", "src/store/capability-store.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"data-preserve-origin-chaining",
					"state-choose-state-tools-by-source-of-truth",
					"state-store-derived-authority",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE12-query-shaping": {
		initial: {
			prompt:
				"move repeated raw list, items, and meta render shaping into query select, combine the product and category responses through useQueries combine, rename bindings to response... and mutation..., and remove wide aliases.",
			files: ["src/page/products/pg-products.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"data-name-query-and-mutation-bindings-consistently",
					"data-shape-query-data-with-select",
					"data-combine-multiple-queries-with-combine",
					"data-preserve-origin-chaining",
					"screen-keep-derived-values-close",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE13-heavy-search": {
		initial: {
			prompt:
				"for a 50k-row search, directly import newly used React hooks, use lazy initialization, urgent input plus deferred result, a non-urgent category transition, and only evidence-backed memoization; update the constraint comment.",
			files: ["src/page/products/component/pg-product-search.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"perf-avoid-defensive-memoization",
					"perf-use-lazy-state-initializers-for-expensive-defaults",
					"perf-defer-heavy-renders-with-measured-evidence",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-keep-body-comments-for-intent-and-steps",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
					"docs-justify-convention-exceptions-with-a-reason-comment",
				],
			},
		},
	},
	"RTE14-subscription-effectevent": {
		initial: {
			prompt:
				"directly import useEffectEvent, replace only a socket subscription latest-callback ref-sync hack with a named handleMessage = useEffectEvent(...), and update subscription lifecycle JSDoc; do not change click or submit actions.",
			files: ["src/page/products/component/pg-product-socket.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"state-use-effectevent-for-non-reactive-effect-callbacks",
					"events-name-handlers-predictably",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-prefer-function-variable-types-over-parameter-annotations",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE15-suspense-absence": {
		initial: {
			prompt:
				'replace Suspense detail ?? [], || "-", a local pending Spinner, an isError branch, single-branch ternaries, and top-level aliases with a route error boundary, an explicit empty state, and origin chaining; remove an ungrounded explanatory comment.',
			files: ["src/page/product-detail/pg-product-detail.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"data-preserve-origin-chaining",
					"composition-name-fragments-explicitly",
					"composition-render-one-branch-with-and",
					"screen-keep-derived-values-close",
					"runtime-place-suspense-boundaries-at-the-section-owner",
					"runtime-avoid-ad-hoc-loading-branches",
					"runtime-place-error-boundaries-by-blast-radius",
				],
				typescript: [
					"absence-expose-optional-values-instead-of-silent-fallbacks",
					"docs-keep-body-comments-for-intent-and-steps",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-justify-convention-exceptions-with-a-reason-comment",
				],
			},
		},
	},
	"RTE16-private-component-import-direction": {
		initial: {
			prompt:
				"two sibling files under src/page/detail/component/sales-trend-panel/component/ import each other's legend row through ../; make the panel own the shared legend row and pass it down as an element prop, and remove the sibling and @/page component imports.",
			files: [
				"src/page/detail/component/sales-trend-panel/pg-sales-trend-panel.tsx",
				"src/page/detail/component/sales-trend-panel/component/pg-detection-section.tsx",
				"src/page/detail/component/sales-trend-panel/component/pg-summary-band.tsx",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-place-owner-files-in-role-folders",
					"ownership-keep-component-imports-flowing-downward",
					"strategy-prefer-children-over-render-props",
				],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "naming-restrict-absolute-aliases-to-layer-roots"],
			},
		},
	},
	"RTE17-chart-lifecycle-ownership": {
		initial: {
			prompt:
				"the ECharts init, resize listener, and dispose currently sit in src/widget/chart/hook/use-chart-instance.ts only to shorten the component; fold that lifecycle back into the owning chart root and leave the domain option builder in function/.",
			files: [
				"src/widget/chart/component/wg-chart-root.tsx",
				"src/widget/chart/hook/use-chart-instance.ts",
				"src/widget/chart/function/to-chart-option.ts",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-place-owner-files-in-role-folders",
					"ownership-prefer-plain-ts-for-local-react-helpers",
					"ownership-keep-lifecycle-in-the-owning-component",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
} as const;

/**
 * @summary Appendix C와 D의 CSS scenario별 exact stage oracle
 */
const cssScenarioStages = {
	"css-route-style-scope-drift": {
		initial: {
			prompt: "pure rendering change in src/page/catalog-index/pg-catalog-index.tsx, with React and TypeScript only.",
			files: ["src/page/catalog-index/pg-catalog-index.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: [], typescript: []},
		},
		scopeDrift: {
			evidence:
				"add route-owned empty-state className, src/page/catalog-index/pg-catalog-index.css, and its direct side-effect import in a project without a CSS Modules standard; final skills add CSS.",
			files: ["src/page/catalog-index/pg-catalog-index.tsx", "src/page/catalog-index/pg-catalog-index.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: ["ownership-place-owner-files-in-role-folders"],
				typescript: ["naming-use-direct-imports-and-public-entry-points"],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"naming-keep-page-slug-traceable",
					"ownership-give-each-file-one-scope-slug",
					"ownership-choose-scope-prefix-by-reuse-range",
					"ownership-use-foreign-classes-only-under-your-own-root",
					"composition-compose-classes-with-clsx",
				],
			},
		},
	},
	"css-owner-boundary-split": {
		initial: {
			prompt:
				"pg-post-index.css holds both the page shell and the filter dialog; move the dialog styles into the component own CSS file and give that file its own slug.",
			files: ["src/page/post-index/pg-post-index.css", "src/page/post-index/component/pg-post-filter-dialog.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["ownership-give-each-file-one-scope-slug", "ownership-choose-scope-prefix-by-reuse-range"]},
		},
	},
	"css-domain-state-class-contract": {
		initial: {
			prompt:
				"split listButtonActive into base plus --active, add a direct clsx import, and compose with clsx() in pg-catalog-index.tsx and _index.css; do not change pseudo-states.",
			files: ["src/page/catalog-index/pg-catalog-index.tsx", "src/page/catalog-index/pg-catalog-index.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["naming-use-direct-imports-and-public-entry-points"],
				css: [
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"composition-keep-classes-single-purpose",
					"selector-use-pseudo-classes-for-dom-owned-states",
					"selector-separate-domain-state-modifiers-from-dom-interaction-states",
				],
			},
		},
	},
	"css-one-off-structural-modifier": {
		initial: {
			prompt:
				"replace non-repeatable section--compactTop spacing patch with a role-named element in pg-catalog-detail.tsx and detail.css; keep the existing clsx import.",
			files: ["src/page/catalog-detail/pg-catalog-detail.tsx", "src/page/catalog-detail/pg-catalog-detail.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: [],
				css: [
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
				],
			},
		},
	},
	"css-ui-wrapper-third-party-dom": {
		initial: {
			prompt:
				"add a direct clsx import and style UiCollapse Ant DOM from a new owned wrapper with the shortest chain in post-filter-dialog.tsx and post-filter-dialog.css; keep the existing hard-coded wrapper color.",
			files: ["src/page/post-index/component/pg-post-filter-dialog.tsx", "src/page/post-index/component/pg-post-filter-dialog.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["naming-use-direct-imports-and-public-entry-points"],
				css: [
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"ownership-use-foreign-classes-only-under-your-own-root",
					"composition-compose-classes-with-clsx",
					"composition-inject-classes-only-at-the-entry-point",
				],
			},
		},
		scopeDrift: {
			evidence: "replace the hard-coded wrapper color with an optional CSS variable and provide its fallback.",
			files: ["src/page/post-index/component/pg-post-filter-dialog.tsx", "src/page/post-index/component/pg-post-filter-dialog.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["naming-use-direct-imports-and-public-entry-points"],
				css: [
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"ownership-use-foreign-classes-only-under-your-own-root",
					"composition-compose-classes-with-clsx",
					"composition-inject-classes-only-at-the-entry-point",
					"values-always-provide-css-variable-fallbacks",
				],
			},
		},
	},
	"css-ui-wrapper-root-prop-contract": {
		initial: {
			prompt:
				"narrow UiButtonProps so it extends HTMLAttributes and opens only the library props we use, expose it documented, read props through the props object in ui-button.tsx, and pass an existing layout class from order-actions.tsx; add no internal selector or new class.",
			files: ["src/ui/button/ui-button.tsx", "src/page/order-index/component/pg-order-actions.tsx"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [
					"typing-narrow-library-wrapper-contracts",
					"typing-choose-wrapper-shape-and-forwarding",
					"composition-read-props-without-destructuring",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-reuse-existing-contracts-before-new-types",
					"types-document-custom-types-and-shapes",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
				css: ["composition-compose-classes-with-clsx", "composition-inject-classes-only-at-the-entry-point"],
			},
		},
	},
	"css-wrapper-element-for-spacing": {
		initial: {
			prompt:
				"a wrapper div with an inline style margin was added around UiCollapse only for spacing; remove both by adding a className contract to the component.",
			files: ["src/ui/collapse/ui-collapse.tsx", "src/page/post-index/component/pg-post-filter-dialog.tsx"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"naming-name-elements-and-modifiers-by-role",
					"composition-inject-classes-only-at-the-entry-point",
					"composition-do-not-add-wrapper-elements-for-styling",
					"composition-do-not-style-through-the-style-attribute",
				],
			},
		},
	},
	"css-rich-text-owner-block": {
		initial: {
			prompt:
				"move top-level .wg_productDetail__prose h2 and > :first-child into the existing owner block; the body comes from dangerouslySetInnerHTML so classes cannot be added.",
			files: ["src/widget/product-detail/wg-product-detail.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-limit-nesting-block-depth", "selector-use-classes-instead-of-element-selectors"]},
		},
	},
	"css-dom-interaction-states": {
		initial: {
			prompt:
				"move top-level hover/focus/disabled into the same class block's &: nesting and preserve the focus ring; no app modifier or value is added.",
			files: ["src/ui/button/ui-button.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-use-pseudo-classes-for-dom-owned-states",
					"selector-nest-dom-state-in-the-owning-block",
					"selector-separate-domain-state-modifiers-from-dom-interaction-states",
					"a11y-always-provide-a-visible-focus-indicator",
				],
			},
		},
	},
	"css-repeated-values-and-optional-token": {
		initial: {
			prompt:
				"scope a global .ant-tree selector under the existing .ui_themePreview owner root with one descendant level, and replace repeated color/spacing/radius with optional CSS variables and fallbacks; keep the file and owner name unchanged; also namespace the shared fade keyframes and add the global reduced-motion block.",
			files: ["src/ui/theme-preview/ui-theme-preview.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"ownership-use-foreign-classes-only-under-your-own-root",
					"selector-use-pseudo-classes-for-dom-owned-states",
					"selector-separate-domain-state-modifiers-from-dom-interaction-states",
					"values-always-provide-css-variable-fallbacks",
					"values-tokenize-repeated-visual-values",
					"a11y-namespace-keyframes-and-respect-reduced-motion",
				],
			},
		},
	},
	"css-shared-declaration-group": {
		initial: {
			prompt:
				"split the shared .pg_salesPanel__glyph--* comma group so each modifier block declares its own width and height; do not introduce local custom properties.",
			files: ["src/page/detail/component/sales-trend-panel/pg-sales-trend-panel.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-do-not-group-classes-with-commas", "values-tokenize-repeated-visual-values"]},
		},
	},
	"css-split-class-declaration": {
		initial: {
			prompt:
				"the same .pg_catalogIndex__toolbar block is opened twice at the top level of one file, and a third override sits nested inside the class block as @media; fold the plain duplicate into one block and move the breakpoint override into a grouped @media at the bottom of the file.",
			files: ["src/page/catalog-index/pg-catalog-index.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-declare-each-class-in-one-block", "layout-group-breakpoints-at-the-file-bottom"]},
		},
	},
	"css-responsive-grid-and-button-width": {
		initial: {
			prompt:
				"the product grid counts its columns with four @media steps and ui-button.css sets its own width at three breakpoints; make the grid and the button size themselves without breakpoints.",
			files: ["src/page/products/pg-products.css", "src/ui/button/ui-button.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["layout-keep-layout-intent-explicit", "layout-reach-for-intrinsic-sizing-before-breakpoints"]},
		},
	},
	"css-sticky-layout-intent": {
		initial: {
			prompt:
				"clarify sticky basis and z-index ownership through layer tokens and remove excessive width/height forcing in pg-dashboard.css.",
			files: ["src/page/dashboard/pg-dashboard.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["values-declare-stacking-layers-as-tokens", "layout-keep-layout-intent-explicit"]},
		},
	},
	"css-theme-token-switch": {
		initial: {
			prompt:
				"add dark mode: a page css file currently branches on prefers-color-scheme inside .pg_dashboard__panel and hardcodes #ffffff and a black box-shadow; move the branch into the token file and keep the component reading tokens only.",
			files: ["src/style/token.css", "src/page/dashboard/pg-dashboard.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"values-always-provide-css-variable-fallbacks",
					"values-tokenize-repeated-visual-values",
					"values-switch-themes-by-changing-token-values",
				],
			},
		},
	},
	"css-cross-owner-internal-targeting": {
		initial: {
			prompt:
				"the detail page styles .wg_chartCard__caption from pg-detail.css; move the change so the page no longer declares widget classes.",
			files: ["src/page/detail/pg-detail.css", "src/widget/chart-card/wg-chart-card.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: ["ownership-use-foreign-classes-only-under-your-own-root", "ownership-change-other-owners-through-their-api"],
			},
		},
	},
	"css-negated-domain-state": {
		initial: {
			prompt:
				"remove the :not(--checked) ancestor condition that drives the descendant checkbox preview; keep the hover and focus feedback.",
			files: ["src/page/detail/component/sales-trend-panel/pg-sales-trend-panel.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-limit-nesting-block-depth",
					"selector-do-not-group-classes-with-commas",
					"selector-nest-dom-state-in-the-owning-block",
					"selector-do-not-invert-domain-state-with-not",
				],
			},
		},
	},
	"css-stylelint-config-setup": {
		initial: {
			prompt: "add a stylelint config for this convention with per-directory prefix overrides; keep stylelint-config-standard as the base.",
			files: ["stylelint.config.mjs"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"naming-use-scope-slug-element-modifier-syntax",
					"ownership-use-foreign-classes-only-under-your-own-root",
					"selector-limit-nesting-block-depth",
					"tooling-configure-stylelint-to-enforce-these-rules",
				],
			},
		},
	},
} as const;

const fixtureRuleIds = ["fixture-first", "fixture-second"] as const;

/**
 * @summary progressive skill fixture source 구성 옵션
 */
interface SkillFixtureOptions {
	/**
	 * @field fixture metadata에 선언할 direct companion 목록
	 */
	companions?: SkillCompanion[];
	/**
	 * @field non-progressive fixture metadata에 선언할 legacy extends 목록
	 */
	extends?: string[];
	/**
	 * @field progressiveDisclosure metadata 활성화 여부
	 */
	progressive?: boolean;
	/**
	 * @field fixture에 생성할 local rule stable ID 목록
	 */
	ruleIds?: string[];
	/**
	 * @field stable ID별 mandatory selection routing metadata
	 */
	ruleRouting?: Record<string, {requiredOnCompletion?: boolean; requiresSelected?: string[]}>;
	/**
	 * @field stable ID별 custom rule title
	 */
	ruleTitles?: Record<string, string>;
}

/**
 * @summary progressive skill fixture 파일 생성 인자
 */
interface WriteFixtureSkillArgs {
	/**
	 * @field 격리된 fixture skill root 절대 경로
	 */
	skillRootDir: string;
	/**
	 * @field 생성할 fixture skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field fixture source 구성 선택 옵션
	 */
	options?: SkillFixtureOptions;
}

/**
 * @summary routing-evals.json fixture 생성 인자
 */
interface WriteManifestArgs {
	/**
	 * @field 격리된 fixture skill root 절대 경로
	 */
	skillRootDir: string;
	/**
	 * @field manifest owner skill 디렉터리 이름
	 */
	skillName: string;
	/**
	 * @field JSON으로 직렬화할 manifest 후보 값
	 */
	manifest: unknown;
}

const createValidManifest = (skill: string = "owner"): RoutingEvalManifest => ({
	version: 1,
	skill,
	scenarios: [
		{
			id: `${skill}-all-rules`,
			prompt: "Change every fixture concern.",
			files: ["src/fixture.ts"],
			expectedSkills: [skill],
			expectedSelected: {[skill]: [...fixtureRuleIds]},
		},
	],
});

const writeFixtureSkill = async (args: WriteFixtureSkillArgs): Promise<void> => {
	const {skillRootDir, skillName, options = {}} = args;
	const {
		companions = [],
		extends: extendedSkills = [],
		progressive = true,
		ruleIds = [...fixtureRuleIds],
		ruleRouting = {},
		ruleTitles = {},
	} = options;
	const skillDir = path.join(skillRootDir, skillName);
	const rulesDir = path.join(skillDir, "rules");
	await mkdir(rulesDir, {recursive: true});
	await writeFile(
		path.join(skillDir, "metadata.json"),
		`${JSON.stringify(
			{
				title: `${skillName} Convention`,
				version: "1.0.0",
				organization: "Fixture Team",
				abstract: "Fixture convention.",
				...(progressive
					? {progressiveDisclosure: true, ...(companions.length > 0 ? {companions} : {})}
					: extendedSkills.length > 0
						? {extends: extendedSkills}
						: {}),
			},
			null,
			2,
		)}\n`,
		"utf8",
	);
	await writeFile(
		path.join(skillDir, "SKILL.md"),
		`---\nname: convention-${skillName}\ndescription: Use when editing ${skillName} code.\n---\n\n# ${skillName}\n`,
		"utf8",
	);
	await writeFile(
		path.join(rulesDir, "_sections.md"),
		"## 1. Fixture Rules (fixture)\n\n**Impact:** HIGH\n\n**Description:** Fixture rules.\n",
		"utf8",
	);

	for (const ruleId of ruleIds) {
		const ruleTitle = ruleTitles[ruleId] ?? ruleId;
		const routing = ruleRouting[ruleId];
		const mandatoryRouting = [
			routing?.requiresSelected === undefined ? undefined : `requiresSelected: ${routing.requiresSelected.join(", ")}`,
			routing?.requiredOnCompletion === undefined ? undefined : `requiredOnCompletion: ${String(routing.requiredOnCompletion)}`,
		]
			.filter((line): line is string => line !== undefined)
			.join("\n");
		await writeFile(
			path.join(rulesDir, `${ruleId}.md`),
			`---\ntitle: ${ruleTitle}\nimpact: HIGH\nimpactDescription: Fixture impact.\nappliesWhen: Editing ${ruleId}.\n${mandatoryRouting.length === 0 ? "" : `${mandatoryRouting}\n`}tags: fixture\n---\n\n## ${ruleTitle}\n\n**Incorrect**\n\nBad.\n\n**Correct**\n\nGood.\n`,
			"utf8",
		);
	}
};

const writeManifest = async (args: WriteManifestArgs): Promise<void> => {
	const {skillRootDir, skillName, manifest} = args;
	await writeFile(path.join(skillRootDir, skillName, "routing-evals.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
};

const withFixtureRoot = async (run: (skillRootDir: string) => Promise<void>): Promise<void> => {
	const skillRootDir = await mkdtemp(path.join(tmpdir(), "routing-evals-"));

	try {
		await run(skillRootDir);
	} finally {
		await rm(skillRootDir, {recursive: true, force: true});
	}
};

test("TypeScript progressive metadata matches Appendix A exactly", async () => {
	const skillPaths = getSkillPaths("typescript", realSkillRootDir);
	const document = await readSkillDocument(skillPaths);

	assert.equal(document.metadata.progressiveDisclosure, true);
	assert.deepEqual(document.metadata.companions ?? [], []);
	assert.equal(document.rules.length, 29);
	assert.deepEqual(
		Object.fromEntries(document.rules.map((rule) => [getRuleId(rule), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}])),
		typescriptRuleRouting,
	);
	assert.equal(
		document.rules.every((rule) => Boolean(rule.appliesWhen) && Buffer.byteLength(rule.appliesWhen ?? "", "utf8") > 0),
		true,
	);
	assert.equal(
		document.rules.every((rule) => (rule.appliesWhen?.length ?? 0) <= 160),
		true,
	);
	const headerJsdocRule = await readRuleSource("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assert.match(headerJsdocRule, /docs-write-doc-comments-as-multiline-blocks/);
	const roleTagRule = await readRuleSource("typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints");
	assert.match(roleTagRule, /역할 태그를 붙이지 않/);
	assert.equal(
		readFrontmatterValue(headerJsdocRule, "requiresSelected"),
		"docs-write-concise-korean-comments-about-purpose-and-constraints, docs-write-doc-comments-as-multiline-blocks",
	);
	assert.doesNotMatch(headerJsdocRule, /^reviewWith:/m);
});

test("TypeScript routing manifest is an exact nine-scenario partition with full positive coverage", async () => {
	const skillPaths = getSkillPaths("typescript", realSkillRootDir);
	await validateRoutingEvalManifest(skillPaths);
	await validateRoutingEvalManifests(realSkillRootDir);
	const manifest = await readRoutingEvalManifest(skillPaths);
	const universe = [...typescriptRuleUniverse];

	assert.equal(manifest.version, 1);
	assert.equal(manifest.skill, "typescript");
	assert.equal(manifest.scenarios.length, 9);
	assert.deepEqual(
		Object.fromEntries(manifest.scenarios.map((scenario) => [scenario.id, scenario.expectedSelected.typescript])),
		typescriptSelections,
	);
	assert.deepEqual(
		Object.fromEntries(manifest.scenarios.map((scenario) => [scenario.id, {prompt: scenario.prompt, files: scenario.files}])),
		typescriptScenarioEvidence,
	);

	const covered = new Set<string>();
	for (const scenario of manifest.scenarios) {
		assert.deepEqual(scenario.expectedSkills, ["typescript"], `${scenario.id} initial expectedSkills must be exact`);
		for (const ruleId of scenario.expectedSelected.typescript ?? []) {
			assert.ok((universe as readonly string[]).includes(ruleId), `${scenario.id} selected ${ruleId} must exist in the index`);
			covered.add(ruleId);
		}
		for (const ruleId of scenario.scopeDrift?.expectedSelected.typescript ?? []) {
			covered.add(ruleId);
		}
		if (scenario.scopeDrift) {
			assert.deepEqual(scenario.scopeDrift.expectedSkills, ["typescript"], `${scenario.id} drift expectedSkills must be exact`);
		}
	}
	assert.equal(covered.size, universe.length);
	assert.equal(
		universe.every((ruleId) => covered.has(ruleId)),
		true,
	);

	const driftScenario = manifest.scenarios.find((scenario) => scenario.id === "helper-boundary-scope-drift");
	assert.ok(driftScenario?.scopeDrift);
	assert.equal(
		driftScenario.scopeDrift.evidence,
		"the same normalization becomes necessary for a second owner, so move the existing named function to `profile-support.ts`, export it, directly import it from `bulk-profile.ts`, and add concise Korean header doc comments.",
	);
	assert.deepEqual(driftScenario.scopeDrift.files, [
		"src/profile/profile-api.ts",
		"src/profile/profile-support.ts",
		"src/bulk/bulk-profile.ts",
	]);
	assert.deepEqual(driftScenario.scopeDrift.expectedSelected.typescript, [
		"naming-use-consistent-file-and-symbol-naming",
		"naming-use-direct-imports-and-public-entry-points",
		"functions-extract-helpers-only-when-the-boundary-is-real",
		"functions-place-and-promote-support-functions",
		"functions-name-functions-by-what-comes-out",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	]);
});

test("TypeScript generated index is complete and within the deterministic byte budget", async () => {
	const skillPaths = getSkillPaths("typescript", realSkillRootDir);
	const source = await readFile(skillPaths.rulesIndexPath, "utf8");
	const entries = Array.from(source.matchAll(/^- T\d+ \| ([^ |]+) \|/gm), (match) => ({id: match[1], fileName: `${match[1]}.md`}));
	const ids = entries.map((entry) => entry.id).sort();
	const document = await readSkillDocument(skillPaths);
	const expectedIds = document.rules.map((rule) => getRuleId(rule)).sort();

	assert.deepEqual(ids, expectedIds);
	assert.equal(ids.length, 29);

	for (const entry of entries) {
		assert.equal(entry.fileName, `${entry.id}.md`);
		await access(path.join(skillPaths.ruleContractsDir, entry.fileName));
	}

	const handbook = await readFile(skillPaths.outputPath, "utf8");
	assert.match(handbook, /> 현재 skill의 `rules\/\*\.md`, `metadata\.json`를 수정한 뒤/);
	assert.doesNotMatch(handbook, /metadata\.json\.companions/);
	assert.doesNotMatch(handbook, /metadata\.json\.extends/);
	for (const rule of document.rules) {
		const bodyWithoutHeading = rule.body.replace(/^## .+\n+/, "");
		assert.equal(handbook.includes(bodyWithoutHeading), true, `${rule.fileName} body must remain verbatim in AGENTS.md`);
	}
});

test("JSDoc routing closure and query-select ownership stay exact across every manifest stage", async () => {
	for (const skillName of ["react", "typescript", "css"] as const) {
		const manifest = await readRoutingEvalManifest(getSkillPaths(skillName, realSkillRootDir));

		for (const scenario of manifest.scenarios) {
			for (const stage of [scenario, scenario.scopeDrift].filter((candidate) => candidate !== undefined)) {
				const selected = stage.expectedSelected.typescript ?? [];

				if (selected.includes("docs-require-header-jsdoc-on-key-declarations")) {
					assert.ok(
						selected.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"),
						`${skillName}/${scenario.id} must close T18 to T21`,
					);
				}
			}
		}
	}

	const reactManifest = await readRoutingEvalManifest(getSkillPaths("react", realSkillRootDir));
	const queryShaping = reactManifest.scenarios.find(({id}) => id === "RTE12-query-shaping");
	assert.ok(queryShaping);
	assert.ok(queryShaping.expectedSelected.react?.includes("data-shape-query-data-with-select"));
	// `select` 안 변환은 7.4 몫이다. 추출 경계 규칙이 같이 걸리면 두 규칙이 같은 코드를 두 번 판정한다.
	assert.equal(queryShaping.expectedSelected.typescript?.includes("functions-extract-helpers-only-when-the-boundary-is-real"), false);
});

test("induced naming closure and activated finish gates stay mandatory across every manifest stage", async () => {
	for (const skillName of ["react", "typescript", "css"] as const) {
		const manifest = await readRoutingEvalManifest(getSkillPaths(skillName, realSkillRootDir));
		const document = await readSkillDocument(getSkillPaths(skillName, realSkillRootDir));

		assert.deepEqual(
			Object.fromEntries(
				document.rules.filter((rule) => rule.requiresSelected.length > 0).map((rule) => [getRuleId(rule), rule.requiresSelected]),
			),
			mandatoryRuleRouting[skillName],
			`${skillName} requiresSelected metadata must match the exact mandatory-routing oracle`,
		);
		assert.deepEqual(
			document.rules.filter((rule) => rule.requiredOnCompletion).map((rule) => getRuleId(rule)),
			completionGateRouting[skillName],
			`${skillName} completion gates must match the exact oracle`,
		);

		for (const scenario of manifest.scenarios) {
			for (const stage of [scenario, scenario.scopeDrift].filter((candidate) => candidate !== undefined)) {
				if (stage.expectedSelected.react?.includes("data-name-query-and-mutation-bindings-consistently")) {
					assert.ok(
						stage.expectedSelected.typescript?.includes("naming-use-consistent-file-and-symbol-naming"),
						`${skillName}/${scenario.id} must close React binding naming to TypeScript symbol naming`,
					);
				}
			}
		}
	}

	const derivedRule = await readRuleSource("react", "screen-keep-derived-values-close");
	const bindingRule = await readRuleSource("react", "data-name-query-and-mutation-bindings-consistently");
	const originRule = await readRuleSource("react", "data-preserve-origin-chaining");

	assertMentions(readAppliesWhen(derivedRule), ["별칭", "추가·이동·제거"], "derivedRule");
	assert.match(originRule, /^reviewWith:[^\n]+screen-keep-derived-values-close/m);
	assert.match(bindingRule, /^requiresSelected:[^\n]+typescript\/naming-use-consistent-file-and-symbol-naming/m);

	// companion router 도 두 gate 를 가르쳐야 한다. 문구가 아니라 언급과 극성으로 본다
	for (const skillName of ["typescript", "css"] as const) {
		const {body} = splitFrontmatter(await readFile(path.join(realSkillRootDir, skillName, "SKILL.md"), "utf8"));
		const apply = extractSection(body, 3);

		assertMentions(apply, ["requiresSelected", "completionGate", "companion"], `${skillName} 3절`);
		assert.equal(isNegated(blockContaining(apply, "requiresSelected")), false, `${skillName}: requiresSelected 가 부정문이다`);
		assert.equal(isNegated(blockContaining(apply, "completionGate")), false, `${skillName}: completionGate 가 부정문이다`);
	}

	const reactManifest = await readRoutingEvalManifest(getSkillPaths("react", realSkillRootDir));
	const sharedAuthority = reactManifest.scenarios.find(({id}) => id === "RTE11-shared-authority");
	assert.ok(sharedAuthority);
	assert.ok(sharedAuthority.expectedSelected.react?.includes("data-preserve-origin-chaining"));
	assert.ok(!(sharedAuthority.expectedSelected.react?.includes("screen-keep-derived-values-close") ?? false));
});

test("TypeScript SKILL.md is a compact router without receipt or audit machinery", async () => {
	const source = await readFile(path.join(realSkillRootDir, "typescript", "SKILL.md"), "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-typescript");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);

	// companion 경계. typescript 는 companion 으로 들어오므로 React/CSS 경계만 되짚는다
	assertMentions(extractSection(body, 1), ["React", "CSS", "companion"], "typescript 1절");
});

test("React progressive metadata and all 47 rule routes match Appendix B exactly", async () => {
	const skillPaths = getSkillPaths("react", realSkillRootDir);
	const document = await readSkillDocument(skillPaths);

	assert.equal(document.metadata.progressiveDisclosure, true);
	// abstract 는 사람이 읽는 개요다. 로딩 경로 설명을 넣지 않는다.
	assert.doesNotMatch(document.metadata.abstract, /SKILL\.md|RULES_INDEX\.md|contracts\/|opt-in/);
	assert.deepEqual(document.metadata.companions, [
		{skill: "typescript", mode: "required"},
		{skill: "css", mode: "conditional", appliesWhen: "class contract, stylesheet 또는 styling surface를 변경한다."},
	]);
	assert.equal(document.rules.length, 47);
	assert.deepEqual(
		Object.fromEntries(document.rules.map((rule) => [getRuleId(rule), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}])),
		reactRuleRouting,
	);
	assert.equal(
		document.rules.every((rule) => Boolean(rule.appliesWhen) && Buffer.byteLength(rule.appliesWhen ?? "", "utf8") > 0),
		true,
	);
	assert.equal(
		document.rules.every((rule) => (rule.appliesWhen?.length ?? 0) <= 160),
		true,
	);
	for (const [ruleId, routing] of Object.entries(reactRuleRouting)) {
		const ruleSource = await readRuleSource("react", ruleId);

		if (routing.reviewWith.length === 0) {
			assert.doesNotMatch(ruleSource, /^reviewWith:/m, `${ruleId} must omit an empty reviewWith key`);
		}
	}
	const template = await readFile(path.join(skillPaths.rulesDir, "_template.md"), "utf8");
	assert.match(readAppliesWhen(template), / /);
	assert.doesNotMatch(template, /^reviewWith:/m);

	// frontmatter 작성 규칙은 스킬마다 복제하지 않고 공통 기여 문서 한 곳에 둔다.
	const contributing = await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8");
	assert.match(contributing, /appliesWhen.*한 줄.*160/);
	assert.match(contributing, /reviewWith.*자동 선택이 아니라.*재평가/i);
	assert.match(contributing, /대상이 없으면.*key\s*를 생략/i);
});

test("React routing manifest is the exact sixteen-scenario Appendix B/D oracle with full positive coverage", async () => {
	const skillPaths = getSkillPaths("react", realSkillRootDir);
	await validateRoutingEvalManifest(skillPaths);
	await validateRoutingEvalManifests(realSkillRootDir);
	const manifest = await readRoutingEvalManifest(skillPaths);
	const expectedScenarioIds = Object.keys(reactScenarioStages);
	const scenarioById = new Map(manifest.scenarios.map((scenario) => [scenario.id, scenario]));

	assert.equal(manifest.version, 1);
	assert.equal(manifest.skill, "react");
	assert.deepEqual(
		manifest.scenarios.map((scenario) => scenario.id),
		expectedScenarioIds,
	);
	assert.equal(manifest.scenarios.length, 16);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		17,
	);

	const universeBySkillName: Record<string, readonly string[]> = {
		css: cssRuleUniverse,
		react: reactRuleUniverse,
		typescript: typescriptRuleUniverse,
	};
	const coveredReactRules = new Set<string>();

	for (const [scenarioId, expectedScenario] of Object.entries(reactScenarioStages)) {
		const scenario = scenarioById.get(scenarioId);
		assert.ok(scenario, `${scenarioId} should exist`);
		const stagePairs: Array<{
			label: string;
			expectedText: string;
			expectedFiles: readonly string[];
			expectedSkills: readonly string[];
			expectedSelected: Readonly<Record<string, readonly string[]>>;
			actualText: string;
			actual: RoutingExpectedPartition & {files: string[]};
		}> = [
			{
				label: "initial",
				expectedText: expectedScenario.initial.prompt,
				expectedFiles: expectedScenario.initial.files,
				expectedSkills: expectedScenario.initial.expectedSkills,
				expectedSelected: expectedScenario.initial.expectedSelected,
				actualText: scenario.prompt,
				actual: scenario,
			},
		];

		if ("scopeDrift" in expectedScenario) {
			assert.ok(scenario.scopeDrift, `${scenarioId} should include scopeDrift`);
			stagePairs.push({
				label: "scopeDrift",
				expectedText: expectedScenario.scopeDrift.evidence,
				expectedFiles: expectedScenario.scopeDrift.files,
				expectedSkills: expectedScenario.scopeDrift.expectedSkills,
				expectedSelected: expectedScenario.scopeDrift.expectedSelected,
				actualText: scenario.scopeDrift.evidence,
				actual: scenario.scopeDrift,
			});
		} else {
			assert.equal(scenario.scopeDrift, undefined, `${scenarioId} should not include scopeDrift`);
		}

		for (const {label, expectedText, expectedFiles, expectedSkills, expectedSelected, actualText, actual} of stagePairs) {
			assert.equal(actualText, expectedText, `${scenarioId} ${label} evidence must be exact`);
			assert.deepEqual(actual.files, expectedFiles, `${scenarioId} ${label} files must be exact`);
			assert.deepEqual(actual.expectedSkills, expectedSkills, `${scenarioId} ${label} expectedSkills must be exact`);
			assert.deepEqual(actual.expectedSelected, expectedSelected, `${scenarioId} ${label} selected maps must be exact`);
			for (const [skillName, selectedRuleIds] of Object.entries(expectedSelected)) {
				const universe = universeBySkillName[skillName];
				assert.ok(universe, `${scenarioId} ${label} ${skillName} must have a known progressive universe`);
				for (const ruleId of selectedRuleIds) {
					assert.ok(universe.includes(ruleId), `${scenarioId} ${label} ${skillName} selected ${ruleId} must exist`);
				}
			}

			for (const ruleId of actual.expectedSelected.react ?? []) {
				coveredReactRules.add(ruleId);
			}
		}
	}

	assert.deepEqual([...coveredReactRules].sort(), [...reactRuleUniverse].sort());
	const ownerMove = scenarioById.get("RTE02-owner-placement-css-drift");
	assert.ok(ownerMove);
	assert.equal(ownerMove.expectedSkills.includes("css"), false);
	assert.match(ownerMove.prompt, /className and style import through unchanged.*no styling change/i);
	assert.equal(ownerMove.expectedSelected.react?.includes("composition-read-props-without-destructuring"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"), true);
	const cssDrift = ownerMove.scopeDrift;
	assert.ok(cssDrift);
	assert.equal(cssDrift.expectedSelected.react?.includes("composition-read-props-without-destructuring"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("composition-do-not-build-structural-variants-with-modifiers"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("selector-separate-domain-state-modifiers-from-dom-interaction-states"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("ownership-choose-scope-prefix-by-reuse-range"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("naming-keep-page-slug-traceable") ?? false, true);

	const routeSupport = scenarioById.get("RTE03-route-support-extraction");
	assert.equal(routeSupport?.expectedSelected.typescript?.includes("types-reuse-existing-contracts-before-new-types"), false);
	assert.equal(routeSupport?.expectedSelected.typescript?.includes("types-reuse-existing-contracts-before-new-types") ?? false, false);
	const derivedSelection = scenarioById.get("RTE10-derived-selection-state");
	assert.equal(derivedSelection?.expectedSelected.react?.includes("events-keep-handler-flow-inline"), false);
	assert.equal(derivedSelection?.expectedSelected.react?.includes("events-keep-handler-flow-inline") ?? false, false);
});

test("React generated index and handbook preserve canonical local rules and compact companion links", async () => {
	const skillPaths = getSkillPaths("react", realSkillRootDir);
	const source = await readFile(skillPaths.rulesIndexPath, "utf8");
	const entries = Array.from(source.matchAll(/^- R\d+ \| ([^ |]+) \|/gm), (match) => ({id: match[1], fileName: `${match[1]}.md`}));
	const document = await readSkillDocument(skillPaths);

	assert.deepEqual(
		entries.map((entry) => entry.id),
		reactRuleUniverse,
	);
	assert.equal(entries.length, 47);

	for (const entry of entries) {
		assert.equal(entry.fileName, `${entry.id}.md`);
		await access(path.join(skillPaths.ruleContractsDir, entry.fileName));
	}

	const handbook = await readFile(skillPaths.outputPath, "utf8");
	assert.match(handbook, /metadata\.json\.companions/);
	assert.doesNotMatch(handbook, /metadata\.json\.extends/);
	assert.match(handbook, /^## 함께 따르는 규칙$/m);
	assert.match(handbook, /^- \[TypeScript Convention\]\(\.\.\/typescript\/HANDBOOK\.md\) — 항상 함께 적용합니다\.$/m);
	assert.match(
		handbook,
		/^- \[CSS Convention\]\(\.\.\/css\/HANDBOOK\.md\) — 다음 조건에서 함께 적용합니다\. class contract, stylesheet 또는 styling surface를 변경한다\.$/m,
	);
	assert.match(handbook, /\.\.\/typescript\/HANDBOOK\.md/);

	for (const rule of document.rules) {
		const bodyWithoutHeading = rule.body.replace(/^## .+\n+/, "");
		assert.equal(handbook.includes(bodyWithoutHeading), true, `${rule.fileName} body must remain verbatim in React AGENTS.md`);
	}

	for (const companionName of ["typescript", "css"] as const) {
		const companionDocument = await readSkillDocument(getSkillPaths(companionName, realSkillRootDir));

		for (const rule of companionDocument.rules) {
			const bodyWithoutHeading = rule.body.replace(/^## .+\n+/, "");
			assert.equal(handbook.includes(bodyWithoutHeading), false, `${companionName}/${rule.fileName} body must not be embedded`);
		}
	}

	const companionSection = handbook.match(/^## 함께 따르는 규칙$[\s\S]*?(?=\n---\n)/m)?.[0] ?? "";
	assert.equal((companionSection.match(/TypeScript Convention/g) ?? []).length, 1);
	assert.equal((companionSection.match(/CSS Convention/g) ?? []).length, 1);
});

test("React SKILL.md is a compact router with required TypeScript and conditional CSS", async () => {
	const source = await readFile(path.join(realSkillRootDir, "react", "SKILL.md"), "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-react");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);

	// companion 경계. typescript 는 무조건, css 는 styling surface 가 바뀔 때만 켠다
	const reactScope = extractSection(body, 1);

	assertMentions(reactScope, ["`convention-typescript`", "`convention-css`", "class contract"], "react 1절");
	assert.match(reactScope, /(때|경우)만/, "react 1절: `convention-css` 조건부 경계가 없다");
	assert.equal(isNegated(blockContaining(reactScope, "`convention-css`")), true, "react 1절: css 미적용 조건이 없다");

	// 진입 skill 이므로 non-progressive companion 의 로딩 경로도 안내한다
	assertMentions(extractSection(body, 2), ["non-progressive", "HANDBOOK.md"], "react 2절");
});

test("CSS progressive metadata and rule routing match Appendix C exactly", async () => {
	const skillPaths = getSkillPaths("css", realSkillRootDir);
	const document = await readSkillDocument(skillPaths);

	assert.equal(document.metadata.progressiveDisclosure, true);
	// abstract 는 사람이 읽는 개요다. 로딩 경로 설명을 넣지 않는다.
	assert.doesNotMatch(document.metadata.abstract, /SKILL\.md|RULES_INDEX\.md|contracts\/|opt-in/);
	assert.deepEqual(document.metadata.companions, [
		{skill: "typescript", mode: "conditional", appliesWhen: "TS/TSX 클래스 계약, 래퍼 Props 또는 style import를 함께 변경한다."},
	]);
	assert.equal(document.rules.length, 32);
	assert.deepEqual(
		Object.fromEntries(document.rules.map((rule) => [getRuleId(rule), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}])),
		cssRuleRouting,
	);
	assert.equal(
		document.rules.every((rule) => Boolean(rule.appliesWhen) && Buffer.byteLength(rule.appliesWhen ?? "", "utf8") > 0),
		true,
	);
	assert.equal(
		document.rules.every((rule) => (rule.appliesWhen?.length ?? 0) <= 160),
		true,
	);
	const wrapperStylingRule = await readRuleSource("css", "composition-inject-classes-only-at-the-entry-point");
	assertMentions(
		wrapperStylingRule,
		[/스타일 창구는 \*\*진입점 하나\*\*/i, /내부 노드로 가는 클래스 프롭을 늘리지 않습니다/i, /변형은.*수정자로 붙입니다/i],
		"wrapperStylingRule",
	);
	const singlePurposeRule = await readRuleSource("css", "composition-keep-classes-single-purpose");
	assertMentions(readAppliesWhen(singlePurposeRule), ["기본 스타일과 상태를 함께", "기본 클래스와 수정자를 나눠"], "singlePurposeRule");
	const layoutIntentRule = await readRuleSource("css", "layout-keep-layout-intent-explicit");
	assertMentions(readAppliesWhen(layoutIntentRule), ["기본과 수정자로 나누면서", "`display`·여백", "값 그대로"], "layoutIntentRule");
	const fallbackRule = await readRuleSource("css", "values-always-provide-css-variable-fallbacks");
	assertMentions(readAppliesWhen(fallbackRule), ["`var(--*)`", "공통 토큰"], "fallbackRule");
	assertMentions(
		flattenWhitespace(fallbackRule),
		[/공통 토큰 목록/i, /상속 속성이면 상속값, 아니면 초기값/, /values-tokenize-repeated-visual-values/i],
		"fallbackRule",
	);

	const template = await readFile(path.join(skillPaths.rulesDir, "_template.md"), "utf8");
	assert.match(readAppliesWhen(template), / /);
	assert.doesNotMatch(template, /^reviewWith:/m);

	// frontmatter 작성 규칙은 스킬마다 복제하지 않고 공통 기여 문서 한 곳에 둔다.
	const contributing = await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8");
	assert.match(contributing, /appliesWhen.*한 줄.*160/);
	assert.match(contributing, /reviewWith.*자동 선택이 아니라.*재평가/i);
	assert.match(contributing, /대상이 없으면.*key\s*를 생략/i);
});

test("CSS routing manifest is the exact eleven-scenario and thirteen-stage Appendix C/D oracle", async () => {
	const skillPaths = getSkillPaths("css", realSkillRootDir);
	await validateRoutingEvalManifest(skillPaths);
	await validateRoutingEvalManifests(realSkillRootDir);
	const manifest = await readRoutingEvalManifest(skillPaths);
	const expectedScenarioIds = Object.keys(cssScenarioStages);
	const scenarioById = new Map(manifest.scenarios.map((scenario) => [scenario.id, scenario]));

	assert.equal(manifest.version, 1);
	assert.equal(manifest.skill, "css");
	assert.deepEqual(
		manifest.scenarios.map((scenario) => scenario.id),
		expectedScenarioIds,
	);
	assert.equal(manifest.scenarios.length, 18);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		20,
	);

	const coveredCssRules = new Set<string>();
	for (const [scenarioId, expectedScenario] of Object.entries(cssScenarioStages)) {
		const scenario = scenarioById.get(scenarioId);
		assert.ok(scenario, `${scenarioId} should exist`);
		const stagePairs: Array<{
			label: string;
			expectedText: string;
			expectedFiles: readonly string[];
			expectedSkills: readonly string[];
			expectedSelected: Readonly<Record<string, readonly string[]>>;
			actualText: string;
			actual: RoutingExpectedPartition & {files: string[]};
		}> = [
			{
				label: "initial",
				expectedText: expectedScenario.initial.prompt,
				expectedFiles: expectedScenario.initial.files,
				expectedSkills: expectedScenario.initial.expectedSkills,
				expectedSelected: expectedScenario.initial.expectedSelected,
				actualText: scenario.prompt,
				actual: scenario,
			},
		];

		if ("scopeDrift" in expectedScenario) {
			assert.ok(scenario.scopeDrift, `${scenarioId} should include scopeDrift`);
			stagePairs.push({
				label: "scopeDrift",
				expectedText: expectedScenario.scopeDrift.evidence,
				expectedFiles: expectedScenario.scopeDrift.files,
				expectedSkills: expectedScenario.scopeDrift.expectedSkills,
				expectedSelected: expectedScenario.scopeDrift.expectedSelected,
				actualText: scenario.scopeDrift.evidence,
				actual: scenario.scopeDrift,
			});
		} else {
			assert.equal(scenario.scopeDrift, undefined, `${scenarioId} should not include scopeDrift`);
		}

		for (const {label, expectedText, expectedFiles, expectedSkills, expectedSelected, actualText, actual} of stagePairs) {
			assert.equal(actualText, expectedText, `${scenarioId} ${label} evidence must be exact`);
			assert.deepEqual(actual.files, expectedFiles, `${scenarioId} ${label} files must be exact`);
			assert.deepEqual(actual.expectedSkills, expectedSkills, `${scenarioId} ${label} expectedSkills must be exact`);
			assert.deepEqual(actual.expectedSelected, expectedSelected, `${scenarioId} ${label} selected maps must be exact`);
			for (const [skillName, selectedRuleIds] of Object.entries(expectedSelected)) {
				const universeBySkillName: Record<string, readonly string[]> = {
					css: cssRuleUniverse,
					react: reactRuleUniverse,
					typescript: typescriptRuleUniverse,
				};
				const universe = universeBySkillName[skillName];
				assert.ok(universe, `${scenarioId} ${label} ${skillName} must have a known progressive universe`);
				for (const ruleId of selectedRuleIds) {
					assert.ok(universe.includes(ruleId), `${scenarioId} ${label} ${skillName} selected ${ruleId} must exist`);
				}
			}

			for (const ruleId of actual.expectedSelected.css ?? []) {
				coveredCssRules.add(ruleId);
			}
		}
	}

	assert.deepEqual([...coveredCssRules].sort(), [...cssRuleUniverse].sort());
	const routeDrift = scenarioById.get("css-route-style-scope-drift");
	assert.deepEqual(routeDrift?.expectedSelected, {react: [], typescript: []});
	assert.deepEqual(routeDrift?.scopeDrift?.expectedSelected.react, ["ownership-place-owner-files-in-role-folders"]);
	assert.deepEqual(routeDrift?.scopeDrift?.expectedSelected.typescript, ["naming-use-direct-imports-and-public-entry-points"]);
	const domainState = scenarioById.get("css-domain-state-class-contract");
	assert.equal(domainState?.expectedSelected.css?.includes("selector-use-pseudo-classes-for-dom-owned-states"), true);

	const oneOffStructuralModifier = scenarioById.get("css-one-off-structural-modifier");
	assert.equal(oneOffStructuralModifier?.expectedSelected.css?.includes("composition-keep-classes-single-purpose"), false);
	assert.equal(oneOffStructuralModifier?.expectedSelected.css?.includes("composition-keep-classes-single-purpose") ?? false, false);

	const repeatedValues = scenarioById.get("css-repeated-values-and-optional-token");
	assert.equal(repeatedValues?.expectedSelected.css?.includes("selector-use-pseudo-classes-for-dom-owned-states"), true);
	assert.equal(
		repeatedValues?.expectedSelected.css?.includes("selector-separate-domain-state-modifiers-from-dom-interaction-states"),
		true,
	);

	const wrapperDrift = scenarioById.get("css-ui-wrapper-third-party-dom");
	assert.equal(wrapperDrift?.expectedSelected.css?.includes("values-always-provide-css-variable-fallbacks"), false);
	assert.equal(wrapperDrift?.expectedSelected.css?.includes("values-always-provide-css-variable-fallbacks") ?? false, false);
	assert.equal(wrapperDrift?.scopeDrift?.expectedSelected.css?.includes("values-always-provide-css-variable-fallbacks"), true);
});

test("routing activation and generated indexes use only the changed semantic delta", async () => {
	const routerPaths = [
		path.join(realSkillRootDir, "react", "SKILL.md"),
		path.join(realSkillRootDir, "typescript", "SKILL.md"),
		path.join(realSkillRootDir, "css", "SKILL.md"),
	];
	// 변경 범위 계약은 라우터가 진다. rules/_template.md 는 규칙 작성 스캐폴드라
	// 같은 문장을 복제하지 않고 CONTRIBUTING.md 를 가리킨다.
	for (const source of await Promise.all(routerPaths.map((filePath) => readFile(filePath, "utf8")))) {
		assert.match(source, /변경 (?:semantic )?delta|실제 변경|실제로 바꾼 것|변경 범위/i);
		assert.match(source, /추가·삭제·이동|추가·삭제·이동·이름 변경/);
		assert.match(source, /read-only|byte-equivalent/);
		assert.match(source, /삭제\+추가|삭제·추가/);
		assert.match(source, /다시 세지|별도.*(?:추가|변경|재선언)/);
		assert.match(source, /N\/A rule|N\/A 규칙|적용되지 않는 규칙/);
		assert.match(source, /최소 semantic patch|최소 변경|범위를 넓히지 않/i);
	}

	for (const skillName of ["react", "typescript", "css"] as const) {
		const template = await readFile(path.join(realSkillRootDir, skillName, "rules", "_template.md"), "utf8");
		assert.match(readAppliesWhen(template), / /, `${skillName} template needs an appliesWhen slot`);
		assert.match(template, /관찰 가능한 (?:것|조건)/, `${skillName} template must ask for observable conditions`);
		assert.match(template, /CONTRIBUTING\.md/, `${skillName} template must point at the authoring guide`);
		assert.doesNotMatch(
			template,
			/(?<![A-Za-z])(?:Selected|N\/A)(?![A-Za-z])/,
			`${skillName} template must not teach the removed protocol`,
		);
	}

	const typescriptDocument = await readSkillDocument(getSkillPaths("typescript", realSkillRootDir));
	const generatedIndex = generateRulesIndexMarkdown(typescriptDocument, []);
	assert.doesNotMatch(generatedIndex, /변경 (?:semantic )?delta/i);
	assert.match(generatedIndex, /Routing digest: `sha256:[a-f0-9]{64}`/);
	assert.match(generatedIndex, /^- T\d+ \| [^ |]+ \|/m);

	const routeOwnerRule = await readRuleSource("css", "naming-keep-page-slug-traceable");
	assert.match(routeOwnerRule, /`pg_\*` 소유자의 클래스 식별자를 새로 만들거나 이름을 바꿀 때/);
});

test("v16 boundary contracts distinguish semantic role changes from contextual and byte-equivalent noise", async () => {
	const readRule = async (skillName: "react" | "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const routeFlow = await readRule("react", "screen-keep-route-flow-visible");
	assertMentions(
		routeFlow,
		["소유자가 그대로인 변경은 대상이 아", "바인딩·별칭", "functions-extract-helpers-only-when-the-boundary-is-real"],
		"routeFlow",
	);
	assert.match(
		routeFlow,
		/소유자가 그대로인 변경은 대상이 아[\s\S]*`query\.select`[\s\S]*바인딩·별칭[\s\S]*파생 상태 이펙트[\s\S]*렌더 계산/i,
	);

	const curriedHandler = await readRule("react", "events-curry-extra-handler-arguments");
	assertMentions(curriedHandler, [/이벤트 객체를 받는 자리/i, /추가 인자/i, /팩토리/i, /감싸는 화살표/i], "curriedHandler");
	assertMentions(
		curriedHandler,
		[/팩토리 반환 타입/i, /typing-take-handler-types-from-existing-contracts/i, /리액트 별칭/i],
		"curriedHandler",
	);
	assert.match(curriedHandler, /이벤트 객체를 받지 않는 프롭 콜백[\s\S]*그대로 넘깁니다[\s\S]*`useEffectEvent`[\s\S]*덧붙이지 않/i);

	const reactHandlerType = await readRule("react", "typing-take-handler-types-from-existing-contracts");
	assert.match(reactHandlerType, /커링한|커링|고차 함수/i);
	assertMentions(reactHandlerType, [/JSX에 바로 쓴 화살표/i, /암묵적 `any`/i, /리액트 별칭/i], "reactHandlerType");
	assertMentions(reactHandlerType, [/`query\.select`/i, /일회성 문맥 콜백/i, /`Ui\*Props`/i, /대상이 아닙니다/i], "reactHandlerType");

	const reactContracts = await Promise.all(
		["screen-keep-route-flow-visible", "events-curry-extra-handler-arguments", "typing-take-handler-types-from-existing-contracts"].map(
			(ruleId) => readFile(path.join(realSkillRootDir, "react", "contracts", `${ruleId}.md`), "utf8"),
		),
	);
	assertMentions(reactContracts[0]!, [/(?:`query\.select`|query `select`)/i, /파생 상태 이펙트/i, /렌더 계산/i], "reactContracts");
	assertMentions(reactContracts[1]!, [/이벤트 객체를 받는 자리/i, /이벤트 객체를 받지 않는 프롭 콜백/i], "reactContracts");
	assert.match(reactContracts[2]!, /커링 팩토리가 돌려주는 함수에도 타입을 적습니다[\s\S]*일회성 문맥 콜백/i);

	const typescriptRouter = await readFile(path.join(realSkillRootDir, "typescript", "SKILL.md"), "utf8");
	assertMentions(
		typescriptRouter,
		[/byte-equivalent/i, /named shape/i, /callable/i, /input\/output/i, /변경으로 본다/i],
		"typescriptRouter",
	);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assertMentions(
		documentedShape,
		[
			/이름 붙인 형태의 필드가 한 글자도 안 바뀌었더라도/i,
			/입력 계약이나 함수 결과를 고정하는 출력 계약/i,
			/(?:output|출력)/i,
			/이 규칙을 적용합니다/i,
		],
		"documentedShape",
	);
	assertMentions(documentedShape, [/익명/i, /(?:inferred|추론)/i, /(?:query )?`select`/i, /해당하지 않습니다/i], "documentedShape");
	assertMentions(documentedShape, [/JSDoc/i, /억지로/i, /(?:억지로 켜려고|켜지 않습니다)/i, /(?:하지 않|금지)/i], "documentedShape");

	const directImports = await readRule("typescript", "naming-use-direct-imports-and-public-entry-points");
	assertMentions(readAppliesWhen(directImports), ["같은 경로에서", /값과 타입 중 무엇을 가져올지/, "추가·삭제·전환"], "directImports");

	const unusedParameters = await readRule("typescript", "types-mark-unused-parameters-with-underscore");
	assertMentions(readAppliesWhen(unusedParameters), ["커링한 핸들러", "마지막에 돌려주는 콜백", /(?:빼거나|쓰지 않)/], "unusedParameters");
	assertMentions(
		unusedParameters,
		[/프레임워크 별칭/i, /매개변수를 쓰지 않는 경우도 예외가 아닙니다/i, /예외가 아닙니다/i, /`\(_event\) =>`/i],
		"unusedParameters",
	);

	for (const ruleId of [
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-prefer-function-variable-types-over-parameter-annotations",
	]) {
		const contextualCallback = await readRule("typescript", ruleId);

		// 제외 표지는 불렛 앞(`제외:`)에도 문장 끝(`… 제외한다`)에도 올 수 있다. 순서가 아니라 개념 존재만 본다.
		assertMentions(
			readAppliesWhen(contextualCallback),
			[/타입 표기/i, "없이", /일회성/i, /문맥으로 추론/i, /제외/],
			`${ruleId} appliesWhen`,
		);
	}

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assertMentions(existingContract, [/그대로인 계약/i, /새 자리에서 쓰는 경우/i, /(?:N\/A|제외)/i], "existingContract");

	const typescriptContracts = await Promise.all(
		[
			"naming-use-direct-imports-and-public-entry-points",
			"types-document-custom-types-and-shapes",
			"types-mark-unused-parameters-with-underscore",
			"types-prefer-function-variable-types-over-parameter-annotations",
			"types-reuse-existing-contracts-before-new-types",
		].map((ruleId) => readFile(path.join(realSkillRootDir, "typescript", "contracts", `${ruleId}.md`), "utf8")),
	);
	assert.match(typescriptContracts[0]!, /경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면/i);
	assert.match(typescriptContracts[1]!, /CRITICAL rule[\s\S]*full rule/i);
	assertMentions(typescriptContracts[2]!, [/커링한 핸들러/i, /마지막 콜백/i], "typescriptContracts");
	assert.match(typescriptContracts[3]!, /CRITICAL rule[\s\S]*full rule/i);
	assertMentions(typescriptContracts[4]!, [/그대로인 계약/i, /새 자리에서 쓰는 것만으로는/i], "typescriptContracts");

	const stylesheetFormat = await readRule("css", "naming-default-to-plain-css-when-no-module-convention");
	assertMentions(stylesheetFormat, [/스타일시트 방식/i, /plain CSS/i, /CSS Modules/i], "stylesheetFormat");
	assertMentions(
		stylesheetFormat,
		[/기존 일반 CSS/i, /(?:class|selector)/i, /(?:rename|이름만 바꾸는)/i, /(?:N\/A|제외)/i],
		"stylesheetFormat",
	);

	const modifierClassification = await readRule("css", "composition-do-not-build-structural-variants-with-modifiers");
	assertMentions(
		modifierClassification,
		[/앱이 켜고 끄는 상태/, /여러 곳에서 반복되는 모양/, /두 개 이상의 `scope_slug`에 이미 있는가/],
		"modifierClassification",
	);

	const layoutIntent = await readRule("css", "layout-keep-layout-intent-explicit");
	assert.match(layoutIntent, /`z-index`[\s\S]*층 토큰[\s\S]*쌓임 순서/i);
	assert.match(layoutIntent, /기준 컨테이너를 주석/i);
	assert.doesNotMatch(layoutIntent, /동작 변화 없이/);

	const variableFallback = await readRule("css", "values-always-provide-css-variable-fallbacks");
	assert.match(variableFallback, /공통 토큰 목록에 있는 변수[\s\S]*쓰지 않습니다/i);
	assert.match(variableFallback, /그 밖의 모든 `var\(\)`[\s\S]*씁니다/i);

	for (const ruleId of ["selector-separate-domain-state-modifiers-from-dom-interaction-states"]) {
		const interactionState = await readRule("css", ruleId);
		assert.match(interactionState, /(?:hover|focus|disabled)[\s\S]*조건 없는 기본 블록[\s\S]*수정자 아래[\s\S]*(?:좁히지 않|두지 않)/i);
	}
	const cssInteractionContracts = await Promise.all(
		["selector-separate-domain-state-modifiers-from-dom-interaction-states"].map((ruleId) =>
			readFile(path.join(realSkillRootDir, "css", "contracts", `${ruleId}.md`), "utf8"),
		),
	);
	for (const contract of cssInteractionContracts) {
		assertMentions(contract, [/기본 블록/i, /수정자 아래/i], "contract");
	}

	const mixedManifest = await readRoutingEvalManifest(getSkillPaths("react", realSkillRootDir));
	const mixedScenarioById = new Map(mixedManifest.scenarios.map((scenario) => [scenario.id, scenario]));
	const tsSelected = (scenarioId: string, ruleId: string): boolean =>
		mixedScenarioById.get(scenarioId)?.expectedSelected.typescript?.includes(ruleId) ?? false;
	const tsNotApplicable = (scenarioId: string, ruleId: string): boolean =>
		!(mixedScenarioById.get(scenarioId)?.expectedSelected.typescript?.includes(ruleId) ?? false);
	assert.equal(tsSelected("RTE03-route-support-extraction", "types-document-custom-types-and-shapes"), true);
	assert.equal(tsNotApplicable("RTE03-route-support-extraction", "types-reuse-existing-contracts-before-new-types"), true);
	for (const ruleId of [
		"naming-use-direct-imports-and-public-entry-points",
		"types-mark-unused-parameters-with-underscore",
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-prefer-function-variable-types-over-parameter-annotations",
	]) {
		assert.equal(tsSelected("RTE10-derived-selection-state", ruleId), true);
	}
	for (const ruleId of [
		"types-document-custom-types-and-shapes",
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-reuse-existing-contracts-before-new-types",
	]) {
		assert.equal(tsNotApplicable("RTE12-query-shaping", ruleId), true);
	}

	const cssManifest = await readRoutingEvalManifest(getSkillPaths("css", realSkillRootDir));
	const cssScenarioById = new Map(cssManifest.scenarios.map((scenario) => [scenario.id, scenario]));
	const domainState = cssScenarioById.get("css-domain-state-class-contract");
	assert.equal(domainState?.expectedSelected.css?.includes("composition-do-not-build-structural-variants-with-modifiers"), true);
	for (const ruleId of [
		"naming-default-to-plain-css-when-no-module-convention",
		"layout-keep-layout-intent-explicit",
		"values-always-provide-css-variable-fallbacks",
		"values-tokenize-repeated-visual-values",
	]) {
		assert.equal(domainState?.expectedSelected.css?.includes(ruleId) ?? false, false);
	}
	const ownerDrift = mixedScenarioById.get("RTE02-owner-placement-css-drift")?.scopeDrift;
	for (const ruleId of [
		"naming-default-to-plain-css-when-no-module-convention",
		"composition-do-not-build-structural-variants-with-modifiers",
	]) {
		assert.equal(ownerDrift?.expectedSelected.css?.includes(ruleId), true);
	}
	for (const ruleId of ["layout-keep-layout-intent-explicit", "values-always-provide-css-variable-fallbacks"]) {
		assert.equal(ownerDrift?.expectedSelected.css?.includes(ruleId) ?? false, false);
	}

	const selected = (scenarioId: string, ruleId: string): boolean =>
		mixedScenarioById.get(scenarioId)?.expectedSelected.react?.includes(ruleId) ?? false;
	const notApplicable = (scenarioId: string, ruleId: string): boolean =>
		!(mixedScenarioById.get(scenarioId)?.expectedSelected.react?.includes(ruleId) ?? false);

	assert.equal(selected("RTE09-route-runtime-section", "screen-keep-route-flow-visible"), true);
	assert.equal(notApplicable("RTE10-derived-selection-state", "screen-keep-route-flow-visible"), true);
	assert.equal(notApplicable("RTE12-query-shaping", "screen-keep-route-flow-visible"), true);
	for (const ruleId of ["typing-take-handler-types-from-existing-contracts", "events-name-handlers-predictably"]) {
		assert.equal(selected("RTE10-derived-selection-state", ruleId), true);
	}
	for (const scenarioId of ["RTE08-delete-handler-flow", "RTE09-route-runtime-section"]) {
		assert.equal(selected(scenarioId, "events-name-handlers-predictably"), true);
		assert.equal(selected(scenarioId, "typing-take-handler-types-from-existing-contracts"), true);
	}
	assert.equal(selected("RTE14-subscription-effectevent", "events-name-handlers-predictably"), true);
	assert.equal(notApplicable("RTE14-subscription-effectevent", "typing-take-handler-types-from-existing-contracts"), true);
});

test("v17 TypeScript boundaries exclude React props and prevent self-created duplicate contracts", async () => {
	const readRule = async (skillName: "typescript", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const namedObjectParams = await readRule("typescript", "functions-use-named-object-params-for-complex-signatures");
	assertMentions(readAppliesWhen(namedObjectParams), [/리액트 (?:함수 )?컴포넌트/, "프롭스", /(?:N\/A|제외)/], "namedObjectParams");
	assert.match(namedObjectParams, /뜻이 같은 계약이 이미 있으면 그대로 씁니다[\s\S]*`\*Params`[\s\S]*`\*Args`[\s\S]*새로 만들지 않/i);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	// 위와 같은 이유로 순서를 박지 않는다.
	assertMentions(
		readAppliesWhen(documentedShape),
		[/외부·생성된·읽기 전용·공용/, /그대로 쓰거나/, /N\/A|제외/],
		"documentedShape appliesWhen",
	);
	assert.match(
		readAppliesWhen(documentedShape),
		/스키마 최상단[\s\S]+계약 필드[\s\S]+파생 별칭[\s\S]+추가·변경[\s\S]+이름 붙인 형태[\s\S]+호출 계약 역할/,
	);
	assert.doesNotMatch(readAppliesWhen(documentedShape), /객체형 상수·field·alias/);
	assert.match(
		documentedShape,
		/새 입력이나 출력 역할이 새 타입 선언을 요구하지는 않습니다[\s\S]*맞는 형태가 이미 우리 코드에 있으면[\s\S]*보강/i,
	);
	assert.match(
		documentedShape,
		/외부·생성된·읽기 전용·공용 형태를 그대로 쓰기만 하면[\s\S]*지역 별칭을 새로 만들지도 않습니다[\s\S]*docs-require-header-jsdoc-on-key-declarations[^\n]+판정/i,
	);
	assert.doesNotMatch(documentedShape, /callable 선언에서[^\n]+(?:역할|계약)[^\n]+설명/);

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assert.match(
		flattenWhitespace(existingContract),
		/위치 인자를 객체 입력으로 바꾸면서, 우리가 고칠 수 있는 기존 형태를 그대로 다시 쓰면[\s\S]*types-document-custom-types-and-shapes[^\n]+걸리고 이 규칙은 걸리지 않습니다/i,
	);
	assert.match(existingContract, /요청에 없는 `\*Params`나 `\*Input`을 만들어 이 규칙을 스스로 켜지 않습니다/i);
	assert.match(
		flattenWhitespace(existingContract),
		/types-document-custom-types-and-shapes[\s\S]+걸리고 이 규칙은 걸리지 않습니다[\s\S]*외부·생성된·읽기 전용·공용 형태를 그대로 쓰면 두 타입 규칙 모두 대상이 아니고[\s\S]+문서 규칙이 따로 판정/i,
	);
	assert.doesNotMatch(existingContract, /callable header[^\n]+문서화/);
	assert.doesNotMatch(readAppliesWhen(existingContract), /재사용 결정을 바꾼다/);
	assert.match(
		existingContract,
		/원본 입력과 정규화한 값은 필드가 같아도 뜻이 달라 입력 형태를 따로 두는 것이 맞습니다[\s\S]*이 규칙은 걸리지 않습니다/i,
	);
	assert.doesNotMatch(documentedShape, /\bT\d{2}\b/);
	assert.doesNotMatch(existingContract, /\bT\d{2}\b/);

	const mixedManifest = await readRoutingEvalManifest(getSkillPaths("react", realSkillRootDir));
	const ownerMove = mixedManifest.scenarios.find(({id}) => id === "RTE02-owner-placement-css-drift");
	assert.equal(ownerMove?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures"), false);
	assert.equal(
		ownerMove?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures") ?? false,
		false,
	);
	assert.equal(
		ownerMove?.scopeDrift?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures"),
		false,
	);

	const typescriptManifest = await readRoutingEvalManifest(getSkillPaths("typescript", realSkillRootDir));
	const namedObjectParam = typescriptManifest.scenarios.find(({id}) => id === "named-object-param");
	assert.equal(namedObjectParam?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures"), true);

	const generatedContracts = await Promise.all(
		[
			"functions-use-named-object-params-for-complex-signatures",
			"types-document-custom-types-and-shapes",
			"types-reuse-existing-contracts-before-new-types",
		].map((ruleId) => readFile(path.join(realSkillRootDir, "typescript", "contracts", `${ruleId}.md`), "utf8")),
	);
	assertMentions(
		generatedContracts[0]!,
		[/리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다/i, /뜻이 같은 계약이 이미 있으면/i],
		"generatedContracts",
	);
	assert.match(generatedContracts[1]!, /CRITICAL rule[\s\S]*full rule/i);
	assertMentions(generatedContracts[2]!, [/위치 인자/i, /객체/i, /`\*Params`/i, /(?:스스로|자기|자가)/i], "generatedContracts");
});

test("v17 semantic contracts reject English-only annotations and effective deep third-party chains", async () => {
	const readRule = async (skillName: "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const koreanComments = await readRule("typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints");
	assertMentions(koreanComments, [/주석 본문이 전부 영어이면/i, /영어/i, /한국어 주석으로 인정하지 않/i], "koreanComments");
	assert.match(koreanComments, /route-local product tree props/);
	assert.match(koreanComments, /route-local 제품 트리 입력 계약/);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(
		documentedShape,
		/주석이 있다고 끝나지 않습니다[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*한국어 조건/i,
	);
	const headerDocs = await readRule("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assert.match(
		flattenWhitespace(headerDocs),
		/헤더 문서 주석[\s\S]*영문 라벨[\s\S]*요구를 채우지 못합니다[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*한국어 내용/i,
	);
	assert.doesNotMatch(headerDocs, /\bT\d{2}\b/);

	const mixedManifest = await readRoutingEvalManifest(getSkillPaths("react", realSkillRootDir));
	const ownerMove = mixedManifest.scenarios.find(({id}) => id === "RTE02-owner-placement-css-drift");
	assert.equal(ownerMove?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures"), false);
	assert.equal(
		ownerMove?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures") ?? false,
		false,
	);
	assert.equal(
		ownerMove?.scopeDrift?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures"),
		false,
	);

	const typescriptManifest = await readRoutingEvalManifest(getSkillPaths("typescript", realSkillRootDir));
	const namedObjectParam = typescriptManifest.scenarios.find(({id}) => id === "named-object-param");
	assert.equal(namedObjectParam?.expectedSelected.typescript?.includes("functions-use-named-object-params-for-complex-signatures"), true);

	const generatedContracts = await Promise.all(
		[
			"functions-use-named-object-params-for-complex-signatures",
			"types-document-custom-types-and-shapes",
			"types-reuse-existing-contracts-before-new-types",
		].map((ruleId) => readFile(path.join(realSkillRootDir, "typescript", "contracts", `${ruleId}.md`), "utf8")),
	);
	assertMentions(
		generatedContracts[0]!,
		[/리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다/i, /뜻이 같은 계약이 이미 있으면/i],
		"generatedContracts",
	);
	assert.match(generatedContracts[1]!, /CRITICAL rule[\s\S]*full rule/i);
	assertMentions(generatedContracts[2]!, [/위치 인자/i, /객체/i, /`\*Params`/i, /(?:스스로|자기|자가)/i], "generatedContracts");
});

test("v17 semantic contracts reject English-only annotations and effective deep third-party chains", async () => {
	const readRule = async (skillName: "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const koreanComments = await readRule("typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints");
	assertMentions(koreanComments, [/주석 본문이 전부 영어이면/i, /영어/i, /한국어 주석으로 인정하지 않/i], "koreanComments");
	assert.match(koreanComments, /route-local product tree props/);
	assert.match(koreanComments, /route-local 제품 트리 입력 계약/);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(
		documentedShape,
		/주석이 있다고 끝나지 않습니다[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*한국어 조건/i,
	);
	const headerDocs = await readRule("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assert.match(
		flattenWhitespace(headerDocs),
		/헤더 문서 주석[\s\S]*영문 라벨[\s\S]*요구를 채우지 못합니다[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*한국어 내용/i,
	);
	assert.doesNotMatch(headerDocs, /\bT\d{2}\b/);

	const foreignRoot = await readRule("css", "ownership-use-foreign-classes-only-under-your-own-root");
	assertMentions(
		foreignRoot,
		[/내 최상위 클래스 블록 안에서만/, /블록 바깥에 홀로 두지 않습니다/, /선택자가 내 식별자로 시작하는지/],
		"foreignRoot",
	);
	assertMentions(
		foreignRoot,
		[
			/그 라이브러리를 쓰는 앱 전체에 적용됩니다/,
			/그 위젯을 쓰는 화면 전체에 적용됩니다/,
			/결합자 개수는 제한하지 않습니다/,
			/selector-disallowed-list/,
		],
		"foreignRoot",
	);
	assert.match(foreignRoot, /& \.ant-tree-node-content-wrapper/);

	const otherOwnerApi = await readRule("css", "ownership-change-other-owners-through-their-api");
	assertMentions(
		otherOwnerApi,
		[/세 갈래를 순서대로 봅니다/, /막다른 길이 아니라 마지막 선택지입니다/, /최상위까지만 닿는 것은 제약이 아니라 경계입니다/],
		"otherOwnerApi",
	);

	const ampersandScope = await readRule("css", "selector-limit-nesting-block-depth");
	assertMentions(
		ampersandScope,
		[/중첩은 항상 한 겹이고, `&`도 한 선택자에 한 번입니다/, /그 블록이 소유한 요소 하나/, /어느 요소를 가리키느냐가 정합니다/],
		"ampersandScope",
	);

	const rawWrapper = await readRule("css", "selector-use-classes-instead-of-element-selectors");
	assertMentions(
		rawWrapper,
		[/우리가 렌더하는 마크업에는 요소 선택자를 쓰지 않습니다/, /dangerouslySetInnerHTML/, /stylelint-disable-next-line/],
		"rawWrapper",
	);

	const entryPoint = await readRule("css", "composition-inject-classes-only-at-the-entry-point");
	assertMentions(
		entryPoint,
		[/스타일 창구는 \*\*진입점 하나\*\*입니다/, /`ui_`든 `wg_`든 `pg_`든 같습니다/, /내부 노드로 가는 클래스 프롭을 늘리지 않습니다/],
		"entryPoint",
	);

	const stylelintConfig = await readRule("css", "tooling-configure-stylelint-to-enforce-these-rules");
	assertMentions(
		stylelintConfig,
		[/stylelint-config-standard/, /selector-max-combinators/, /overrides/, /리뷰가 담당합니다/],
		"stylelintConfig",
	);

	const nestingDepth = await readRule("css", "selector-limit-nesting-block-depth");
	assertMentions(nestingDepth, [/실제 선택자가 숨습니다/, /max-nesting-depth: 1/, /최상위가 0겹/], "nestingDepth");

	const commaGroup = await readRule("css", "selector-do-not-group-classes-with-commas");
	assertMentions(
		commaGroup,
		[/중복을 감수합니다/, /조건마다 블록을 따로 열고 선언을 그대로 씁니다/, /no-duplicate-selectors/, /쉼표 묶음 자체는 막지 않습니다/],
		"commaGroup",
	);

	const oneBlockPerClass = await readRule("css", "selector-declare-each-class-in-one-block");
	assertMentions(
		oneBlockPerClass,
		[/한 블록에만 있습니다/, /선언 순서에 의존하는 덮어쓰기가 생기지 않습니다/, /@media/],
		"oneBlockPerClass",
	);

	const nestDomState = await readRule("css", "selector-nest-dom-state-in-the-owning-block");
	assertMentions(
		nestDomState,
		[
			/블록 바깥에서 다시 열지 않습니다/,
			/식별자가 같은 자손을 결합자 하나로 겨냥합니다/,
			/`:has\(\)`로 조상을 겨냥할 수는 있지만 쓰지 않습니다/,
		],
		"nestDomState",
	);

	const notInversion = await readRule("css", "selector-do-not-invert-domain-state-with-not");
	assertMentions(
		notInversion,
		[/조상의 수정자로 자손의 모습을 정하려 한 것입니다/, /부정 조건이 필요 없어집니다/, /:not\(:disabled\)/],
		"notInversion",
	);

	const focusIndicator = await readRule("css", "a11y-always-provide-a-visible-focus-indicator");
	assertMentions(
		focusIndicator,
		[/포커스 표시를 없애지 않습니다/, /:focus-visible/, /색각 이상에서 구분되지 않습니다/, /브라우저만 알 수 있어서/],
		"focusIndicator",
	);

	const generatedContracts = await Promise.all(
		[
			["typescript", "docs-require-header-jsdoc-on-key-declarations"],
			["typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints"],
			["css", "selector-nest-dom-state-in-the-owning-block"],
			["css", "ownership-use-foreign-classes-only-under-your-own-root"],
		].map(([skillName, ruleId]) => readFile(path.join(realSkillRootDir, skillName!, "contracts", `${ruleId}.md`), "utf8")),
	);
	assert.match(
		flattenWhitespace(generatedContracts[0]!),
		/영문 라벨[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*한국어 내용/i,
	);
	assertMentions(generatedContracts[1]!, [/주석 본문이 전부 영어이면/i, /영어/i], "generatedContracts");
	assert.match(generatedContracts[2]!, /pseudo-class[\s\S]*식별자가 같은 자손을 결합자 하나로 겨냥합니다/i);
	assert.match(generatedContracts[3]!, /CRITICAL rule[\s\S]*full rule/i);
});

test("CSS generated index is canonical, complete, body-preserving, and within its byte budget", async () => {
	const skillPaths = getSkillPaths("css", realSkillRootDir);
	const source = await readFile(skillPaths.rulesIndexPath, "utf8");
	const entries = Array.from(source.matchAll(/^- C\d+ \| ([^ |]+) \|/gm), (match) => ({id: match[1], fileName: `${match[1]}.md`}));
	const document = await readSkillDocument(skillPaths);

	assert.deepEqual(
		entries.map((entry) => entry.id),
		cssRuleUniverse,
	);
	assert.equal(entries.length, 32);

	for (const entry of entries) {
		assert.equal(entry.fileName, `${entry.id}.md`);
		await access(path.join(skillPaths.ruleContractsDir, entry.fileName));
	}

	const handbook = await readFile(skillPaths.outputPath, "utf8");
	assert.match(handbook, /metadata\.json\.companions/);
	assert.doesNotMatch(handbook, /metadata\.json\.extends/);
	assert.match(handbook, /^## 함께 따르는 규칙$/m);
	assert.match(handbook, /- \[TypeScript Convention\]\(\.\.\/typescript\/HANDBOOK\.md\) — 다음 조건에서 함께 적용합니다\./);
	assert.match(handbook, /다음 조건에서 함께 적용합니다\. TS\/TSX 클래스 계약, 래퍼 Props 또는 style import를 함께 변경한다\./);
	assert.match(handbook, /\.\.\/typescript\/HANDBOOK\.md/);
	for (const rule of document.rules) {
		const bodyWithoutHeading = rule.body.replace(/^## .+\n+/, "");
		assert.equal(handbook.includes(bodyWithoutHeading), true, `${rule.fileName} body must remain verbatim in AGENTS.md`);
	}

	const typescriptDocument = await readSkillDocument(getSkillPaths("typescript", realSkillRootDir));
	for (const rule of typescriptDocument.rules) {
		const bodyWithoutHeading = rule.body.replace(/^## .+\n+/, "");
		assert.equal(handbook.includes(bodyWithoutHeading), false, `${rule.fileName} companion body must not be embedded in CSS AGENTS.md`);
	}
	assert.equal((handbook.match(/TypeScript Convention/g) ?? []).length, 1);
	assert.doesNotMatch(handbook, /`convention-react`/);
});

test("CSS SKILL.md is a compact router with companion boundaries", async () => {
	const source = await readFile(path.join(realSkillRootDir, "css", "SKILL.md"), "utf8");
	const {body} = splitFrontmatter(source);

	assertRouterShape(source, "convention-css");
	assertRouterProtocol(body);
	assertRemovedApparatusStaysGone(body);

	// companion 경계. 순수 CSS 변경이면 둘 다 켜지 않는다
	const cssScope = extractSection(body, 1);

	assertMentions(cssScope, ["`convention-react`", "`convention-typescript`", "순수 CSS"], "css 1절");
	assert.equal(isNegated(blockContaining(cssScope, "순수 CSS")), true, "css 1절: 순수 CSS 예외가 없다");
});

test("fixture manifests accept exact progressive partitions and non-progressive activation evidence", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy", options: {progressive: false}});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSkills.push("legacy");
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
		await validateRoutingEvalManifests(skillRootDir);
	});
});

test("manifest canonical order matches the compact index codepoint order", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({
			skillRootDir,
			skillName: "owner",
			options: {ruleTitles: {"fixture-first": "Älpha Rule", "fixture-second": "Zulu Rule"}},
		});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSelected.owner = ["fixture-second", "fixture-first"];
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
	});
});

test("manifest reader rejects invalid JSON and strict shape/version/owner violations", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		const manifestPath = getSkillPaths("owner", skillRootDir).routingEvalsPath;
		await writeFile(manifestPath, "{not json", "utf8");
		await assert.rejects(() => readRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /invalid JSON/i);

		const cases: [string, unknown, RegExp][] = [
			["version", {...createValidManifest(), version: 2}, /version.*1/i],
			["owner", {...createValidManifest(), skill: "other"}, /owner|must match.*owner/i],
			["top-level extra", {...createValidManifest(), extra: true}, /unknown.*extra/i],
			["scenario extra", {...createValidManifest(), scenarios: [{...createValidManifest().scenarios[0], extra: true}]}, /unknown.*extra/i],
			["empty prompt", {...createValidManifest(), scenarios: [{...createValidManifest().scenarios[0], prompt: ""}]}, /prompt.*non-empty/i],
			[
				"duplicate files",
				{...createValidManifest(), scenarios: [{...createValidManifest().scenarios[0], files: ["src/fixture.ts", "src/fixture.ts"]}]},
				/files.*duplicate/i,
			],
			[
				"scope drift unknown key",
				{
					...createValidManifest(),
					scenarios: [
						{
							...createValidManifest().scenarios[0],
							scopeDrift: {
								evidence: "Expanded.",
								files: ["src/fixture.ts"],
								expectedSkills: ["owner"],
								expectedSelected: {owner: [...fixtureRuleIds]},
								extra: true,
							},
						},
					],
				},
				/scopeDrift.*unknown.*extra/i,
			],
			[
				"scope drift empty evidence",
				{
					...createValidManifest(),
					scenarios: [
						{
							...createValidManifest().scenarios[0],
							scopeDrift: {
								evidence: "",
								files: ["src/fixture.ts"],
								expectedSkills: ["owner"],
								expectedSelected: {owner: [...fixtureRuleIds]},
							},
						},
					],
				},
				/scopeDrift.*evidence.*non-empty/i,
			],
		];

		for (const [label, candidate, expected] of cases) {
			await writeManifest({skillRootDir, skillName: "owner", manifest: candidate});
			await assert.rejects(() => readRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), expected, label);
		}
	});
});

test("manifest parser preserves hostile own partition keys for strict rejection", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		const manifestPath = getSkillPaths("owner", skillRootDir).routingEvalsPath;
		await writeFile(
			manifestPath,
			`${JSON.stringify(createValidManifest(), null, 2).replace(
				'"expectedSelected": {',
				'"expectedSelected": {\n          "__proto__": [],',
			)}\n`,
			"utf8",
		);

		await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /unexpected partition.*__proto__/i);
	});
});

test("manifest validator rejects duplicate arrays, unknown skills/rules, overlap, and incomplete or unexpected partitions", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy", options: {progressive: false}});
		const cases: [string, (manifest: RoutingEvalManifest) => void, RegExp][] = [
			[
				"owner activation missing",
				(manifest) => {
					manifest.scenarios[0]!.expectedSkills = ["legacy"];
					manifest.scenarios[0]!.expectedSelected = {};
				},
				/must activate its owner skill.*owner/i,
			],
			["duplicate expectedSkills", (manifest) => manifest.scenarios[0]!.expectedSkills.push("owner"), /expectedSkills.*duplicate/i],
			["unknown skill", (manifest) => manifest.scenarios[0]!.expectedSkills.push("missing"), /unknown skill.*missing/i],
			["unknown rule", (manifest) => manifest.scenarios[0]!.expectedSelected.owner.push("missing-rule"), /unknown rule.*missing-rule/i],
			["duplicate rule", (manifest) => manifest.scenarios[0]!.expectedSelected.owner.push("fixture-first"), /expectedSelected.*duplicate/i],
			["missing progressive map key", (manifest) => delete manifest.scenarios[0]!.expectedSelected.owner, /expectedSelected.*owner/i],
			[
				"unexpected partition key",
				(manifest) => {
					manifest.scenarios[0]!.expectedSelected.other = [];
				},
				/unexpected partition.*other/i,
			],
			[
				"non-progressive partition",
				(manifest) => {
					manifest.scenarios[0]!.expectedSkills.push("legacy");
					manifest.scenarios[0]!.expectedSelected.legacy = [];
				},
				/unexpected partition skill.*legacy/i,
			],
		];

		for (const [label, mutate, expected] of cases) {
			const manifest = structuredClone(createValidManifest());
			mutate(manifest);
			await writeManifest({skillRootDir, skillName: "owner", manifest});
			await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), expected, label);
		}
	});
});

test("manifest validator enforces required closure and partitions an explicitly activated conditional companion", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "leaf"});
		await writeFixtureSkill({skillRootDir, skillName: "conditional"});
		await writeFixtureSkill({skillRootDir, skillName: "required", options: {companions: [{skill: "leaf", mode: "required"}]}});
		await writeFixtureSkill({
			skillRootDir,
			skillName: "owner",
			options: {
				companions: [
					{skill: "required", mode: "required"},
					{skill: "conditional", mode: "conditional", appliesWhen: "Editing conditional code."},
				],
			},
		});
		const manifest = createValidManifest();
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /required companion.*required/i);

		manifest.scenarios[0]!.expectedSkills.push("required");
		manifest.scenarios[0]!.expectedSelected.required = [...fixtureRuleIds];
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /required companion.*leaf/i);

		manifest.scenarios[0]!.expectedSkills.push("leaf");
		manifest.scenarios[0]!.expectedSelected.leaf = [...fixtureRuleIds];
		manifest.scenarios[0]!.expectedSkills.push("conditional");
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/expectedSelected.*conditional|conditional.*partition/i,
		);

		manifest.scenarios[0]!.expectedSelected.conditional = [...fixtureRuleIds];
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
	});
});

test("manifest validator enforces requiresSelected and requiredOnCompletion rule closure", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({
			skillRootDir,
			skillName: "owner",
			options: {ruleRouting: {"fixture-first": {requiresSelected: ["fixture-second"]}}},
		});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSelected.owner = ["fixture-first"];
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/requiresSelected target "owner\/fixture-second"/i,
		);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner", options: {ruleRouting: {"fixture-second": {requiredOnCompletion: true}}}});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSelected.owner = ["fixture-first"];
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/requiredOnCompletion rule "owner\/fixture-second"/i,
		);
	});
});

test("manifest validator enforces recursive required closure for non-progressive legacy extends", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "typescript"});
		await writeFixtureSkill({skillRootDir, skillName: "react", options: {progressive: false, extends: ["typescript"]}});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSkills.push("react");
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/missing required dependency skill "typescript" for "react"/i,
		);

		manifest.scenarios[0]!.expectedSkills.push("typescript");
		manifest.scenarios[0]!.expectedSelected.typescript = [...fixtureRuleIds];
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy-leaf", options: {progressive: false}});
		await writeFixtureSkill({skillRootDir, skillName: "legacy-base", options: {progressive: false, extends: ["legacy-leaf"]}});
		await writeFixtureSkill({skillRootDir, skillName: "react", options: {progressive: false, extends: ["legacy-base"]}});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSkills.push("react", "legacy-base");
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/missing required dependency skill "legacy-leaf" for "legacy-base"/i,
		);

		manifest.scenarios[0]!.expectedSkills.push("legacy-leaf");
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
	});
});

test("manifest validator rejects a legacy dependency cycle reached only through expectedSkills evidence", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy-a", options: {progressive: false, extends: ["legacy-b"]}});
		await writeFixtureSkill({skillRootDir, skillName: "legacy-b", options: {progressive: false, extends: ["legacy-a"]}});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSkills.push("legacy-a");
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/Circular skill extends.*legacy-a -> legacy-b -> legacy-a/i,
		);
	});
});

test("manifest owner may activate first in drift but must stay active and fully partitioned", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "typescript"});
		await writeFixtureSkill({skillRootDir, skillName: "react", options: {progressive: false}});
		const manifest: RoutingEvalManifest = {
			version: 1,
			skill: "owner",
			scenarios: [
				{
					id: "owner-added-by-drift",
					prompt: "Change rendering with React and TypeScript only.",
					files: ["src/view.tsx"],
					expectedSkills: ["react", "typescript"],
					expectedSelected: {typescript: [...fixtureRuleIds]},
					scopeDrift: {
						evidence: "Add the owner surface after scope drift.",
						files: ["src/view.tsx", "src/view.css"],
						expectedSkills: ["react", "typescript", "owner"],
						expectedSelected: {typescript: [...fixtureRuleIds], owner: [...fixtureRuleIds]},
					},
				},
			],
		};
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await writeManifest({skillRootDir, skillName: "typescript", manifest: createValidManifest("typescript")});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
		await validateRoutingEvalManifests(skillRootDir);

		const ownerNeverActive = structuredClone(manifest);
		ownerNeverActive.scenarios[0]!.scopeDrift!.expectedSkills.pop();
		delete ownerNeverActive.scenarios[0]!.scopeDrift!.expectedSelected.owner;
		await writeManifest({skillRootDir, skillName: "owner", manifest: ownerNeverActive});
		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/must activate its owner skill.*owner.*initial.*scopeDrift|initial.*scopeDrift.*owner/i,
		);

		const ownerRemovedByDrift = createValidManifest();
		ownerRemovedByDrift.scenarios[0]!.scopeDrift = {
			evidence: "Remove the owner after drift.",
			files: ["src/fixture.ts", "src/view.tsx"],
			expectedSkills: ["react"],
			expectedSelected: {},
		};
		await writeManifest({skillRootDir, skillName: "owner", manifest: ownerRemovedByDrift});
		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/scopeDrift.*skill set.*monotonic.*owner/i,
		);

		const missingDriftOwnerMap = structuredClone(manifest);
		delete missingDriftOwnerMap.scenarios[0]!.scopeDrift!.expectedSelected.owner;
		await writeManifest({skillRootDir, skillName: "owner", manifest: missingDriftOwnerMap});
		await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /scopeDrift.*expectedSelected.*owner/i);
	});
});

test("scope drift is monotonic for files, activated skills, and selected rules", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy", options: {progressive: false}});
		const manifest = createValidManifest();
		manifest.scenarios[0]!.expectedSkills.push("legacy");
		manifest.scenarios[0]!.scopeDrift = {
			evidence: "The scope expands.",
			files: ["src/fixture.ts", "src/second.ts"],
			expectedSkills: ["owner", "legacy"],
			expectedSelected: {owner: [...fixtureRuleIds]},
		};
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));

		const cases: [string, (candidate: RoutingEvalManifest) => void, RegExp][] = [
			["file removal", (candidate) => candidate.scenarios[0]!.scopeDrift!.files.shift(), /scopeDrift.*file.*monotonic/i],
			["skill removal", (candidate) => candidate.scenarios[0]!.scopeDrift!.expectedSkills.pop(), /scopeDrift.*skill.*monotonic/i],
			[
				"selection removal",
				(candidate) => {
					candidate.scenarios[0]!.scopeDrift!.expectedSelected.owner.pop();
				},
				/scopeDrift.*selected.*monotonic/i,
			],
		];

		for (const [label, mutate, expected] of cases) {
			const candidate = structuredClone(manifest);
			mutate(candidate);
			await writeManifest({skillRootDir, skillName: "owner", manifest: candidate});
			await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), expected, label);
		}
	});
});

test("all-manifest validation rejects cross-owner scenario duplicates and missing positive coverage", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "alpha"});
		await writeFixtureSkill({skillRootDir, skillName: "beta"});
		const alphaManifest = createValidManifest("alpha");
		const betaManifest = createValidManifest("beta");
		betaManifest.scenarios[0]!.id = alphaManifest.scenarios[0]!.id;
		await writeManifest({skillRootDir, skillName: "alpha", manifest: alphaManifest});
		await writeManifest({skillRootDir, skillName: "beta", manifest: betaManifest});
		await assert.rejects(() => validateRoutingEvalManifests(skillRootDir), /duplicate scenario id.*alpha-all-rules/i);

		betaManifest.scenarios[0]!.id = "beta-all-rules";
		betaManifest.scenarios[0]!.expectedSelected.beta = ["fixture-first"];
		await writeManifest({skillRootDir, skillName: "beta", manifest: betaManifest});
		await assert.rejects(() => validateRoutingEvalManifests(skillRootDir), /positive coverage.*beta.*fixture-second/i);
	});
});

test("single and all manifest APIs reject required companion cycles", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "alpha", options: {companions: [{skill: "beta", mode: "required"}]}});
		await writeFixtureSkill({skillRootDir, skillName: "beta", options: {companions: [{skill: "alpha", mode: "required"}]}});

		for (const skillName of ["alpha", "beta"] as const) {
			const manifest = createValidManifest(skillName);
			const companionName = skillName === "alpha" ? "beta" : "alpha";
			manifest.scenarios[0]!.expectedSkills.push(companionName);
			manifest.scenarios[0]!.expectedSelected[companionName] = [...fixtureRuleIds];
			await writeManifest({skillRootDir, skillName, manifest});
		}

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("alpha", skillRootDir)),
			/Circular skill companions.*alpha -> beta -> alpha/i,
		);
		await assert.rejects(() => validateRoutingEvalManifests(skillRootDir), /Circular skill companions.*alpha -> beta -> alpha/i);
	});
});

test("routing eval module has no import-time CLI side effects", async () => {
	const logs: string[] = [];
	const originalLog = console.log;
	console.log = (message?: unknown) => logs.push(String(message));

	try {
		await import(`../src/routing-evals.js?side-effect-check=${Date.now()}`);
	} finally {
		console.log = originalLog;
	}

	assert.deepEqual(logs, []);
});
