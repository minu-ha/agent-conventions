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
import {maximumConditionLength} from "../src/dependencies.js";
import {readRoutingEvalManifest, validateRoutingEvalManifest, validateRoutingEvalManifests} from "../src/routing-evals.js";
import {generateRulesIndexMarkdown, getRuleId} from "../src/routing.js";
import type {RoutingEvalManifest, RoutingExpectedPartition, RoutingScopeDrift, SkillCompanion} from "../src/types.js";

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
 * @helper 에이전트가 실제로 읽게 되는 텍스트. 링크만 남긴 CRITICAL·HIGH contract 는 원문까지 이어 읽는다
 */
const readAgentFacingRule = async (skill: string, ruleId: string): Promise<string> => {
	const contract = await readFile(path.join(realSkillRootDir, skill, "contracts", `${ruleId}.md`), "utf8");

	if (!/must read the \[full rule\]/.test(contract)) {
		return contract;
	}

	const rulesDir = path.join(realSkillRootDir, skill, "rules");
	const ruleFileName = (await readdir(rulesDir)).find((fileName) => fileName.endsWith(`-${ruleId}.md`));

	if (ruleFileName === undefined) {
		throw new Error(`${skill}/${ruleId}: full rule file not found for a link-only contract`);
	}

	return `${contract}\n${await readFile(path.join(rulesDir, ruleFileName), "utf8")}`;
};

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
	"types-derive-subsets-with-indexed-access",
	"types-prefer-function-variable-types-over-parameter-annotations",
	"types-document-custom-types-and-shapes",
	"types-mark-unused-parameters-with-underscore",
	"types-narrow-unknown-instead-of-asserting",
	"types-replace-enum-with-as-const-objects",
	"types-choose-interface-for-object-contracts-and-type-for-composition",
	"naming-place-project-constants-in-the-root-constant-folder",
	"naming-place-owner-constants-in-the-owner-constant-folder",
	"naming-use-consistent-file-and-symbol-naming",
	"naming-use-direct-imports-and-public-entry-points",
	"naming-import-by-absolute-path",
	"naming-read-environment-values-through-config-env",
	"naming-name-types-by-role-and-lifetime",
	"functions-declare-functions-as-arrow-consts",
	"functions-use-named-object-params-for-complex-signatures",
	"functions-extract-helpers-only-when-the-boundary-is-real",
	"functions-give-each-function-its-own-file",
	"functions-order-declarations-top-down",
	"functions-promote-owner-free-functions-to-root-util",
	"functions-avoid-imperative-assembly-in-wide-scopes",
	"functions-name-a-value-only-for-recompute-or-judgment",
	"functions-name-functions-by-what-comes-out",
	"values-prefer-immutable-array-sorting",
	"values-use-set-and-map-for-repeated-lookups",
	"values-read-objects-through-chains",
	"values-declare-meaningful-numbers",
	"values-avoid-lookup-tables-for-simple-choices",
	"values-use-es-toolkit-for-value-helpers",
	"values-handle-dates-with-dayjs",
	"values-decide-once-and-carry-the-result",
	"absence-expose-optional-values-instead-of-silent-fallbacks",
	"absence-resolve-defaults-at-the-boundary",
	"absence-do-not-guard-what-types-guarantee",
	"absence-check-once-at-the-boundary",
	"docs-keep-body-comments-for-intent-and-steps",
	"docs-require-header-jsdoc-on-key-declarations",
	"docs-write-korean-comments-about-purpose-and-constraints",
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
	"ownership-choose-scope-prefix-by-owner-layer",
	"ownership-use-foreign-classes-only-under-your-own-root",
	"ownership-change-other-owners-through-their-api",
	"composition-compose-classes-with-clsx",
	"composition-do-not-build-structural-variants-with-modifiers",
	"composition-keep-classes-single-purpose",
	"composition-inject-classes-only-at-the-entry-point",
	"composition-do-not-add-wrapper-elements-for-styling",
	"composition-do-not-style-through-the-style-attribute",
	"composition-write-modifiers-as-conditions",
	"selector-limit-nesting-block-depth",
	"selector-use-classes-instead-of-element-selectors",
	"selector-do-not-group-classes-with-commas",
	"selector-declare-each-class-in-one-block",
	"selector-use-pseudo-classes-for-dom-owned-states",
	"selector-nest-dom-state-in-the-owning-block",
	"selector-do-not-negate-with-not",
	"values-fall-back-only-outside-core-tokens",
	"values-tokenize-repeated-visual-values",
	"values-declare-stacking-layers-as-tokens",
	"values-switch-themes-by-changing-token-values",
	"values-name-tokens-by-purpose",
	"layout-group-breakpoints-at-the-file-bottom",
	"layout-write-breakpoints-desktop-first",
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
	"typing-open-dom-props-in-three-steps",
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
	"composition-order-hooks-handlers-effects-then-return",
	"composition-split-owner-parts-only-for-runtime-boundaries",
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
	"state-name-url-state-bindings-as-a-set",
	"events-name-handlers-predictably",
	"events-curry-extra-handler-arguments",
	"events-run-user-actions-in-handlers-not-effects",
	"perf-avoid-defensive-memoization",
	"perf-use-lazy-state-initializers-for-expensive-defaults",
	"perf-defer-heavy-renders-with-measured-evidence",
	"a11y-give-interactive-elements-an-accessible-name",
	"docs-require-jsdoc-on-key-declarations",
	"docs-write-jsx-comments-as-multiline-blocks",
	"tooling-enable-the-biome-react-domain",
] as const;

/**
 * @summary Appendix A의 TypeScript rule별 exact routing metadata oracle
 */
