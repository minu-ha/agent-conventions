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
import {generateRulesIndexMarkdown, getRuleId, getRulesIndexByteBudget} from "../src/routing.js";
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
	"naming-centralize-shared-config-namespaces",
	"naming-preserve-config-origin-with-chained-access",
	"naming-use-consistent-file-and-symbol-naming",
	"naming-use-direct-imports-and-public-entry-points",
	"types-document-custom-types-and-shapes",
	"types-mark-unused-parameters-with-underscore",
	"types-prefer-function-variable-types-over-parameter-annotations",
	"types-reuse-callback-signatures-from-existing-contracts",
	"types-reuse-existing-contracts-before-new-types",
	"functions-avoid-imperative-assembly-in-wide-scopes",
	"functions-extract-helpers-only-when-the-boundary-is-real",
	"functions-prefer-immutable-array-sorting",
	"functions-replace-enum-with-as-const-objects",
	"functions-use-named-object-params-for-complex-signatures",
	"functions-use-set-and-map-for-repeated-lookups",
	"absence-expose-optional-values-instead-of-silent-fallbacks",
	"docs-keep-inline-comments-for-constraints-and-caveats",
	"docs-require-header-jsdoc-on-key-declarations",
	"docs-write-concise-korean-comments-about-purpose-and-constraints",
	"guardrails-review-banned-typescript-shortcuts-before-finishing",
] as const;

const cssRuleUniverse = [
	"naming-default-to-plain-css-when-no-module-convention",
	"naming-keep-scope-slug-unique-per-owner",
	"naming-name-elements-and-modifiers-by-role",
	"naming-keep-page-slug-traceable",
	"naming-separate-owner-style-scopes",
	"naming-use-scope-slug-element-modifier-syntax",
	"composition-compose-classes-with-clsx",
	"composition-do-not-build-structural-variants-with-modifiers",
	"composition-keep-classes-single-purpose",
	"composition-style-ui-components-through-owned-wrappers",
	"selector-avoid-deep-descendant-dependencies",
	"selector-limit-nesting-block-depth",
	"selector-target-third-party-dom-from-owned-roots",
	"selector-use-pseudo-classes-for-dom-owned-states",
	"values-keep-layout-intent-explicit",
	"values-always-provide-css-variable-fallbacks",
	"values-separate-domain-state-modifiers-from-dom-interaction-states",
	"values-tokenize-repeated-visual-values",
	"organization-keep-style-files-owned-by-one-component-or-route",
] as const;

/**
 * @summary generated React index의 canonical codepoint rule universe
 */
const reactRuleUniverse = [
	"ownership-import-react-types-directly",
	"ownership-prefer-plain-ts-for-local-react-helpers",
	"ownership-layer-component-boundaries",
	"ownership-place-owner-files-in-role-folders",
	"ownership-shared-config-entry-points",
	"ownership-use-consistent-file-and-symbol-naming",
	"ownership-keep-component-imports-flowing-downward",
	"ownership-keep-lifecycle-in-the-owning-component",
	"typing-function-type-first",
	"typing-reuse-existing-contracts",
	"strategy-avoid-boolean-prop-proliferation",
	"strategy-choose-single-composition-compound-and-variants",
	"strategy-prefer-children-over-render-props",
	"composition-destructure-props-inside",
	"composition-do-not-define-components-inside-components",
	"composition-prefer-arrow-functions-and-object-params",
	"composition-named-handlers-over-inline",
	"composition-use-ref-prop-instead-of-forwardref-in-react-19",
	"composition-use-activity-for-render-branches",
	"screen-avoid-premature-abstraction",
	"screen-extract-local-section-components-for-runtime-boundaries",
	"screen-extract-utilities-selectively",
	"screen-keep-derived-values-close",
	"screen-keep-route-flow-visible",
	"events-keep-handler-flow-inline",
	"events-name-and-curry-handlers",
	"events-run-user-actions-in-handlers-not-effects",
	"data-avoid-fallback-defaults-and-loading-flags",
	"data-name-query-and-mutation-bindings-consistently",
	"data-preserve-origin-chaining",
	"data-shape-query-data-with-select",
	"state-calculate-derived-values-during-render",
	"state-choose-state-tools-by-source-of-truth",
	"state-store-derived-authority",
	"state-use-functional-setstate-updates",
	"state-use-effectevent-for-non-reactive-effect-callbacks",
	"perf-compiler-first-memoization",
	"perf-use-lazy-state-initializers-for-expensive-defaults",
	"perf-use-starttransition-for-non-urgent-updates",
	"perf-use-usedeferredvalue-for-heavy-derived-renders",
	"docs-limit-inline-comments-to-non-obvious-logic",
	"docs-require-jsdoc-on-key-declarations",
] as const;

/**
 * @summary Appendix A의 TypeScript rule별 exact routing metadata oracle
 */
const typescriptRuleRouting = {
	"naming-centralize-shared-config-namespaces": {
		appliesWhen:
			"여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의할 때. shared config 경계를 바꿀 때.",
		reviewWith: ["naming-preserve-config-origin-with-chained-access", "naming-use-direct-imports-and-public-entry-points"],
	},
	"naming-preserve-config-origin-with-chained-access": {
		appliesWhen:
			"`config` 또는 `util` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경할 때.",
		reviewWith: [],
	},
	"naming-use-consistent-file-and-symbol-naming": {
		appliesWhen:
			"TypeScript 파일, local 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꿀 때. 제외: alias 없는 third-party import binding 추가인 경우.",
		reviewWith: [],
	},
	"naming-use-direct-imports-and-public-entry-points": {
		appliesWhen:
			"TypeScript import/export, barrel, shared 공개 진입점·owner support module 경계를 추가·변경할 때. 절대경로 alias로 다른 모듈을 가져올 때. 같은 module path의 value/type specifier를 추가·삭제·전환할 때.",
		reviewWith: [],
	},
	"types-document-custom-types-and-shapes": {
		appliesWhen:
			"type·interface·schema root·객체 상수·계약 field·파생 alias를 추가·변경할 때. named shape에 callable 역할을 추가할 때. 제외: 외부·generated·read-only·shared unchanged shape나 익명 추론 반환인 경우.",
		reviewWith: [],
	},
	"types-mark-unused-parameters-with-underscore": {
		appliesWhen:
			"기존 callback·framework 계약 구현을 추가·변경하며 parameter를 생략하거나 사용하지 않을 때. curried handler가 반환하는 최종 callback에서 parameter를 생략할 때.",
		reviewWith: [],
	},
	"types-prefer-function-variable-types-over-parameter-annotations": {
		appliesWhen:
			"기존 callable 계약을 named·shared 함수 구현에 재사용할 때. 같은 시그니처를 여러 구현이 공유하도록 바꿀 때. 제외: annotation 없는 one-off contextually typed inline callback인 경우.",
		reviewWith: [],
	},
	"types-reuse-callback-signatures-from-existing-contracts": {
		appliesWhen:
			"interface·객체·framework의 named·shared callback 구현에서 기존 시그니처를 재사용·변경할 때. 제외: annotation 없는 one-off contextually typed inline callback인 경우.",
		reviewWith: ["types-mark-unused-parameters-with-underscore"],
	},
	"types-reuse-existing-contracts-before-new-types": {
		appliesWhen:
			"의미상 같은 기존 type·interface·schema 대신 shape를 새로 선언·변경·복제·파생할 때. 중복 shape를 도입·제거할 때. 제외: 호환 후보 없는 새 shape, 순수 owner 이동, unchanged contract의 새 사용처인 경우.",
		reviewWith: ["types-document-custom-types-and-shapes"],
	},
	"functions-avoid-imperative-assembly-in-wide-scopes": {
		appliesWhen: "파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push` 또는 조건부 누적으로 값을 조립하거나 리팩터링할 때.",
		reviewWith: [],
	},
	"functions-extract-helpers-only-when-the-boundary-is-real": {
		appliesWhen:
			"support function을 추출·이동·export·공유할 때. generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꿀 때.",
		reviewWith: ["docs-require-header-jsdoc-on-key-declarations"],
	},
	"functions-prefer-immutable-array-sorting": {
		appliesWhen: "props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬할 때. 기존 `.sort()` 호출을 추가·변경할 때.",
		reviewWith: [],
	},
	"functions-replace-enum-with-as-const-objects": {
		appliesWhen: "`enum` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경할 때.",
		reviewWith: [],
	},
	"functions-use-named-object-params-for-complex-signatures": {
		appliesWhen:
			"매개변수 3개 이상 또는 같은 계열 인자를 받는 일반 함수를 추가·변경할 때. 객체 매개변수의 구조분해 위치를 바꿀 때. 제외: React 함수 컴포넌트의 props 수신·구조분해만 바꾸는 경우.",
		reviewWith: [],
	},
	"functions-use-set-and-map-for-repeated-lookups": {
		appliesWhen: "같은 컬렉션에 `includes`, `find` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경할 때.",
		reviewWith: [],
	},
	"absence-expose-optional-values-instead-of-silent-fallbacks": {
		appliesWhen: "optional 값의 읽기·정규화·전달을 바꿀 때. `??`, `||`, 기본값 또는 빈 값 대체 분기를 추가·변경할 때.",
		reviewWith: ["docs-keep-inline-comments-for-constraints-and-caveats"],
	},
	"docs-keep-inline-comments-for-constraints-and-caveats": {
		appliesWhen: "함수 본문의 `//` 주석을 추가·수정·유지할 때. 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명할 때.",
		reviewWith: [],
	},
	"docs-require-header-jsdoc-on-key-declarations": {
		appliesWhen:
			"query·mutation, 원격 함수, 비자명한 handler/effect, exported helper·hook, custom type·interface, store 선언을 추가·변경할 때. 선언 위 주석의 형식이나 태그를 정할 때.",
		reviewWith: [],
	},
	"docs-write-concise-korean-comments-about-purpose-and-constraints": {
		appliesWhen: "TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰할 때.",
		reviewWith: [],
	},
	"guardrails-review-banned-typescript-shortcuts-before-finishing": {
		appliesWhen:
			"TypeScript/TSX 변경을 완료 판정할 때. diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검할 때.",
		reviewWith: [],
	},
} as const;

/**
 * @summary Appendix C의 CSS rule별 exact routing metadata oracle
 */
const cssRuleRouting = {
	"naming-default-to-plain-css-when-no-module-convention": {
		appliesWhen:
			"프로젝트 표준 미확정 상태에서 새 stylesheet 접근 형식(plain CSS·CSS Modules)을 선택하거나 `.module.css`·`styles.*`로 전환할 때. 제외: 기존 plain CSS class rename만 하는 경우.",
		reviewWith: [],
	},
	"naming-keep-scope-slug-unique-per-owner": {
		appliesWhen: "새 `scope_slug`를 만들거나 기존 slug를 복사·이름 변경할 때. 서로 다른 컴포넌트가 같은 slug를 쓸 가능성이 있을 때.",
		reviewWith: [],
	},
	"naming-name-elements-and-modifiers-by-role": {
		appliesWhen: "element 또는 modifier class 이름을 새로 지을 때. `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경할 때.",
		reviewWith: [],
	},
	"naming-keep-page-slug-traceable": {
		appliesWhen: "`pg_*` owner의 class slug를 새로 만들거나 이름을 바꿀 때. 같은 이름 component가 여러 화면에 생겨 slug를 구분해야 할 때.",
		reviewWith: [],
	},
	"naming-separate-owner-style-scopes": {
		appliesWhen: "스타일 owner를 화면 내부, widget, primitive 중에서 결정할 때. 새 CSS 파일을 만들거나 기존 owner 범위를 옮길 때.",
		reviewWith: ["naming-keep-scope-slug-unique-per-owner", "organization-keep-style-files-owned-by-one-component-or-route"],
	},
	"naming-use-scope-slug-element-modifier-syntax": {
		appliesWhen: "plain CSS의 project-owned class를 새로 만들 때. 이름, scope, slug, element, modifier 구분자 또는 casing을 변경할 때.",
		reviewWith: [],
	},
	"composition-compose-classes-with-clsx": {
		appliesWhen: "TSX의 `className`을 추가·수정할 때. base class, modifier, optional class를 조합할 때.",
		reviewWith: [],
	},
	"composition-do-not-build-structural-variants-with-modifiers": {
		appliesWhen: "modifier를 추가·변경할 때. 반복 가능한 state·API variant와 one-off structural patch 사이를 판정할 때.",
		reviewWith: ["naming-name-elements-and-modifiers-by-role"],
	},
	"composition-keep-classes-single-purpose": {
		appliesWhen:
			"기존 class가 base와 state·variant 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리할 때. 제외: 기존 결합 책임을 분리하지 않고 처음부터 새 single-purpose pair를 만들거나 책임 보존 rename만 하는 경우.",
		reviewWith: [],
	},
	"composition-style-ui-components-through-owned-wrappers": {
		appliesWhen:
			"`Ui*` wrapper에 `className`을 주거나 wrapper가 노출할 class 계약을 정할 때. `Ui*` 내부 DOM을 겨냥하는 스타일을 추가할 때. 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우.",
		reviewWith: ["selector-target-third-party-dom-from-owned-roots"],
	},
	"selector-avoid-deep-descendant-dependencies": {
		appliesWhen:
			"공백·`>`·`+`·`~`로 요소 사이 관계를 표현하는 selector를 추가·수정할 때. DOM 계층에 의존하는 project-owned·third-party selector를 검토할 때.",
		reviewWith: [
			"selector-limit-nesting-block-depth",
			"selector-use-pseudo-classes-for-dom-owned-states",
			"selector-target-third-party-dom-from-owned-roots",
			"composition-style-ui-components-through-owned-wrappers",
		],
	},
	"selector-limit-nesting-block-depth": {
		appliesWhen:
			"중첩 `{}` block을 추가하거나 기존 block을 펼치거나 합칠 때. raw HTML prose·copy·content wrapper 안 element selector를 추가·수정할 때.",
		reviewWith: ["selector-avoid-deep-descendant-dependencies"],
	},
	"selector-target-third-party-dom-from-owned-roots": {
		appliesWhen: "`.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정할 때. owned wrapper 아래로 범위를 제한할 때.",
		reviewWith: [],
	},
	"selector-use-pseudo-classes-for-dom-owned-states": {
		appliesWhen:
			"`:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정할 때. parent DOM state가 child styling에 영향을 줄 때.",
		reviewWith: [],
	},
	"values-keep-layout-intent-explicit": {
		appliesWhen:
			"`sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경할 때. 제외: 같은 element의 base/modifier 분리에서 기존 `display`·spacing 선언을 값 그대로 재배치하는 경우.",
		reviewWith: [],
	},
	"values-always-provide-css-variable-fallbacks": {
		appliesWhen: "`var(--*)` 사용을 추가하거나 변수 이름·fallback을 바꿀 때. core token 목록에 항목을 추가·제거할 때.",
		reviewWith: ["values-tokenize-repeated-visual-values"],
	},
	"values-separate-domain-state-modifiers-from-dom-interaction-states": {
		appliesWhen: "app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경할 때. focus ring을 수정할 때.",
		reviewWith: ["composition-do-not-build-structural-variants-with-modifiers"],
	},
	"values-tokenize-repeated-visual-values": {
		appliesWhen: "여러 파일이 같은 색·간격·radius·타이포·그림자 값을 쓸 때. 새 CSS custom property를 선언할 때.",
		reviewWith: ["values-always-provide-css-variable-fallbacks"],
	},
	"organization-keep-style-files-owned-by-one-component-or-route": {
		appliesWhen:
			"stylesheet를 새로 만들거나 이동·분할·병합해 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있을 때.",
		reviewWith: [],
	},
} as const;

/**
 * @summary Appendix B의 React rule별 exact routing metadata oracle
 */