const typescriptRuleRouting = {
	"types-reuse-existing-contracts-before-new-types": {
		appliesWhen:
			"뜻이 같은 기존 타입, 인터페이스, 스키마가 있는데 형태를 새로 선언·변경·복제·파생할 때. 같은 형태를 두 번 선언했다가 넣거나 뺄 때. 제외: 맞는 후보가 없거나 소유자만 옮긴 경우. 제외: 그대로인 계약을 새 자리에서 쓰는 경우. 제외: 고칠 수 없는 형태를 그대로 쓰는 경우.",
		reviewWith: ["types-derive-subsets-with-indexed-access", "types-document-custom-types-and-shapes"],
	},
	"types-derive-subsets-with-indexed-access": {
		appliesWhen:
			"기존 타입의 일부 필드만 담는 형태를 선언·변경할 때. `Pick`·`Omit`·`Partial`·`Required`·`Extract`·`NonNullable`을 추가·변경할 때. 제외: 필드 이름·타입·선택 여부가 모두 같아 기존 타입을 그대로 참조하는 경우.",
		reviewWith: ["types-reuse-existing-contracts-before-new-types", "types-document-custom-types-and-shapes"],
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
		appliesWhen:
			"`as` 단언, `!` `null` 아님 단언, `any`, `@ts-expect-error`를 추가·변경·제거할 때. 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때. 제외: 검증된 내부 값에 `as const`나 `satisfies`만 적용하는 경우.",
		reviewWith: ["docs-justify-convention-exceptions-with-a-reason-comment", "tooling-configure-biome-to-enforce-these-rules"],
	},
	"types-replace-enum-with-as-const-objects": {
		appliesWhen:
			"`enum`이나 타입과 실행 양쪽에서 함께 쓰는 값 집합을 추가·변경할 때. 제외: 외부 패키지가 내보낸 `enum` 값을 그대로 읽어 쓰는 경우.",
		reviewWith: [],
	},
	"types-choose-interface-for-object-contracts-and-type-for-composition": {
		appliesWhen:
			"`interface`와 `type` 사이에서 선언 형식을 바꿀 때. 객체 계약, union, tuple, 함수 시그니처, mapped·conditional type에 이름을 붙여 선언할 때. 제외: 외부·생성된 계약을 그대로 참조하는 경우.",
		reviewWith: ["types-reuse-existing-contracts-before-new-types", "types-document-custom-types-and-shapes"],
	},
	"naming-place-project-constants-in-the-root-constant-folder": {
		appliesWhen:
			"프로젝트 전반이 쓰는 URL 경로, 페이지 크기, 표시 문구, 기준값을 추가·이동·중복 정의할 때. 루트 `constant` 폴더의 파일이나 상수 이름을 바꿀 때.",
		reviewWith: ["naming-place-owner-constants-in-the-owner-constant-folder", "naming-use-direct-imports-and-public-entry-points"],
	},
	"naming-place-owner-constants-in-the-owner-constant-folder": {
		appliesWhen: "한 소유자의 상수나 선언형 계약을 추가하거나 옮길 때. 루트 상수와 소유자 전용 상수 사이에서 위치를 바꿀 때.",
		reviewWith: ["naming-place-project-constants-in-the-root-constant-folder"],
	},
	"naming-use-consistent-file-and-symbol-naming": {
		appliesWhen:
			"TypeScript 파일, 폴더, 변수, 함수, 타입, 객체·스키마 키의 이름을 새로 만들거나 바꿀 때. 외부 계약이 정한 이름이나 키의 표기를 바꿀지 판단할 때. 제외: 별칭 없이 외부 패키지에서 그대로 가져오는 경우.",
		reviewWith: [],
	},
	"naming-use-direct-imports-and-public-entry-points": {
		appliesWhen:
			"가져오기, 내보내기, `index.ts` 배럴, 공개 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때. 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때.",
		reviewWith: ["naming-import-by-absolute-path"],
	},
	"naming-import-by-absolute-path": {
		appliesWhen:
			"다른 모듈을 가져오는 경로를 쓸 때. `./`나 `../`로 시작하는 경로를 쓰거나 별칭 경로를 상대경로로 바꾸려 할 때. `src` 바로 아래 레이어 루트 폴더나 `store` 파일을 새로 만들 때.",
		reviewWith: ["naming-use-direct-imports-and-public-entry-points"],
	},
	"naming-read-environment-values-through-config-env": {
		appliesWhen: "`import.meta.env`나 `process.env`를 읽는 코드를 추가·이동할 때. 환경마다 달라지는 값이나 기능 플래그를 새로 들여올 때.",
		reviewWith: [
			"naming-place-project-constants-in-the-root-constant-folder",
			"absence-expose-optional-values-instead-of-silent-fallbacks",
		],
	},
	"naming-name-types-by-role-and-lifetime": {
		appliesWhen:
			"타입·인터페이스나 그 파일의 이름을 새로 만들거나 바꿀 때. 타입을 소유자 폴더 안과 밖 사이에서 옮기며 이름을 바꿀 때. 제외: 외부·생성된 계약 이름을 그대로 쓰는 경우.",
		reviewWith: ["naming-use-consistent-file-and-symbol-naming"],
	},
	"functions-declare-functions-as-arrow-consts": {
		appliesWhen:
			"이름을 지어 선언하는 함수를 새로 만들거나 선언 형태나 본문 형태를 바꿀 때. 객체 프로퍼티에 함수를 담거나 그 형태를 바꿀 때. 제외: 인라인 콜백이나 커링의 바깥 화살표인 경우. 제외: 클래스 메서드, 제너레이터, 오버로드 선언인 경우.",
		reviewWith: ["functions-use-named-object-params-for-complex-signatures"],
	},
	"functions-use-named-object-params-for-complex-signatures": {
		appliesWhen:
			"매개변수가 셋을 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때. 객체 매개변수의 필드를 읽는 방식을 바꿀 때. 제외: 리액트 함수 컴포넌트가 프롭스를 받는 방식만 바꾸는 경우.",
		reviewWith: ["types-reuse-existing-contracts-before-new-types", "values-read-objects-through-chains"],
	},
	"functions-extract-helpers-only-when-the-boundary-is-real": {
		appliesWhen:
			"보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때. 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때.",
		reviewWith: [
			"functions-give-each-function-its-own-file",
			"values-decide-once-and-carry-the-result",
			"docs-require-header-jsdoc-on-key-declarations",
		],
	},
	"functions-give-each-function-its-own-file": {
		appliesWhen:
			"떼어 낸 보조 함수를 어느 파일이나 폴더에 둘지 정할 때. `helper.ts`, `helpers.ts`, `utils.ts` 같은 파일을 만들거나 거기에 함수를 더할 때. 대표 함수가 자기만 쓰는 보조를 처음 갖게 될 때. 보조를 부르는 대표 함수나 소유자가 늘어날 때.",
		reviewWith: ["functions-promote-owner-free-functions-to-root-util", "functions-order-declarations-top-down"],
	},
	"functions-order-declarations-top-down": {
		appliesWhen:
			"`.ts` 파일에 선언을 추가하거나 선언 자리를 옮길 때. 내보낸 계약 타입이나 모듈 상수를 내보낸 함수보다 아래에 두려 할 때. 제외: 리액트 컴포넌트 본문 안 선언 자리를 바꾸는 경우.",
		reviewWith: [],
	},
	"functions-promote-owner-free-functions-to-root-util": {
		appliesWhen:
			"함수를 루트 `util` 폴더로 옮기거나 종류 폴더를 새로 만들 때. 두 소유자가 같은 함수를 쓰게 될 때. 제외: 소유자 안에서 파일 자리만 바꾸는 경우.",
		reviewWith: [],
	},
	"functions-avoid-imperative-assembly-in-wide-scopes": {
		appliesWhen:
			"모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 만들 때. 삼항 안에 삼항을 넣을 때.",
		reviewWith: ["functions-extract-helpers-only-when-the-boundary-is-real"],
	},
	"functions-name-a-value-only-for-recompute-or-judgment": {
		appliesWhen:
			"순수 계산의 결과를 지역 변수(`const`)로 받는 줄을 추가·삭제할 때. 표현식을 쓰는 자리에 그대로 적을지 변수로 뺄지 정할 때.",
		reviewWith: ["functions-avoid-imperative-assembly-in-wide-scopes", "values-read-objects-through-chains"],
	},
	"functions-name-functions-by-what-comes-out": {
		appliesWhen: "이름을 붙인 함수를 새로 만들거나 이름을 바꿀 때. 제외: 생성기·프레임워크·외부 계약이 정한 이름을 그대로 쓰는 경우.",
		reviewWith: [],
	},
	"values-prefer-immutable-array-sorting": {
		appliesWhen: "프롭스, 상태, 매개변수, 모듈 상수에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.",
		reviewWith: ["values-use-es-toolkit-for-value-helpers"],
	},
	"values-use-set-and-map-for-repeated-lookups": {
		appliesWhen:
			"같은 목록의 `includes`나 `find`를 루프·배열 콜백 안에서 호출하도록 추가·변경할 때. 같은 목록의 키 조회를 서로 다른 세 지점 이상에서 하도록 추가·변경할 때. 제외: 조회하는 목록이 짧고 길이가 정해져 있는 경우.",
		reviewWith: [],
	},
	"values-read-objects-through-chains": {
		appliesWhen:
			"구조분해로 객체에서 값을 꺼내는 줄을 추가·변경할 때. 객체 필드를 별칭 `const`에 담아 그 이름으로 쓰려 할 때. 제외: 배열이나 튜플을 자리로 푸는 경우.",
		reviewWith: ["functions-name-a-value-only-for-recompute-or-judgment"],
	},
	"values-declare-meaningful-numbers": {
		appliesWhen: "비교, 계산, 호출 인자에 숫자 리터럴을 새로 적을 때. 제외: 관용값이나 배열 인덱스처럼 뜻이 없는 숫자를 쓰는 경우.",
		reviewWith: [
			"naming-place-project-constants-in-the-root-constant-folder",
			"absence-expose-optional-values-instead-of-silent-fallbacks",
		],
	},
	"values-avoid-lookup-tables-for-simple-choices": {
		appliesWhen:
			"상태나 `variant`에 따라 쓸 값 하나를 고르는 객체·Map을 추가·변경할 때. 조회표의 키로 프롭이나 상태를 읽어 값을 넘기는 코드를 추가·변경할 때.",
		reviewWith: [],
	},
	"values-use-es-toolkit-for-value-helpers": {
		appliesWhen:
			"배열, 객체, 문자열, 숫자를 다루는 보조 코드를 추가·변경할 때. `reduce`, `Object.entries`, `Array.from`, 정규식으로 값을 다시 짜는 코드를 쓸 때. 제외: 표준 메서드 하나로 끝나는 경우.",
		reviewWith: ["values-prefer-immutable-array-sorting", "values-handle-dates-with-dayjs"],
	},
	"values-handle-dates-with-dayjs": {
		appliesWhen:
			"날짜를 파싱하거나 형식을 맞추거나 더하고 뺄 때. `new Date`, `getTime()`, `setDate()`, `toLocaleDateString()`을 쓸 때. 제외: 서버가 준 시각 문자열을 파싱 없이 그대로 보여주는 경우.",
		reviewWith: ["values-use-es-toolkit-for-value-helpers", "naming-place-project-constants-in-the-root-constant-folder"],
	},
	"values-decide-once-and-carry-the-result": {
		appliesWhen:
			"같은 입력에 같은 판정·정규화·포맷을 두 자리 이상에서 할 때. 포맷하거나 정리한 값을 소비처에서 다시 파싱하거나 정리할 때. 두 함수가 같은 판정 함수를 부르게 되어 공유 보조를 만들려 할 때.",
		reviewWith: ["functions-extract-helpers-only-when-the-boundary-is-real", "absence-resolve-defaults-at-the-boundary"],
	},
	"absence-expose-optional-values-instead-of-silent-fallbacks": {
		appliesWhen: "선택 값을 읽거나 정규화하거나 넘기는 방식을 바꿀 때. `??`, `||`, 기본값, 빈 값 대체 분기를 추가·변경할 때.",
		reviewWith: [
			"absence-resolve-defaults-at-the-boundary",
			"naming-place-project-constants-in-the-root-constant-folder",
			"naming-place-owner-constants-in-the-owner-constant-folder",
		],
	},
	"absence-resolve-defaults-at-the-boundary": {
		appliesWhen:
			"선택 값의 기본값을 어디서 채울지 정할 때. 같은 선택 값에 `??` 기본값 해소가 둘 이상의 사용처에 흩어질 때. search 스키마, 응답 매핑, 쿼리 `select`에 기본값 채움을 추가·변경할 때.",
		reviewWith: [
			"absence-expose-optional-values-instead-of-silent-fallbacks",
			"functions-name-a-value-only-for-recompute-or-judgment",
			"values-read-objects-through-chains",
		],
	},
	"absence-do-not-guard-what-types-guarantee": {
		appliesWhen:
			"`isNil`, `typeof`, 옵셔널 체이닝으로 값을 검사하는 분기를 추가·변경할 때. 선택 필드에 값을 넣으면서 `undefined`를 피하려고 조건부 스프레드를 쓸 때. 제외: `unknown`이나 앱 밖에서 온 값을 좁히는 경우.",
		reviewWith: [
			"types-narrow-unknown-instead-of-asserting",
			"absence-expose-optional-values-instead-of-silent-fallbacks",
			"absence-check-once-at-the-boundary",
		],
	},
	"absence-check-once-at-the-boundary": {
		appliesWhen:
			"`isNil`, `Number.isFinite` 같은 검사를 함수에 넣을 때. `null`, `undefined`, `unknown`을 매개변수·반환 타입에 넣거나 뺄 때. 응답 매핑·쿼리·search 스키마에서 없음·유한 수 검사로 타입을 좁힐 때.",
		reviewWith: [
			"absence-resolve-defaults-at-the-boundary",
			"absence-do-not-guard-what-types-guarantee",
			"values-decide-once-and-carry-the-result",
		],
	},
	"docs-keep-body-comments-for-intent-and-steps": {
		appliesWhen:
			"함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약, 부수효과 순서, 긴 절차의 단계를 주석으로 설명할 때.",
		reviewWith: ["docs-write-korean-comments-about-purpose-and-constraints", "docs-justify-convention-exceptions-with-a-reason-comment"],
	},
	"docs-require-header-jsdoc-on-key-declarations": {
		appliesWhen:
			"쿼리, 뮤테이션, 원격 함수, 커스텀 훅, 스토어, 포매터 선언을 추가·변경할 때. 분기나 `await`나 두 개 이상의 동작이 있는 핸들러와 이펙트를 추가·변경할 때. 다시 쓰거나 내보낸 보조 함수를 추가·변경할 때.",
		reviewWith: [],
	},
	"docs-write-korean-comments-about-purpose-and-constraints": {
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
		reviewWith: ["docs-write-korean-comments-about-purpose-and-constraints"],
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
		appliesWhen:
			"새 `scope_slug`를 만들거나 기존 식별자를 복사·이름 변경할 때. 하위 컴포넌트에 CSS 파일을 새로 만들면서 부모 식별자를 그대로 쓸 때.",
		reviewWith: [],
	},
	"ownership-choose-scope-prefix-by-owner-layer": {
		appliesWhen: "새 CSS 파일을 만들면서 `pg_`, `wg_`, `ui_` 중 하나를 고를 때. 소유자의 레이어가 바뀌어 접두사를 옮길 때.",
		reviewWith: ["ownership-give-each-file-one-scope-slug", "ownership-use-foreign-classes-only-under-your-own-root"],
	},
	"ownership-use-foreign-classes-only-under-your-own-root": {
		appliesWhen: "`.ant-*`, `.rc-*`, `.Mui-*` 같은 외부 라이브러리 클래스를 쓸 때. 다른 `scope_slug`의 클래스를 선택자로 잡을 때.",
		reviewWith: [
			"ownership-change-other-owners-through-their-api",
			"ownership-give-each-file-one-scope-slug",
			"selector-limit-nesting-block-depth",
		],
	},
	"ownership-change-other-owners-through-their-api": {
		appliesWhen: "다른 컴포넌트의 배치나 내부 모습을 바꿔야 할 때. 컴포넌트에 클래스 관련 프롭을 추가할 때.",
		reviewWith: ["ownership-use-foreign-classes-only-under-your-own-root", "composition-inject-classes-only-at-the-entry-point"],
	},
	"composition-compose-classes-with-clsx": {
		appliesWhen: "TSX의 `className`을 추가·수정할 때. 기본 클래스, 수정자, 선택 클래스를 함께 엮을 때.",
		reviewWith: ["composition-write-modifiers-as-conditions", "typescript/values-avoid-lookup-tables-for-simple-choices"],
	},
	"composition-do-not-build-structural-variants-with-modifiers": {
		appliesWhen: "수정자를 추가·변경할 때. 여러 곳에서 반복되는 모양인지 한 곳만의 보정인지 가릴 때.",
		reviewWith: ["naming-name-elements-and-modifiers-by-role"],
	},
	"composition-keep-classes-single-purpose": {
		appliesWhen:
			"상태를 나타내는 낱말이 들어간 요소 클래스 이름을 추가·변경할 때. 제외: 처음부터 기본 클래스와 수정자를 나눠 만드는 경우. 제외: 책임이 그대로인 이름 변경만 하는 경우.",
		reviewWith: [],
	},
	"composition-inject-classes-only-at-the-entry-point": {
		appliesWhen:
			"우리가 만든 컴포넌트에 `className`이나 클래스 관련 프롭을 추가할 때. 그 컴포넌트 내부 노드의 모양을 화면마다 다르게 해야 할 때. 제외: 기존 CSS 최상위 블록 아래 외부 라이브러리 선택자만 고치는 경우.",
		reviewWith: [
			"ownership-use-foreign-classes-only-under-your-own-root",
			"ownership-change-other-owners-through-their-api",
			"composition-do-not-add-wrapper-elements-for-styling",
		],
	},
	"composition-do-not-add-wrapper-elements-for-styling": {
		appliesWhen: "스타일을 주려고 `div`나 `span`을 새로 감쌀 때. `className`을 받지 않는 컴포넌트에 여백이나 크기를 줘야 할 때.",
		reviewWith: ["composition-inject-classes-only-at-the-entry-point", "naming-name-elements-and-modifiers-by-role"],
	},
	"composition-do-not-style-through-the-style-attribute": {
		appliesWhen: "TSX의 `style` 속성을 추가하거나 그 안의 선언을 바꿀 때. 컴포넌트 프롭으로 `style`을 받아 넘길 때.",
		reviewWith: [
			"composition-inject-classes-only-at-the-entry-point",
			"values-tokenize-repeated-visual-values",
			"values-fall-back-only-outside-core-tokens",
		],
	},
	"composition-write-modifiers-as-conditions": {
		appliesWhen:
			"값이나 `variant` 프롭으로 수정자를 고르는 `className`을 추가·변경할 때. 클래스 이름에 값을 끼워 넣는 템플릿 리터럴을 추가·변경할 때. 제외: 불리언 하나로 수정자가 붙거나 빠지는 경우.",
		reviewWith: ["composition-compose-classes-with-clsx", "typescript/values-avoid-lookup-tables-for-simple-choices"],
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
			"`:hover`, `:focus-visible`, `:disabled`, `:checked` 스타일을 추가·수정할 때. 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때. 상태 가상 클래스를 수정자 블록 안팎으로 옮길 때.",
		reviewWith: [
			"selector-limit-nesting-block-depth",
			"selector-use-pseudo-classes-for-dom-owned-states",
			"selector-do-not-group-classes-with-commas",
			"a11y-always-provide-a-visible-focus-indicator",
		],
	},
	"selector-do-not-negate-with-not": {
		appliesWhen: "선택자에 `:not()`을 넣으려 할 때. 기존 `:not()` 조건을 없애거나 긍정 조건으로 바꿀 때.",
		reviewWith: ["selector-use-pseudo-classes-for-dom-owned-states"],
	},
	"values-fall-back-only-outside-core-tokens": {
		appliesWhen: "`var(--*)`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때. 공통 토큰 목록에 항목을 넣거나 뺄 때.",
		reviewWith: ["values-tokenize-repeated-visual-values"],
	},
	"values-tokenize-repeated-visual-values": {
		appliesWhen: "여러 파일이 같은 색, 간격, 모서리 반경, 타이포그래피, 그림자 값을 쓸 때. 새 변수를 선언할 때.",
		reviewWith: ["values-fall-back-only-outside-core-tokens", "composition-do-not-style-through-the-style-attribute"],
	},
	"values-declare-stacking-layers-as-tokens": {
		appliesWhen: "`z-index`를 새로 넣거나 값을 바꿀 때. 겹쳐 뜨는 요소를 추가할 때.",
		reviewWith: ["layout-keep-layout-intent-explicit", "values-tokenize-repeated-visual-values"],
	},
	"values-switch-themes-by-changing-token-values": {
		appliesWhen:
			"다크 모드나 테마 전환을 넣을 때. 컴포넌트 CSS에 `prefers-color-scheme`이나 `[data-theme]`를 쓰려 할 때. 그림자나 `color-scheme`처럼 테마마다 달라지는 값을 추가·변경할 때.",
		reviewWith: ["values-fall-back-only-outside-core-tokens", "values-tokenize-repeated-visual-values", "values-name-tokens-by-purpose"],
	},
	"values-name-tokens-by-purpose": {
		appliesWhen:
			"색·그림자·간격·층 같은 디자인 토큰을 새로 만들거나 이름을 바꿀 때. 토큰 파일에 `white`, `gray-100`처럼 값을 말하는 이름을 넣거나 뺄 때.",
		reviewWith: ["values-tokenize-repeated-visual-values", "values-switch-themes-by-changing-token-values"],
	},
	"layout-group-breakpoints-at-the-file-bottom": {
		appliesWhen: "`@media` 브레이크포인트를 추가하거나 옮길 때. 화면 폭에 따라 값이 달라지는 선언을 넣을 때.",
		reviewWith: [
			"layout-write-breakpoints-desktop-first",
			"layout-reach-for-intrinsic-sizing-before-breakpoints",
			"selector-declare-each-class-in-one-block",
			"values-switch-themes-by-changing-token-values",
		],
	},
	"layout-write-breakpoints-desktop-first": {
		appliesWhen:
			"`@media` 조건을 쓰거나 브레이크포인트 숫자를 고를 때. `@media` 조건에 `min-width`나 `max-width` 표기를 쓸 때. 제외: `prefers-color-scheme` 같은 폭이 아닌 조건을 쓰는 경우.",
		reviewWith: ["layout-group-breakpoints-at-the-file-bottom", "tooling-configure-stylelint-to-enforce-these-rules"],
	},
	"layout-keep-layout-intent-explicit": {
		appliesWhen:
			"`sticky`·`fixed`, `z-index`, 부모·자식 레이아웃 책임을 추가·변경할 때. 로딩 대체 화면의 컨테이너나 높이를 정할 때. 제외: 같은 요소를 기본과 수정자로 나누면서 기존 `display`·여백 선언을 값 그대로 옮기는 경우.",
		reviewWith: ["values-declare-stacking-layers-as-tokens"],
	},
	"layout-reach-for-intrinsic-sizing-before-breakpoints": {
		appliesWhen:
			"`@media` 브레이크포인트를 새로 넣으려 할 때. 폭에 따라 줄바꿈, 열 개수, 크기가 달라져야 할 때. 컨테이너 폭에 따른 `@container` 배치 조건을 추가·변경할 때.",
		reviewWith: ["layout-keep-layout-intent-explicit", "layout-group-breakpoints-at-the-file-bottom"],
	},
	"a11y-always-provide-a-visible-focus-indicator": {
		appliesWhen:
			"`outline`, `:focus`, `:focus-visible` 스타일을 추가·수정할 때. 상호작용 요소의 기본 포커스 링을 덮어쓸 때. 강제 색상 모드에서 포커스 표시가 사라져 스타일을 보완할 때.",
		reviewWith: ["selector-nest-dom-state-in-the-owning-block"],
	},
	"a11y-namespace-keyframes-and-respect-reduced-motion": {
		appliesWhen:
			"`@keyframes` 이름이나 애니메이션 지속 시간, 지연 시간, 이징을 선언하거나 바꿀 때. `animation`, `transition`, `prefers-reduced-motion` 동작을 추가·변경할 때.",
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
		appliesWhen: "컴포넌트를 `ui`, `widget`, `page` 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때.",
		reviewWith: ["ownership-place-owner-files-in-role-folders", "css/ownership-choose-scope-prefix-by-owner-layer"],
	},
	"ownership-prefix-layer-names-on-files-and-symbols": {
		appliesWhen:
			"컴포넌트 파일이나 심볼 이름을 새로 지을 때. 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때. 부품이나 하위 소유자의 이름을 짓거나 바꿀 때.",
		reviewWith: ["ownership-layer-component-boundaries", "typescript/naming-use-consistent-file-and-symbol-naming"],
	},
	"ownership-place-owner-files-in-role-folders": {
		appliesWhen:
			"소유자 아래 `_constant`·`_function`·`_hook`·`_type` 폴더나 하위 소유자 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우.",
		reviewWith: ["ownership-keep-component-imports-flowing-downward", "css/ownership-choose-scope-prefix-by-owner-layer"],
	},
	"ownership-keep-component-imports-flowing-downward": {
		appliesWhen:
			"소유자 폴더 안의 컴포넌트 파일을 가져올 때. 다른 소유자나 다른 라우트의 파일을 가져오려 할 때. 여러 자식이 같은 컴포넌트를 써야 해서 배치를 다시 정할 때. 제외: 같은 소유자 안에서 `_function`·`_type`·`_constant`·`_hook` 파일을 가져오는 경우.",
		reviewWith: ["ownership-layer-component-boundaries"],
	},
	"ownership-prefer-plain-ts-for-local-react-helpers": {
		appliesWhen:
			"화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때. 화면 지역 함수에 `use` 접두사를 붙이거나 커스텀 훅 이름을 바꿀 때. 제외: 상태·컨텍스트·다른 훅 호출 순서를 실제로 캡슐화하는 경우.",
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
			"React Query 쿼리·뮤테이션 훅의 지역 바인딩을 추가하거나 이름을 바꿀 때. 쿼리나 뮤테이션 훅의 반환값을 새 지역 변수에 담을 때.",
		reviewWith: ["data-preserve-origin-chaining"],
	},
	"data-shape-query-data-with-select": {
		appliesWhen:
			"서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. React Query `select`의 결과 형태를 추가·변경할 때. 제외: 이미 가공한 항목을 `.map`으로 JSX 요소에 대응시키기만 하는 경우.",
		reviewWith: ["data-name-query-and-mutation-bindings-consistently", "data-preserve-origin-chaining"],
	},
	"data-combine-multiple-queries-with-combine": {
		appliesWhen:
			"쿼리 결과 둘 이상을 하나의 값으로 합치는 코드를 추가·변경할 때. 화면 본문에서 두 `data`를 꺼내 함께 계산하는 코드를 넣거나 뺄 때. 여러 쿼리의 병렬 실행과 앞 응답에 의존하는 순차 실행을 바꿀 때.",
		reviewWith: ["data-shape-query-data-with-select", "screen-keep-derived-values-close"],
	},
	"data-preserve-origin-chaining": {
		appliesWhen: "응답, 뮤테이션, 스토어에서 값을 꺼내 쓰는 코드를 추가·변경할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때.",
		reviewWith: ["screen-keep-derived-values-close", "data-shape-query-data-with-select"],
	},
	"data-handle-mutation-failure-where-it-is-called": {
		appliesWhen: "뮤테이션을 부르는 코드를 추가·변경할 때. `mutate`와 `mutateAsync` 사이를 오갈 때.",
		reviewWith: ["data-invalidate-queries-the-mutation-changed", "events-run-user-actions-in-handlers-not-effects"],
	},
	"data-invalidate-queries-the-mutation-changed": {
		appliesWhen:
			"뮤테이션 성공 뒤 서버 상태를 다시 맞추는 코드를 추가·변경할 때. 저장 결과를 캐시에 직접 쓰거나 `refetch`로 맞추는 코드를 넣을 때. 제외: 사용자 새로 고침 버튼이나 요청 전 낙관적 갱신만 바꾸는 경우.",
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
			"typing-open-dom-props-in-three-steps",
			"typing-take-handler-types-from-existing-contracts",
			"typing-choose-wrapper-shape-and-forwarding",
			"typescript/docs-justify-convention-exceptions-with-a-reason-comment",
		],
	},
	"typing-open-dom-props-in-three-steps": {
		appliesWhen:
			"래퍼 프롭스가 `HTMLAttributes`를 `extends` 하거나 그 상속을 뗄 때. 라이브러리 프롭과 DOM 프롭의 이름이 부딪혀 컴파일이 막힐 때. 제외: DOM 프롭이 아닌 표시 프롭만 더하거나 빼는 경우.",
		reviewWith: [
			"typing-narrow-library-wrapper-contracts",
			"css/composition-do-not-style-through-the-style-attribute",
			"typescript/types-reuse-existing-contracts-before-new-types",
		],
	},
	"typing-choose-wrapper-shape-and-forwarding": {
		appliesWhen: "래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가·변경할 때. 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때.",
		reviewWith: ["typescript/values-avoid-lookup-tables-for-simple-choices"],
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
		appliesWhen: "합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때.",
		reviewWith: ["strategy-choose-single-composition-compound-and-variants", "css/composition-do-not-add-wrapper-elements-for-styling"],
	},
	"strategy-avoid-boolean-prop-proliferation": {
		appliesWhen:
			"`ui`나 `widget` 컴포넌트에 불리언 모드·표시 프롭을 추가할 때. 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때. 제외: 라우트 진입 파일 안에서만 쓰는 일회성 분기인 경우. 제외: `disabled`·`checked` 같은 독립 상태 프롭만 여는 경우.",
		reviewWith: ["strategy-expose-only-assembled-compound-parts"],
	},
	"strategy-prefer-children-over-render-props": {
		appliesWhen:
			"공용 컴포넌트에 헤더·푸터·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때. `ReactNode` 슬롯이나 렌더 함수 계약에 이름을 붙이거나 바꿀 때.",
		reviewWith: [],
	},
	"composition-read-props-without-destructuring": {
		appliesWhen:
			"함수 컴포넌트의 시그니처나 본문에서 프롭스를 읽는 코드를 추가·변경할 때. 컴포넌트 안에서 `props`를 구조분해하는 줄을 넣거나 뺄 때.",
		reviewWith: ["screen-keep-derived-values-close", "data-preserve-origin-chaining", "typescript/values-read-objects-through-chains"],
	},
	"composition-do-not-define-components-inside-components": {
		appliesWhen:
			"컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 재마운트·포커스 초기화 징후를 다룰 때.",
		reviewWith: [],
	},
	"composition-named-handlers-over-inline": {
		appliesWhen:
			"TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 읽어도 의도가 안 보이는 상태 전환이 들어갈 때. 제외: 인자 없이 핸들러 참조만 넘기는 경우.",
		reviewWith: [
			"events-run-user-actions-in-handlers-not-effects",
			"events-curry-extra-handler-arguments",
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
		],
	},
	"composition-open-ref-props-only-for-imperative-contracts": {
		appliesWhen:
			"컴포넌트에 `ref` 프롭을 추가하거나 공개할 대상을 바꿀 때. `useImperativeHandle`로 노출하는 명령형 계약 타입을 만들거나 이름을 바꿀 때. 제외: DOM 요소를 그대로 가리키는 기존 `ref` 계약의 타입만 바꾸는 경우.",
		reviewWith: ["typing-narrow-library-wrapper-contracts", "typescript/docs-justify-convention-exceptions-with-a-reason-comment"],
	},
	"composition-use-activity-only-to-preserve-mounted-subtrees": {
		appliesWhen: "조건부 렌더링과 `Activity` 사이를 오갈 때. `<Activity>`를 추가·삭제하거나 `mode`를 계산하는 표현식을 바꿀 때.",
		reviewWith: ["composition-do-not-define-components-inside-components"],
	},
	"composition-declare-props-interface-above-the-component": {
		appliesWhen:
			"컴포넌트 프롭스 타입을 새로 선언할 때. 프롭스 타입의 위치나 공개 범위를 바꿀 때. 제외: 같은 파일에서만 쓰는 화면 지역 프롭스를 `export`하지 않는 경우.",
		reviewWith: ["composition-read-props-without-destructuring", "typescript/types-document-custom-types-and-shapes"],
	},
	"composition-name-fragments-explicitly": {
		appliesWhen: "JSX에서 여러 요소를 `Fragment`나 `<>`로 감싸는 문법을 추가·변경할 때. `Fragment`에 `key`를 붙이거나 떼어 낼 때.",
		reviewWith: [],
	},
	"composition-render-one-branch-with-and": {
		appliesWhen: "JSX 안에 조건부 렌더링을 추가하거나 조건식을 바꿀 때. 기존 JSX 삼항이나 `조건 && …`을 넣거나 뺄 때.",
		reviewWith: [],
	},
	"composition-order-hooks-handlers-effects-then-return": {
		appliesWhen: "컴포넌트 본문에 훅·핸들러·이펙트를 추가하거나 자리를 옮길 때. 본문 선언이 아래 선언을 참조해 순서를 다시 잡을 때.",
		reviewWith: ["screen-keep-derived-values-close", "events-run-user-actions-in-handlers-not-effects"],
	},
	"composition-split-owner-parts-only-for-runtime-boundaries": {
		appliesWhen:
			"위젯이나 ui 컴포넌트 안에서 JSX 일부를 별도 컴포넌트 파일로 떼거나 되돌릴 때. 제외: 라우트 진입 파일의 섹션을 나누는 경우.",
		reviewWith: [
			"screen-extract-local-section-components-for-runtime-boundaries",
			"ownership-place-owner-files-in-role-folders",
			"strategy-expose-only-assembled-compound-parts",
		],
	},
	"screen-keep-route-flow-visible": {
		appliesWhen:
			"라우트 진입의 search 파라미터, 화면 이동, 쿼리, 뮤테이션, 화면 전체 이펙트를 옮기거나 나눌 때. 화면 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우.",
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
		appliesWhen:
			"오류 경계를 추가하거나 옮길 때. 화면 본문에 `isError` 분기나 실패 대체 화면 반환을 넣을 때. 캐시가 있는 쿼리의 재조회 실패 처리나 오류 경계의 다시 시도 연결을 바꿀 때.",
		reviewWith: [],
	},
	"state-calculate-derived-values-during-render": {
		appliesWhen:
			"현재 프롭스, 상태, search 파라미터, 응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 파생값 동기화 이펙트를 제거할 때.",
		reviewWith: ["screen-keep-derived-values-close", "state-store-derived-authority"],
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
	"state-name-url-state-bindings-as-a-set": {
		appliesWhen:
			"라우트 search 파라미터를 읽거나 쓰는 바인딩을 추가·변경할 때. search 파라미터 파서 묶음을 만들거나 옮길 때. 제외: 서버 요청 쿼리·뮤테이션 바인딩만 바꾸는 경우.",
		reviewWith: ["state-choose-state-tools-by-source-of-truth"],
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
			"`useMemo`·`useCallback`을 추가하거나 제거할 때. `memo`로 컴포넌트를 감싸거나 벗길 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때.",
		reviewWith: ["perf-defer-heavy-renders-with-measured-evidence"],
	},
	"perf-use-lazy-state-initializers-for-expensive-defaults": {
		appliesWhen:
			"`useState` 초기값에 `localStorage` 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용이 큰 계산을 넣을 때. 제외: 숫자·문자열 같은 단순 값이나 프롭을 그대로 초기값에 넣는 경우.",
		reviewWith: ["perf-avoid-defensive-memoization"],
	},
	"perf-defer-heavy-renders-with-measured-evidence": {
		appliesWhen:
			"`startTransition`·`useTransition`·`useDeferredValue`를 추가·삭제할 때. 목록이나 표가 커져 입력 반응이 늦다는 보고를 받았을 때.",
		reviewWith: ["perf-avoid-defensive-memoization"],
	},
	"a11y-give-interactive-elements-an-accessible-name": {
		appliesWhen: "클릭이나 입력을 받는 요소를 추가·변경할 때. 글자 없이 아이콘만 있는 버튼을 추가할 때.",
		reviewWith: [],
	},
	"docs-require-jsdoc-on-key-declarations": {
		appliesWhen:
			"쿼리·뮤테이션이나 읽어도 의도가 안 보이는 핸들러·이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때.",
		reviewWith: ["typescript/types-document-custom-types-and-shapes"],
	},
	"docs-write-jsx-comments-as-multiline-blocks": {
		appliesWhen:
			"JSX 자식 자리에 주석을 새로 쓰거나 기존 주석의 형식을 바꿀 때. 화면을 구역으로 나누고 그 구역이 무엇을 담당하는지 적을 때. JSX에 여러 줄로 펼쳐진 형제 블록을 새로 만들거나 나눌 때.",
		reviewWith: [
			"typescript/docs-write-doc-comments-as-multiline-blocks",
			"typescript/docs-write-korean-comments-about-purpose-and-constraints",
		],
	},
	"tooling-enable-the-biome-react-domain": {
		appliesWhen:
			"프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json`의 `linter.domains`나 `linter.rules`에 항목을 추가·삭제할 때.",
		reviewWith: [],
	},
} as const;