const reactRuleRouting = {
	"ownership-import-react-types-directly": {
		appliesWhen:
			"`React.*` namespace 타입과 direct `import type` 중 선택할 때. 같은 module path의 type/value import 구성을 추가·삭제·전환할 때. 제외: 일반 direct value import만 바꾸는 경우.",
		reviewWith: [],
	},
	"ownership-prefer-plain-ts-for-local-react-helpers": {
		appliesWhen:
			"화면 전용 계산·정규화·payload 조립을 custom hook으로 추출하려 할 때. 화면 전용 순수 로직을 별도 support module로 옮기려 할 때.",
		reviewWith: [
			"screen-extract-utilities-selectively",
			"ownership-place-owner-files-in-role-folders",
			"ownership-keep-lifecycle-in-the-owning-component",
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
		],
	},
	"ownership-layer-component-boundaries": {
		appliesWhen: "컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때.",
		reviewWith: ["ownership-place-owner-files-in-role-folders", "css/naming-separate-owner-style-scopes"],
	},
	"ownership-place-owner-files-in-role-folders": {
		appliesWhen:
			"owner 아래 `component`·`config`·`function`·`hook`·`type` 폴더를 만들거나 옮길 때. 추출한 component·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우.",
		reviewWith: ["ownership-keep-component-imports-flowing-downward", "css/naming-separate-owner-style-scopes"],
	},
	"ownership-shared-config-entry-points": {
		appliesWhen: "둘 이상의 화면이 쓰는 상수·설정·순수 함수를 추가하거나 옮길 때. leaf 파일에 중복 선언된 공용 값을 정리할 때.",
		reviewWith: ["typescript/naming-centralize-shared-config-namespaces", "typescript/naming-preserve-config-origin-with-chained-access"],
	},
	"ownership-use-consistent-file-and-symbol-naming": {
		appliesWhen:
			"React/TSX 파일·컴포넌트·exported symbol·공용 설정 이름을 정하거나 바꿀 때. sibling `.ts` support 파일·symbol을 만들거나 옮길 때. 제외: local query·mutation binding 이름만 바꾸는 경우.",
		reviewWith: [],
	},
	"ownership-keep-component-imports-flowing-downward": {
		appliesWhen:
			"`component` 폴더 안의 파일을 다른 파일에서 import할 때. `../`나 `@/page` 경로로 component를 가져오려 할 때. 여러 자식이 같은 component를 필요로 해 배치를 다시 정할 때.",
		reviewWith: ["ownership-layer-component-boundaries"],
	},
	"ownership-keep-lifecycle-in-the-owning-component": {
		appliesWhen:
			"외부 library instance 생성·resize·구독·dispose를 한 component가 소유할 때. lifecycle 코드를 custom hook으로 옮겨 파일을 줄이려 할 때. 제외: 여러 owner가 같은 lifecycle 계약을 실제로 호출하는 경우.",
		reviewWith: ["ownership-prefer-plain-ts-for-local-react-helpers"],
	},
	"typing-function-type-first": {
		appliesWhen:
			"React 이벤트 핸들러나 prop callback의 선언·시그니처를 추가·변경할 때. 기존 React alias나 callback 계약을 그대로 쓸 수 있는 상황일 때. curried factory가 최종 반환하는 handler를 다룰 때.",
		reviewWith: ["typing-reuse-existing-contracts", "ownership-import-react-types-directly"],
	},
	"typing-reuse-existing-contracts": {
		appliesWhen:
			"Props callback 구현을 추가·변경할 때. API 응답 기반 view type을 추가·변경하는데 기존 prop·API 계약과 같은 shape가 보일 때. wrapper 컴포넌트 사용처에서 Props 타입을 참조할 때.",
		reviewWith: [
			"typescript/types-reuse-callback-signatures-from-existing-contracts",
			"typescript/types-reuse-existing-contracts-before-new-types",
		],
	},
	"strategy-avoid-boolean-prop-proliferation": {
		appliesWhen:
			"여러 곳에서 쓰는 shared component에 boolean mode·visibility prop을 추가할 때. 기존 boolean prop 조합과 JSX 분기가 늘어날 때.",
		reviewWith: [],
	},
	"strategy-choose-single-composition-compound-and-variants": {
		appliesWhen:
			"exported shared component에 slot·public part·shared context/action을 추가할 때. 반복되는 preset이나 mode API를 추가할 때. shared component의 조립 구조를 재설계할 때.",
		reviewWith: [
			"strategy-avoid-boolean-prop-proliferation",
			"strategy-prefer-children-over-render-props",
			"screen-avoid-premature-abstraction",
		],
	},
	"strategy-prefer-children-over-render-props": {
		appliesWhen:
			"shared component에 header·footer·action 같은 정적 slot을 추가·변경할 때. render prop을 추가·변경하는데 runtime data 주입이 꼭 필요한지 불분명할 때.",
		reviewWith: [],
	},
	"composition-destructure-props-inside": {
		appliesWhen:
			"props를 받는 함수 컴포넌트의 시그니처나 구조분해 방식을 추가·변경할 때. props를 받는 컴포넌트를 다른 파일로 옮기거나 이름을 바꿀 때.",
		reviewWith: [],
	},
	"composition-do-not-define-components-inside-components": {
		appliesWhen: "컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 remount·focus reset 징후를 다룰 때.",
		reviewWith: [],
	},
	"composition-prefer-arrow-functions-and-object-params": {
		appliesWhen:
			"React 인접 코드에 `function` 선언이 생길 때. 함수가 매개변수를 3개 이상 받을 때. 함수가 함께 이동하는 같은 계열 값을 받을 때.",
		reviewWith: ["typescript/functions-use-named-object-params-for-complex-signatures"],
	},
	"composition-named-handlers-over-inline": {
		appliesWhen:
			"TSX event prop의 인라인 callback에 분기나 비동기 호출을 추가·수정할 때. 인라인 callback에 여러 동작·부수효과나 비자명한 state transition이 들어갈 때. 제외: 단순 setter나 인자 전달 한 줄 위임만 있는 경우.",
		reviewWith: ["events-keep-handler-flow-inline", "events-run-user-actions-in-handlers-not-effects"],
	},
	"composition-use-ref-prop-instead-of-forwardref-in-react-19": {
		appliesWhen: "React 19 컴포넌트에 focus·scroll·measure용 ref 공개 API를 추가·변경할 때. 새 `forwardRef` wrapper를 도입하려 할 때.",
		reviewWith: [],
	},
	"composition-use-activity-for-render-branches": {
		appliesWhen:
			"마운트된 subtree의 표시 상태를 보존하려고 조건부 렌더링을 Activity로 바꿀 때. Activity 등 visibility primitive와 조건부 렌더링 사이를 오갈 때.",
		reviewWith: [],
	},
	"screen-avoid-premature-abstraction": {
		appliesWhen: "screen 코드를 helper·hook·component·module로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때.",
		reviewWith: [
			"screen-extract-local-section-components-for-runtime-boundaries",
			"screen-extract-utilities-selectively",
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
		],
	},
	"screen-extract-local-section-components-for-runtime-boundaries": {
		appliesWhen:
			"route-local section component를 새로 추출할 때. 기존 section이 async·state·provider·interaction·library·performance 경계를 소유하는지 바꿀 때.",
		reviewWith: [],
	},
	"screen-extract-utilities-selectively": {
		appliesWhen:
			"화면 계산·변환·preset·option·column meta를 별도 함수나 support module로 옮길 때. 화면 support 경계를 바꿀 때. 제외: query `select` 내부 shaping만 바꾸는 경우.",
		reviewWith: ["ownership-place-owner-files-in-role-folders", "typescript/functions-extract-helpers-only-when-the-boundary-is-real"],
	},
	"screen-keep-derived-values-close": {
		appliesWhen:
			"오리진을 끊는 alias·flag·표시값을 넓은 screen scope에 추가·이동·제거할 때. `let` 재할당이나 배열 `push` 기반 조립을 바꿀 때.",
		reviewWith: [],
	},
	"screen-keep-route-flow-visible": {
		appliesWhen:
			"route entry의 search·navigate·query·mutation·cross-section effect를 옮기거나 나눌 때. page section 조립의 순서나 owner를 바꿀 때. 제외: 같은 owner 안에서 표현만 바꾸는 경우.",
		reviewWith: ["screen-extract-local-section-components-for-runtime-boundaries", "ownership-place-owner-files-in-role-folders"],
	},
	"events-keep-handler-flow-inline": {
		appliesWhen:
			"화면 전용 named handler의 분기·mutation·navigation·후처리를 여러 helper나 hook으로 나눌 때. 쪼개져 있던 handler 흐름을 다시 합칠 때.",
		reviewWith: ["screen-extract-utilities-selectively"],
	},
	"events-name-and-curry-handlers": {
		appliesWhen:
			"이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 target/event 표현을 바꿀 때. 추가 인자 전달 방식이나 최종 React handler 시그니처를 바꿀 때.",
		reviewWith: ["typing-function-type-first", "typescript/naming-use-consistent-file-and-symbol-naming"],
	},
	"events-run-user-actions-in-handlers-not-effects": {
		appliesWhen:
			"제출·저장·삭제·닫기 같은 one-shot 사용자 액션을 handler와 state+effect 사이에서 옮길 때. one-shot 사용자 액션의 실행 흐름을 바꿀 때.",
		reviewWith: [],
	},
	"data-avoid-fallback-defaults-and-loading-flags": {
		appliesWhen:
			"optional 응답에 `??`·`||` 기본값을 넣을 때. Suspense 화면 본문에 초기 loading return을 추가·변경할 때. 결측·로딩 UX를 다룰 때.",
		reviewWith: [
			"data-preserve-origin-chaining",
			"screen-keep-derived-values-close",
			"typescript/absence-expose-optional-values-instead-of-silent-fallbacks",
		],
	},
	"data-name-query-and-mutation-bindings-consistently": {
		appliesWhen: "React Query query·mutation hook의 로컬 binding을 추가하거나 이름을 바꿀 때. 역할이 드러나지 않는 별칭이 diff에 보일 때.",
		reviewWith: ["data-preserve-origin-chaining"],
	},
	"data-preserve-origin-chaining": {
		appliesWhen: "page·layout·screen 넓은 스코프에서 response·mutation·store를 구조분해할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때.",
		reviewWith: ["screen-keep-derived-values-close"],
	},
	"data-shape-query-data-with-select": {
		appliesWhen: "서버 응답의 list·items·meta 등을 렌더에서 가공하거나 반복 소비할 때. React Query `select`의 결과 shape를 추가·변경할 때.",
		reviewWith: ["data-name-query-and-mutation-bindings-consistently", "data-preserve-origin-chaining"],
	},
	"state-calculate-derived-values-during-render": {
		appliesWhen: "현재 props·state·search·response에서 계산 가능한 값을 별도 state와 effect로 동기화할 때. 그런 동기화를 제거할 때.",
		reviewWith: [],
	},
	"state-choose-state-tools-by-source-of-truth": {
		appliesWhen:
			"로컬 UI·전역 client·server 데이터를 새 state 도구로 옮길 때. 서로 다른 source of truth 사이에 값을 복제하거나 동기화할 때.",
		reviewWith: ["state-store-derived-authority"],
	},
	"state-store-derived-authority": {
		appliesWhen:
			"여러 화면·메뉴·route guard가 쓰는 권한·capability 같은 derived decision을 store에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 store로 올리려 할 때.",
		reviewWith: ["docs-require-jsdoc-on-key-declarations"],
	},
	"state-use-functional-setstate-updates": {
		appliesWhen:
			"다음 state가 현재 state에 의존하는 갱신을 추가·변경할 때. handler·async callback·연속 호출에서 `setState` 방식을 바꿀 때.",
		reviewWith: [],
	},
	"state-use-effectevent-for-non-reactive-effect-callbacks": {
		appliesWhen:
			"subscription effect가 최신 prop·state callback을 읽어야 할 때. ref 동기화 hack, dependency 재설치, `useEffectEvent`를 추가·변경할 때.",
		reviewWith: ["events-run-user-actions-in-handlers-not-effects"],
	},
	"perf-compiler-first-memoization": {
		appliesWhen:
			"`useMemo`·`useCallback`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 deferred 계산을 이유로 수동 memoization을 검토할 때.",
		reviewWith: [],
	},
	"perf-use-lazy-state-initializers-for-expensive-defaults": {
		appliesWhen: "`useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때.",
		reviewWith: [],
	},
	"perf-use-starttransition-for-non-urgent-updates": {
		appliesWhen:
			"클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 state update를 다룰 때. state update의 우선순위나 transition 처리를 바꿀 때.",
		reviewWith: [],
	},
	"perf-use-usedeferredvalue-for-heavy-derived-renders": {
		appliesWhen: "검색어·필터·정렬 입력이 무거운 파생 view를 갱신해 typing 지연이 생길 때. `useDeferredValue` 기반 계산을 추가·변경할 때.",
		reviewWith: ["perf-compiler-first-memoization", "perf-use-starttransition-for-non-urgent-updates"],
	},
	"docs-limit-inline-comments-to-non-obvious-logic": {
		appliesWhen: "React 함수·handler·JSX 인접 로직 안의 `//` 주석을 추가·수정할 때. 자명한 설명과 실제 제약을 구분해 주석을 정리할 때.",
		reviewWith: [],
	},
	"docs-require-jsdoc-on-key-declarations": {
		appliesWhen:
			"query·mutation이나 비자명한 handler/effect를 추가·변경할 때. exported helper·hook·store 선언을 추가·변경할 때. re-export 포함 public type·interface나 compound public part를 추가·변경할 때.",
		reviewWith: [],
	},
} as const;

/**
 * @summary 조건부 reviewWith와 달리 Selected가 반드시 닫혀야 하는 exact routing oracle
 */
const mandatoryRuleRouting = {
	react: {
		"ownership-import-react-types-directly": ["typescript/naming-use-direct-imports-and-public-entry-points"],
		"ownership-use-consistent-file-and-symbol-naming": ["typescript/naming-use-consistent-file-and-symbol-naming"],
		"ownership-keep-component-imports-flowing-downward": ["typescript/naming-use-direct-imports-and-public-entry-points"],
		"typing-function-type-first": ["typescript/types-reuse-callback-signatures-from-existing-contracts"],
		"composition-named-handlers-over-inline": ["docs-require-jsdoc-on-key-declarations", "events-name-and-curry-handlers"],
		"data-name-query-and-mutation-bindings-consistently": [
			"typescript/naming-use-consistent-file-and-symbol-naming",
			"docs-require-jsdoc-on-key-declarations",
		],
		"data-shape-query-data-with-select": ["docs-require-jsdoc-on-key-declarations"],
		"state-calculate-derived-values-during-render": ["screen-keep-derived-values-close"],
		"state-use-effectevent-for-non-reactive-effect-callbacks": ["docs-require-jsdoc-on-key-declarations"],
		"docs-limit-inline-comments-to-non-obvious-logic": ["typescript/docs-keep-inline-comments-for-constraints-and-caveats"],
		"docs-require-jsdoc-on-key-declarations": ["typescript/docs-require-header-jsdoc-on-key-declarations"],
	},
	typescript: {
		"types-reuse-callback-signatures-from-existing-contracts": ["types-prefer-function-variable-types-over-parameter-annotations"],
		"functions-replace-enum-with-as-const-objects": [
			"naming-use-consistent-file-and-symbol-naming",
			"types-document-custom-types-and-shapes",
		],
		"docs-require-header-jsdoc-on-key-declarations": ["docs-write-concise-korean-comments-about-purpose-and-constraints"],
	},
	css: {
		"selector-target-third-party-dom-from-owned-roots": ["selector-avoid-deep-descendant-dependencies"],
		"selector-use-pseudo-classes-for-dom-owned-states": ["values-separate-domain-state-modifiers-from-dom-interaction-states"],
	},
} as const;