/**
 * @summary 조건부 reviewWith와 달리 Selected가 반드시 닫혀야 하는 exact routing oracle
 */
const mandatoryRuleRouting = {
	react: {
		"ownership-keep-component-imports-flowing-downward": ["typescript/naming-import-by-absolute-path"],
		"data-name-query-and-mutation-bindings-consistently": [
			"typescript/naming-use-consistent-file-and-symbol-naming",
			"docs-require-jsdoc-on-key-declarations",
		],
		"data-shape-query-data-with-select": ["docs-require-jsdoc-on-key-declarations"],
		"typing-take-handler-types-from-existing-contracts": ["typescript/types-prefer-function-variable-types-over-parameter-annotations"],
		"typing-choose-wrapper-shape-and-forwarding": ["typing-narrow-library-wrapper-contracts"],
		"composition-named-handlers-over-inline": ["docs-require-jsdoc-on-key-declarations"],
		"runtime-place-suspense-boundaries-at-the-section-owner": ["runtime-avoid-ad-hoc-loading-branches"],
		"runtime-place-error-boundaries-by-blast-radius": ["runtime-place-suspense-boundaries-at-the-section-owner"],
		"state-name-url-state-bindings-as-a-set": ["typescript/naming-place-owner-constants-in-the-owner-constant-folder"],
		"events-curry-extra-handler-arguments": ["typing-take-handler-types-from-existing-contracts"],
		"docs-require-jsdoc-on-key-declarations": ["typescript/docs-require-header-jsdoc-on-key-declarations"],
	},
	typescript: {
		"types-document-custom-types-and-shapes": [
			"docs-write-korean-comments-about-purpose-and-constraints",
			"docs-write-doc-comments-as-multiline-blocks",
		],
		"types-replace-enum-with-as-const-objects": ["naming-use-consistent-file-and-symbol-naming", "types-document-custom-types-and-shapes"],
		"naming-place-owner-constants-in-the-owner-constant-folder": ["naming-use-consistent-file-and-symbol-naming"],
		"functions-give-each-function-its-own-file": ["functions-extract-helpers-only-when-the-boundary-is-real"],
		"values-avoid-lookup-tables-for-simple-choices": ["docs-justify-convention-exceptions-with-a-reason-comment"],
		"docs-require-header-jsdoc-on-key-declarations": [
			"docs-write-korean-comments-about-purpose-and-constraints",
			"docs-write-doc-comments-as-multiline-blocks",
		],
	},
	css: {"selector-use-pseudo-classes-for-dom-owned-states": ["selector-nest-dom-state-in-the-owning-block"]},
} as const;

const completionGateRouting = {react: [], typescript: [], css: []} as const;

/**
 * @summary Appendix A scenario별 initial exact selected rule oracle
 */
const typescriptSelections = {
	"root-constant-existing-source": [
		"naming-place-project-constants-in-the-root-constant-folder",
		"naming-place-owner-constants-in-the-owner-constant-folder",
		"naming-use-consistent-file-and-symbol-naming",
		"naming-use-direct-imports-and-public-entry-points",
		"naming-import-by-absolute-path",
		"naming-read-environment-values-through-config-env",
		"values-declare-meaningful-numbers",
	],
	"callback-contract-implementation": [
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-mark-unused-parameters-with-underscore",
		"naming-use-consistent-file-and-symbol-naming",
	],
	"derive-existing-contract-with-docs": [
		"types-reuse-existing-contracts-before-new-types",
		"types-derive-subsets-with-indexed-access",
		"types-document-custom-types-and-shapes",
		"types-narrow-unknown-instead-of-asserting",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	],
	"type-declaration-form": [
		"types-document-custom-types-and-shapes",
		"types-choose-interface-for-object-contracts-and-type-for-composition",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	],
	"type-role-and-lifetime": [
		"types-document-custom-types-and-shapes",
		"naming-use-consistent-file-and-symbol-naming",
		"naming-name-types-by-role-and-lifetime",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	],
	"helper-boundary-scope-drift": [
		"naming-use-consistent-file-and-symbol-naming",
		"functions-extract-helpers-only-when-the-boundary-is-real",
		"functions-give-each-function-its-own-file",
		"functions-order-declarations-top-down",
		"functions-name-functions-by-what-comes-out",
	],
	"shared-collection-lookups-and-sort": ["values-prefer-immutable-array-sorting", "values-use-set-and-map-for-repeated-lookups"],
	"hand-rolled-collection-helpers": [
		"naming-use-direct-imports-and-public-entry-points",
		"values-use-es-toolkit-for-value-helpers",
		"values-handle-dates-with-dayjs",
	],
	"local-value-lookup": [
		"naming-use-consistent-file-and-symbol-naming",
		"values-avoid-lookup-tables-for-simple-choices",
		"docs-justify-convention-exceptions-with-a-reason-comment",
	],
	"enum-like-runtime-contract": [
		"types-document-custom-types-and-shapes",
		"types-replace-enum-with-as-const-objects",
		"naming-use-consistent-file-and-symbol-naming",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
		"tooling-configure-biome-to-enforce-these-rules",
	],
	"wide-scope-assembly": ["functions-avoid-imperative-assembly-in-wide-scopes", "functions-name-a-value-only-for-recompute-or-judgment"],
	"named-object-param": [
		"naming-use-consistent-file-and-symbol-naming",
		"functions-declare-functions-as-arrow-consts",
		"functions-use-named-object-params-for-complex-signatures",
		"values-read-objects-through-chains",
	],
	"explicit-product-fallback": [
		"absence-expose-optional-values-instead-of-silent-fallbacks",
		"absence-resolve-defaults-at-the-boundary",
		"docs-keep-body-comments-for-intent-and-steps",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-justify-convention-exceptions-with-a-reason-comment",
	],
	"decide-once-and-guard-real-absence": [
		"values-decide-once-and-carry-the-result",
		"absence-expose-optional-values-instead-of-silent-fallbacks",
		"absence-do-not-guard-what-types-guarantee",
	],
	"check-absence-once-across-helpers": [
		"values-decide-once-and-carry-the-result",
		"absence-do-not-guard-what-types-guarantee",
		"absence-check-once-at-the-boundary",
	],
	"internal-satisfies-is-not-a-runtime-assertion": [],
	"runtime-json-needs-validation-despite-satisfies": ["types-narrow-unknown-instead-of-asserting"],
	"fixed-short-membership-near-miss": [],
	"two-direct-lookups-near-miss": [],
	"optional-presence-contract-keeps-omission": [
		"absence-expose-optional-values-instead-of-silent-fallbacks",
		"absence-do-not-guard-what-types-guarantee",
	],
	"readonly-optional-derived-write-type": [
		"types-derive-subsets-with-indexed-access",
		"types-document-custom-types-and-shapes",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	],
	"elapsed-time-preserves-hours": ["values-handle-dates-with-dayjs"],
	"external-response-key-preservation": [
		"types-document-custom-types-and-shapes",
		"naming-use-consistent-file-and-symbol-naming",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	],
	"narrow-library-field-with-extract": ["types-reuse-existing-contracts-before-new-types", "types-derive-subsets-with-indexed-access"],
} as const;