const completionGateRouting = {react: [], typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"], css: []} as const;

/**
 * @summary Appendix A scenario별 initial exact selected rule oracle
 */
const typescriptSelections = {
	"callback-contract-implementation": [
		"naming-use-consistent-file-and-symbol-naming",
		"types-mark-unused-parameters-with-underscore",
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-reuse-callback-signatures-from-existing-contracts",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"derive-existing-contract-with-docs": [
		"types-document-custom-types-and-shapes",
		"types-reuse-existing-contracts-before-new-types",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"enum-like-runtime-contract": [
		"naming-use-consistent-file-and-symbol-naming",
		"types-document-custom-types-and-shapes",
		"functions-replace-enum-with-as-const-objects",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"explicit-product-fallback": [
		"absence-expose-optional-values-instead-of-silent-fallbacks",
		"docs-keep-inline-comments-for-constraints-and-caveats",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"helper-boundary-scope-drift": [
		"functions-extract-helpers-only-when-the-boundary-is-real",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"named-object-param": [
		"naming-use-consistent-file-and-symbol-naming",
		"functions-use-named-object-params-for-complex-signatures",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"shared-collection-lookups-and-sort": [
		"functions-prefer-immutable-array-sorting",
		"functions-use-set-and-map-for-repeated-lookups",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"shared-config-existing-source": [
		"naming-centralize-shared-config-namespaces",
		"naming-preserve-config-origin-with-chained-access",
		"naming-use-direct-imports-and-public-entry-points",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"wide-scope-assembly": [
		"functions-avoid-imperative-assembly-in-wide-scopes",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
} as const;

/**
 * @summary Appendix A scenario별 exact prompt와 file evidence oracle
 */
const typescriptScenarioEvidence = {
	"callback-contract-implementation": {
		prompt:
			"implement an existing documented interface callback through its Indexed Access function type and rename the unused contract parameter to `_level`; do not add types, imports, or docs.",
		files: ["src/logging/log-sink.ts"],
	},
	"derive-existing-contract-with-docs": {
		prompt:
			"replace a duplicate `UserPreview` interface with a same-name `Pick<UserRecord, ...>` alias and add concise Korean header doc comments; imports and names otherwise stay unchanged.",
		files: ["src/users/user-preview.ts"],
	},
	"enum-like-runtime-contract": {
		prompt:
			"replace `enum AuditStatus` with snake_case `audit_status as const`, derive `AuditStatus`, and document the object, every key, and derived type in Korean.",
		files: ["src/audit/audit-status.ts"],
	},
	"explicit-product-fallback": {
		prompt:
			"replace an ungrounded optional page-size `??` with an explicit branch for the specified product default 20 and a short Korean constraint comment; helper/header boundaries stay unchanged.",
		files: ["src/search/resolve-page-size.ts"],
	},
	"helper-boundary-scope-drift": {
		prompt: "inline a single-owner mapper/sub-step into `profile-api.ts`.",
		files: ["src/profile/profile-api.ts"],
	},
	"named-object-param": {
		prompt:
			"change a function that destructures `BuildRequestUrlArgs` in the signature to accept `args` and destructure on the first body line; no other contract/docs/import changes.",
		files: ["src/http/build-request-url.ts"],
	},
	"shared-collection-lookups-and-sort": {
		prompt:
			"replace repeated `includes` with an existing Set's `has` and replace shared-input `.sort()` with `.toSorted()`; declarations, imports, and docs stay unchanged.",
		files: ["src/search/filter-entries.ts"],
	},
	"shared-config-existing-source": {
		prompt:
			"`billing-request.ts` and `audit-request.ts` duplicate URL/page-size constants are replaced with the existing `shared/config.ts` values; use direct `config.*` access and do not change the declaration.",
		files: ["src/features/billing/billing-request.ts", "src/features/audit/audit-request.ts"],
	},
	"wide-scope-assembly": {
		prompt:
			"replace an existing top-level `let` plus conditional `push` flow with a declarative calculation assigned to the same `visibleTabs` name; imports and docs stay unchanged.",
		files: ["src/navigation/visible-tabs.ts"],
	},
} as const;

/**
 * @summary Appendix B와 D의 React scenario별 exact stage oracle
 */
const reactScenarioStages = {
	"RTE01-import-contract-cleanup": {
		initial: {
			prompt:
				"rename UserCard.tsx to user-card.tsx, remove index.ts barrel, replace React.MouseEvent and a duplicate API view type with existing contracts in src/components/ui/user-card.tsx and src/components/ui/index.ts.",
			files: ["src/components/ui/user-card.tsx", "src/components/ui/index.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-import-react-types-directly",
					"ownership-use-consistent-file-and-symbol-naming",
					"typing-function-type-first",
					"typing-reuse-existing-contracts",
					"events-name-and-curry-handlers",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-reuse-callback-signatures-from-existing-contracts",
					"types-reuse-existing-contracts-before-new-types",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE02-owner-placement-css-drift": {
		initial: {
			prompt:
				"move a route-only tree renderer from shared UI to src/page/entries/component/pg-entry-tree.tsx and rename it as owner-private; carry its existing className and style import through unchanged and make no styling change.",
			files: ["src/ui/entry-tree/ui-entry-tree.tsx", "src/page/entries/component/pg-entry-tree.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-owner-files-in-role-folders",
					"ownership-use-consistent-file-and-symbol-naming",
					"composition-destructure-props-inside",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
		scopeDrift: {
			evidence:
				"in a project without a CSS Modules standard, add directly imported src/page/entries/component/pg-entry-tree.css, create owner-unique pg_* role-named classes, and compose the changed className contract with the existing direct clsx import; final skills add CSS with no additional React rule.",
			files: [
				"src/ui/entry-tree/ui-entry-tree.tsx",
				"src/page/entries/component/pg-entry-tree.tsx",
				"src/page/entries/component/pg-entry-tree.css",
			],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-owner-files-in-role-folders",
					"ownership-use-consistent-file-and-symbol-naming",
					"composition-destructure-props-inside",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-keep-scope-slug-unique-per-owner",
					"naming-name-elements-and-modifiers-by-role",
					"naming-keep-page-slug-traceable",
					"naming-separate-owner-style-scopes",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"values-separate-domain-state-modifiers-from-dom-interaction-states",
					"organization-keep-style-files-owned-by-one-component-or-route",
				],
			},
		},
	},
	"RTE03-route-support-extraction": {
		initial: {
			prompt:
				"move one real four-argument multi-line payload boundary out of src/page/entries/pg-entries.tsx into src/page/entries/function/build-entry-payload.ts; do not create a hook, generic utils file, or helper soup.",
			files: ["src/page/entries/pg-entries.tsx", "src/page/entries/function/build-entry-payload.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-prefer-plain-ts-for-local-react-helpers",
					"ownership-place-owner-files-in-role-folders",
					"ownership-use-consistent-file-and-symbol-naming",
					"composition-prefer-arrow-functions-and-object-params",
					"screen-avoid-premature-abstraction",
					"screen-extract-utilities-selectively",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"functions-extract-helpers-only-when-the-boundary-is-real",
					"functions-use-named-object-params-for-complex-signatures",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE04-shared-config": {
		initial: {
			prompt:
				"move a duplicated menu key and default page size from two screens into a documented snake_case as const config object in src/shared/config.ts and directly import and use config.* from both route pages.",
			files: ["src/routes/entries/page.tsx", "src/routes/reports/page.tsx", "src/shared/config.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: ["ownership-shared-config-entry-points", "ownership-use-consistent-file-and-symbol-naming"],
				typescript: [
					"naming-centralize-shared-config-namespaces",
					"naming-preserve-config-origin-with-chained-access",
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"functions-replace-enum-with-as-const-objects",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE05-toolbar-composition": {
		initial: {
			prompt:
				"replace compact/edit/search/focus booleans and static render props on wg-entry-toolbar.tsx with stateless compound parts plus repeated explicit variants, and document public parts.",
			files: ["src/components/widgets/entry-toolbar/wg-entry-toolbar.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-use-consistent-file-and-symbol-naming",
					"strategy-avoid-boolean-prop-proliferation",
					"strategy-choose-single-composition-compound-and-variants",
					"strategy-prefer-children-over-render-props",
					"composition-destructure-props-inside",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE06-nested-forwardref": {
		initial: {
			prompt:
				"hoist an existing nested forwardRef search input that resets focus to module scope and convert it to a React 19 ref prop in ui-search-card.tsx.",
			files: ["src/components/ui/search-card/ui-search-card.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"composition-destructure-props-inside",
					"composition-do-not-define-components-inside-components",
					"composition-use-ref-prop-instead-of-forwardref-in-react-19",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE07-visibility-lifecycle": {
		initial: {
			prompt:
				"change only the show/hide branch for an already-mounted sidebar to the already-imported project Activity primitive to preserve expanded state; keep empty-state unmount behavior.",
			files: ["src/routes/entries/-local/entry-sidebar.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: ["composition-use-activity-for-render-branches"],
				typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"],
			},
		},
	},
	"RTE08-delete-handler-flow": {
		initial: {
			prompt:
				"move a row delete inline async branch, mutation, navigation, and state+effect replay into one curried named handler, keep an unused React event as _event, directly import its reused callback type, and keep screen-only flow inside page.tsx.",
			files: ["src/routes/entries/page.tsx"],
			expectedSkills: ["react", "typescript", "tanstack-route"],
			expectedSelected: {
				react: [
					"typing-function-type-first",
					"composition-named-handlers-over-inline",
					"events-keep-handler-flow-inline",
					"events-name-and-curry-handlers",
					"events-run-user-actions-in-handlers-not-effects",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-mark-unused-parameters-with-underscore",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-reuse-callback-signatures-from-existing-contracts",
					"functions-extract-helpers-only-when-the-boundary-is-real",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE09-route-runtime-section": {
		initial: {
			prompt:
				'extract only the tree section that owns local search and expanded state plus a tree adapter into -local, implement a named selection handler from EntryTreeSectionProps["onCategorySelect"], and keep search params, navigation, page query, and mutation in the route entry.',
			files: ["src/routes/entries/page.tsx", "src/routes/entries/-local/entry-tree-section.tsx"],
			expectedSkills: ["react", "typescript", "tanstack-route"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-owner-files-in-role-folders",
					"ownership-use-consistent-file-and-symbol-naming",
					"typing-function-type-first",
					"typing-reuse-existing-contracts",
					"composition-destructure-props-inside",
					"screen-avoid-premature-abstraction",
					"screen-extract-local-section-components-for-runtime-boundaries",
					"screen-keep-route-flow-visible",
					"events-name-and-curry-handlers",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-reuse-callback-signatures-from-existing-contracts",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE10-derived-selection-state": {
		initial: {
			prompt:
				"extract the inline selection toggle into a named handleSelectionToggle handler, replace selectedIds-derived count and flag effect+state synchronization with render calculation near use, and use a functional updater; do not change navigation or styling.",
			files: ["src/routes/entries/page.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-import-react-types-directly",
					"typing-function-type-first",
					"composition-named-handlers-over-inline",
					"screen-keep-derived-values-close",
					"events-name-and-curry-handlers",
					"state-calculate-derived-values-during-render",
					"state-use-functional-setstate-updates",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-mark-unused-parameters-with-underscore",
					"types-prefer-function-variable-types-over-parameter-annotations",
					"types-reuse-callback-signatures-from-existing-contracts",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE11-shared-authority": {
		initial: {
			prompt:
				"synchronize shared capability once at the owning layout and store for multiple screens, menu, and guards; do not copy single-screen server fields into the store.",
			files: ["src/routes/_authenticated/layout.tsx", "src/stores/capability-store.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"data-preserve-origin-chaining",
					"state-choose-state-tools-by-source-of-truth",
					"state-store-derived-authority",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE12-query-shaping": {
		initial: {
			prompt:
				"move repeated raw list, items, and meta render shaping into query select, rename bindings to response... and mutation..., and remove wide aliases.",
			files: ["src/routes/entries/page.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"screen-keep-derived-values-close",
					"data-name-query-and-mutation-bindings-consistently",
					"data-preserve-origin-chaining",
					"data-shape-query-data-with-select",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE13-heavy-search": {
		initial: {
			prompt:
				"for a 50k-row search, directly import newly used React hooks, use lazy initialization, urgent input plus deferred result, a non-urgent category transition, and only evidence-backed memoization; update the constraint comment.",
			files: ["src/routes/entries/-local/entry-search.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"perf-compiler-first-memoization",
					"perf-use-lazy-state-initializers-for-expensive-defaults",
					"perf-use-starttransition-for-non-urgent-updates",
					"perf-use-usedeferredvalue-for-heavy-derived-renders",
					"docs-limit-inline-comments-to-non-obvious-logic",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-keep-inline-comments-for-constraints-and-caveats",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE14-subscription-effectevent": {
		initial: {
			prompt:
				"directly import useEffectEvent, replace only a socket subscription latest-callback ref-sync hack with a named handleMessage = useEffectEvent(...), and update subscription lifecycle JSDoc; do not change click or submit actions.",
			files: ["src/routes/entries/-local/entry-socket.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"events-name-and-curry-handlers",
					"state-use-effectevent-for-non-reactive-effect-callbacks",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE15-suspense-absence": {
		initial: {
			prompt:
				'replace Suspense detail ?? [], || "-", a local pending Spinner, and top-level aliases with an explicit empty state and origin chaining; remove an ungrounded explanatory comment.',
			files: ["src/routes/entries/detail.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"screen-keep-derived-values-close",
					"data-avoid-fallback-defaults-and-loading-flags",
					"data-preserve-origin-chaining",
					"docs-limit-inline-comments-to-non-obvious-logic",
				],
				typescript: [
					"absence-expose-optional-values-instead-of-silent-fallbacks",
					"docs-keep-inline-comments-for-constraints-and-caveats",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE16-private-component-import-direction": {
		initial: {
			prompt:
				"two sibling files under src/page/detail/component/spike-pattern-panel/component/ import each other's legend row through ../; make the panel own the shared legend row and pass it down as an element prop, and remove the sibling and @/page component imports.",
			files: [
				"src/page/detail/component/spike-pattern-panel/pg-spike-pattern-panel.tsx",
				"src/page/detail/component/spike-pattern-panel/component/pg-detection-section.tsx",
				"src/page/detail/component/spike-pattern-panel/component/pg-summary-band.tsx",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-place-owner-files-in-role-folders",
					"ownership-keep-component-imports-flowing-downward",
					"strategy-prefer-children-over-render-props",
				],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "guardrails-review-banned-typescript-shortcuts-before-finishing"],
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
				"src/widget/chart/function/build-chart-option.ts",
			],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-prefer-plain-ts-for-local-react-helpers",
					"ownership-place-owner-files-in-role-folders",
					"ownership-keep-lifecycle-in-the-owning-component",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
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
			prompt: "pure rendering change in src/routes/catalog/index.tsx, with React and TypeScript only.",
			files: ["src/routes/catalog/index.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {react: [], typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"]},
		},
		scopeDrift: {
			evidence:
				"add route-owned empty-state className, src/routes/catalog/_index.css, and its direct side-effect import in a project without a CSS Modules standard; final skills add CSS.",
			files: ["src/routes/catalog/index.tsx", "src/routes/catalog/_index.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: ["ownership-place-owner-files-in-role-folders"],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "guardrails-review-banned-typescript-shortcuts-before-finishing"],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-keep-scope-slug-unique-per-owner",
					"naming-name-elements-and-modifiers-by-role",
					"naming-keep-page-slug-traceable",
					"naming-separate-owner-style-scopes",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"organization-keep-style-files-owned-by-one-component-or-route",
				],
			},
		},
	},
	"css-owner-boundary-split": {
		initial: {
			prompt:
				"split mixed route/document/local ownership from posts/_index.css into pages/_document.css and posts/_local/filter-dialog.css; class names do not change.",
			files: ["src/routes/posts/_index.css", "src/pages/_document.css", "src/routes/posts/_local/filter-dialog.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["naming-separate-owner-style-scopes", "organization-keep-style-files-owned-by-one-component-or-route"]},
		},
	},
	"css-domain-state-class-contract": {
		initial: {
			prompt:
				"split listButtonActive into base plus --active, add a direct clsx import, and compose with clsx() in catalog/index.tsx and _index.css; do not change pseudo-states.",
			files: ["src/routes/catalog/index.tsx", "src/routes/catalog/_index.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "guardrails-review-banned-typescript-shortcuts-before-finishing"],
				css: [
					"naming-name-elements-and-modifiers-by-role",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"composition-keep-classes-single-purpose",
					"selector-use-pseudo-classes-for-dom-owned-states",
					"values-separate-domain-state-modifiers-from-dom-interaction-states",
				],
			},
		},
	},
	"css-one-off-structural-modifier": {
		initial: {
			prompt:
				"replace non-repeatable section--compactTop spacing patch with a role-named element in catalog/detail.tsx and detail.css; keep the existing clsx import.",
			files: ["src/routes/catalog/detail.tsx", "src/routes/catalog/detail.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"],
				css: [
					"naming-name-elements-and-modifiers-by-role",
					"naming-use-scope-slug-element-modifier-syntax",
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
			files: ["src/routes/posts/_local/post-filter-dialog.tsx", "src/routes/posts/_local/post-filter-dialog.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "guardrails-review-banned-typescript-shortcuts-before-finishing"],
				css: [
					"naming-name-elements-and-modifiers-by-role",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"composition-style-ui-components-through-owned-wrappers",
					"selector-avoid-deep-descendant-dependencies",
					"selector-target-third-party-dom-from-owned-roots",
				],
			},
		},
		scopeDrift: {
			evidence: "replace the hard-coded wrapper color with an optional CSS variable and provide its fallback.",
			files: ["src/routes/posts/_local/post-filter-dialog.tsx", "src/routes/posts/_local/post-filter-dialog.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "guardrails-review-banned-typescript-shortcuts-before-finishing"],
				css: [
					"naming-name-elements-and-modifiers-by-role",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"composition-style-ui-components-through-owned-wrappers",
					"selector-avoid-deep-descendant-dependencies",
					"selector-target-third-party-dom-from-owned-roots",
					"values-always-provide-css-variable-fallbacks",
				],
			},
		},
	},
	"css-ui-wrapper-root-prop-contract": {
		initial: {
			prompt:
				"directly type-import the official root className Props, expose documented UiButtonProps, destructure props inside ui-button.tsx, and pass an existing layout class from order-actions.tsx; add no internal selector or new class.",
			files: ["src/components/ui/button/ui-button.tsx", "src/routes/orders/order-actions.tsx"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: ["composition-destructure-props-inside", "docs-require-jsdoc-on-key-declarations"],
				typescript: [
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"types-reuse-existing-contracts-before-new-types",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
				css: ["composition-compose-classes-with-clsx", "composition-style-ui-components-through-owned-wrappers"],
			},
		},
	},
	"css-rich-text-owner-block": {
		initial: {
			prompt:
				"move top-level .wg_entryDetail__prose h2 and > :first-child into existing owner-block raw-element nesting; class names and values stay unchanged.",
			files: ["src/components/widgets/entry-detail/wg-entry-detail.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-limit-nesting-block-depth"]},
		},
	},
	"css-dom-interaction-states": {
		initial: {
			prompt:
				"move top-level hover/focus/disabled into the same class block's &: nesting and preserve the focus ring; no app modifier or value is added.",
			files: ["src/components/ui/button/ui-button.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: ["selector-use-pseudo-classes-for-dom-owned-states", "values-separate-domain-state-modifiers-from-dom-interaction-states"],
			},
		},
	},
	"css-repeated-values-and-optional-token": {
		initial: {
			prompt:
				"scope a global .ant-tree selector under the existing .ui_themePreview owner root with one descendant level, and replace repeated color/spacing/radius with optional CSS variables and fallbacks; keep the file and owner name unchanged.",
			files: ["src/components/ui/theme-preview/theme-preview.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-avoid-deep-descendant-dependencies",
					"selector-target-third-party-dom-from-owned-roots",
					"selector-use-pseudo-classes-for-dom-owned-states",
					"values-always-provide-css-variable-fallbacks",
					"values-separate-domain-state-modifiers-from-dom-interaction-states",
					"values-tokenize-repeated-visual-values",
				],
			},
		},
	},
	"css-sticky-layout-intent": {
		initial: {
			prompt:
				"clarify sticky basis and z-index ownership and remove excessive width/height forcing in dashboard/_index.css; tokens and selectors stay unchanged.",
			files: ["src/routes/dashboard/_index.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["values-keep-layout-intent-explicit"]},
		},
	},
	"css-deep-project-descendant-chain": {
		initial: {
			prompt: "flatten .layout .panel .detail .item to a target element top-level block without changing class names or values.",
			files: ["src/routes/catalog/_index.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-avoid-deep-descendant-dependencies", "selector-limit-nesting-block-depth"]},
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
	assert.equal(document.rules.length, 20);
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
	assert.match(headerJsdocRule, /annotation 태그는 쓰지 않습니다/);
	assert.equal(
		readFrontmatterValue(headerJsdocRule, "requiresSelected"),
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
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
		"naming-use-direct-imports-and-public-entry-points",
		"functions-extract-helpers-only-when-the-boundary-is-real",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
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
	assert.equal(ids.length, 20);
	assert.equal(getRulesIndexByteBudget(ids.length), 8_000);
	assert.equal(Buffer.byteLength(source, "utf8") <= getRulesIndexByteBudget(ids.length), true);

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
	assert.ok(!(queryShaping.expectedSelected.react?.includes("screen-extract-utilities-selectively") ?? false));
	assert.equal(queryShaping.expectedSelected.react?.includes("screen-extract-utilities-selectively"), false);
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
				if (stage.expectedSkills.includes("typescript")) {
					assert.ok(
						stage.expectedSelected.typescript?.includes("guardrails-review-banned-typescript-shortcuts-before-finishing"),
						`${skillName}/${scenario.id} must select the TypeScript finish gate`,
					);
				}

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
	const typescriptFinishRule = await readRuleSource("typescript", "guardrails-review-banned-typescript-shortcuts-before-finishing");

	assertMentions(readAppliesWhen(derivedRule), ["alias", "추가·이동·제거"], "derivedRule");
	assert.match(originRule, /^reviewWith:[^\n]+screen-keep-derived-values-close/m);
	assert.match(bindingRule, /^requiresSelected:[^\n]+typescript\/naming-use-consistent-file-and-symbol-naming/m);
	assert.match(typescriptFinishRule, /^requiredOnCompletion: true$/m);

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
	assertMentions(extractSection(body, 1), ["React/CSS", "companion"], "typescript 1절");
});

test("React progressive metadata and all 42 rule routes match Appendix B exactly", async () => {
	const skillPaths = getSkillPaths("react", realSkillRootDir);
	const document = await readSkillDocument(skillPaths);

	assert.equal(document.metadata.progressiveDisclosure, true);
	// abstract 는 사람이 읽는 개요다. 로딩 경로 설명을 넣지 않는다.
	assert.doesNotMatch(document.metadata.abstract, /SKILL\.md|RULES_INDEX\.md|contracts\/|opt-in/);
	assert.deepEqual(document.metadata.companions, [
		{skill: "typescript", mode: "required"},
		{skill: "css", mode: "conditional", appliesWhen: "class contract, stylesheet 또는 styling surface를 변경한다."},
	]);
	assert.equal(document.rules.length, 42);
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
	const ownershipNamingRule = await readRuleSource("react", "ownership-use-consistent-file-and-symbol-naming");
	assertMentions(readAppliesWhen(ownershipNamingRule), ["바꿀 때", "sibling `.ts` support 파일"], "ownershipNamingRule");
	assert.match(
		ownershipNamingRule,
		/local query·mutation binding[^\n]+data-name-query-and-mutation-bindings-consistently|data-name-query-and-mutation-bindings-consistently[^\n]+local query·mutation binding/i,
	);
	const screenExtractionRule = await readRuleSource("react", "screen-extract-utilities-selectively");
	assert.match(
		screenExtractionRule,
		/query `select`[\s\S]+data-shape-query-data-with-select[\s\S]+별도 함수나 support module 경계[\s\S]+적용하지 않/i,
	);
	assert.match(screenExtractionRule, /Incorrect[\s\S]*normalizeEntryValues[\s\S]*mergeEntryPayload/i);
	assert.match(screenExtractionRule, /Correct[\s\S]*normalizeTreeNodes[\s\S]*handleSave/i);
	assertMentions(screenExtractionRule, [/Correct/i, /한 exported 함수/i, /buildEntryPayload/i], "screenExtractionRule");

	const template = await readFile(path.join(skillPaths.rulesDir, "_template.md"), "utf8");
	assert.match(readAppliesWhen(template), / /);
	assert.doesNotMatch(template, /^reviewWith:/m);

	// frontmatter 작성 규칙은 스킬마다 복제하지 않고 공통 기여 문서 한 곳에 둔다.
	const contributing = await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8");
	assert.match(contributing, /appliesWhen.*한 줄.*160/);
	assert.match(contributing, /reviewWith.*자동 선택이 아니라.*재평가/i);
	assert.match(contributing, /대상이 없으면.*key\s*를 생략/i);
});

test("React routing manifest is the exact seventeen-scenario Appendix B/D oracle with full positive coverage", async () => {
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
	assert.equal(manifest.scenarios.length, 17);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		18,
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
	assert.equal(ownerMove.expectedSelected.react?.includes("composition-destructure-props-inside"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"), true);
	const cssDrift = ownerMove.scopeDrift;
	assert.ok(cssDrift);
	assert.equal(cssDrift.expectedSelected.react?.includes("composition-destructure-props-inside"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("composition-do-not-build-structural-variants-with-modifiers"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("values-separate-domain-state-modifiers-from-dom-interaction-states"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("naming-separate-owner-style-scopes"), true);
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
	assert.equal(entries.length, 42);
	assert.equal(getRulesIndexByteBudget(entries.length), 15_480);
	assert.equal(Buffer.byteLength(source, "utf8") <= getRulesIndexByteBudget(entries.length), true);

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
		{skill: "typescript", mode: "conditional", appliesWhen: "TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다."},
	]);
	assert.equal(document.rules.length, 19);
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
	const wrapperStylingRule = await readRuleSource("css", "composition-style-ui-components-through-owned-wrappers");
	assertMentions(
		wrapperStylingRule,
		[/스타일 창구는 root `className` 하나/i, /래핑 `div`/i, /selector-target-third-party-dom-from-owned-roots/i],
		"wrapperStylingRule",
	);
	const singlePurposeRule = await readRuleSource("css", "composition-keep-classes-single-purpose");
	assertMentions(readAppliesWhen(singlePurposeRule), ["기존 결합 책임", "처음부터 새 single-purpose pair"], "singlePurposeRule");
	const layoutIntentRule = await readRuleSource("css", "values-keep-layout-intent-explicit");
	assertMentions(readAppliesWhen(layoutIntentRule), ["base/modifier", "`display`·spacing", "값 그대로"], "layoutIntentRule");
	const fallbackRule = await readRuleSource("css", "values-always-provide-css-variable-fallbacks");
	assertMentions(readAppliesWhen(fallbackRule), ["`var(--*)`", "core token"], "fallbackRule");
	assertMentions(
		flattenWhitespace(fallbackRule),
		[/core token 목록/i, /fail-loud/i, /values-tokenize-repeated-visual-values/i],
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
	assert.equal(manifest.scenarios.length, 11);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		13,
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
	assert.deepEqual(routeDrift?.expectedSelected, {
		react: [],
		typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"],
	});
	assert.deepEqual(routeDrift?.scopeDrift?.expectedSelected.react, ["ownership-place-owner-files-in-role-folders"]);
	assert.deepEqual(routeDrift?.scopeDrift?.expectedSelected.typescript, [
		"naming-use-direct-imports-and-public-entry-points",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	]);
	const domainState = scenarioById.get("css-domain-state-class-contract");
	assert.equal(domainState?.expectedSelected.css?.includes("selector-use-pseudo-classes-for-dom-owned-states"), true);

	const oneOffStructuralModifier = scenarioById.get("css-one-off-structural-modifier");
	assert.equal(oneOffStructuralModifier?.expectedSelected.css?.includes("composition-keep-classes-single-purpose"), false);
	assert.equal(oneOffStructuralModifier?.expectedSelected.css?.includes("composition-keep-classes-single-purpose") ?? false, false);

	const repeatedValues = scenarioById.get("css-repeated-values-and-optional-token");
	assert.equal(repeatedValues?.expectedSelected.css?.includes("selector-use-pseudo-classes-for-dom-owned-states"), true);
	assert.equal(repeatedValues?.expectedSelected.css?.includes("values-separate-domain-state-modifiers-from-dom-interaction-states"), true);

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
	assert.match(routeOwnerRule, /`pg_\*` owner의 class slug를 새로 만들거나 이름을 바꿀 때/);
});

test("v16 boundary contracts distinguish semantic role changes from contextual and byte-equivalent noise", async () => {
	const readRule = async (skillName: "react" | "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const routeFlow = await readRule("react", "screen-keep-route-flow-visible");
	assertMentions(routeFlow, ["소유자가 그대로인 변경은 대상이 아", "binding·alias", "support-code 규칙"], "routeFlow");
	assert.match(
		routeFlow,
		/소유자가 그대로인 변경은 대상이 아[\s\S]*`query\.select`[\s\S]*binding·alias[\s\S]*derived-state effect[\s\S]*render 계산/i,
	);

	const curriedHandler = await readRule("react", "events-name-and-curry-handlers");
	assertMentions(
		curriedHandler,
		[/인라인 callback/i, /추가 인자/i, /event boundary/i, /wrapper/i, /(?:완료가 아|우회)/i],
		"curriedHandler",
	);
	assertMentions(curriedHandler, [/최종 반환/i, /React handler/i, /typing-function-type-first/i, /함께 적용/i], "curriedHandler");
	assert.match(
		curriedHandler,
		/UI-agnostic domain[\s\S]*custom component prop callback[\s\S]*`useEffectEvent`[\s\S]*(?:DOM event|curry)[\s\S]*(?:만들지 않|N\/A)/i,
	);

	const reactHandlerType = await readRule("react", "typing-function-type-first");
	assert.match(reactHandlerType, /curried|고차 함수/i);
	assertMentions(reactHandlerType, [/contextual typing/i, /반환 함수 타입/i, /생략하지 않/i], "reactHandlerType");
	assertMentions(
		reactHandlerType,
		[/`query\.select`/i, /one-off contextual callback/i, /UI-agnostic domain function/i, /적용하지 않/i],
		"reactHandlerType",
	);

	const reactContracts = await Promise.all(
		["screen-keep-route-flow-visible", "events-name-and-curry-handlers", "typing-function-type-first"].map((ruleId) =>
			readFile(path.join(realSkillRootDir, "react", "contracts", `${ruleId}.md`), "utf8"),
		),
	);
	assertMentions(reactContracts[0]!, [/(?:`query\.select`|query `select`)/i, /derived-state effect/i, /render 계산/i], "reactContracts");
	assertMentions(reactContracts[1]!, [/인라인 callback/i, /custom component prop callback/i], "reactContracts");
	assert.match(reactContracts[2]!, /curried[\s\S]*one-off contextual callback/i);

	const typescriptRouter = await readFile(path.join(realSkillRootDir, "typescript", "SKILL.md"), "utf8");
	assertMentions(
		typescriptRouter,
		[/byte-equivalent/i, /named shape/i, /callable/i, /input\/output/i, /변경으로 본다/i],
		"typescriptRouter",
	);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assertMentions(documentedShape, [/기존 named shape/i, /새 callable (?:input|입력)/i, /(?:output|출력)/i, /Selected/i], "documentedShape");
	assertMentions(documentedShape, [/익명/i, /(?:inferred|추론)/i, /(?:query )?`select`/i, /N\/A/i], "documentedShape");
	assertMentions(documentedShape, [/JSDoc/i, /(?:스스로|자기)/i, /(?:활성화|Selected)/i, /(?:하지 않|금지)/i], "documentedShape");

	const directImports = await readRule("typescript", "naming-use-direct-imports-and-public-entry-points");
	assertMentions(readAppliesWhen(directImports), ["같은 module path", /(?:value|type) specifier/, "추가·삭제·전환"], "directImports");

	const unusedParameters = await readRule("typescript", "types-mark-unused-parameters-with-underscore");
	assertMentions(readAppliesWhen(unusedParameters), ["curried handler", "최종 callback", /(?:생략|사용하지 않)/], "unusedParameters");
	assertMentions(unusedParameters, [/framework alias/i, /매개변수 생략/i, /N\/A.*아니/i, /`_event`/i], "unusedParameters");

	for (const ruleId of [
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-reuse-callback-signatures-from-existing-contracts",
	]) {
		const contextualCallback = await readRule("typescript", ruleId);

		// 제외 표지는 불렛 앞(`제외:`)에도 문장 끝(`… 제외한다`)에도 올 수 있다. 순서가 아니라 개념 존재만 본다.
		assertMentions(
			readAppliesWhen(contextualCallback),
			[/annotation/i, "없는", /one-off/i, /contextual(?:ly)? typed/i, /N\/A|제외/],
			`${ruleId} appliesWhen`,
		);
	}

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assertMentions(existingContract, [/unchanged contract/i, /새 사용처/i, /(?:N\/A|제외)/i], "existingContract");

	const typescriptContracts = await Promise.all(
		[
			"naming-use-direct-imports-and-public-entry-points",
			"types-document-custom-types-and-shapes",
			"types-mark-unused-parameters-with-underscore",
			"types-prefer-function-variable-types-over-parameter-annotations",
			"types-reuse-callback-signatures-from-existing-contracts",
			"types-reuse-existing-contracts-before-new-types",
		].map((ruleId) => readFile(path.join(realSkillRootDir, "typescript", "contracts", `${ruleId}.md`), "utf8")),
	);
	assert.match(typescriptContracts[0]!, /same module path|같은 module path/i);
	assert.match(typescriptContracts[1]!, /CRITICAL rule[\s\S]*full rule/i);
	assertMentions(typescriptContracts[2]!, [/curried handler/i, /최종 callback/i], "typescriptContracts");
	assert.match(typescriptContracts[3]!, /CRITICAL rule[\s\S]*full rule/i);
	assert.match(typescriptContracts[4]!, /one-off contextually typed inline callback/i);
	assertMentions(typescriptContracts[5]!, [/unchanged contract/i, /(?:새 함수 인자|새 사용처|call site)/i], "typescriptContracts");

	const stylesheetFormat = await readRule("css", "naming-default-to-plain-css-when-no-module-convention");
	assertMentions(stylesheetFormat, [/stylesheet 접근 형식/i, /plain CSS/i, /CSS Modules/i], "stylesheetFormat");
	assertMentions(
		stylesheetFormat,
		[/기존 plain CSS/i, /(?:class|selector)/i, /(?:rename|이름 변경)/i, /(?:N\/A|제외)/i],
		"stylesheetFormat",
	);

	const modifierClassification = await readRule("css", "composition-do-not-build-structural-variants-with-modifiers");
	assertMentions(modifierClassification, [/허용:/, /one-off structural modifier/i, /두 번째 화면/], "modifierClassification");

	const layoutIntent = await readRule("css", "values-keep-layout-intent-explicit");
	assert.match(layoutIntent, /`z-index`[\s\S]*layer 토큰[\s\S]*stacking 순서/i);
	assert.match(layoutIntent, /기준 컨테이너를 주석/i);
	assert.doesNotMatch(layoutIntent, /동작 변화 없이/);

	const variableFallback = await readRule("css", "values-always-provide-css-variable-fallbacks");
	assert.match(variableFallback, /core token 목록에 있는 변수[\s\S]*쓰지 않습니다/i);
	assert.match(variableFallback, /그 밖의 모든 `var\(\)`[\s\S]*씁니다/i);

	for (const ruleId of ["values-separate-domain-state-modifiers-from-dom-interaction-states"]) {
		const interactionState = await readRule("css", ruleId);
		assert.match(
			interactionState,
			/(?:hover|focus|disabled)[\s\S]*unconditional base element block[\s\S]*modifier 아래[\s\S]*(?:좁히지 않|두지 않)/i,
		);
	}
	const cssInteractionContracts = await Promise.all(
		["values-separate-domain-state-modifiers-from-dom-interaction-states"].map((ruleId) =>
			readFile(path.join(realSkillRootDir, "css", "contracts", `${ruleId}.md`), "utf8"),
		),
	);
	for (const contract of cssInteractionContracts) {
		assertMentions(contract, [/base(?: element)? block/i, /modifier 아래/i], "contract");
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
		"types-reuse-callback-signatures-from-existing-contracts",
	]) {
		assert.equal(tsSelected("RTE10-derived-selection-state", ruleId), true);
	}
	for (const ruleId of [
		"types-document-custom-types-and-shapes",
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-reuse-callback-signatures-from-existing-contracts",
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
		"values-keep-layout-intent-explicit",
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
	for (const ruleId of ["values-keep-layout-intent-explicit", "values-always-provide-css-variable-fallbacks"]) {
		assert.equal(ownerDrift?.expectedSelected.css?.includes(ruleId) ?? false, false);
	}

	const selected = (scenarioId: string, ruleId: string): boolean =>
		mixedScenarioById.get(scenarioId)?.expectedSelected.react?.includes(ruleId) ?? false;
	const notApplicable = (scenarioId: string, ruleId: string): boolean =>
		!(mixedScenarioById.get(scenarioId)?.expectedSelected.react?.includes(ruleId) ?? false);

	assert.equal(selected("RTE09-route-runtime-section", "screen-keep-route-flow-visible"), true);
	assert.equal(notApplicable("RTE10-derived-selection-state", "screen-keep-route-flow-visible"), true);
	assert.equal(notApplicable("RTE12-query-shaping", "screen-keep-route-flow-visible"), true);
	for (const ruleId of ["ownership-import-react-types-directly", "typing-function-type-first", "events-name-and-curry-handlers"]) {
		assert.equal(selected("RTE10-derived-selection-state", ruleId), true);
	}
	for (const scenarioId of ["RTE08-delete-handler-flow", "RTE09-route-runtime-section"]) {
		assert.equal(selected(scenarioId, "events-name-and-curry-handlers"), true);
		assert.equal(selected(scenarioId, "typing-function-type-first"), true);
		assert.equal(notApplicable(scenarioId, "ownership-import-react-types-directly"), true);
	}
	assert.equal(selected("RTE14-subscription-effectevent", "events-name-and-curry-handlers"), true);
	assert.equal(notApplicable("RTE14-subscription-effectevent", "typing-function-type-first"), true);
	assert.equal(notApplicable("RTE14-subscription-effectevent", "ownership-import-react-types-directly"), true);
});

test("v17 TypeScript boundaries exclude React props and prevent self-created duplicate contracts", async () => {
	const readRule = async (skillName: "typescript", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const namedObjectParams = await readRule("typescript", "functions-use-named-object-params-for-complex-signatures");
	assertMentions(readAppliesWhen(namedObjectParams), [/React (?:함수 )?컴포넌트/, "props", /(?:N\/A|제외)/], "namedObjectParams");
	assert.match(
		namedObjectParams,
		/기존 named contract[\s\S]*그대로 재사용[\s\S]*`\*Params`[\s\S]*`\*Args`[\s\S]*(?:새로 만들지 않|추가하지 않)/i,
	);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	// 위와 같은 이유로 순서를 박지 않는다.
	assertMentions(
		readAppliesWhen(documentedShape),
		[/external|generated|read-only|shared/, /unchanged|변경하지 않/, /N\/A|제외/],
		"documentedShape appliesWhen",
	);
	assert.match(
		readAppliesWhen(documentedShape),
		/schema root[\s\S]+계약 field[\s\S]+파생 alias[\s\S]+추가·변경[\s\S]+named shape[\s\S]+callable 역할[\s\S]+추가/,
	);
	assert.doesNotMatch(readAppliesWhen(documentedShape), /객체형 상수·field·alias/);
	assert.match(
		documentedShape,
		/새 callable (?:input|입력)[^\n]+(?:output|출력)[^\n]*역할[\s\S]*새 (?:type|interface|선언)[\s\S]*요구하지 않[\s\S]*(?:기존|로컬 소유)[^\n]*named shape[\s\S]*(?:문서|JSDoc|`@summary`)[\s\S]*(?:보강|갱신)/i,
	);
	assert.match(
		documentedShape,
		/(?:외부|external|generated|read-only|shared)[\s\S]*(?:owner|선언)[^\n]+(?:수정하지 않|보강하지 않)[\s\S]*(?:local alias|별도 alias)[^\n]+(?:만들지 않|추가하지 않)[\s\S]*callable 문서화 여부[^\n]+docs-require-header-jsdoc-on-key-declarations[^\n]+(?:독립|applicability|판정)/i,
	);
	assert.doesNotMatch(documentedShape, /callable 선언에서[^\n]+(?:역할|계약)[^\n]+설명/);

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assert.match(
		flattenWhitespace(existingContract),
		/positional[\s\S]*object[\s\S]*(?:수정 가능한 로컬 소유|기존) (?:호환|compatible) (?:named )?(?:shape|contract)[\s\S]*types-document-custom-types-and-shapes[^\n]+Selected[\s\S]*types-reuse-existing-contracts-before-new-types[^\n]+N\/A/i,
	);
	assert.match(
		existingContract,
		/요청[^\n]+(?:semantic delta[^\n]+없는|밖)[\s\S]*`\*Params`[\s\S]*`\*Input`[\s\S]*(?:스스로|자기|자가)[\s\S]*(?:활성화|Selected)[\s\S]*(?:하지 않|금지)/i,
	);
	assert.match(
		flattenWhitespace(existingContract),
		/types-document-custom-types-and-shapes[\s\S]+Selected[\s\S]*types-reuse-existing-contracts-before-new-types[\s\S]+N\/A[\s\S]*(?:외부|external|generated|read-only|shared)[\s\S]+(?:두 type 규칙|두 규칙|모두)[\s\S]+N\/A[\s\S]*callable 문서화 여부[\s\S]+docs rule[\s\S]+독립 판정/i,
	);
	assert.doesNotMatch(existingContract, /callable header[^\n]+문서화/);
	assert.doesNotMatch(readAppliesWhen(existingContract), /재사용 결정을 바꾼다/);
	assert.match(
		existingContract,
		/(?:정규화 전|raw input)[\s\S]*(?:정규화 후|normalized (?:output|payload)|payload)[\s\S]*(?:같은 field|field[^\n]+같)[\s\S]*의미[^\n]+(?:다르|달라)[\s\S]*(?:별도|새) (?:input )?(?:shape|contract)[\s\S]*types-reuse-existing-contracts-before-new-types[^\n]+N\/A/i,
	);
	assert.doesNotMatch(documentedShape, /\bT\d{2}\b/);
	assert.doesNotMatch(existingContract, /\bT\d{2}\b/);

	const typescriptPressure = await readFile(path.join(realSkillRootDir, "typescript", "pressure-tests.md"), "utf8");
	assert.match(
		typescriptPressure,
		/CreateEntryPayloadParams[\s\S]*(?:정규화 전|raw input)[\s\S]*CreateEntryPayload[\s\S]*(?:정규화 후|payload)/i,
	);
	assert.match(
		typescriptPressure,
		/External Contract and Documentation Independence[\s\S]*types-document-custom-types-and-shapes[\s\S]*types-reuse-existing-contracts-before-new-types[\s\S]*(?:둘 다|모두) N\/A[\s\S]*docs-require-header-jsdoc-on-key-declarations[\s\S]*독립[^\n]+Selected/i,
	);

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
	assertMentions(generatedContracts[0]!, [/React 함수 컴포넌트/i, /기존 named contract/i], "generatedContracts");
	assert.match(generatedContracts[1]!, /CRITICAL rule[\s\S]*full rule/i);
	assertMentions(generatedContracts[2]!, [/positional/i, /object/i, /`\*Params`/i, /(?:스스로|자기|자가)/i], "generatedContracts");
});

test("v17 semantic contracts reject English-only annotations and effective deep third-party chains", async () => {
	const readRule = async (skillName: "typescript" | "css", ruleId: string): Promise<string> => {
		return await readRuleSource(skillName, ruleId);
	};

	const koreanComments = await readRule("typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints");
	assertMentions(koreanComments, [/주석 본문 전체/i, /(?:ASCII|영문)/i, /(?:한글 주석으로 인정하지 않|실패)/i], "koreanComments");
	assert.match(koreanComments, /route-local entry tree props/);
	assert.match(koreanComments, /route-local 엔트리 트리 입력 계약/);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(
		documentedShape,
		/헤더와 필드 주석[\s\S]*존재만으로[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*(?:content|한국어)[^\n]+gate/i,
	);
	const headerDocs = await readRule("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assert.match(
		flattenWhitespace(headerDocs),
		/헤더 doc 주석[\s\S]*(?:영문 label|영문 라벨)[\s\S]*(?:충족하지 않|미충족|완료되지 않)[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*content gate/i,
	);
	assert.doesNotMatch(headerDocs, /\bT\d{2}\b/);

	const descendantDepth = await readRule("css", "selector-avoid-deep-descendant-dependencies");
	assertMentions(descendantDepth, [/결합자라고 부릅니다/, /중첩은 펼친 뒤에/, /같은 요소에 붙는/], "descendantDepth");
	assertMentions(descendantDepth, [/기본값은 결합자 0/, /소유 root 아래 third-party 내부 DOM/], "descendantDepth");

	const thirdPartyRoot = await readRule("css", "selector-target-third-party-dom-from-owned-roots");
	assertMentions(
		thirdPartyRoot,
		[/owned root/i, /instance를 한정/i, /중간 (?:library root|라이브러리 root)/i, /(?:생략|반복하지 않)/i],
		"thirdPartyRoot",
	);
	assertMentions(thirdPartyRoot, [/selector-avoid-deep-descendant-dependencies/i, /주석 한 줄/i, /(?:근거|evidence)/i], "thirdPartyRoot");
	assert.match(thirdPartyRoot, /& \.ant-tree \.ant-tree-node-content-wrapper/);
	assert.match(thirdPartyRoot, /& \.ant-tree-node-content-wrapper/);

	const typescriptPressure = await readFile(path.join(realSkillRootDir, "typescript", "pressure-tests.md"), "utf8");
	assert.match(typescriptPressure, /route-local entry tree props/);
	assert.match(typescriptPressure, /route-local 엔트리 트리 입력 계약/);
	const cssPressure = await readFile(path.join(realSkillRootDir, "css", "pressure-tests.md"), "utf8");
	assert.match(cssPressure, /& \.ant-tree \.ant-tree-node-content-wrapper/);
	assert.match(cssPressure, /& \.ant-tree-node-content-wrapper/);

	const generatedContracts = await Promise.all(
		[
			["typescript", "docs-require-header-jsdoc-on-key-declarations"],
			["typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints"],
			["css", "selector-avoid-deep-descendant-dependencies"],
			["css", "selector-target-third-party-dom-from-owned-roots"],
		].map(([skillName, ruleId]) => readFile(path.join(realSkillRootDir, skillName!, "contracts", `${ruleId}.md`), "utf8")),
	);
	assert.match(
		flattenWhitespace(generatedContracts[0]!),
		/영문 label[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*content gate/i,
	);
	assertMentions(generatedContracts[1]!, [/주석 본문 전체/i, /(?:ASCII|영문)/i], "generatedContracts");
	assert.match(generatedContracts[2]!, /결합자[\s\S]*중첩은 펼친 뒤에/i);
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
	assert.equal(entries.length, 19);
	assert.equal(getRulesIndexByteBudget(entries.length), 7_660);
	assert.equal(Buffer.byteLength(source, "utf8") <= getRulesIndexByteBudget(entries.length), true);

	for (const entry of entries) {
		assert.equal(entry.fileName, `${entry.id}.md`);
		await access(path.join(skillPaths.ruleContractsDir, entry.fileName));
	}

	const handbook = await readFile(skillPaths.outputPath, "utf8");
	assert.match(handbook, /metadata\.json\.companions/);
	assert.doesNotMatch(handbook, /metadata\.json\.extends/);
	assert.match(handbook, /^## 함께 따르는 규칙$/m);
	assert.match(handbook, /- \[TypeScript Convention\]\(\.\.\/typescript\/HANDBOOK\.md\) — 다음 조건에서 함께 적용합니다\./);
	assert.match(handbook, /다음 조건에서 함께 적용합니다\. TS\/TSX class contract, wrapper Props 또는 style import를 함께 변경한다\./);
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