/**
 * @summary Appendix A scenario별 exact prompt와 file evidence oracle
 */
const typescriptScenarioEvidence = {
	"root-constant-existing-source": {
		prompt:
			"`billing-request.ts` and `audit-request.ts` duplicate URL/page-size constants, write a retry threshold inline, and read `import.meta.env` directly; move the constants into flat `constant/<topic>.ts` files, read the environment value through `config/env.ts`, and import each name directly.",
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
	"type-declaration-form": {
		prompt:
			"replace an existing `type ProductSummary = {...}` with an `interface` because it is an independent field contract, and replace an object-shaped `interface ProductMode` with a literal-union `type`; keep both names, fields, imports, and docs unchanged.",
		files: ["src/products/product-contracts.ts"],
	},
	"type-role-and-lifetime": {
		prompt:
			"rename the owner-local `SalesReportViewModel` interface and its `salesReportViewModel` value to `ReportSnapshot` and `reportSnapshot` because they freeze rows, filters, and pagination from one query; keep fields, imports, and docs unchanged.",
		files: ["src/report/report-panel.ts"],
	},
	"helper-boundary-scope-drift": {
		prompt:
			"inline the single-use `mapProfileRow` sub-step into the exported builder body in `profile-api.ts` with a step comment, and rename that builder by its result.",
		files: ["src/profile/profile-api.ts"],
	},
	"shared-collection-lookups-and-sort": {
		prompt:
			"replace `includes` inside a products.filter callback over a server-sized list with an existing Set's `has` and replace shared-input `.sort()` with es-toolkit `sortBy`; declarations, imports, and docs stay unchanged.",
		files: ["src/search/filter-products.ts"],
	},
	"hand-rolled-collection-helpers": {
		prompt:
			"replace an index-comparison de-duplication, a `reduce` grouping, and a `new Date` millisecond offset in `owner-summary.ts` with `uniq`, `groupBy`, and `dayjs`; exported names, types, and docs stay unchanged.",
		files: ["src/owner/owner-summary.ts"],
	},
	"local-value-lookup": {
		prompt:
			"replace a one-use toolbar variant lookup object with a conditional value at the call site; leave the prop contract, imports, and docs unchanged.",
		files: ["src/chart/to-toolbar-variant.ts"],
	},
	"enum-like-runtime-contract": {
		prompt:
			"replace `enum ProductStatus` with `product_status as const`, include a multiword `waiting_review` member, derive `ProductStatus`, and document the object and derived type in Korean without per-key comments.",
		files: ["src/audit/audit-status.ts"],
	},
	"wide-scope-assembly": {
		prompt:
			"replace an existing top-level `let` plus conditional `push` flow with a declarative calculation assigned to the same `visibleTabs` name and inline the single-use intermediate const; imports and docs stay unchanged.",
		files: ["src/navigation/visible-tabs.ts"],
	},
	"named-object-param": {
		prompt:
			"change a function that destructures `BuildRequestUrlArgs` in the signature to accept `args` and read every field through `args.*`; no other contract/docs/import changes.",
		files: ["src/http/to-request-url.ts"],
	},
	"explicit-product-fallback": {
		prompt:
			"replace an ungrounded optional page-size `??` literal with a reference to the declared config default and a Korean constraint comment; helper/header boundaries stay unchanged.",
		files: ["src/search/resolve-page-size.ts"],
	},
	"decide-once-and-guard-real-absence": {
		prompt:
			"`pg-pattern.tsx` formats `avgCorr` while building `SelectionInfo` and `to-metrics-content.ts` formats the same field again; read the carried value instead, replace `...(isNil(tamValidity) ? {} : {tamValidity})` with a plain optional field, and drop the `isNil` check on the non-null `name` field. The internal display contract permits explicit undefined and no consumer distinguishes key presence; tamValidity cannot be null.",
		files: ["src/page/pattern/pg-pattern.tsx", "src/page/pattern/_function/to-metrics-content.ts"],
	},
	"check-absence-once-across-helpers": {
		prompt:
			"`to-signed-tone.ts` and `format-signed-percent.ts` each re-check `isNil` and `Number.isFinite` on `changeRate` that `pg-detail.tsx` already narrows in `select`; take `number` in the helpers, keep the single `isNotNil` check where the badge is rendered, and drop the repeated guards.",
		files: [
			"src/page/detail/pg-detail.tsx",
			"src/page/detail/_function/to-badge/_to-signed-tone.ts",
			"src/page/detail/_function/format-signed-percent.ts",
		],
	},
	"internal-satisfies-is-not-a-runtime-assertion": {
		prompt:
			"Add only `satisfies ExistingRequest` to an inline object literal passed directly to an existing internal function. The object contains validated internal values, is not a module constant or named shape, and neither its properties nor any declaration form, import, or comment changes.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"runtime-json-needs-validation-despite-satisfies": {
		prompt:
			"In an existing response boundary, replace `return JSON.parse(text) satisfies ExistingRecord` with `return existingRecordSchema.parse(JSON.parse(text))`; imports, names, signatures, and comments already exist and stay unchanged. The input is untrusted JSON and the boundary already propagates parse failures.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"fixed-short-membership-near-miss": {
		prompt:
			"Change only the inline argument of an existing `editable_statuses.includes(...)` call from one existing status property to another. The immutable status list has exactly five entries and the check runs once. No declaration, name, import, comment, or contract changes.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"two-direct-lookups-near-miss": {
		prompt:
			"Replace the predicate in each of two existing direct `users.find(...)` calls, outside every loop or array callback. There are only these two lookup sites. No function declaration, variable, import, type, comment, or fallback is added or changed.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"optional-presence-contract-keeps-omission": {
		prompt:
			"Adjust only an existing optional-field object construction in a function return so a key is omitted when its input is undefined. The receiving in-memory patch contract uses Object.hasOwn to distinguish an omitted key from an explicit undefined. The target property is optional, compiler settings are unchanged, and the existing reason comment already documents that contract. Reuse the existing shouldOmit decision without adding or changing any absence predicate.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"readonly-optional-derived-write-type": {
		prompt:
			'In an existing documented UserPreview interface, change only `name?: UserRecord["name"]` to `name?: Required<UserRecord>["name"]` while preserving `readonly id`. exactOptionalPropertyTypes is already enabled and the original UserRecord.name?: string forbids writing undefined. Keep the name, original field contract, and existing Korean documentation.',
		files: ["src/contracts/value-boundary.ts"],
	},
	"elapsed-time-preserves-hours": {
		prompt:
			"Change only an existing dayjs addition from a millisecond expression to the equivalent declared expiryHours in hour units. The contract is exactly that elapsed duration, including across daylight-saving transitions. Keep the existing variable, constants, imports, types, and comments.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"external-response-key-preservation": {
		prompt:
			"Replace only an incorrect property spelling in an existing response schema to match an API-owned snake_case key. The schema name, value validators, imports, and existing Korean documentation are unchanged. Do not rename API keys into our internal style.",
		files: ["src/contracts/value-boundary.ts"],
	},
	"narrow-library-field-with-extract": {
		prompt:
			"In the existing chart axis contract, replace `min?: number` and `max?: number` with `Extract<ValueAxisOption['min'], number>` derived from the library axis option type, and type the dataZoom range fields as `NonNullable<DataZoomComponentOption['start']>` instead of restating `number`. Keep field names, optionality, and the existing Korean field comments unchanged.",
		files: ["src/component/ui/chart/_type/chart-axis.ts", "src/component/ui/chart/_type/data-zoom-range.ts"],
	},
} as const;

/**
 * @summary Appendix B와 D의 React scenario별 exact stage oracle
 */
const reactScenarioStages = {
	"RTE01-import-contract-cleanup": {
		initial: {
			prompt:
				"rename UserCard.tsx to user-card.tsx, remove index.ts barrel, replace React.MouseEvent and a duplicate API view type with existing contracts in src/component/ui/user-card/ui-user-card.tsx and src/component/ui/index.ts.",
			files: ["src/component/ui/user-card/ui-user-card.tsx", "src/component/ui/index.ts"],
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE02-owner-placement-css-drift": {
		initial: {
			prompt:
				"move a route-only tree renderer from shared UI to src/page/products/_pg-product-tree.tsx and rename it as owner-private; carry its existing className and style import through unchanged and make no styling change.",
			files: ["src/component/ui/product-tree/ui-product-tree.tsx", "src/page/products/_pg-product-tree.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-prefix-layer-names-on-files-and-symbols",
					"ownership-place-owner-files-in-role-folders",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
		scopeDrift: {
			evidence:
				"in a project without a CSS Modules standard, add directly imported src/page/products/_pg-product-tree.css, create owner-unique pg_* role-named classes, and compose the changed className contract with the existing direct clsx import; final skills add CSS with no additional React rule.",
			files: [
				"src/component/ui/product-tree/ui-product-tree.tsx",
				"src/page/products/_pg-product-tree.tsx",
				"src/page/products/_pg-product-tree.css",
			],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-prefix-layer-names-on-files-and-symbols",
					"ownership-place-owner-files-in-role-folders",
				],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-name-elements-and-modifiers-by-role",
					"naming-keep-page-slug-traceable",
					"ownership-give-each-file-one-scope-slug",
					"ownership-choose-scope-prefix-by-owner-layer",
					"ownership-use-foreign-classes-only-under-your-own-root",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"selector-nest-dom-state-in-the-owning-block",
				],
			},
		},
	},
	"RTE03-route-support-extraction": {
		initial: {
			prompt:
				"move one real four-argument multi-line payload boundary out of src/page/products/pg-products.tsx into src/page/products/_function/to-product-save-request.ts; do not create a hook, generic utils file, or helper soup.",
			files: ["src/page/products/pg-products.tsx", "src/page/products/_function/to-product-save-request.ts"],
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE04-root-constant": {
		initial: {
			prompt:
				"move a duplicated menu key set and default page size from two screens into documented flat constants in src/constant/navigation.ts and src/constant/pagination.ts and import each name directly from both route pages.",
			files: [
				"src/page/products/pg-products.tsx",
				"src/page/reports/pg-reports.tsx",
				"src/constant/navigation.ts",
				"src/constant/pagination.ts",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [],
				typescript: [
					"types-document-custom-types-and-shapes",
					"types-replace-enum-with-as-const-objects",
					"naming-place-project-constants-in-the-root-constant-folder",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE05-toolbar-composition": {
		initial: {
			prompt:
				"replace compact/edit/search/focus booleans and static render props on wg-product-toolbar.tsx with stateless compound parts plus repeated explicit variants, give the icon-only buttons accessible names, and document public parts.",
			files: ["src/component/widget/product-toolbar/wg-product-toolbar.tsx"],
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE06-nested-forwardref": {
		initial: {
			prompt:
				"hoist an existing nested forwardRef search input that resets focus to module scope, convert it to a React 19 ref prop, and narrow UiSearchCardProps so it extends the element-specific HTMLAttributes and opens only the library props in use in ui-search-card.tsx.",
			files: ["src/component/ui/search-card/ui-search-card.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"typing-narrow-library-wrapper-contracts",
					"typing-open-dom-props-in-three-steps",
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
					"docs-write-korean-comments-about-purpose-and-constraints",
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE09-route-runtime-section": {
		initial: {
			prompt:
				'extract only the tree section that owns local search and expanded state plus a tree adapter into the owner component folder, implement a named selection handler from UiTreeProps["onSelect"], mark the remaining page sections in JSX, and keep section assembly, Suspense boundaries, and route navigation decisions visible at the route entry while the section owns its data and interaction.',
			files: ["src/page/products/pg-products.tsx", "src/page/products/_pg-product-tree-section.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-owner-files-in-role-folders",
					"typing-take-handler-types-from-existing-contracts",
					"composition-read-props-without-destructuring",
					"screen-keep-route-flow-visible",
					"screen-avoid-premature-abstraction",
					"screen-extract-local-section-components-for-runtime-boundaries",
					"runtime-place-suspense-boundaries-at-the-section-owner",
					"runtime-avoid-ad-hoc-loading-branches",
					"events-name-handlers-predictably",
					"docs-require-jsdoc-on-key-declarations",
					"docs-write-jsx-comments-as-multiline-blocks",
				],
				typescript: [
					"types-reuse-existing-contracts-before-new-types",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-document-custom-types-and-shapes",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"absence-expose-optional-values-instead-of-silent-fallbacks",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE10-derived-selection-state": {
		initial: {
			prompt:
				'extract the inline domain selection callback as a named handleSelectionToggle handler typed from UiListProps["onSelect"], replace selectedIds-derived count and flag effect+state synchronization with render calculation near use, and use a functional updater; the callback receives an ID value, not a DOM event, and needs no curried arguments. Do not change navigation or styling.',
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
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-prefer-function-variable-types-over-parameter-annotations",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
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
					"docs-write-korean-comments-about-purpose-and-constraints",
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE13-heavy-search": {
		initial: {
			prompt:
				"for a 50k-row search, directly import newly used React hooks, use lazy initialization, urgent input plus deferred result, a non-urgent category transition, and only evidence-backed memoization; update the constraint comment.",
			files: ["src/page/products/_pg-product-search.tsx"],
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
					"docs-write-korean-comments-about-purpose-and-constraints",
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
			files: ["src/page/products/_pg-product-socket.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"composition-order-hooks-handlers-effects-then-return",
					"state-use-effectevent-for-non-reactive-effect-callbacks",
					"events-name-handlers-predictably",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-prefer-function-variable-types-over-parameter-annotations",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-justify-convention-exceptions-with-a-reason-comment",
				],
			},
		},
	},
	"RTE16-private-component-import-direction": {
		initial: {
			prompt:
				"two sibling files under src/page/detail/sales-trend-panel/ import each other's legend row through ../; make the panel own the shared legend row and pass it down as an element prop, and remove the sibling and @/page component imports.",
			files: [
				"src/page/detail/sales-trend-panel/pg-sales-trend-panel.tsx",
				"src/page/detail/sales-trend-panel/_pg-detection-section.tsx",
				"src/page/detail/sales-trend-panel/_pg-summary-band.tsx",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-place-owner-files-in-role-folders",
					"ownership-keep-component-imports-flowing-downward",
					"strategy-prefer-children-over-render-props",
				],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "naming-import-by-absolute-path"],
			},
		},
	},
	"RTE17-chart-lifecycle-ownership": {
		initial: {
			prompt:
				"the ECharts init, resize listener, and dispose currently sit in src/component/widget/chart/_hook/use-chart-instance.ts only to shorten the component; fold that lifecycle back into the owning chart root and leave the domain option builder in function/.",
			files: [
				"src/component/widget/chart/chart-root/wg-chart-root.tsx",
				"src/component/widget/chart/_hook/use-chart-instance.ts",
				"src/component/widget/chart/_function/to-chart-option.ts",
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
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"RTE18-url-state-naming": {
		initial: {
			prompt:
				"move the product list page's inline URL param parser map into src/page/products/_constant/product-list-url-parsers.ts as productListUrlParsers, rename the parsed binding pair to urlParams/setUrlParams, keep the raw URLSearchParams builder named searchParams, and leave the server query and mutation bindings unchanged.",
			files: ["src/page/products/pg-products.tsx", "src/page/products/_constant/product-list-url-parsers.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: ["state-name-url-state-bindings-as-a-set"],
				typescript: [
					"types-document-custom-types-and-shapes",
					"naming-place-owner-constants-in-the-owner-constant-folder",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"react-biome-domain-setup": {
		initial: {
			prompt:
				"add the react domain to the existing biome config and enable the nested-component rule that the domain leaves off; do not touch any component file.",
			files: ["biome.json"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: ["tooling-enable-the-biome-react-domain"], typescript: ["tooling-configure-biome-to-enforce-these-rules"]},
		},
	},
	"react-activity-preserve-draft": {
		initial: {
			prompt:
				"Replace only the conditional rendering around the existing sidebar with Activity controlled by the existing isSidebarOpen state, preserving the sidebar draft and DOM when hidden; import Activity directly. Keep effects, handlers, component declarations, and styles unchanged.",
			files: ["src/page/products/pg-products.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: ["composition-use-activity-only-to-preserve-mounted-subtrees", "composition-render-one-branch-with-and"],
				typescript: ["naming-use-direct-imports-and-public-entry-points"],
			},
		},
	},
	"react-query-jsx-map-near-miss": {
		initial: {
			prompt:
				"Replace only UiProductList receiving responseProductListSuspense.data.items with a direct items.map that renders an h3 keyed by item.id and displaying item.label. The query select already provides the final items; do not reshape data, alter the query declaration, introduce aliases, or change styles.",
			files: ["src/page/products/_pg-product-list-section.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: ["data-preserve-origin-chaining"], typescript: []},
		},
	},
	"react-user-refresh-near-miss": {
		initial: {
			prompt:
				"Replace only the existing named refresh handler body with void responseProductListSuspense.refetch() for the user refresh button. There is no mutation or cache-writing change; preserve the handler name, type, comment, and JSX.",
			files: ["src/page/products/_pg-product-list-section.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: ["data-preserve-origin-chaining"], typescript: []},
		},
	},
	"react-independent-disabled-prop-near-miss": {
		initial: {
			prompt:
				"On an existing UiButton usage change only disabled={false} to disabled={true}. Keep its visible text, type, existing click handler, className, wrapper implementation, and props declarations unchanged.",
			files: ["src/page/products/_pg-product-toolbar.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: ["a11y-give-interactive-elements-an-accessible-name"], typescript: []},
		},
	},
	"react-suspense-dependent-query": {
		initial: {
			prompt:
				"Change the existing query declarations so the second Suspense query waits for the first response ID, using the already imported useSuspenseQuery in order instead of enabled. Preserve binding names, render code, handlers, and boundaries; update the query JSDoc to describe the dependency.",
			files: ["src/page/products/_pg-product-detail-section.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: ["data-combine-multiple-queries-with-combine", "data-preserve-origin-chaining", "docs-require-jsdoc-on-key-declarations"],
				typescript: [
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
			},
		},
	},
	"react-suspense-cached-refetch-error": {
		initial: {
			prompt:
				"The existing Suspense query has cached data, but this confirmation screen must stop showing stale recommendations after a failed refetch. Add only a render-time error check that throws the existing query error after isFetching is false, using the existing ancestor boundaries. Keep the query declaration, hooks, JSX, and comments unchanged.",
			files: ["src/page/products/_pg-product-recommendation-section.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"data-preserve-origin-chaining",
					"runtime-place-suspense-boundaries-at-the-section-owner",
					"runtime-avoid-ad-hoc-loading-branches",
					"runtime-place-error-boundaries-by-blast-radius",
				],
				typescript: [],
			},
		},
	},
	"react-widget-part-split-and-private-part-naming": {
		initial: {
			prompt:
				"In the chatbot widget, move the `_wg-chatbot-content.tsx` part that only reads context and picks a branch back into `wg-chatbot.tsx`, rename the private header part `_wg-header.tsx`/`WgHeader` to `_wg-chatbot-header.tsx`/`WgChatbotHeader` so the owner name is carried, and put a multiline block comment above each multi-line JSX block in the entry file. Keep behavior, props, and hooks unchanged.",
			files: [
				"src/component/widget/chatbot/wg-chatbot.tsx",
				"src/component/widget/chatbot/_wg-chatbot-content.tsx",
				"src/component/widget/chatbot/_wg-header.tsx",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-prefix-layer-names-on-files-and-symbols",
					"ownership-place-owner-files-in-role-folders",
					"composition-split-owner-parts-only-for-runtime-boundaries",
					"docs-write-jsx-comments-as-multiline-blocks",
				],
				typescript: ["naming-use-consistent-file-and-symbol-naming"],
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
					"ownership-choose-scope-prefix-by-owner-layer",
					"composition-compose-classes-with-clsx",
				],
			},
		},
	},
	"css-owner-boundary-split": {
		initial: {
			prompt:
				"pg-post-index.css holds both the page shell and the filter dialog; move the dialog styles into the component own CSS file and give that file its own slug.",
			files: ["src/page/post-index/pg-post-index.css", "src/page/post-index/_pg-post-filter-dialog.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"naming-use-scope-slug-element-modifier-syntax",
					"naming-keep-page-slug-traceable",
					"ownership-give-each-file-one-scope-slug",
					"ownership-choose-scope-prefix-by-owner-layer",
				],
			},
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
	"css-value-driven-modifier": {
		initial: {
			prompt:
				"pick the metricValue modifier from the four-value tone in pg-sales-trend-panel.tsx where the stylesheet defines --positive and --negative only; keep the existing clsx import and stylesheet.",
			files: ["src/page/detail/sales-trend-panel/pg-sales-trend-panel.tsx"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: [],
				css: [
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"composition-write-modifiers-as-conditions",
				],
			},
		},
	},
	"css-ui-wrapper-third-party-dom": {
		initial: {
			prompt:
				"add a direct clsx import and style UiCollapse Ant DOM from a new owned wrapper with the shortest chain in post-filter-dialog.tsx and post-filter-dialog.css; keep the existing hard-coded wrapper color.",
			files: ["src/page/post-index/_pg-post-filter-dialog.tsx", "src/page/post-index/_pg-post-filter-dialog.css"],
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
			files: ["src/page/post-index/_pg-post-filter-dialog.tsx", "src/page/post-index/_pg-post-filter-dialog.css"],
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
					"values-fall-back-only-outside-core-tokens",
				],
			},
		},
	},
	"css-ui-wrapper-root-prop-contract": {
		initial: {
			prompt:
				"narrow UiButtonProps so it extends ButtonHTMLAttributes and opens only the library props we use, expose it documented, read props through the props object in ui-button.tsx, and pass an existing layout class from order-actions.tsx; add no internal selector or new class.",
			files: ["src/component/ui/button/ui-button.tsx", "src/page/order-index/_pg-order-actions.tsx"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [
					"typing-narrow-library-wrapper-contracts",
					"typing-open-dom-props-in-three-steps",
					"typing-choose-wrapper-shape-and-forwarding",
					"composition-read-props-without-destructuring",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"types-reuse-existing-contracts-before-new-types",
					"types-document-custom-types-and-shapes",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-korean-comments-about-purpose-and-constraints",
					"docs-write-doc-comments-as-multiline-blocks",
				],
				css: ["composition-compose-classes-with-clsx", "composition-inject-classes-only-at-the-entry-point"],
			},
		},
	},
	"css-wrapper-element-for-spacing": {
		initial: {
			prompt:
				"Remove a div that wraps UiCollapse only for spacing and move its existing className onto UiCollapse, whose existing root already forwards className. Keep class names, CSS declarations, prop types, imports, and the component implementation unchanged.",
			files: ["src/component/ui/collapse/ui-collapse.tsx", "src/page/post-index/_pg-post-filter-dialog.tsx"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: [],
				css: [
					"composition-compose-classes-with-clsx",
					"composition-inject-classes-only-at-the-entry-point",
					"composition-do-not-add-wrapper-elements-for-styling",
				],
			},
		},
	},
	"css-rich-text-owner-block": {
		initial: {
			prompt:
				"move top-level .wg_productDetail__prose h2 and > :first-child into the existing owner block; the body comes from dangerouslySetInnerHTML so classes cannot be added.",
			files: ["src/component/widget/product-detail/wg-product-detail.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-limit-nesting-block-depth", "selector-use-classes-instead-of-element-selectors"]},
		},
	},
	"css-dom-interaction-states": {
		initial: {
			prompt:
				"move top-level hover/focus/disabled into the same class block's &: nesting and preserve the focus ring; no app modifier or value is added.",
			files: ["src/component/ui/button/ui-button.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-use-pseudo-classes-for-dom-owned-states",
					"selector-nest-dom-state-in-the-owning-block",
					"a11y-always-provide-a-visible-focus-indicator",
				],
			},
		},
	},
	"css-repeated-values-and-optional-token": {
		initial: {
			prompt:
				"Scope a global .ant-tree selector under the existing .ui_themePreview owner root with one new descendant block. Replace color and spacing repeated across files with existing global core tokens, and consume an optional Ant border-radius variable with a fallback. Keep file and owner names unchanged. Also namespace the existing fade keyframes and add the global reduced-motion block. Do not add DOM state selectors.",
			files: ["src/component/ui/theme-preview/ui-theme-preview.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"ownership-use-foreign-classes-only-under-your-own-root",
					"selector-limit-nesting-block-depth",
					"values-fall-back-only-outside-core-tokens",
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
			files: ["src/page/detail/sales-trend-panel/pg-sales-trend-panel.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-do-not-group-classes-with-commas"]},
		},
	},
	"css-split-class-declaration": {
		initial: {
			prompt:
				"the same .pg_catalogIndex__toolbar block is opened twice at the top level of one file, and a third override sits nested inside the class block as @media (min-width: 1024px); fold the plain duplicate into one block and move the breakpoint override into a grouped desktop-first @media at the bottom of the file.",
			files: ["src/page/catalog-index/pg-catalog-index.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-declare-each-class-in-one-block",
					"layout-group-breakpoints-at-the-file-bottom",
					"layout-write-breakpoints-desktop-first",
				],
			},
		},
	},
	"css-responsive-grid-and-button-width": {
		initial: {
			prompt:
				"the product grid counts its columns with four @media steps and ui-button.css sets its own width at three breakpoints; make the grid and the button size themselves without breakpoints.",
			files: ["src/page/products/pg-products.css", "src/component/ui/button/ui-button.css"],
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
					"values-fall-back-only-outside-core-tokens",
					"values-tokenize-repeated-visual-values",
					"values-switch-themes-by-changing-token-values",
					"values-name-tokens-by-purpose",
				],
			},
		},
	},
	"css-cross-owner-internal-targeting": {
		initial: {
			prompt:
				"the detail page styles .wg_chartCard__caption from pg-detail.css; move the change so the page no longer declares widget classes.",
			files: ["src/page/detail/pg-detail.css", "src/component/widget/chart-card/wg-chart-card.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: ["ownership-use-foreign-classes-only-under-your-own-root", "ownership-change-other-owners-through-their-api"],
			},
		},
	},
	"css-negated-domain-state": {
		initial: {
			prompt:
				"Remove the :not(.pg_salesPanel__spreadButton--selected) ancestor condition that drives the descendant preview. Flatten two nested selector levels and separate its grouped hover/focus-visible selectors. Keep existing class names and preserve hover and visible focus feedback in both selected and unselected states.",
			files: ["src/page/detail/sales-trend-panel/pg-sales-trend-panel.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-limit-nesting-block-depth",
					"selector-do-not-group-classes-with-commas",
					"selector-use-pseudo-classes-for-dom-owned-states",
					"selector-nest-dom-state-in-the-owning-block",
					"selector-do-not-negate-with-not",
					"a11y-always-provide-a-visible-focus-indicator",
				],
			},
		},
	},
	"css-stylelint-config-setup": {
		initial: {
			prompt: "add a stylelint config for this convention with per-directory prefix overrides; keep stylelint-config-standard as the base.",
			files: ["stylelint.config.mjs"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["tooling-configure-stylelint-to-enforce-these-rules"]},
		},
	},
	"css-forced-colors-focus-repair": {
		initial: {
			prompt:
				"Repair the existing :focus-visible block in ui-input.css: its shadow-only focus ring disappears in forced-colors mode. Add a transparent outline in that block while preserving normal colors. Keep class names and nesting unchanged.",
			files: ["src/component/ui/input/ui-input.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-declare-each-class-in-one-block",
					"selector-use-pseudo-classes-for-dom-owned-states",
					"selector-nest-dom-state-in-the-owning-block",
					"a11y-always-provide-a-visible-focus-indicator",
				],
			},
		},
	},
	"css-reduced-motion-existing-delays": {
		initial: {
			prompt:
				"The existing global prefers-reduced-motion block shortens animation-duration and transition-duration but leaves a four-second delay. Remove both delays in the same block. Do not add classes, keyframes, tokens, or viewport conditions.",
			files: ["src/style/motion.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["a11y-namespace-keyframes-and-respect-reduced-motion"]},
		},
	},
	"css-container-size-query": {
		initial: {
			prompt:
				"A widget already has a slot parent and a details child. Add container-type: inline-size to the parent and hide optional details below the actual slot width with a top-level @container (width < 480px) block after the base declarations. Keep class names and TSX unchanged; the viewport must not decide this behavior.",
			files: ["src/component/widget/product-card/wg-product-card.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-declare-each-class-in-one-block",
					"layout-keep-layout-intent-explicit",
					"layout-reach-for-intrinsic-sizing-before-breakpoints",
				],
			},
		},
	},
	"css-width-property-without-breakpoint": {
		initial: {
			prompt:
				"Change only the existing min-width declaration from 160px to 180px in the page toolbar class. Keep selectors, declarations count, parent-child layout ownership, and all media/container conditions unchanged.",
			files: ["src/page/products/pg-products.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: []},
		},
	},
	"css-positive-descendant-state-no-negation": {
		initial: {
			prompt:
				"Change the existing border-color literal within &:hover .pg_salesPanel__preview. Keep the selector, class names, and nesting unchanged. There is no :not(), modifier, token, transition, or focus declaration.",
			files: ["src/page/detail/sales-trend-panel/pg-sales-trend-panel.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-use-pseudo-classes-for-dom-owned-states", "selector-nest-dom-state-in-the-owning-block"]},
		},
	},
	"css-core-token-fallback-removal": {
		initial: {
			prompt:
				"Remove only the literal fallback from var(--app-color-surface, white) in an existing class declaration. The core token is already guaranteed in every theme; change no token definitions or theme conditions.",
			files: ["src/page/products/pg-products.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["values-fall-back-only-outside-core-tokens"]},
		},
	},
	"css-core-token-definition-not-animation": {
		initial: {
			prompt:
				"Change only the value of an existing --app-color-surface declaration in the token file. It is not a new token, a token rename, a theme branch, a CSS animation, or a transition.",
			files: ["src/style/token.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: []},
		},
	},
	"css-readonly-style-context": {
		initial: {
			prompt:
				"Change only the visible button label from Save to Apply in pg-products.tsx. Existing className, style import, stylesheet, props, and event handlers are unchanged context. Do not introduce new styling.",
			files: ["src/page/products/pg-products.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: ["a11y-give-interactive-elements-an-accessible-name"], typescript: []},
		},
		scopeDrift: {
			evidence:
				"After the text edit, pass the existingButtonStyle object to the same button as style={existingButtonStyle}. Keep the existing style object, its values, imports, and className unchanged. Adding the style attribute is now an actual styling change.",
			files: ["src/page/products/pg-products.tsx"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: ["a11y-give-interactive-elements-an-accessible-name"],
				typescript: [],
				css: ["composition-do-not-style-through-the-style-attribute"],
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

/**
 * @helper fixture metadata 의 의존성 부분. progressive 는 companions 를, 아니면 extends 를 쓴다
 */
const toDependencyMetadata = (progressive: boolean, companions: SkillCompanion[], extendedSkills: string[]): Record<string, unknown> => {
	if (progressive) {
		return {progressiveDisclosure: true, ...(companions.length > 0 ? {companions} : {})};
	}

	return extendedSkills.length > 0 ? {extends: extendedSkills} : {};
};

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
				...toDependencyMetadata(progressive, companions, extendedSkills),
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

/**
 * @helper 첫 시나리오의 `scopeDrift` 를 꺼낸다. 없으면 fixture 가 깨진 것이라 바로 던진다
 */
const toFirstScopeDrift = (candidate: RoutingEvalManifest): RoutingScopeDrift => {
	const drift = candidate.scenarios[0]?.scopeDrift;

	if (drift === undefined) {
		throw new Error("fixture 의 첫 시나리오에 scopeDrift 가 없다");
	}

	return drift;
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
	assert.equal(document.rules.length, 42);
	assert.deepEqual(
		Object.fromEntries(document.rules.map((rule) => [getRuleId(rule), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}])),
		typescriptRuleRouting,
	);
	assert.equal(
		document.rules.every((rule) => Boolean(rule.appliesWhen) && Buffer.byteLength(rule.appliesWhen ?? "", "utf8") > 0),
		true,
	);
	assert.equal(
		document.rules.every((rule) => (rule.appliesWhen?.length ?? 0) <= maximumConditionLength),
		true,
	);
	const headerJsdocRule = await readRuleSource("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assert.match(headerJsdocRule, /docs-write-doc-comments-as-multiline-blocks/);
	const roleTagRule = await readRuleSource("typescript", "docs-write-korean-comments-about-purpose-and-constraints");
	assert.match(roleTagRule, /`@api`, `@helper`, `@field` \| 이름과 문법이 드러내는 역할을 태그로 반복하지 않습니다/);
	assert.equal(
		readFrontmatterValue(headerJsdocRule, "requiresSelected"),
		"docs-write-korean-comments-about-purpose-and-constraints, docs-write-doc-comments-as-multiline-blocks",
	);
	assert.doesNotMatch(headerJsdocRule, /^reviewWith:/m);
});

test("TypeScript naming keeps immutable data constants in snake_case without renaming role-based symbols", async () => {
	const namingRule = await readRuleSource("typescript", "naming-use-consistent-file-and-symbol-naming");
	const toolingRule = await readRuleSource("typescript", "tooling-configure-biome-to-enforce-these-rules");
	const biomeConfigSource = await readFile(path.join(repoDir, "package/biome.json"), "utf8");
	const snakeCaseFormat = /"formats": \["camelCase", "PascalCase", "snake_case"\]/g;

	assertMentions(
		namingRule,
		[
			"모듈 스코프 불변 데이터 상수·값 집합과 그 소유 하위 키 | `snake_case`",
			"`retry_policy.max_attempts`",
			"`product_status.waiting_review`",
			"`productSearchSchema`",
		],
		"TypeScript constant naming rule",
	);
	assert.equal([...toolingRule.matchAll(snakeCaseFormat)].length, 2);
	assert.equal([...biomeConfigSource.matchAll(snakeCaseFormat)].length, 2);
	assert.match(toolingRule, /"kind": "typeProperty"}, "formats": \["camelCase"\]/);
});

test("type and function names expose contract role without repeating framework or owner context", async () => {
	const declarationFormRule = await readRuleSource("typescript", "types-choose-interface-for-object-contracts-and-type-for-composition");
	const typeRoleRule = await readRuleSource("typescript", "naming-name-types-by-role-and-lifetime");
	const functionNameRule = await readRuleSource("typescript", "functions-name-functions-by-what-comes-out");
	const hookBoundaryRule = await readRuleSource("react", "ownership-prefer-plain-ts-for-local-react-helpers");
	const compositionRule = await readRuleSource("react", "strategy-prefer-children-over-render-props");
	const imperativeRefRule = await readRuleSource("react", "composition-open-ref-props-only-for-imperative-contracts");

	assertMentions(
		declarationFormRule,
		[
			/독립된 객체 필드 계약은 `interface`/,
			/리터럴 유니언[^\n]+\| `type`/,
			/매핑·조건부 타입[^\n]+\| `type`/,
			/형식을 맞추려고 별칭을 만들거나 객체 형태를 전부 `interface`로 바꾸지 않습니다/,
		],
		"TypeScript declaration-form rule",
	);
	assertMentions(
		typeRoleRule,
		[
			"`Params`",
			"`Snapshot`",
			"`Content`",
			"`VM`",
			"`ViewModel`",
			/소유자.*접두/s,
			/외부.*생성.*계약/s,
			/역할어를 고릅니다[^\n]+쓰려고 타입을 만들지 않으며[^\n]+기존 계약이나 추론되는 익명 결과를 유지합니다/,
		],
		"TypeScript type-role rule",
	);
	assertMentions(
		functionNameRule,
		[
			/서로 다른 입력 둘 이상의 우선순위 선택 \| `choose` \| `chooseBackSource`/,
			/같은 개념의 허용 범위·표현 보정 \| `normalize` \| `normalizePageSize`/,
			/사람이 읽는 표시 문자열 \| `format` \| `formatCandidateDayCount`/,
			/두 값의 정렬 순서 \| `compare` \| `compareProductsByPrice`/,
			/비동기 I\/O·여러 요청 조율 \| `load`, `fetch` \| `loadProductExport`/,
			/참·거짓 판정 \| `is`, `has`, `can`, `should` \| `shouldShowSummary`/,
			/생성기.*프레임워크.*외부 계약/s,
		],
		"TypeScript function-name rule",
	);
	assert.match(hookBoundaryRule, /실제.*훅.*`use<Capability>`/s);
	assertMentions(compositionRule, ["`<Owner>Slot`", "`<Owner>Renderer`", /ReactNode.*실행 문맥/s], "React slot and renderer naming");
	assertMentions(imperativeRefRule, ["`<Owner>Handle`", "`useImperativeHandle`", /DOM.*ref/s], "React handle naming");
});

test("TypeScript routing manifest matches the reviewed scenarios with full positive coverage", async () => {
	const skillPaths = getSkillPaths("typescript", realSkillRootDir);
	await validateRoutingEvalManifest(skillPaths);
	await validateRoutingEvalManifests(realSkillRootDir);
	const manifest = await readRoutingEvalManifest(skillPaths);
	const universe = [...typescriptRuleUniverse];

	assert.equal(manifest.version, 1);
	assert.equal(manifest.skill, "typescript");
	assert.equal(manifest.scenarios.length, 24);
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
		"the same normalization becomes necessary for a second owner, so decide whether it stays with an owner or moves to the root `util` folder, move the existing named function to `profile-support.ts`, export it, directly import it from `bulk-profile.ts`, and add concise Korean header doc comments.",
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
		"functions-give-each-function-its-own-file",
		"functions-order-declarations-top-down",
		"functions-promote-owner-free-functions-to-root-util",
		"functions-name-functions-by-what-comes-out",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-korean-comments-about-purpose-and-constraints",
		"docs-write-doc-comments-as-multiline-blocks",
	]);
});

test("TypeScript generated index is complete and within the deterministic byte budget", async () => {
	const skillPaths = getSkillPaths("typescript", realSkillRootDir);
	const source = await readFile(skillPaths.rulesIndexPath, "utf8");
	const entries = Array.from(source.matchAll(/^- T\d+(?:-\d+)? \| ([^ |]+) \|/gm), (match) => ({id: match[1], fileName: `${match[1]}.md`}));
	const ids = entries.map((entry) => entry.id).sort();
	const document = await readSkillDocument(skillPaths);
	const expectedIds = document.rules.map((rule) => getRuleId(rule)).sort();

	assert.deepEqual(ids, expectedIds);
	assert.equal(ids.length, 42);

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
						selected.includes("docs-write-korean-comments-about-purpose-and-constraints"),
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

test("Generated API and combined query bindings preserve the Suspense execution contract", async () => {
	const source = await readRuleSource("react", "data-name-query-and-mutation-bindings-consistently");
	const {body} = splitFrontmatter(source);
	const normative = body.split("**Incorrect", 1)[0] ?? "";
	const combineSource = await readRuleSource("react", "data-combine-multiple-queries-with-combine");

	assertMentions(
		normative,
		[
			"생성된 단일 API 훅",
			"요청 종류만 나타내는 앞부분",
			"`response` 또는 `mutation`",
			"여러 쿼리를 합친 바인딩",
			"`useSuspenseQueries`",
			"끝에 `Suspense`를 유지",
		],
		"generated API binding naming rule",
	);
	assert.doesNotMatch(normative, /훅 이름에서 `use`를 떼고/);
	assert.doesNotMatch(normative, /`select`/);
	assert.match(body, /const responseProductListSuspense = useGetProductListSuspense\(\);/);
	assert.match(combineSource, /const responseProductRowsSuspense = useSuspenseQueries\(\{/);
	assert.match(combineSource, /responseProductRowsSuspense\.rows/);
	assert.doesNotMatch(combineSource, /const responseProductRows = useSuspenseQueries\(\{/);
});

test("JSX branches, local value choices, and query selectors stay explicit at their use sites", async () => {
	const renderRule = await readRuleSource("react", "composition-render-one-branch-with-and");
	const renderNormative = splitFrontmatter(renderRule).body.split("**Incorrect", 1)[0] ?? "";
	assertMentions(flattenWhitespace(renderNormative), [/JSX 요소/i, /분기마다.*`&&`/i, /삼항.*값 하나/i], "renderRule");
	assert.doesNotMatch(renderNormative, /두 분기가 다 뜻을 가지면 삼항/);
	assert.match(renderRule, /\{props\.view === "chart" && <PgChart \/>\}/);
	assert.match(renderRule, /\{props\.view === "table" && <PgTable \/>\}/);

	const lookupRule = await readRuleSource("typescript", "values-avoid-lookup-tables-for-simple-choices");
	const lookupNormative = splitFrontmatter(lookupRule).body.split("**Incorrect", 1)[0] ?? "";
	assertMentions(
		flattenWhitespace(lookupNormative),
		[/한 곳.*값.*조회표/i, /대응 관계 자체.*계약/i, /선언 바로 위.*확인할 수 있는 근거/i],
		"lookupRule",
	);
	assert.match(lookupRule, /variant=\{props\.variant === "fill" \? "default" : props\.variant\}/);
	assert.match(lookupRule, /GET \/orders.*P·C·D/);

	const selectRule = await readRuleSource("react", "data-shape-query-data-with-select");
	const selectNormative = splitFrontmatter(selectRule).body.split("**Incorrect", 1)[0] ?? "";
	assertMentions(
		flattenWhitespace(selectNormative),
		[/`select`는 인라인/i, /재실행만을 이유로.*`useCallback`.*`useMemo`를 더하지 않/i, /구조 공유/i, /실측 병목/i],
		"selectRule",
	);

	const combineRule = await readRuleSource("react", "data-combine-multiple-queries-with-combine");
	const combineNormative = splitFrontmatter(combineRule).body.split("**Incorrect", 1)[0] ?? "";
	assertMentions(
		flattenWhitespace(combineNormative),
		[/`combine`.*인라인/i, /재실행만을 이유로.*`useCallback`.*`useMemo`를 더하지 않/i, /구조 공유/i],
		"combineRule",
	);

	const memoRule = await readRuleSource("react", "perf-avoid-defensive-memoization");
	const memoNormative = splitFrontmatter(memoRule).body.split("**Incorrect", 1)[0] ?? "";
	assertMentions(
		flattenWhitespace(memoNormative),
		[/참조 변경이 상태 초기화나 구독 재설치/i, /다시 실행된다는 사실만으로 메모이제이션하지 않습니다/i],
		"memoRule",
	);

	const wrapperRule = await readRuleSource("react", "typing-choose-wrapper-shape-and-forwarding");
	const classRule = await readRuleSource("css", "composition-compose-classes-with-clsx");
	assert.match(wrapperRule, /^reviewWith: typescript\/values-avoid-lookup-tables-for-simple-choices$/m);
	assert.equal(
		readFrontmatterValue(classRule, "reviewWith"),
		"composition-write-modifiers-as-conditions, typescript/values-avoid-lookup-tables-for-simple-choices",
	);
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

test("React progressive metadata and all 52 rule routes match Appendix B exactly", async () => {
	const skillPaths = getSkillPaths("react", realSkillRootDir);
	const document = await readSkillDocument(skillPaths);

	assert.equal(document.metadata.progressiveDisclosure, true);
	// abstract 는 사람이 읽는 개요다. 로딩 경로 설명을 넣지 않는다.
	assert.doesNotMatch(document.metadata.abstract, /SKILL\.md|RULES_INDEX\.md|contracts\/|opt-in/);
	assert.deepEqual(document.metadata.companions, [
		{skill: "typescript", mode: "required"},
		{skill: "css", mode: "conditional", appliesWhen: "class contract, stylesheet 또는 styling surface를 변경한다."},
	]);
	assert.equal(document.rules.length, 53);
	assert.deepEqual(
		Object.fromEntries(document.rules.map((rule) => [getRuleId(rule), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}])),
		reactRuleRouting,
	);
	assert.equal(
		document.rules.every((rule) => Boolean(rule.appliesWhen) && Buffer.byteLength(rule.appliesWhen ?? "", "utf8") > 0),
		true,
	);
	assert.equal(
		document.rules.every((rule) => (rule.appliesWhen?.length ?? 0) <= maximumConditionLength),
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

test("React routing manifest matches the reviewed scenarios with full positive coverage", async () => {
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
	assert.equal(manifest.scenarios.length, 25);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		26,
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
	assert.equal(ownerMove.expectedSelected.react?.includes("composition-read-props-without-destructuring"), false);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-write-korean-comments-about-purpose-and-constraints"), true);
	const cssDrift = ownerMove.scopeDrift;
	assert.ok(cssDrift);
	assert.equal(cssDrift.expectedSelected.react?.includes("composition-read-props-without-destructuring"), false);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-write-korean-comments-about-purpose-and-constraints"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("composition-do-not-build-structural-variants-with-modifiers"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("selector-nest-dom-state-in-the-owning-block"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("ownership-choose-scope-prefix-by-owner-layer"), true);
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
	const entries = Array.from(source.matchAll(/^- R\d+(?:-\d+)? \| ([^ |]+) \|/gm), (match) => ({id: match[1], fileName: `${match[1]}.md`}));
	const document = await readSkillDocument(skillPaths);

	assert.deepEqual(
		entries.map((entry) => entry.id),
		reactRuleUniverse,
	);
	assert.equal(entries.length, 53);

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

	// 현재 companion은 모두 progressive이므로 각 라우터와 인덱스를 읽는다.
	assertMentions(extractSection(body, 2), ["SKILL.md", "RULES_INDEX.md"], "react 2절");
	assert.doesNotMatch(extractSection(body, 2), /non-progressive/);
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
	assert.equal(document.rules.length, 34);
	assert.deepEqual(
		Object.fromEntries(document.rules.map((rule) => [getRuleId(rule), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}])),
		cssRuleRouting,
	);
	assert.equal(
		document.rules.every((rule) => Boolean(rule.appliesWhen) && Buffer.byteLength(rule.appliesWhen ?? "", "utf8") > 0),
		true,
	);
	assert.equal(
		document.rules.every((rule) => (rule.appliesWhen?.length ?? 0) <= maximumConditionLength),
		true,
	);
	const wrapperStylingRule = await readRuleSource("css", "composition-inject-classes-only-at-the-entry-point");
	assertMentions(
		flattenWhitespace(wrapperStylingRule),
		[
			/\*\*최상위 진입점 한 곳\*\*에서만 외부 클래스를 받습니다/,
			/\| 금지하는 형태 \|.*?\| `headerClassName`, `itemClassName` 같은 내부 클래스 프롭 \|/,
			/`variant` 프롭을 받고 헤더나 본문 등 필요한 노드마다 수정자를 붙입니다/,
		],
		"wrapperStylingRule",
	);
	const singlePurposeRule = await readRuleSource("css", "composition-keep-classes-single-purpose");
	assertMentions(readAppliesWhen(singlePurposeRule), ["상태를 나타내는 낱말", "기본 클래스와 수정자를 나눠"], "singlePurposeRule");
	const layoutIntentRule = await readRuleSource("css", "layout-keep-layout-intent-explicit");
	assertMentions(readAppliesWhen(layoutIntentRule), ["기본과 수정자로 나누면서", "`display`·여백", "값 그대로"], "layoutIntentRule");
	const fallbackRule = await readRuleSource("css", "values-fall-back-only-outside-core-tokens");
	assertMentions(readAppliesWhen(fallbackRule), ["`var(--*)`", "공통 토큰"], "fallbackRule");
	assertMentions(
		flattenWhitespace(fallbackRule),
		[/공통 토큰 목록/i, /상속 속성은 상속값, 나머지는 초기값이 됩니다/, /values-tokenize-repeated-visual-values/i],
		"fallbackRule",
	);

	const modifierMapRule = await readRuleSource("css", "composition-write-modifiers-as-conditions");
	const modifierMapNormative = splitFrontmatter(modifierMapRule).body.split("**Incorrect", 1)[0] ?? "";
	assertMentions(
		flattenWhitespace(modifierMapNormative),
		[
			/수정자는 조건과 완성된 클래스 문자열로 적습니다/,
			/템플릿 리터럴로 이름을 조립하지 않습니다/,
			/이름을 조립하면 CSS와 사용처를 같은 문자열로 검색할 수 없습니다/,
			/\| 값이 여럿임 \| 값마다 한 줄씩 적습니다/,
			/값이 다섯이고 수정자가 둘이면 둘만 적습니다/,
			/여러 요소에 같은 값을 적용해도 요소마다 나열합니다/,
			/일부 값에만 CSS 수정자가 있음 \| 해당 값만 나열하고 나머지는 기본 모습으로 둡니다/,
			/라이브러리 타입을 그대로 받음 \| 수정자를 만들지 않고 라이브러리에 넘깁니다/,
		],
		"modifierMapRule",
	);
	assert.match(modifierMapRule, /`pg_salesPanel__metricValue--\$\{tone\}`/);
	assert.match(modifierMapRule, /tone === "positive" && "pg_salesPanel__metricValue--positive"/);
	assert.match(modifierMapRule, /props\.variant === "fit" && "ui_tooltip__body--fit"/);
	assert.match(modifierMapRule, /props\.role === "trigger" && "wg_flowNode__title--trigger"/);
	assert.doesNotMatch(modifierMapNormative, /끼워 넣습니다|조립합니다/);
	assert.match(modifierMapRule, /variant\?: ButtonProps\["variant"\]/);

	const template = await readFile(path.join(skillPaths.rulesDir, "_template.md"), "utf8");
	assert.match(readAppliesWhen(template), / /);
	assert.doesNotMatch(template, /^reviewWith:/m);

	// frontmatter 작성 규칙은 스킬마다 복제하지 않고 공통 기여 문서 한 곳에 둔다.
	const contributing = await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8");
	assert.match(contributing, /appliesWhen.*한 줄.*160/);
	assert.match(contributing, /reviewWith.*자동 선택이 아니라.*재평가/i);
	assert.match(contributing, /대상이 없으면.*key\s*를 생략/i);
});

test("CSS routing manifest matches the reviewed scenarios and scope changes", async () => {
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
	assert.equal(manifest.scenarios.length, 27);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		30,
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
	assert.equal(domainState?.expectedSelected.css?.includes("selector-use-pseudo-classes-for-dom-owned-states"), false);

	const oneOffStructuralModifier = scenarioById.get("css-one-off-structural-modifier");
	assert.equal(oneOffStructuralModifier?.expectedSelected.css?.includes("composition-keep-classes-single-purpose"), false);
	assert.equal(oneOffStructuralModifier?.expectedSelected.css?.includes("composition-keep-classes-single-purpose") ?? false, false);

	const repeatedValues = scenarioById.get("css-repeated-values-and-optional-token");
	assert.equal(repeatedValues?.expectedSelected.css?.includes("selector-use-pseudo-classes-for-dom-owned-states"), false);
	assert.equal(repeatedValues?.expectedSelected.css?.includes("selector-nest-dom-state-in-the-owning-block"), false);
	assert.equal(repeatedValues?.expectedSelected.css?.includes("selector-limit-nesting-block-depth"), true);

	const wrapperDrift = scenarioById.get("css-ui-wrapper-third-party-dom");
	assert.equal(wrapperDrift?.expectedSelected.css?.includes("values-fall-back-only-outside-core-tokens"), false);
	assert.equal(wrapperDrift?.expectedSelected.css?.includes("values-fall-back-only-outside-core-tokens") ?? false, false);
	assert.equal(wrapperDrift?.scopeDrift?.expectedSelected.css?.includes("values-fall-back-only-outside-core-tokens"), true);
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
	assert.match(generatedIndex, /^- T\d+(?:-\d+)? \| [^ |]+ \|/m);

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
		["소유자가 바뀌지 않는", "바인딩·별칭", "functions-extract-helpers-only-when-the-boundary-is-real"],
		"routeFlow",
	);
	assert.match(
		routeFlow,
		/소유자가 바뀌지 않는 `query\.select`[\s\S]*바인딩·별칭[\s\S]*파생 상태 이펙트[\s\S]*렌더 계산 전환은 대상이 아닙니다/i,
	);

	const curriedHandler = await readRule("react", "events-curry-extra-handler-arguments");
	assertMentions(curriedHandler, [/이벤트 객체를 받는 자리/i, /추가 인자/i, /팩토리/i, /감싸는 화살표/i], "curriedHandler");
	assertMentions(
		curriedHandler,
		[/팩토리가 추가 인자를 받고/i, /\| 반환 타입 \|.*typing-take-handler-types-from-existing-contracts.*리액트 별칭/i],
		"curriedHandler",
	);
	assert.match(
		curriedHandler,
		/이벤트를 받지 않는 `\(id\) => void` 프롭 콜백.*커링하지 않고 이름 붙인 핸들러를 그대로 넘깁니다[\s\S]*`useEffectEvent`[\s\S]*덧붙이지 않/i,
	);

	const reactHandlerType = await readRule("react", "typing-take-handler-types-from-existing-contracts");
	assert.match(reactHandlerType, /커링한|커링|고차 함수/i);
	assertMentions(reactHandlerType, [/JSX에 직접 쓴 화살표/i, /암시적 `any`/i, /리액트 별칭/i], "reactHandlerType");
	assertMentions(reactHandlerType, [/`query\.select`/i, /일회성 문맥 콜백/i, /`Ui\*Props`/i, /대상에서 제외합니다/i], "reactHandlerType");

	const reactContracts = await Promise.all(
		["screen-keep-route-flow-visible", "events-curry-extra-handler-arguments", "typing-take-handler-types-from-existing-contracts"].map(
			(ruleId) => readAgentFacingRule("react", ruleId),
		),
	);
	assertMentions(reactContracts[0], [/(?:`query\.select`|query `select`)/i, /파생 상태 이펙트/i, /렌더 계산/i], "reactContracts");
	assertMentions(
		reactContracts[1],
		[/이벤트 객체를 받는 자리/i, /이벤트를 받지 않는 `\(id\) => void` 프롭 콜백.*커링하지 않고/i],
		"reactContracts",
	);
	assert.match(reactContracts[2], /커링 팩토리가 반환하는 핸들러.*팩토리 반환 타입에 적습니다[\s\S]*일회성 문맥 콜백/i);

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
			/새 입력·출력 계약 역할을 맡음/i,
			/필드가 그대로여도 기존 선언의 헤더와 필드 주석에 새 역할을 설명합니다/i,
			/새 역할에도 맞는 기존 형태를 연결하며, 새 타입 선언을 요구하지 않습니다/i,
		],
		"documentedShape",
	);
	assert.match(documentedShape, /이름 없이 구현에서 추론되는 익명 객체.*대상이 아닙니다.*`select`의 익명 반환값도 그대로 둡니다/i);
	assert.match(documentedShape, /익명 결과에 이 규칙을 적용하려고 필드 주석이나 새 타입을 만들지 않습니다/i);

	const directImports = await readRule("typescript", "naming-use-direct-imports-and-public-entry-points");
	assertMentions(readAppliesWhen(directImports), ["같은 경로에서", /값과 타입 중 무엇을 가져올지/, "추가·삭제·전환"], "directImports");

	const unusedParameters = await readRule("typescript", "types-mark-unused-parameters-with-underscore");
	assertMentions(readAppliesWhen(unusedParameters), ["커링한 핸들러", "마지막에 돌려주는 콜백", /(?:빼거나|쓰지 않)/], "unusedParameters");
	assertMentions(
		unusedParameters,
		[
			/기존 콜백·프레임워크 계약의 매개변수는 쓰지 않아도 생략하지 않고 `_` 접두사로 남깁니다/i,
			/커링한 핸들러의 마지막 콜백과 매개변수를 하나도 쓰지 않는 구현도 같습니다/i,
			/`MouseEventHandler`의 이벤트를 쓰지 않으면 `\(\) =>` 대신 `\(_event\) =>`로 받습니다/i,
		],
		"unusedParameters",
	);

	for (const ruleId of [
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-prefer-function-variable-types-over-parameter-annotations",
	]) {
		const contextualCallback = await readRule("typescript", ruleId);

		// 제외 표지는 항목 앞(`제외:`)에도 문장 끝(`… 제외한다`)에도 올 수 있다. 순서가 아니라 개념 존재만 본다.
		assertMentions(
			readAppliesWhen(contextualCallback),
			[/타입 표기/i, "없이", /일회성/i, /문맥으로 추론/i, /제외/],
			`${ruleId} appliesWhen`,
		);
	}

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assert.match(existingContract, /다음은 이 규칙을 적용하지 않는 경우입니다[\s\S]*그대로인 계약의 새 사용처/i);

	const typescriptContracts = await Promise.all(
		[
			"naming-use-direct-imports-and-public-entry-points",
			"types-document-custom-types-and-shapes",
			"types-mark-unused-parameters-with-underscore",
			"types-prefer-function-variable-types-over-parameter-annotations",
			"types-reuse-existing-contracts-before-new-types",
		].map((ruleId) => readAgentFacingRule("typescript", ruleId)),
	);
	assert.match(typescriptContracts[0], /같은 경로라도 값·타입 가져오기를 바꾸면 이 규칙을 적용합니다/i);
	assert.match(
		await readFile(path.join(realSkillRootDir, "react", "contracts", "ownership-keep-component-imports-flowing-downward.md"), "utf8"),
		/CRITICAL rule[\s\S]*full rule/i,
	);
	assertMentions(typescriptContracts[2], [/커링한 핸들러/i, /마지막 콜백/i], "typescriptContracts");
	assertMentions(
		typescriptContracts[3],
		[
			/기존 호출 계약이 있으면 매개변수와 반환 타입을 반복하지 않고 함수를 담는 변수에 붙입니다/i,
			/맞는 계약도 없고 구현도 하나뿐임.*매개변수 타입을 직접 적습니다/i,
		],
		"typescriptContracts",
	);
	assert.match(typescriptContracts[4], /다음은 이 규칙을 적용하지 않는 경우입니다[\s\S]*그대로인 계약의 새 사용처/i);

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
		[/앱이 켜고 끄는 상태/, /여러 곳에서 반복되는 모양/, /같은 수정자 이름이 두 개 이상의 `scope_slug`에 이미 있음/],
		"modifierClassification",
	);

	const layoutIntent = await readRule("css", "layout-keep-layout-intent-explicit");
	assert.match(layoutIntent, /`z-index`[\s\S]*층 토큰[\s\S]*쌓임 순서/i);
	assert.match(layoutIntent, /기준 컨테이너를 주석/i);
	assert.doesNotMatch(layoutIntent, /동작 변화 없이/);

	const variableFallback = await readRule("css", "values-fall-back-only-outside-core-tokens");
	assert.match(variableFallback, /\| 공통 토큰 목록에 있음 \| 쓰지 않습니다/i);
	assertMentions(
		variableFallback,
		[/`var\(\)`의 대체값 여부는 그 목록과 대조해 정합니다/i, /\| 그 밖의 변수 \| 씁니다/i],
		"variableFallback",
	);

	for (const ruleId of ["selector-nest-dom-state-in-the-owning-block"]) {
		const interactionState = await readRule("css", ruleId);
		assertMentions(
			interactionState,
			[
				/조건 없는 기본 클래스 블록\*\* 안에 `&:`로 씁니다/i,
				/블록 바깥이나 수정자 블록에서 다시 열지 않습니다/i,
				/도메인 상태와 무관한 `:hover`, `:focus-visible`, `:disabled`.*기본 블록에 둡니다/i,
			],
			"interactionState",
		);
	}
	const cssInteractionContracts = await Promise.all(
		["selector-nest-dom-state-in-the-owning-block"].map((ruleId) => readAgentFacingRule("css", ruleId)),
	);
	for (const contract of cssInteractionContracts) {
		assertMentions(contract, [/조건 없는 기본 클래스 블록/i, /수정자 블록에서 다시 열지 않습니다/i], "contract");
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
		"types-prefer-function-variable-types-over-parameter-annotations",
	]) {
		assert.equal(tsSelected("RTE10-derived-selection-state", ruleId), true);
	}
	assert.equal(tsNotApplicable("RTE10-derived-selection-state", "types-mark-unused-parameters-with-underscore"), true);
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
		"values-fall-back-only-outside-core-tokens",
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
	for (const ruleId of ["layout-keep-layout-intent-explicit", "values-fall-back-only-outside-core-tokens"]) {
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
	assertMentions(
		documentedShape,
		[
			/새 입력·출력 계약 역할을 맡음 \| 필드가 그대로여도 기존 선언의 헤더와 필드 주석에 새 역할을 설명합니다/,
			/새 역할에도 맞는 기존 형태를 연결하며, 새 타입 선언을 요구하지 않습니다/,
		],
		"documentedShape reuses existing declarations for new roles",
	);
	assertMentions(
		documentedShape,
		[
			/외부·생성된·읽기 전용·공용 형태를 그대로 씀 \| 선언을 고치거나 문서화용 지역 별칭을 만들지 않습니다/,
			/함수 선언의 헤더 주석은 `docs-require-header-jsdoc-on-key-declarations`가 별도로 판단합니다/,
		],
		"documentedShape preserves external contracts and separate function documentation",
	);
	assert.doesNotMatch(documentedShape, /callable 선언에서[^\n]+(?:역할|계약)[^\n]+설명/);

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assert.match(
		flattenWhitespace(existingContract),
		/여러 위치 인자를 우리가 고칠 수 있는 기존 객체 계약 하나로 묶음 \| 그 계약을 그대로 받고 `types-document-custom-types-and-shapes`만 적용합니다/i,
	);
	assert.match(existingContract, /규칙을 적용하려고 요청에 없는 `\*Params`나 `\*Input`을 만들지 않습니다/i);
	assertMentions(
		existingContract,
		[
			/다음은 이 규칙을 적용하지 않는 경우입니다/,
			/외부·생성된·읽기 전용·공용 형태를 그대로 사용 \| 이 규칙과 `types-derive-subsets-with-indexed-access` 모두 대상이 아닙니다\. 함수 헤더 주석은 `docs-require-header-jsdoc-on-key-declarations`가 판단합니다/,
		],
		"existingContract excludes unchanged external contracts",
	);
	assert.doesNotMatch(existingContract, /callable header[^\n]+문서화/);
	assert.doesNotMatch(readAppliesWhen(existingContract), /재사용 결정을 바꾼다/);
	assertMentions(
		existingContract,
		[
			/구조가 같아도 단위나 도메인 역할이 다르면 합치지 않습니다/,
			/원본 입력과 정규화 결과처럼 역할이 다름 \| 필드가 같아도 별도 계약을 둡니다/,
			/맞는 기존 형태가 없는 새 도메인 계약 \| 새로 선언하고 `types-document-custom-types-and-shapes`만 적용합니다/,
		],
		"existingContract keeps distinct roles separate",
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
		].map((ruleId) => readAgentFacingRule("typescript", ruleId)),
	);
	assertMentions(
		generatedContracts[0],
		[/리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다/i, /뜻이 같은 계약이 이미 있으면/i],
		"generatedContracts",
	);
	assertMentions(
		generatedContracts[1],
		[
			/직접 선언한 타입과 형태는 헤더와 필드를 구분해 문서화합니다/i,
			/커스텀 `type`, `interface`, 스키마 최상단 \| 씁니다 \| 원본에서 가져온 필드에도 각각 씁니다/i,
		],
		"generatedContracts",
	);
	assertMentions(
		generatedContracts[2],
		[
			/여러 위치 인자를 우리가 고칠 수 있는 기존 객체 계약 하나로 묶음/i,
			/규칙을 적용하려고 요청에 없는 `\*Params`나 `\*Input`을 만들지 않습니다/i,
		],
		"generatedContracts",
	);
});

test("v17 semantic contracts reject English-only annotations and effective deep third-party chains", async () => {
	const readRule = async (skillName: "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const koreanComments = await readRule("typescript", "docs-write-korean-comments-about-purpose-and-constraints");
	assertMentions(
		koreanComments,
		[
			/주석은 한국어로 목적·제약·부수효과를 설명합니다/i,
			/본문 전체가 영어인 주석은 허용하지 않습니다/i,
			/헤더가 영어뿐이면 필드 주석이 한국어여도 요구를 충족하지 못합니다/i,
		],
		"koreanComments",
	);
	assert.match(koreanComments, /route-local product tree props/);
	assert.match(koreanComments, /route-local product 트리 입력 계약/);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(documentedShape, /주석 내용은 `docs-write-korean-comments-about-purpose-and-constraints`의 한국어 기준을 따릅니다/i);
	const headerDocs = await readRule("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assertMentions(
		flattenWhitespace(headerDocs),
		[
			/헤더 문서 주석을 씁니다[\s\S]*빈 본문이나 영문 라벨만으로는 요구를 충족하지 못하며 실제 한국어 설명이 필요합니다/i,
			/내용과 태그는 `docs-write-korean-comments-about-purpose-and-constraints`가 정합니다/i,
		],
		"headerDocs require meaningful Korean content",
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
		].map((ruleId) => readAgentFacingRule("typescript", ruleId)),
	);
	assertMentions(
		generatedContracts[0],
		[/리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다/i, /뜻이 같은 계약이 이미 있으면/i],
		"generatedContracts",
	);
	assertMentions(
		generatedContracts[1],
		[
			/직접 선언한 타입과 형태는 헤더와 필드를 구분해 문서화합니다/i,
			/커스텀 `type`, `interface`, 스키마 최상단 \| 씁니다 \| 원본에서 가져온 필드에도 각각 씁니다/i,
		],
		"generatedContracts",
	);
	assertMentions(
		generatedContracts[2],
		[
			/여러 위치 인자를 우리가 고칠 수 있는 기존 객체 계약 하나로 묶음/i,
			/규칙을 적용하려고 요청에 없는 `\*Params`나 `\*Input`을 만들지 않습니다/i,
		],
		"generatedContracts",
	);
});

test("v17 semantic contracts reject English-only annotations and effective deep third-party chains", async () => {
	const readRule = async (skillName: "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const koreanComments = await readRule("typescript", "docs-write-korean-comments-about-purpose-and-constraints");
	assertMentions(
		koreanComments,
		[
			/주석은 한국어로 목적·제약·부수효과를 설명합니다/i,
			/본문 전체가 영어인 주석은 허용하지 않습니다/i,
			/헤더가 영어뿐이면 필드 주석이 한국어여도 요구를 충족하지 못합니다/i,
		],
		"koreanComments",
	);
	assert.match(koreanComments, /route-local product tree props/);
	assert.match(koreanComments, /route-local product 트리 입력 계약/);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(documentedShape, /주석 내용은 `docs-write-korean-comments-about-purpose-and-constraints`의 한국어 기준을 따릅니다/i);
	const headerDocs = await readRule("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assertMentions(
		flattenWhitespace(headerDocs),
		[
			/헤더 문서 주석을 씁니다[\s\S]*빈 본문이나 영문 라벨만으로는 요구를 충족하지 못하며 실제 한국어 설명이 필요합니다/i,
			/내용과 태그는 `docs-write-korean-comments-about-purpose-and-constraints`가 정합니다/i,
		],
		"headerDocs require meaningful Korean content",
	);
	assert.doesNotMatch(headerDocs, /\bT\d{2}\b/);

	const foreignRoot = await readRule("css", "ownership-use-foreign-classes-only-under-your-own-root");
	assertMentions(
		foreignRoot,
		[
			/내 최상위 클래스 블록 안에서 `&`로 시작하는 선택자/,
			/`\.ant-tree-title \{ \}` \| 금지/,
			/`\.pg_treePanel__root \.ant-tree-title \{ \}` \| 금지\. 최상위 블록 안에서 `&`로 시작해야 합니다/,
		],
		"foreignRoot",
	);
	assertMentions(
		foreignRoot,
		[
			/그 라이브러리를 쓰는 앱 전체에 적용됩니다/,
			/그 위젯을 쓰는 모든 화면에 적용됩니다/,
			/다른 소유자의 DOM 경로는 우리가 정하지 않으므로 결합자 개수를 제한하지 않습니다/,
			/selector-disallowed-list/,
		],
		"foreignRoot",
	);
	assert.match(foreignRoot, /& \.ant-tree-node-content-wrapper/);

	const otherOwnerApi = await readRule("css", "ownership-change-other-owners-through-their-api");
	assertMentions(
		otherOwnerApi,
		[
			/세 방법을 순서대로 확인합니다/,
			/세 방법이 모두 맞지 않으면 `ownership-use-foreign-classes-only-under-your-own-root`에 따라 내 최상위 블록 안에서\s+선택자로 지정합니다/,
			/`className`을 최상위까지만 전달하는 경계는 `composition-inject-classes-only-at-the-entry-point` 규칙이 정합니다/,
		],
		"otherOwnerApi",
	);

	const ampersandScope = await readRule("css", "selector-limit-nesting-block-depth");
	assertMentions(
		ampersandScope,
		[
			/선택자 블록 중첩은 \*\*한 겹\*\*, `&`는 \*\*한 선택자에 한 번\*\*만 씁니다/,
			/그 블록이 소유한 요소의 조건이나 가상 요소/,
			/`&`가 가리키는 요소가 작성 위치를 결정합니다/,
		],
		"ampersandScope",
	);

	const rawWrapper = await readRule("css", "selector-use-classes-instead-of-element-selectors");
	assertMentions(
		rawWrapper,
		[/우리가 렌더하는 마크업은 요소 선택자 대신 클래스로 선택합니다/, /dangerouslySetInnerHTML/, /stylelint-disable-next-line/],
		"rawWrapper",
	);

	const entryPoint = await readRule("css", "composition-inject-classes-only-at-the-entry-point");
	assertMentions(
		entryPoint,
		[
			/\*\*최상위 진입점 한 곳\*\*에서만 외부 클래스를 받습니다/,
			/우리가 만든 컴포넌트는 레이어와 무관하게/,
			/금지하는 형태[\s\S]*`headerClassName`, `itemClassName` 같은 내부 클래스 프롭/,
		],
		"entryPoint",
	);

	const stylelintConfig = await readRule("css", "tooling-configure-stylelint-to-enforce-these-rules");
	assertMentions(
		stylelintConfig,
		[/stylelint-config-standard/, /selector-max-combinators/, /overrides/, /기계가 확인하지 못하는 의미는 리뷰에서 판단합니다/],
		"stylelintConfig",
	);

	const nestingDepth = await readRule("css", "selector-limit-nesting-block-depth");
	assertMentions(
		nestingDepth,
		[/전체 경로가 여러 블록에 흩어지고 기계 검사도 각 블록만 봅니다/, /max-nesting-depth: 1/, /최상위는 0겹/],
		"nestingDepth",
	);

	const commaGroup = await readRule("css", "selector-do-not-group-classes-with-commas");
	assertMentions(
		commaGroup,
		[
			/중복되더라도 각 클래스 블록에 선언을 모두 적어/,
			/한 대상에 진입 조건이 여럿임 \| 조건마다 블록을 엽니다/,
			/no-duplicate-selectors/,
			/중복 없이 쉼표로 묶기만 함 \| 리뷰\. 기계 검사는 묶음 자체를 막지 않습니다/,
		],
		"commaGroup",
	);

	const oneBlockPerClass = await readRule("css", "selector-declare-each-class-in-one-block");
	assertMentions(
		oneBlockPerClass,
		[
			/한 클래스의 선언은 파일 안 한 블록에 모읍니다/,
			/같은 클래스를 여러 곳에서 다시 열어 선언 순서로 덮어쓰지 않습니다/,
			/명시도와 선언 순서를 확인합니다/,
			/@container/,
		],
		"oneBlockPerClass",
	);

	const nestDomState = await readRule("css", "selector-nest-dom-state-in-the-owning-block");
	assertMentions(
		nestDomState,
		[
			/블록 바깥이나 수정자 블록에서 다시 열지 않습니다/,
			/조상 블록에서 식별자가 같은 자손을 결합자 하나로 선택합니다/,
			/조상 상태를 자손 블록에서 읽거나 지역 변수로 전달함 \| `:has\(\)`도 쓰지 않습니다/,
		],
		"nestDomState",
	);

	const notInversion = await readRule("css", "selector-do-not-negate-with-not");
	assertMentions(
		notInversion,
		[/조상 수정자가 자손의 모습을 바꿈 \| 자손 수정자로 옮깁니다/, /상태별 결과를 보존합니다/, /:not\(:disabled\)/, /:enabled:hover/],
		"notInversion",
	);

	const focusIndicator = await readRule("css", "a11y-always-provide-a-visible-focus-indicator");
	assertMentions(
		focusIndicator,
		[
			/포커스 표시를 유지하고 `outline: none`을 쓸 때는 대체 스타일을 함께 제공합니다/,
			/:focus-visible/,
			/색각 이상에서도 구분할 수 있어야 합니다/,
			/브라우저가 입력 방식과 사용자 설정으로 판단하므로/,
			/forced-colors: active/,
			/투명한 `outline`/,
		],
		"focusIndicator",
	);

	const generatedContracts = await Promise.all(
		[
			["typescript", "docs-require-header-jsdoc-on-key-declarations"],
			["typescript", "docs-write-korean-comments-about-purpose-and-constraints"],
			["css", "selector-nest-dom-state-in-the-owning-block"],
			["css", "ownership-use-foreign-classes-only-under-your-own-root"],
		].map((pair) => readAgentFacingRule(pair[0], pair[1])),
	);
	assertMentions(
		flattenWhitespace(generatedContracts[0]),
		[
			/빈 본문이나 영문 라벨만으로는 요구를 충족하지 못하며 실제 한국어 설명이 필요합니다/i,
			/내용과 태그는 `docs-write-korean-comments-about-purpose-and-constraints`가 정합니다/i,
		],
		"generated header documentation contract",
	);
	assertMentions(
		generatedContracts[1],
		[/본문 전체가 영어인 주석은 허용하지 않습니다/i, /주석은 한국어로 목적·제약·부수효과를 설명합니다/i],
		"generatedContracts",
	);
	assert.match(generatedContracts[2], /pseudo-class[\s\S]*조상 블록에서 식별자가 같은 자손을 결합자 하나로 선택합니다/i);
	assert.match(generatedContracts[3], /CRITICAL rule[\s\S]*full rule/i);
});

test("CSS generated index is canonical, complete, body-preserving, and within its byte budget", async () => {
	const skillPaths = getSkillPaths("css", realSkillRootDir);
	const source = await readFile(skillPaths.rulesIndexPath, "utf8");
	const entries = Array.from(source.matchAll(/^- C\d+(?:-\d+)? \| ([^ |]+) \|/gm), (match) => ({id: match[1], fileName: `${match[1]}.md`}));
	const document = await readSkillDocument(skillPaths);

	assert.deepEqual(
		entries.map((entry) => entry.id),
		cssRuleUniverse,
	);
	assert.equal(entries.length, 34);

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
		manifest.scenarios[0].expectedSkills.push("legacy");
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
		manifest.scenarios[0].expectedSelected.owner = ["fixture-second", "fixture-first"];
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
					manifest.scenarios[0].expectedSkills = ["legacy"];
					manifest.scenarios[0].expectedSelected = {};
				},
				/must activate its owner skill.*owner/i,
			],
			["duplicate expectedSkills", (manifest) => manifest.scenarios[0].expectedSkills.push("owner"), /expectedSkills.*duplicate/i],
			["unknown skill", (manifest) => manifest.scenarios[0].expectedSkills.push("missing"), /unknown skill.*missing/i],
			["unknown rule", (manifest) => manifest.scenarios[0].expectedSelected.owner.push("missing-rule"), /unknown rule.*missing-rule/i],
			["duplicate rule", (manifest) => manifest.scenarios[0].expectedSelected.owner.push("fixture-first"), /expectedSelected.*duplicate/i],
			["missing progressive map key", (manifest) => delete manifest.scenarios[0].expectedSelected.owner, /expectedSelected.*owner/i],
			[
				"unexpected partition key",
				(manifest) => {
					manifest.scenarios[0].expectedSelected.other = [];
				},
				/unexpected partition.*other/i,
			],
			[
				"non-progressive partition",
				(manifest) => {
					manifest.scenarios[0].expectedSkills.push("legacy");
					manifest.scenarios[0].expectedSelected.legacy = [];
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

		manifest.scenarios[0].expectedSkills.push("required");
		manifest.scenarios[0].expectedSelected.required = [...fixtureRuleIds];
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /required companion.*leaf/i);

		manifest.scenarios[0].expectedSkills.push("leaf");
		manifest.scenarios[0].expectedSelected.leaf = [...fixtureRuleIds];
		manifest.scenarios[0].expectedSkills.push("conditional");
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/expectedSelected.*conditional|conditional.*partition/i,
		);

		manifest.scenarios[0].expectedSelected.conditional = [...fixtureRuleIds];
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
		manifest.scenarios[0].expectedSelected.owner = ["fixture-first"];
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/requiresSelected target "owner\/fixture-second"/i,
		);
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner", options: {ruleRouting: {"fixture-second": {requiredOnCompletion: true}}}});
		const manifest = createValidManifest();
		manifest.scenarios[0].expectedSelected.owner = ["fixture-first"];
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
		manifest.scenarios[0].expectedSkills.push("react");
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/missing required dependency skill "typescript" for "react"/i,
		);

		manifest.scenarios[0].expectedSkills.push("typescript");
		manifest.scenarios[0].expectedSelected.typescript = [...fixtureRuleIds];
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));
	});

	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy-leaf", options: {progressive: false}});
		await writeFixtureSkill({skillRootDir, skillName: "legacy-base", options: {progressive: false, extends: ["legacy-leaf"]}});
		await writeFixtureSkill({skillRootDir, skillName: "react", options: {progressive: false, extends: ["legacy-base"]}});
		const manifest = createValidManifest();
		manifest.scenarios[0].expectedSkills.push("react", "legacy-base");
		await writeManifest({skillRootDir, skillName: "owner", manifest});

		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/missing required dependency skill "legacy-leaf" for "legacy-base"/i,
		);

		manifest.scenarios[0].expectedSkills.push("legacy-leaf");
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
		manifest.scenarios[0].expectedSkills.push("legacy-a");
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
		toFirstScopeDrift(ownerNeverActive).expectedSkills.pop();
		delete toFirstScopeDrift(ownerNeverActive).expectedSelected.owner;
		await writeManifest({skillRootDir, skillName: "owner", manifest: ownerNeverActive});
		await assert.rejects(
			() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)),
			/must activate its owner skill.*owner.*initial.*scopeDrift|initial.*scopeDrift.*owner/i,
		);

		const ownerRemovedByDrift = createValidManifest();
		ownerRemovedByDrift.scenarios[0].scopeDrift = {
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
		delete toFirstScopeDrift(missingDriftOwnerMap).expectedSelected.owner;
		await writeManifest({skillRootDir, skillName: "owner", manifest: missingDriftOwnerMap});
		await assert.rejects(() => validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir)), /scopeDrift.*expectedSelected.*owner/i);
	});
});

test("scope drift is monotonic for files, activated skills, and selected rules", async () => {
	await withFixtureRoot(async (skillRootDir) => {
		await writeFixtureSkill({skillRootDir, skillName: "owner"});
		await writeFixtureSkill({skillRootDir, skillName: "legacy", options: {progressive: false}});
		const manifest = createValidManifest();
		manifest.scenarios[0].expectedSkills.push("legacy");
		manifest.scenarios[0].scopeDrift = {
			evidence: "The scope expands.",
			files: ["src/fixture.ts", "src/second.ts"],
			expectedSkills: ["owner", "legacy"],
			expectedSelected: {owner: [...fixtureRuleIds]},
		};
		await writeManifest({skillRootDir, skillName: "owner", manifest});
		await validateRoutingEvalManifest(getSkillPaths("owner", skillRootDir));

		const cases: [string, (candidate: RoutingEvalManifest) => void, RegExp][] = [
			["file removal", (candidate) => toFirstScopeDrift(candidate).files.shift(), /scopeDrift.*file.*monotonic/i],
			["skill removal", (candidate) => toFirstScopeDrift(candidate).expectedSkills.pop(), /scopeDrift.*skill.*monotonic/i],
			[
				"selection removal",
				(candidate) => {
					toFirstScopeDrift(candidate).expectedSelected.owner.pop();
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
		betaManifest.scenarios[0].id = alphaManifest.scenarios[0].id;
		await writeManifest({skillRootDir, skillName: "alpha", manifest: alphaManifest});
		await writeManifest({skillRootDir, skillName: "beta", manifest: betaManifest});
		await assert.rejects(() => validateRoutingEvalManifests(skillRootDir), /duplicate scenario id.*alpha-all-rules/i);

		betaManifest.scenarios[0].id = "beta-all-rules";
		betaManifest.scenarios[0].expectedSelected.beta = ["fixture-first"];
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
			manifest.scenarios[0].expectedSkills.push(companionName);
			manifest.scenarios[0].expectedSelected[companionName] = [...fixtureRuleIds];
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
