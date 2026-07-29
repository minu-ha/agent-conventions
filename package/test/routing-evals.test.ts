import assert from "node:assert/strict";
import {access, mkdtemp, mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

import {getSkillPaths} from "../src/config.js";
import {readSkillDocument} from "../src/parser.js";
import {readRoutingEvalManifest, validateRoutingEvalManifest, validateRoutingEvalManifests} from "../src/routing-evals.js";
import {generateRulesIndexMarkdown, getCanonicalRoutingRuleIds, getRuleId, getRulesIndexByteBudget} from "../src/routing.js";
import type {RoutingEvalManifest, RoutingExpectedPartition, SkillCompanion} from "../src/types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(currentDir, "../..");

/**
 * @helper 줄바꿈으로 접힌 본문을 한 줄로 펴서 문구 단위로 비교
 */
const flattenWhitespace = (text: string): string => text.replace(/\s+/g, " ");
const realSkillRootDir = path.join(repoDir, "skill");
const behavioralProtocolPath = path.join(repoDir, "docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json");

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
	"docs-standardize-annotation-tags-by-declaration-role",
	"docs-use-helper-for-reusable-pure-helper-functions",
	"docs-write-concise-korean-comments-about-purpose-and-constraints",
	"guardrails-review-banned-typescript-shortcuts-before-finishing",
] as const;

const cssRuleUniverse = [
	"naming-default-to-plain-css-when-no-module-convention",
	"naming-keep-scope-slug-unique-per-owner",
	"naming-name-elements-and-modifiers-by-role",
	"naming-preserve-route-slug-traceability",
	"naming-separate-local-and-route-style-scopes",
	"naming-use-scope-slug-element-modifier-syntax",
	"composition-compose-classes-with-clsx",
	"composition-do-not-build-structural-variants-with-modifiers",
	"composition-keep-classes-single-purpose",
	"composition-style-ui-components-through-owned-wrappers",
	"composition-prefer-ui-wrapper-prop-types",
	"selector-avoid-deep-descendant-dependencies",
	"selector-keep-project-selectors-flat",
	"selector-target-third-party-dom-from-owned-roots",
	"selector-use-pseudo-classes-for-dom-owned-states",
	"values-keep-layout-intent-explicit",
	"values-always-provide-css-variable-fallbacks",
	"values-separate-domain-state-modifiers-from-dom-interaction-states",
	"values-tokenize-repeated-visual-values",
	"organization-keep-style-files-owned-by-one-component-or-route",
	"organization-review-banned-css-patterns-before-finishing",
] as const;

/**
 * @summary generated React index의 canonical codepoint rule universe
 */
const reactRuleUniverse = [
	"ownership-avoid-barrel-and-react-namespace-imports",
	"ownership-prefer-plain-ts-for-local-react-helpers",
	"ownership-layer-component-boundaries",
	"ownership-place-route-local-files-by-scope",
	"ownership-shared-config-entry-points",
	"ownership-use-consistent-file-and-symbol-naming",
	"typing-function-type-first",
	"typing-reuse-existing-contracts",
	"strategy-avoid-boolean-prop-proliferation",
	"strategy-choose-single-composition-compound-and-variants",
	"strategy-prefer-children-over-render-props",
	"composition-destructure-props-inside",
	"composition-do-not-define-components-inside-components",
	"composition-prefer-arrow-functions-and-object-params",
	"composition-named-handlers-over-inline",
	"composition-use-activity-for-render-branches",
	"composition-use-ref-prop-instead-of-forwardref-in-react-19",
	"screen-avoid-premature-abstraction",
	"screen-extract-local-section-components-for-runtime-boundaries",
	"screen-extract-utilities-selectively",
	"screen-keep-derived-values-close",
	"screen-keep-route-flow-visible",
	"screen-move-pure-support-code-out-of-entry-files",
	"events-keep-handler-flow-inline",
	"events-name-and-curry-handlers",
	"events-run-user-actions-in-handlers-not-effects",
	"state-avoid-fallback-defaults-and-loading-flags",
	"state-calculate-derived-values-during-render",
	"state-choose-state-tools-by-source-of-truth",
	"state-name-query-and-mutation-bindings-consistently",
	"state-compiler-first-memoization",
	"state-preserve-origin-chaining",
	"state-shape-query-data-with-select",
	"state-store-derived-authority",
	"state-use-functional-setstate-updates",
	"state-use-lazy-state-initializers-for-expensive-defaults",
	"state-use-starttransition-for-non-urgent-updates",
	"state-use-usedeferredvalue-for-heavy-derived-renders",
	"state-use-effectevent-for-non-reactive-effect-callbacks",
	"docs-document-compound-parts-with-part-and-description",
	"docs-limit-inline-comments-to-non-obvious-logic",
	"docs-require-jsdoc-on-key-declarations",
] as const;

test("behavioral protocol mandatory routing contract exactly mirrors current rule frontmatter", async () => {
	const skillNames = ["react", "typescript", "css"] as const;
	const documents = new Map(
		await Promise.all(
			skillNames.map(async (skillName) => [skillName, await readSkillDocument(getSkillPaths(skillName, realSkillRootDir))] as const),
		),
	);
	const ruleReferenceByQualifiedId = new Map<string, string>();

	for (const skillName of skillNames) {
		const document = documents.get(skillName)!;
		const prefix = skillName.slice(0, 1).toUpperCase();

		for (const [index, ruleId] of getCanonicalRoutingRuleIds(document).entries()) {
			ruleReferenceByQualifiedId.set(`${skillName}/${ruleId}`, `${skillName}:${prefix}${String(index + 1).padStart(2, "0")} ${ruleId}`);
		}
	}

	const expectedRequiresSelected: Record<string, string[]> = {};
	const expectedCompletionGates: Record<string, string[]> = {};

	for (const skillName of skillNames) {
		const document = documents.get(skillName)!;
		expectedCompletionGates[skillName] = [];

		for (const rule of document.rules) {
			const ruleId = getRuleId(rule);
			const sourceReference = ruleReferenceByQualifiedId.get(`${skillName}/${ruleId}`)!;

			if (rule.requiredOnCompletion) expectedCompletionGates[skillName]!.push(sourceReference.slice(sourceReference.indexOf(":") + 1));

			if (rule.requiresSelected.length > 0) {
				expectedRequiresSelected[sourceReference] = rule.requiresSelected.map((target) => {
					const qualifiedTarget = target.includes("/") ? target : `${skillName}/${target}`;
					const targetReference = ruleReferenceByQualifiedId.get(qualifiedTarget);

					assert.ok(targetReference, `missing current target identity for ${qualifiedTarget}`);
					return targetReference;
				});
			}
		}
	}

	const protocol = JSON.parse(await readFile(behavioralProtocolPath, "utf8")) as {
		execution: {mandatoryRoutingContract: {completionGates: Record<string, string[]>; requiresSelected: Record<string, string[]>}};
	};
	const actualContract = protocol.execution.mandatoryRoutingContract;
	const normalizeRequiresSelected = (record: Record<string, string[]>): Record<string, string[]> =>
		Object.fromEntries(
			Object.entries(record)
				.sort(([left], [right]) => left.localeCompare(right, "en"))
				.map(([source, targets]) => [source, [...targets].sort((left, right) => left.localeCompare(right, "en"))]),
		);

	assert.deepEqual(actualContract.completionGates, expectedCompletionGates);
	assert.deepEqual(normalizeRequiresSelected(actualContract.requiresSelected), normalizeRequiresSelected(expectedRequiresSelected));
});

/**
 * @summary Appendix A의 TypeScript rule별 exact routing metadata oracle
 */
const typescriptRuleRouting = {
	"absence-expose-optional-values-instead-of-silent-fallbacks": {
		appliesWhen: "optional 값의 읽기·정규화·전달을 바꾸거나 `??`, `||`, 기본값 또는 빈 값 대체 분기를 추가·변경한다.",
		reviewWith: ["docs-keep-inline-comments-for-constraints-and-caveats"],
	},
	"docs-keep-inline-comments-for-constraints-and-caveats": {
		appliesWhen: "함수 본문의 `//` 주석을 추가·수정·유지하거나 도메인 규칙, 예외 방어, 외부 제약 또는 부수효과 순서를 주석으로 설명한다.",
		reviewWith: [],
	},
	"docs-require-header-jsdoc-on-key-declarations": {
		appliesWhen:
			"named query·mutation, 원격 함수, 비자명한 handler/effect, reusable/exported helper·custom hook, custom type·interface, store, formatter 또는 예외 memo 선언을 추가·변경한다.",
		reviewWith: [],
	},
	"docs-standardize-annotation-tags-by-declaration-role": {
		appliesWhen: "TypeScript/TSX 선언의 JSDoc 태그를 추가·변경하거나 선언 역할에 맞는 annotation을 검토한다.",
		reviewWith: [],
	},
	"docs-use-helper-for-reusable-pure-helper-functions": {
		appliesWhen:
			"여러 caller가 쓰는 pure support function, owner-named exported helper 또는 `shared/util.ts` 함수를 추가·변경하거나 `@helper`를 붙이려 한다.",
		reviewWith: [],
	},
	"docs-write-concise-korean-comments-about-purpose-and-constraints": {
		appliesWhen: "TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰한다.",
		reviewWith: [],
	},
	"functions-avoid-imperative-assembly-in-wide-scopes": {
		appliesWhen: "파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push` 또는 조건부 누적으로 값을 조립하거나 이를 리팩터링한다.",
		reviewWith: [],
	},
	"functions-extract-helpers-only-when-the-boundary-is-real": {
		appliesWhen:
			"support function을 추출·이동·export·공유하거나 generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꾼다.",
		reviewWith: ["docs-use-helper-for-reusable-pure-helper-functions", "docs-require-header-jsdoc-on-key-declarations"],
	},
	"functions-prefer-immutable-array-sorting": {
		appliesWhen: "props, state, 매개변수 또는 공유 입력에서 온 배열을 정렬하거나 기존 `.sort()` 호출을 추가·변경한다.",
		reviewWith: [],
	},
	"functions-replace-enum-with-as-const-objects": {
		appliesWhen: "`enum` 또는 타입과 런타임에서 함께 쓰는 enum-like 값 집합을 추가·변경한다.",
		reviewWith: [],
	},
	"functions-use-named-object-params-for-complex-signatures": {
		appliesWhen:
			"매개변수 3개 이상 또는 같은 계열 인자를 받는 일반 함수를 추가·변경하거나 객체 매개변수의 구조분해 위치를 바꾼다. React 함수 컴포넌트의 props 수신·구조분해만 바꾸면 제외한다.",
		reviewWith: [],
	},
	"functions-use-set-and-map-for-repeated-lookups": {
		appliesWhen: "같은 컬렉션에 `includes`, `find` 또는 keyed lookup을 여러 번 수행하는 코드를 추가·변경한다.",
		reviewWith: [],
	},
	"guardrails-review-banned-typescript-shortcuts-before-finishing": {
		appliesWhen:
			"TypeScript/TSX 변경을 완료 판정하거나 diff에서 barrel, 중복 타입, 조기 helper, 넓은 조립, 무근거 fallback 또는 자명한 주석을 점검한다.",
		reviewWith: [],
	},
	"naming-centralize-shared-config-namespaces": {
		appliesWhen:
			"여러 leaf 모듈이 함께 쓰는 URL, feature flag, 페이지 크기나 상수를 추가·이동·중복 정의하거나 shared config 경계를 바꾼다.",
		reviewWith: ["naming-preserve-config-origin-with-chained-access", "naming-use-direct-imports-and-public-entry-points"],
	},
	"naming-preserve-config-origin-with-chained-access": {
		appliesWhen:
			"`config` 또는 `util` 값을 leaf 모듈에서 접근하며 넓은 스코프 구조분해, 별칭 또는 feature-local namespace를 추가·변경한다.",
		reviewWith: [],
	},
	"naming-use-consistent-file-and-symbol-naming": {
		appliesWhen:
			"TypeScript 파일, local 변수·함수·타입, 객체·schema field 또는 enum-like 상수의 이름을 새로 만들거나 바꾼다. alias 없는 third-party import binding 추가는 제외한다.",
		reviewWith: [],
	},
	"naming-use-direct-imports-and-public-entry-points": {
		appliesWhen:
			"TypeScript import/export, barrel, shared 공개 진입점·feature support module 경계를 추가·변경하거나 같은 module path의 value/type specifier를 추가·삭제·전환한다.",
		reviewWith: [],
	},
	"types-document-custom-types-and-shapes": {
		appliesWhen:
			"type·interface·schema root·객체 상수·계약 field·파생 alias를 추가·변경하거나 named shape에 callable 역할을 추가한다. 외부·generated·read-only·shared unchanged shape·익명 inferred 반환은 제외한다.",
		reviewWith: [],
	},
	"types-mark-unused-parameters-with-underscore": {
		appliesWhen:
			"기존 callback·framework 계약 구현을 추가·변경하며 parameter를 생략하거나 사용하지 않는다. curried handler가 반환하는 최종 callback의 생략도 포함한다.",
		reviewWith: [],
	},
	"types-prefer-function-variable-types-over-parameter-annotations": {
		appliesWhen:
			"기존 callable 계약을 named·shared 함수 구현에 재사용하거나 같은 시그니처를 여러 구현이 공유하도록 바꾼다. annotation 없는 one-off contextually typed inline callback은 제외한다.",
		reviewWith: [],
	},
	"types-reuse-callback-signatures-from-existing-contracts": {
		appliesWhen:
			"interface·객체·framework의 named·shared callback 구현에서 기존 시그니처를 재사용·변경한다. annotation 없는 one-off contextually typed inline callback은 제외한다.",
		reviewWith: ["types-mark-unused-parameters-with-underscore"],
	},
	"types-reuse-existing-contracts-before-new-types": {
		appliesWhen:
			"의미상 같은 기존 type·interface·schema 대신 shape를 새로 선언·변경·복제·파생하거나 중복 shape를 도입·제거한다. 호환 후보 없는 새 shape, 순수 owner 이동, unchanged contract의 새 사용처는 제외한다.",
		reviewWith: ["types-document-custom-types-and-shapes"],
	},
} as const;

/**
 * @summary Appendix C의 CSS rule별 exact routing metadata oracle
 */
const cssRuleRouting = {
	"composition-compose-classes-with-clsx": {
		appliesWhen: "TSX의 `className`을 추가·수정하거나 base class, modifier, optional class를 조합한다.",
		reviewWith: [],
	},
	"composition-do-not-build-structural-variants-with-modifiers": {
		appliesWhen:
			"modifier를 추가·변경하거나 반복 가능한 state·API variant와 one-off structural patch 사이를 판정한다. 허용된 state로 결론 나도 변경된 modifier 분류는 Selected다.",
		reviewWith: ["naming-name-elements-and-modifiers-by-role"],
	},
	"composition-keep-classes-single-purpose": {
		appliesWhen:
			"기존 class가 base와 state·variant 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리한다. 기존 결합 책임을 분리하지 않고 처음부터 새 single-purpose pair를 만들거나 책임 보존 rename만 하면 제외한다.",
		reviewWith: [],
	},
	"composition-prefer-ui-wrapper-prop-types": {
		appliesWhen: "`Ui*` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용하고 라이브러리 원본 Props 참조를 검토한다.",
		reviewWith: [],
	},
	"composition-style-ui-components-through-owned-wrappers": {
		appliesWhen:
			"실제 `Ui*` React wrapper 사용처·API에서 내부 DOM styling 경계를 정하거나 root `className`·slot prop hook을 주입·노출·사용한다. 기존 CSS owner root 아래 third-party selector만 수정하면 제외한다.",
		reviewWith: ["selector-target-third-party-dom-from-owned-roots"],
	},
	"naming-default-to-plain-css-when-no-module-convention": {
		appliesWhen:
			"프로젝트 표준 미확정 상태에서 새 stylesheet 접근 형식(plain CSS·CSS Modules)을 선택하거나 `.module.css`·`styles.*`로 전환한다. 기존 plain CSS class rename은 제외한다.",
		reviewWith: [],
	},
	"naming-keep-scope-slug-unique-per-owner": {
		appliesWhen: "새 `scope_slug` namespace를 추가·복사·이름 변경하거나 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있다.",
		reviewWith: [],
	},
	"naming-name-elements-and-modifiers-by-role": {
		appliesWhen: "element 또는 modifier class를 새로 짓거나 `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경한다.",
		reviewWith: [],
	},
	"naming-preserve-route-slug-traceability": {
		appliesWhen: "route/framework 규칙이 `rt_*` owner를 선택한 화면에서 route class slug를 새로 만들거나 이름을 변경한다.",
		reviewWith: [],
	},
	"naming-separate-local-and-route-style-scopes": {
		appliesWhen:
			"스타일 owner를 route screen/support, document, 독립 leaf helper, reusable widget, UI primitive 중에서 결정하거나 서로 다른 owner를 이동·분리한다.",
		reviewWith: ["organization-keep-style-files-owned-by-one-component-or-route"],
	},
	"naming-use-scope-slug-element-modifier-syntax": {
		appliesWhen: "plain CSS의 project-owned class를 새로 만들거나 이름, scope, slug, element, modifier 구분자 또는 casing을 변경한다.",
		reviewWith: [],
	},
	"organization-keep-style-files-owned-by-one-component-or-route": {
		appliesWhen:
			"stylesheet를 새로 만들거나 이동·분할·병합하고 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있다.",
		reviewWith: [],
	},
	"organization-review-banned-css-patterns-before-finishing": {
		appliesWhen: "CSS 또는 TSX class contract 변경이 완료 단계에 들어간다.",
		reviewWith: [],
	},
	"selector-avoid-deep-descendant-dependencies": {
		appliesWhen:
			"descendant 또는 child selector chain을 추가·수정하거나 DOM 계층에 의존하는 project-owned·third-party selector를 검토한다.",
		reviewWith: [],
	},
	"selector-keep-project-selectors-flat": {
		appliesWhen:
			"project-owned class를 중첩·descendant selector로 연결하거나 raw HTML prose·copy·content wrapper 안 element selector를 추가·수정한다.",
		reviewWith: [],
	},
	"selector-target-third-party-dom-from-owned-roots": {
		appliesWhen: "`.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정하거나 owned wrapper 아래로 범위를 제한한다.",
		reviewWith: [],
	},
	"selector-use-pseudo-classes-for-dom-owned-states": {
		appliesWhen:
			"`:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정하거나 parent DOM state가 child styling에 영향을 준다.",
		reviewWith: [],
	},
	"values-always-provide-css-variable-fallbacks": {
		appliesWhen:
			"새·변경된 `var(--*)` 사용이나 token 주입 보장 경계를 바꾼다. 같은 stylesheet·주입 경계에서 기존 `var()` 선언을 selector 사이 byte-equivalent 이동만 하면 제외한다.",
		reviewWith: [],
	},
	"values-keep-layout-intent-explicit": {
		appliesWhen:
			"`sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경한다. 같은 element의 base/modifier 분리에서 기존 `display`·spacing 선언을 값 그대로 재배치하면 제외한다.",
		reviewWith: [],
	},
	"values-separate-domain-state-modifiers-from-dom-interaction-states": {
		appliesWhen: "app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경하거나 focus ring에 손댄다.",
		reviewWith: ["composition-do-not-build-structural-variants-with-modifiers"],
	},
	"values-tokenize-repeated-visual-values": {
		appliesWhen: "색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복되거나 새 shared visual value를 하드코딩한다.",
		reviewWith: ["values-always-provide-css-variable-fallbacks"],
	},
} as const;

/**
 * @summary Appendix B의 React rule별 exact routing metadata oracle
 */
const reactRuleRouting = {
	"composition-destructure-props-inside": {
		appliesWhen: "props를 받는 함수 컴포넌트의 시그니처·본문 구조분해 방식을 추가·변경하거나 그 컴포넌트를 다른 파일로 이동·이름 변경한다.",
		reviewWith: [],
	},
	"composition-do-not-define-components-inside-components": {
		appliesWhen: "컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가·이동하거나 재렌더 시 remount·focus reset 징후를 다룬다.",
		reviewWith: [],
	},
	"composition-named-handlers-over-inline": {
		appliesWhen:
			"TSX event prop의 인라인 callback에 분기, 비동기 호출, 여러 동작·부수효과 또는 비자명한 state transition을 추가·수정한다. 단순 setter·인자 전달 한 줄 위임은 제외한다.",
		reviewWith: ["events-keep-handler-flow-inline", "events-run-user-actions-in-handlers-not-effects"],
	},
	"composition-prefer-arrow-functions-and-object-params": {
		appliesWhen: "React 인접 코드에 function 선언이 생기거나 함수가 3개 이상 매개변수 또는 함께 이동하는 같은 계열 값을 받는다.",
		reviewWith: ["typescript/functions-use-named-object-params-for-complex-signatures"],
	},
	"composition-use-activity-for-render-branches": {
		appliesWhen: "이미 마운트된 subtree의 표시 상태를 보존하려고 조건부 렌더링과 Activity 또는 동등한 visibility primitive 사이를 바꾼다.",
		reviewWith: [],
	},
	"composition-use-ref-prop-instead-of-forwardref-in-react-19": {
		appliesWhen: "React 19 컴포넌트에 focus·scroll·measure용 ref 공개 API를 추가·변경하거나 새 `forwardRef` wrapper를 도입한다.",
		reviewWith: [],
	},
	"docs-document-compound-parts-with-part-and-description": {
		appliesWhen:
			"compound component의 exported public part·props interface·part 내부 handler를 추가·변경하거나 public part 문서를 수정한다.",
		reviewWith: [],
	},
	"docs-limit-inline-comments-to-non-obvious-logic": {
		appliesWhen: "React 함수·handler·JSX 인접 로직 안의 `//` 주석을 추가·수정하거나 자명한 설명과 실제 제약을 구분해 정리한다.",
		reviewWith: [],
	},
	"docs-require-jsdoc-on-key-declarations": {
		appliesWhen:
			"query·mutation, 비자명한 handler/effect, exported helper/custom hook/store, exported 또는 re-exported public type/interface, 예외 memo 선언을 추가·변경한다.",
		reviewWith: [],
	},
	"events-keep-handler-flow-inline": {
		appliesWhen: "화면 전용 named handler의 분기·mutation·navigation·후처리를 여러 helper나 hook으로 나누거나 다시 합친다.",
		reviewWith: ["screen-extract-utilities-selectively"],
	},
	"events-name-and-curry-handlers": {
		appliesWhen: "이벤트 핸들러를 새로 만들거나 이름, target/event 표현, 추가 인자 전달 방식 또는 최종 React handler 시그니처를 바꾼다.",
		reviewWith: ["typing-function-type-first", "typescript/naming-use-consistent-file-and-symbol-naming"],
	},
	"events-run-user-actions-in-handlers-not-effects": {
		appliesWhen: "제출·저장·삭제·닫기 같은 one-shot 사용자 액션을 handler와 state+effect 사이에서 이동하거나 실행 흐름을 바꾼다.",
		reviewWith: [],
	},
	"ownership-avoid-barrel-and-react-namespace-imports": {
		appliesWhen:
			"`index.ts`·barrel 재노출, `React.*` namespace 타입과 direct `import type` 중 선택, type/value 혼합 import 또는 소유 출처를 숨긴 경로를 추가·수정한다. 일반 direct value import는 제외한다.",
		reviewWith: [],
	},
	"ownership-layer-component-boundaries": {
		appliesWhen: "컴포넌트를 ui·widget·route-local 중 어느 소유 레이어에 둘지 결정하거나 레이어 사이에서 이동·공용화한다.",
		reviewWith: ["ownership-place-route-local-files-by-scope", "css/naming-separate-local-and-route-style-scopes"],
	},
	"ownership-place-route-local-files-by-scope": {
		appliesWhen: "route 전용 컴포넌트·스타일·순수 로직을 새로 만들거나 `-local`과 route sibling `.ts` 사이에서 위치를 바꾼다.",
		reviewWith: ["css/naming-separate-local-and-route-style-scopes", "css/organization-keep-style-files-owned-by-one-component-or-route"],
	},
	"ownership-prefer-plain-ts-for-local-react-helpers": {
		appliesWhen: "화면 전용 계산·정규화·payload 조립을 custom hook 또는 별도 support module로 추출·이동하려 한다.",
		reviewWith: [
			"screen-extract-utilities-selectively",
			"screen-move-pure-support-code-out-of-entry-files",
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
		],
	},
	"ownership-shared-config-entry-points": {
		appliesWhen: "둘 이상의 화면이 쓰는 상수·설정·순수 함수를 추가·이동하거나 leaf 파일에 중복 선언된 공용 값을 정리한다.",
		reviewWith: ["typescript/naming-centralize-shared-config-namespaces", "typescript/naming-preserve-config-origin-with-chained-access"],
	},
	"ownership-use-consistent-file-and-symbol-naming": {
		appliesWhen:
			"React/TSX 파일·컴포넌트·exported symbol·공용 설정 이름을 정하거나 바꾸거나, React 작업에서 sibling `.ts` support 파일이나 exported support symbol을 만들거나 옮긴다. local query·mutation만이면 제외한다.",
		reviewWith: [],
	},
	"screen-avoid-premature-abstraction": {
		appliesWhen: "screen 코드를 helper·hook·component·module로 추출하거나 한 곳에서만 쓰는 기존 추상화를 접어 넣는다.",
		reviewWith: [
			"screen-extract-local-section-components-for-runtime-boundaries",
			"screen-extract-utilities-selectively",
			"typescript/functions-extract-helpers-only-when-the-boundary-is-real",
		],
	},
	"screen-extract-local-section-components-for-runtime-boundaries": {
		appliesWhen:
			"route-local section component를 새로 추출하거나 기존 section이 async·state·provider·interaction·library·performance 경계를 소유하는지 바꾼다.",
		reviewWith: [],
	},
	"screen-extract-utilities-selectively": {
		appliesWhen:
			"화면 계산·변환·preset·option·column meta를 별도 함수/support module로 추출·이동하거나 support 경계를 바꾼다. query `select` 내부 shaping만이면 제외한다.",
		reviewWith: ["screen-move-pure-support-code-out-of-entry-files", "typescript/functions-extract-helpers-only-when-the-boundary-is-real"],
	},
	"screen-keep-derived-values-close": {
		appliesWhen:
			"response·state·search·props의 오리진을 끊는 alias·flag·표시값을 넓은 screen scope에 추가·이동·제거하거나 `let`/`push` 조립을 바꾼다.",
		reviewWith: [],
	},
	"screen-keep-route-flow-visible": {
		appliesWhen:
			"route entry의 search·navigate·query·mutation·cross-section effect를 component/module 사이에서 이동·분리하거나 page section 조립의 순서·owner를 바꾼다. 같은 owner 안 표현 변경은 제외한다.",
		reviewWith: ["screen-extract-local-section-components-for-runtime-boundaries", "screen-move-pure-support-code-out-of-entry-files"],
	},
	"screen-move-pure-support-code-out-of-entry-files": {
		appliesWhen: "route entry에 여러 줄 pure helper·preset·option·화면 전용 type이 쌓이거나 추출한 support code의 목적지 파일을 정한다.",
		reviewWith: ["docs-require-jsdoc-on-key-declarations"],
	},
	"state-avoid-fallback-defaults-and-loading-flags": {
		appliesWhen:
			"optional 응답에 `??`·`||` 기본값을 넣거나 Suspense 화면 본문에 초기 loading return을 추가·변경하고 결측·로딩 UX를 다룬다.",
		reviewWith: [
			"state-preserve-origin-chaining",
			"screen-keep-derived-values-close",
			"typescript/absence-expose-optional-values-instead-of-silent-fallbacks",
		],
	},
	"state-calculate-derived-values-during-render": {
		appliesWhen: "현재 props·state·search·response에서 계산 가능한 값을 별도 state와 effect로 동기화하거나 그 동기화를 제거한다.",
		reviewWith: [],
	},
	"state-choose-state-tools-by-source-of-truth": {
		appliesWhen: "로컬 UI·전역 client·server 데이터를 새 state 도구로 옮기거나 서로 다른 source of truth 사이에 복제·동기화한다.",
		reviewWith: ["state-store-derived-authority"],
	},
	"state-compiler-first-memoization": {
		appliesWhen:
			"`useMemo`·`useCallback`을 추가·제거하거나 참조 동일성·실측 병목·무거운 deferred 계산을 이유로 수동 memoization을 검토한다.",
		reviewWith: [],
	},
	"state-name-query-and-mutation-bindings-consistently": {
		appliesWhen: "React Query query·mutation hook의 로컬 binding을 추가·이름 변경하거나 역할이 드러나지 않는 별칭이 diff에 보인다.",
		reviewWith: ["state-preserve-origin-chaining"],
	},
	"state-preserve-origin-chaining": {
		appliesWhen: "page·layout·screen 넓은 스코프에서 response·mutation·store를 구조분해하거나 별칭으로 끊고 원본 값 접근을 바꾼다.",
		reviewWith: ["screen-keep-derived-values-close"],
	},
	"state-shape-query-data-with-select": {
		appliesWhen: "서버 응답의 list·items·meta 등을 렌더에서 가공·반복 소비하거나 React Query `select`의 결과 shape를 추가·변경한다.",
		reviewWith: ["state-name-query-and-mutation-bindings-consistently", "state-preserve-origin-chaining"],
	},
	"state-store-derived-authority": {
		appliesWhen:
			"여러 화면·메뉴·route guard가 쓰는 권한·capability 같은 derived decision을 store에 저장·동기화하거나 단일 화면 값까지 store로 올린다.",
		reviewWith: ["docs-require-jsdoc-on-key-declarations"],
	},
	"state-use-effectevent-for-non-reactive-effect-callbacks": {
		appliesWhen:
			"subscription effect가 최신 prop·state callback을 읽도록 ref 동기화 hack, dependency 재설치 또는 `useEffectEvent`를 추가·변경한다.",
		reviewWith: ["events-run-user-actions-in-handlers-not-effects"],
	},
	"state-use-functional-setstate-updates": {
		appliesWhen: "다음 state가 현재 state에 의존하는 handler·async callback·반복 갱신에서 `setState` 호출 방식을 추가·변경한다.",
		reviewWith: [],
	},
	"state-use-lazy-state-initializers-for-expensive-defaults": {
		appliesWhen: "`useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 추가·변경한다.",
		reviewWith: [],
	},
	"state-use-starttransition-for-non-urgent-updates": {
		appliesWhen: "클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 state update의 우선순위나 transition 처리를 바꾼다.",
		reviewWith: [],
	},
	"state-use-usedeferredvalue-for-heavy-derived-renders": {
		appliesWhen: "검색어·필터·정렬 입력이 무거운 파생 view를 갱신해 typing 지연이 생기거나 `useDeferredValue` 기반 계산을 추가·변경한다.",
		reviewWith: ["state-compiler-first-memoization", "state-use-starttransition-for-non-urgent-updates"],
	},
	"strategy-avoid-boolean-prop-proliferation": {
		appliesWhen: "여러 곳에서 쓰는 shared component에 boolean mode·visibility prop을 추가하거나 기존 boolean 조합과 JSX 분기가 늘어난다.",
		reviewWith: [],
	},
	"strategy-choose-single-composition-compound-and-variants": {
		appliesWhen:
			"exported shared component에 slot·public part·shared context/action·반복 preset·mode API를 추가하거나 조립 구조를 재설계한다.",
		reviewWith: [
			"strategy-avoid-boolean-prop-proliferation",
			"strategy-prefer-children-over-render-props",
			"screen-avoid-premature-abstraction",
		],
	},
	"strategy-prefer-children-over-render-props": {
		appliesWhen:
			"shared component에 header·footer·action 같은 정적 slot 또는 render prop을 추가·변경하며 runtime data 주입 필요가 불분명하다.",
		reviewWith: [],
	},
	"typing-function-type-first": {
		appliesWhen:
			"React 이벤트 핸들러나 prop callback의 선언·시그니처를 추가·변경하며 기존 React alias·callback 계약을 쓸 수 있다. curried factory의 최종 반환 handler도 포함한다.",
		reviewWith: ["typing-reuse-existing-contracts", "ownership-avoid-barrel-and-react-namespace-imports"],
	},
	"typing-reuse-existing-contracts": {
		appliesWhen: "Props callback 구현이나 API 응답 기반 view type을 추가·변경하며 기존 prop·API 계약과 같은 shape가 보인다.",
		reviewWith: [
			"typescript/types-reuse-callback-signatures-from-existing-contracts",
			"typescript/types-reuse-existing-contracts-before-new-types",
		],
	},
} as const;

/**
 * @summary 조건부 reviewWith와 달리 Selected가 반드시 닫혀야 하는 exact routing oracle
 */
const mandatoryRuleRouting = {
	react: {
		"composition-named-handlers-over-inline": ["docs-require-jsdoc-on-key-declarations", "events-name-and-curry-handlers"],
		"docs-document-compound-parts-with-part-and-description": ["docs-require-jsdoc-on-key-declarations"],
		"docs-limit-inline-comments-to-non-obvious-logic": ["typescript/docs-keep-inline-comments-for-constraints-and-caveats"],
		"docs-require-jsdoc-on-key-declarations": ["typescript/docs-require-header-jsdoc-on-key-declarations"],
		"ownership-avoid-barrel-and-react-namespace-imports": ["typescript/naming-use-direct-imports-and-public-entry-points"],
		"ownership-use-consistent-file-and-symbol-naming": ["typescript/naming-use-consistent-file-and-symbol-naming"],
		"state-calculate-derived-values-during-render": ["screen-keep-derived-values-close"],
		"state-name-query-and-mutation-bindings-consistently": [
			"typescript/naming-use-consistent-file-and-symbol-naming",
			"docs-require-jsdoc-on-key-declarations",
		],
		"state-shape-query-data-with-select": ["docs-require-jsdoc-on-key-declarations"],
		"state-use-effectevent-for-non-reactive-effect-callbacks": ["docs-require-jsdoc-on-key-declarations"],
		"typing-function-type-first": ["typescript/types-reuse-callback-signatures-from-existing-contracts"],
	},
	typescript: {
		"docs-require-header-jsdoc-on-key-declarations": [
			"docs-standardize-annotation-tags-by-declaration-role",
			"docs-write-concise-korean-comments-about-purpose-and-constraints",
		],
		"functions-replace-enum-with-as-const-objects": [
			"naming-use-consistent-file-and-symbol-naming",
			"types-document-custom-types-and-shapes",
		],
		"types-reuse-callback-signatures-from-existing-contracts": ["types-prefer-function-variable-types-over-parameter-annotations"],
	},
	css: {
		"composition-prefer-ui-wrapper-prop-types": ["typescript/types-reuse-existing-contracts-before-new-types"],
		"selector-target-third-party-dom-from-owned-roots": ["selector-avoid-deep-descendant-dependencies"],
		"selector-use-pseudo-classes-for-dom-owned-states": ["values-separate-domain-state-modifiers-from-dom-interaction-states"],
	},
} as const;

const completionGateRouting = {
	react: [],
	typescript: ["guardrails-review-banned-typescript-shortcuts-before-finishing"],
	css: ["organization-review-banned-css-patterns-before-finishing"],
} as const;

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
		"docs-standardize-annotation-tags-by-declaration-role",
		"docs-write-concise-korean-comments-about-purpose-and-constraints",
		"guardrails-review-banned-typescript-shortcuts-before-finishing",
	],
	"enum-like-runtime-contract": [
		"naming-use-consistent-file-and-symbol-naming",
		"types-document-custom-types-and-shapes",
		"functions-replace-enum-with-as-const-objects",
		"docs-require-header-jsdoc-on-key-declarations",
		"docs-standardize-annotation-tags-by-declaration-role",
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
			"replace a duplicate `UserPreview` interface with a same-name `Pick<UserRecord, ...>` alias and add concise Korean `@summary`; imports and names otherwise stay unchanged.",
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
					"ownership-avoid-barrel-and-react-namespace-imports",
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
					"docs-standardize-annotation-tags-by-declaration-role",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
	},
	"RTE02-owner-placement-css-drift": {
		initial: {
			prompt:
				"move a route-only tree renderer from shared UI to src/routes/entries/-local/entry-tree.tsx and rename it as route-local; carry its existing className and style import through unchanged and make no styling change.",
			files: ["src/components/ui/entry-tree.tsx", "src/routes/entries/-local/entry-tree.tsx"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-route-local-files-by-scope",
					"ownership-use-consistent-file-and-symbol-naming",
					"composition-destructure-props-inside",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
			},
		},
		scopeDrift: {
			evidence:
				"in a project without a CSS Modules standard, add directly imported src/routes/entries/-local/entry-tree.css, create route-support rt_* owner-unique role-named classes, and compose the changed className contract with the existing direct clsx import; final skills add CSS with no additional React rule.",
			files: ["src/components/ui/entry-tree.tsx", "src/routes/entries/-local/entry-tree.tsx", "src/routes/entries/-local/entry-tree.css"],
			expectedSkills: ["react", "typescript", "css"],
			expectedSelected: {
				react: [
					"ownership-layer-component-boundaries",
					"ownership-place-route-local-files-by-scope",
					"ownership-use-consistent-file-and-symbol-naming",
					"composition-destructure-props-inside",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-keep-scope-slug-unique-per-owner",
					"naming-name-elements-and-modifiers-by-role",
					"naming-preserve-route-slug-traceability",
					"naming-separate-local-and-route-style-scopes",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"composition-do-not-build-structural-variants-with-modifiers",
					"values-separate-domain-state-modifiers-from-dom-interaction-states",
					"organization-keep-style-files-owned-by-one-component-or-route",
					"organization-review-banned-css-patterns-before-finishing",
				],
			},
		},
	},
	"RTE03-route-support-extraction": {
		initial: {
			prompt:
				"move one real four-argument multi-line payload boundary from src/routes/entries/page.tsx to sibling page.ts; do not create a hook, generic utils file, or helper soup.",
			files: ["src/routes/entries/page.tsx", "src/routes/entries/page.ts"],
			expectedSkills: ["react", "typescript"],
			expectedSelected: {
				react: [
					"ownership-prefer-plain-ts-for-local-react-helpers",
					"ownership-place-route-local-files-by-scope",
					"ownership-use-consistent-file-and-symbol-naming",
					"composition-prefer-arrow-functions-and-object-params",
					"screen-avoid-premature-abstraction",
					"screen-extract-utilities-selectively",
					"screen-move-pure-support-code-out-of-entry-files",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"functions-extract-helpers-only-when-the-boundary-is-real",
					"functions-use-named-object-params-for-complex-signatures",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
					"docs-use-helper-for-reusable-pure-helper-functions",
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
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"docs-document-compound-parts-with-part-and-description",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"ownership-place-route-local-files-by-scope",
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
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"ownership-avoid-barrel-and-react-namespace-imports",
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
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"state-choose-state-tools-by-source-of-truth",
					"state-preserve-origin-chaining",
					"state-store-derived-authority",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"types-document-custom-types-and-shapes",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"state-name-query-and-mutation-bindings-consistently",
					"state-preserve-origin-chaining",
					"state-shape-query-data-with-select",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"state-compiler-first-memoization",
					"state-use-lazy-state-initializers-for-expensive-defaults",
					"state-use-starttransition-for-non-urgent-updates",
					"state-use-usedeferredvalue-for-heavy-derived-renders",
					"docs-limit-inline-comments-to-non-obvious-logic",
					"docs-require-jsdoc-on-key-declarations",
				],
				typescript: [
					"naming-use-consistent-file-and-symbol-naming",
					"naming-use-direct-imports-and-public-entry-points",
					"docs-keep-inline-comments-for-constraints-and-caveats",
					"docs-require-header-jsdoc-on-key-declarations",
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"docs-standardize-annotation-tags-by-declaration-role",
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
					"state-avoid-fallback-defaults-and-loading-flags",
					"state-preserve-origin-chaining",
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
				react: ["ownership-place-route-local-files-by-scope"],
				typescript: ["naming-use-direct-imports-and-public-entry-points", "guardrails-review-banned-typescript-shortcuts-before-finishing"],
				css: [
					"naming-default-to-plain-css-when-no-module-convention",
					"naming-keep-scope-slug-unique-per-owner",
					"naming-name-elements-and-modifiers-by-role",
					"naming-preserve-route-slug-traceability",
					"naming-separate-local-and-route-style-scopes",
					"naming-use-scope-slug-element-modifier-syntax",
					"composition-compose-classes-with-clsx",
					"organization-keep-style-files-owned-by-one-component-or-route",
					"organization-review-banned-css-patterns-before-finishing",
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
			expectedSelected: {
				css: [
					"naming-separate-local-and-route-style-scopes",
					"organization-keep-style-files-owned-by-one-component-or-route",
					"organization-review-banned-css-patterns-before-finishing",
				],
			},
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
					"organization-review-banned-css-patterns-before-finishing",
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
					"organization-review-banned-css-patterns-before-finishing",
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
					"organization-review-banned-css-patterns-before-finishing",
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
					"organization-review-banned-css-patterns-before-finishing",
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
					"docs-standardize-annotation-tags-by-declaration-role",
					"docs-write-concise-korean-comments-about-purpose-and-constraints",
					"guardrails-review-banned-typescript-shortcuts-before-finishing",
				],
				css: [
					"composition-compose-classes-with-clsx",
					"composition-style-ui-components-through-owned-wrappers",
					"composition-prefer-ui-wrapper-prop-types",
					"organization-review-banned-css-patterns-before-finishing",
				],
			},
		},
	},
	"css-rich-text-owner-block": {
		initial: {
			prompt:
				"move top-level .wg_entryDetail__prose h2 and > :first-child into existing owner-block raw-element nesting; class names and values stay unchanged.",
			files: ["src/components/widgets/entry-detail/wg-entry-detail.css"],
			expectedSkills: ["css"],
			expectedSelected: {css: ["selector-keep-project-selectors-flat", "organization-review-banned-css-patterns-before-finishing"]},
		},
	},
	"css-dom-interaction-states": {
		initial: {
			prompt:
				"move top-level hover/focus/disabled into the same class block's &: nesting and preserve the focus ring; no app modifier or value is added.",
			files: ["src/components/ui/button/ui-button.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-use-pseudo-classes-for-dom-owned-states",
					"values-separate-domain-state-modifiers-from-dom-interaction-states",
					"organization-review-banned-css-patterns-before-finishing",
				],
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
					"organization-review-banned-css-patterns-before-finishing",
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
			expectedSelected: {css: ["values-keep-layout-intent-explicit", "organization-review-banned-css-patterns-before-finishing"]},
		},
	},
	"css-deep-project-descendant-chain": {
		initial: {
			prompt: "flatten .layout .panel .detail .item to a target element top-level block without changing class names or values.",
			files: ["src/routes/catalog/_index.css"],
			expectedSkills: ["css"],
			expectedSelected: {
				css: [
					"selector-avoid-deep-descendant-dependencies",
					"selector-keep-project-selectors-flat",
					"organization-review-banned-css-patterns-before-finishing",
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
	assert.equal(document.rules.length, 22);
	assert.deepEqual(
		Object.fromEntries(
			document.rules.map((rule) => [rule.fileName.replace(/\.md$/, ""), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}]),
		),
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
	const headerJsdocRule = await readFile(path.join(skillPaths.rulesDir, "docs-require-header-jsdoc-on-key-declarations.md"), "utf8");
	assert.match(headerJsdocRule, /named query·mutation binding[^\n]+@api/i);
	assert.match(
		headerJsdocRule,
		/^requiresSelected: docs-standardize-annotation-tags-by-declaration-role, docs-write-concise-korean-comments-about-purpose-and-constraints$/m,
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
		"the same normalization becomes necessary for a second owner, so move the existing named function to `profile-support.ts`, export it, directly import it from `bulk-profile.ts`, and add concise Korean `@helper` docs.",
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
		"docs-standardize-annotation-tags-by-declaration-role",
		"docs-use-helper-for-reusable-pure-helper-functions",
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
	const expectedIds = document.rules.map((rule) => rule.fileName.replace(/\.md$/, "")).sort();

	assert.deepEqual(ids, expectedIds);
	assert.equal(ids.length, 22);
	assert.equal(getRulesIndexByteBudget(ids.length), 8_680);
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
						selected.includes("docs-standardize-annotation-tags-by-declaration-role"),
						`${skillName}/${scenario.id} must close T18 to T19`,
					);
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
	assert.ok(queryShaping.expectedSelected.react?.includes("state-shape-query-data-with-select"));
	assert.ok(!(queryShaping.expectedSelected.react?.includes("screen-extract-utilities-selectively") ?? false));
	assert.equal(queryShaping.expectedSelected.react?.includes("screen-extract-utilities-selectively"), false);
});

test("induced naming closure and activated finish gates stay mandatory across every manifest stage", async () => {
	for (const skillName of ["react", "typescript", "css"] as const) {
		const manifest = await readRoutingEvalManifest(getSkillPaths(skillName, realSkillRootDir));
		const document = await readSkillDocument(getSkillPaths(skillName, realSkillRootDir));

		assert.deepEqual(
			Object.fromEntries(
				document.rules
					.filter((rule) => rule.requiresSelected.length > 0)
					.map((rule) => [rule.fileName.replace(/\.md$/, ""), rule.requiresSelected]),
			),
			mandatoryRuleRouting[skillName],
			`${skillName} requiresSelected metadata must match the exact mandatory-routing oracle`,
		);
		assert.deepEqual(
			document.rules.filter((rule) => rule.requiredOnCompletion).map((rule) => rule.fileName.replace(/\.md$/, "")),
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

				if (stage.expectedSkills.includes("css")) {
					assert.ok(
						stage.expectedSelected.css?.includes("organization-review-banned-css-patterns-before-finishing"),
						`${skillName}/${scenario.id} must select the CSS finish gate`,
					);
				}

				if (stage.expectedSelected.react?.includes("state-name-query-and-mutation-bindings-consistently")) {
					assert.ok(
						stage.expectedSelected.typescript?.includes("naming-use-consistent-file-and-symbol-naming"),
						`${skillName}/${scenario.id} must close React binding naming to TypeScript symbol naming`,
					);
				}
			}
		}
	}

	const reactRulesDir = getSkillPaths("react", realSkillRootDir).rulesDir;
	const derivedRule = await readFile(path.join(reactRulesDir, "screen-keep-derived-values-close.md"), "utf8");
	const bindingRule = await readFile(path.join(reactRulesDir, "state-name-query-and-mutation-bindings-consistently.md"), "utf8");
	const originRule = await readFile(path.join(reactRulesDir, "state-preserve-origin-chaining.md"), "utf8");
	const typescriptFinishRule = await readFile(
		path.join(getSkillPaths("typescript", realSkillRootDir).rulesDir, "guardrails-review-banned-typescript-shortcuts-before-finishing.md"),
		"utf8",
	);
	const cssFinishRule = await readFile(
		path.join(getSkillPaths("css", realSkillRootDir).rulesDir, "organization-review-banned-css-patterns-before-finishing.md"),
		"utf8",
	);

	assert.match(derivedRule, /^appliesWhen:[^\n]+alias[^\n]+추가·이동·제거/m);
	assert.match(originRule, /^reviewWith:[^\n]+screen-keep-derived-values-close/m);
	assert.match(bindingRule, /^requiresSelected:[^\n]+typescript\/naming-use-consistent-file-and-symbol-naming/m);
	assert.match(typescriptFinishRule, /^requiredOnCompletion: true$/m);
	assert.match(cssFinishRule, /^requiredOnCompletion: true$/m);

	const typescriptSkill = await readFile(path.join(realSkillRootDir, "typescript", "SKILL.md"), "utf8");
	const cssSkill = await readFile(path.join(realSkillRootDir, "css", "SKILL.md"), "utf8");
	assert.match(typescriptSkill, /`completionGate` 규칙은 마무리 시 항상 적용한다/);
	assert.match(cssSkill, /`completionGate` 규칙은 마무리 시 항상 적용한다/);
	assert.match(typescriptSkill, /`requiresSelected` target은 함께 적용한다[^\n]+companion도 활성화한다/);
	assert.match(cssSkill, /`requiresSelected` target은 함께 적용한다[^\n]+companion도 활성화한다/);

	const reactManifest = await readRoutingEvalManifest(getSkillPaths("react", realSkillRootDir));
	const sharedAuthority = reactManifest.scenarios.find(({id}) => id === "RTE11-shared-authority");
	assert.ok(sharedAuthority);
	assert.ok(sharedAuthority.expectedSelected.react?.includes("state-preserve-origin-chaining"));
	assert.ok(!(sharedAuthority.expectedSelected.react?.includes("screen-keep-derived-values-close") ?? false));
});

test("TypeScript SKILL.md is a compact router without receipt or audit machinery", async () => {
	const source = await readFile(path.join(realSkillRootDir, "typescript", "SKILL.md"), "utf8");
	const frontmatterSource = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

	assert.match(frontmatterSource, /^name: convention-typescript$/m);
	assert.match(frontmatterSource, /^description: Use when /m);
	assert.doesNotMatch(frontmatterSource, /scan|read|load/i);
	assert.equal(wordCount < 400, true, `router has ${wordCount} words`);
	assert.equal(Buffer.byteLength(source, "utf8") < 5_000, true);

	// 1. 변경 범위 판정
	assert.match(body, /## 1\. 변경 범위 판정/);
	assert.match(body, /최소 변경|범위를 넓히지 않는다/);

	// 2. 인덱스 전체 훑기
	assert.match(body, /RULES_INDEX\.md/);
	assert.match(body, /끝까지 훑/);
	assert.match(body, /첫 match에서 멈추지 않는다/);

	// 3. 규칙 읽고 구현
	assert.match(body, /contracts\/<id>\.md/);
	assert.match(body, /`CRITICAL`이면 `rules\/<id>\.md` 원문도 반드시 읽는다/);
	assert.match(body, /`requiresSelected` target은 함께 적용한다/);
	assert.match(body, /`reviewWith` target은[^\n]+자동으로 적용하지는 않는다/);
	assert.match(body, /`completionGate` 규칙은 마무리 시 항상 적용한다/);
	assert.match(body, /다시 훑는다[^\n]*\n?[^\n]*더 걸리는 게 없으면 멈춘다|더 걸리는 게 없으면 멈춘다/);

	// 4~5. 범위 변경과 마무리
	assert.match(body, /## 4\. 범위 변경/);
	assert.match(body, /## 5\. 마무리/);
	assert.match(body, /file\/line과 수정안으로 보고한다/);
	assert.match(body, /통과는 컨벤션을 지켰다는 근거가 아니다/);

	// opt-in full handbook
	assert.match(body, /\[HANDBOOK\.md\]\(\.\/HANDBOOK\.md\)는 전체 handbook이다/);

	// 제거한 강제 장치가 되살아나지 않아야 한다
	assert.doesNotMatch(body, /digest|sha256/i);
	assert.doesNotMatch(body, /exact partition|ordinal/i);
	assert.doesNotMatch(body, /receipt/i);
	assert.doesNotMatch(body, /convention-audit/);
	assert.doesNotMatch(body, /Excluded groups|exclusion group/i);

	// companion 경계
	assert.match(body, /React\/CSS 경계가 걸리면 해당 companion도 활성화한다/);
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
		Object.fromEntries(
			document.rules.map((rule) => [rule.fileName.replace(/\.md$/, ""), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}]),
		),
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
		const ruleSource = await readFile(path.join(skillPaths.rulesDir, `${ruleId}.md`), "utf8");

		if (routing.reviewWith.length === 0) {
			assert.doesNotMatch(ruleSource, /^reviewWith:/m, `${ruleId} must omit an empty reviewWith key`);
		}
	}
	const ownershipNamingRule = await readFile(path.join(skillPaths.rulesDir, "ownership-use-consistent-file-and-symbol-naming.md"), "utf8");
	assert.match(ownershipNamingRule, /^appliesWhen:[^\n]+바꾸거나,[^\n]+sibling `\.ts` support 파일/m);
	assert.match(
		ownershipNamingRule,
		/local query·mutation binding[^\n]+state-name-query-and-mutation-bindings-consistently|state-name-query-and-mutation-bindings-consistently[^\n]+local query·mutation binding/i,
	);
	const screenExtractionRule = await readFile(path.join(skillPaths.rulesDir, "screen-extract-utilities-selectively.md"), "utf8");
	assert.match(screenExtractionRule, /query `select`[\s\S]+state-shape-query-data-with-select[\s\S]+별도 함수\/support module[\s\S]+N\/A/i);
	assert.match(screenExtractionRule, /Incorrect[\s\S]*normalizeEntryValues[\s\S]*mergeEntryPayload/i);
	assert.match(screenExtractionRule, /Correct[\s\S]*normalizeTreeNodes[\s\S]*handleSave/i);
	assert.match(screenExtractionRule, /Correct[\s\S]*한 exported 함수[\s\S]*buildEntryPayload/i);

	const template = await readFile(path.join(skillPaths.rulesDir, "_template.md"), "utf8");
	assert.match(template, /^appliesWhen: /m);
	assert.doesNotMatch(template, /^reviewWith: /m);

	// frontmatter 작성 규칙은 스킬마다 복제하지 않고 공통 기여 문서 한 곳에 둔다.
	const contributing = await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8");
	assert.match(contributing, /appliesWhen.*한 줄.*160/);
	assert.match(contributing, /reviewWith.*자동 선택이.*아니라.*재평가/i);
	assert.match(contributing, /대상이 없으면.*key\s*를 아예 생략/i);
});

test("React routing manifest is the exact fifteen-scenario Appendix B/D oracle with full positive coverage", async () => {
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
	assert.equal(manifest.scenarios.length, 15);
	assert.equal(
		manifest.scenarios.reduce((count, scenario) => count + (scenario.scopeDrift ? 2 : 1), 0),
		16,
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
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-standardize-annotation-tags-by-declaration-role"), true);
	assert.equal(ownerMove.expectedSelected.typescript?.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"), true);
	const cssDrift = ownerMove.scopeDrift;
	assert.ok(cssDrift);
	assert.equal(cssDrift.expectedSelected.react?.includes("composition-destructure-props-inside"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("types-document-custom-types-and-shapes"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-require-header-jsdoc-on-key-declarations"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-standardize-annotation-tags-by-declaration-role"), true);
	assert.equal(cssDrift.expectedSelected.typescript?.includes("docs-write-concise-korean-comments-about-purpose-and-constraints"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("composition-do-not-build-structural-variants-with-modifiers"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("values-separate-domain-state-modifiers-from-dom-interaction-states"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("naming-preserve-route-slug-traceability"), true);
	assert.equal(cssDrift.expectedSelected.css?.includes("naming-preserve-route-slug-traceability") ?? false, true);

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
	const frontmatterSource = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

	assert.match(frontmatterSource, /^name: convention-react$/m);
	assert.match(frontmatterSource, /^description: Use when /m);
	assert.doesNotMatch(frontmatterSource, /scan|read|load/i);
	assert.equal(wordCount < 400, true, `router has ${wordCount} words`);
	assert.equal(Buffer.byteLength(source, "utf8") < 5_000, true);

	// 1. 변경 범위 판정
	assert.match(body, /## 1\. 변경 범위 판정/);
	assert.match(body, /최소 변경|범위를 넓히지 않는다/);

	// 2. 인덱스 전체 훑기
	assert.match(body, /RULES_INDEX\.md/);
	assert.match(body, /끝까지 훑/);
	assert.match(body, /첫 match에서 멈추지 않는다/);

	// 3. 규칙 읽고 구현
	assert.match(body, /contracts\/<id>\.md/);
	assert.match(body, /`CRITICAL`이면 `rules\/<id>\.md` 원문도 반드시 읽는다/);
	assert.match(body, /`requiresSelected` target은 함께 적용한다/);
	assert.match(body, /`reviewWith` target은[^\n]+자동으로 적용하지는 않는다/);
	assert.match(body, /`completionGate` 규칙은 마무리 시 항상 적용한다/);
	assert.match(body, /다시 훑는다[^\n]*\n?[^\n]*더 걸리는 게 없으면 멈춘다|더 걸리는 게 없으면 멈춘다/);

	// 4~5. 범위 변경과 마무리
	assert.match(body, /## 4\. 범위 변경/);
	assert.match(body, /## 5\. 마무리/);
	assert.match(body, /file\/line과 수정안으로 보고한다/);
	assert.match(body, /통과는 컨벤션을 지켰다는 근거가 아니다/);

	// opt-in full handbook
	assert.match(body, /\[HANDBOOK\.md\]\(\.\/HANDBOOK\.md\)는 전체 handbook이다/);

	// 제거한 강제 장치가 되살아나지 않아야 한다
	assert.doesNotMatch(body, /digest|sha256/i);
	assert.doesNotMatch(body, /exact partition|ordinal/i);
	assert.doesNotMatch(body, /receipt/i);
	assert.doesNotMatch(body, /convention-audit/);
	assert.doesNotMatch(body, /Excluded groups|exclusion group/i);

	// companion 경계
	assert.match(body, /`convention-typescript`는 항상 함께 활성화한다/);
	assert.match(body, /class contract·stylesheet·styling surface가 바뀔 때만 `convention-css`를 추가하고, 아니면 켜지 않는다/);
	assert.match(body, /non-progressive skill이면[^\n]+`HANDBOOK\.md`를 읽는다/);
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
	assert.equal(document.rules.length, 21);
	assert.deepEqual(
		Object.fromEntries(
			document.rules.map((rule) => [rule.fileName.replace(/\.md$/, ""), {appliesWhen: rule.appliesWhen, reviewWith: rule.reviewWith}]),
		),
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
	const wrapperStylingRule = await readFile(
		path.join(skillPaths.rulesDir, "composition-style-ui-components-through-owned-wrappers.md"),
		"utf8",
	);
	assert.match(wrapperStylingRule, /실제 `Ui\*` React wrapper[\s\S]+CSS-only[\s\S]+selector-target-third-party-dom-from-owned-roots/i);
	const singlePurposeRule = await readFile(path.join(skillPaths.rulesDir, "composition-keep-classes-single-purpose.md"), "utf8");
	assert.match(singlePurposeRule, /^appliesWhen:[^\n]+기존 결합 책임[^\n]+처음부터 새 single-purpose pair/m);
	const layoutIntentRule = await readFile(path.join(skillPaths.rulesDir, "values-keep-layout-intent-explicit.md"), "utf8");
	assert.match(layoutIntentRule, /^appliesWhen:[^\n]+base\/modifier[^\n]+`display`·spacing[^\n]+값 그대로/m);
	const fallbackRule = await readFile(path.join(skillPaths.rulesDir, "values-always-provide-css-variable-fallbacks.md"), "utf8");
	assert.match(fallbackRule, /^appliesWhen:[^\n]+`var\(--\*\)`[^\n]+같은 stylesheet[^\n]+byte-equivalent/m);
	assert.match(flattenWhitespace(fallbackRule), /실제 diff에 새 CSS variable 사용[^\n]+요청 여부와 무관하게[^\n]+다시 선택/i);

	const template = await readFile(path.join(skillPaths.rulesDir, "_template.md"), "utf8");
	assert.match(template, /^appliesWhen: /m);
	assert.doesNotMatch(template, /^reviewWith: /m);

	// frontmatter 작성 규칙은 스킬마다 복제하지 않고 공통 기여 문서 한 곳에 둔다.
	const contributing = await readFile(path.join(repoDir, "CONTRIBUTING.md"), "utf8");
	assert.match(contributing, /appliesWhen.*한 줄.*160/);
	assert.match(contributing, /reviewWith.*자동 선택이.*아니라.*재평가/i);
	assert.match(contributing, /대상이 없으면.*key\s*를 아예 생략/i);
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
	assert.deepEqual(routeDrift?.scopeDrift?.expectedSelected.react, ["ownership-place-route-local-files-by-scope"]);
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
	const templatePaths = [
		path.join(realSkillRootDir, "react", "rules", "_template.md"),
		path.join(realSkillRootDir, "typescript", "rules", "_template.md"),
		path.join(realSkillRootDir, "css", "rules", "_template.md"),
		path.join(repoDir, "AGENTS.template.md"),
	];

	for (const source of await Promise.all([...routerPaths, ...templatePaths].map((filePath) => readFile(filePath, "utf8")))) {
		assert.match(source, /변경 (?:semantic )?delta|실제 변경|실제로 바꾼 것|변경 범위/i);
		assert.match(source, /추가·삭제·이동|추가·삭제·이동·이름 변경/);
		assert.match(source, /read-only|byte-equivalent/);
		assert.match(source, /삭제\+추가|삭제·추가/);
		assert.match(source, /다시 세지|별도.*(?:추가|변경|재선언)/);
		assert.match(source, /N\/A rule|N\/A 규칙|적용되지 않는 규칙/);
		assert.match(source, /최소 semantic patch|최소 변경|범위를 넓히지 않/i);
	}

	const typescriptDocument = await readSkillDocument(getSkillPaths("typescript", realSkillRootDir));
	const generatedIndex = generateRulesIndexMarkdown(typescriptDocument, []);
	assert.doesNotMatch(generatedIndex, /변경 (?:semantic )?delta/i);
	assert.match(generatedIndex, /Routing digest: `sha256:[a-f0-9]{64}`/);
	assert.match(generatedIndex, /^- T\d+ \| [^ |]+ \|/m);

	const routeOwnerRule = await readFile(path.join(realSkillRootDir, "css", "rules", "naming-preserve-route-slug-traceability.md"), "utf8");
	assert.match(routeOwnerRule, /route\/framework 규칙이 `rt_\*` owner를 선택한 화면/);
});

test("v16 boundary contracts distinguish semantic role changes from contextual and byte-equivalent noise", async () => {
	const readRule = async (skillName: "react" | "typescript" | "css", ruleId: string): Promise<string> => {
		return await readFile(path.join(realSkillRootDir, skillName, "rules", `${ruleId}.md`), "utf8");
	};

	const routeFlow = await readRule("react", "screen-keep-route-flow-visible");
	assert.match(routeFlow, /orchestration[\s\S]*(?:owner|소유)[\s\S]*(?:page-section|section)[\s\S]*topology/i);
	assert.match(
		routeFlow,
		/같은 (?:route )?owner[\s\S]*(?:`query\.select`|query `select`)[\s\S]*binding·alias[\s\S]*derived-state effect[\s\S]*render 계산[\s\S]*N\/A/i,
	);

	const curriedHandler = await readRule("react", "events-name-and-curry-handlers");
	assert.match(curriedHandler, /DOM React event prop[\s\S]*인라인 callback[\s\S]*추가 인자[\s\S]*wrapper[\s\S]*(?:완료가 아|우회)/i);
	assert.match(curriedHandler, /최종 반환[\s\S]*React handler[\s\S]*typing-function-type-first[\s\S]*Selected/i);
	assert.match(
		curriedHandler,
		/UI-agnostic domain[\s\S]*custom component prop callback[\s\S]*`useEffectEvent`[\s\S]*(?:DOM event|curry)[\s\S]*(?:만들지 않|N\/A)/i,
	);

	const reactHandlerType = await readRule("react", "typing-function-type-first");
	assert.match(reactHandlerType, /curried|고차 함수/i);
	assert.match(reactHandlerType, /반환(?:된|하는)? (?:함수|handler)[\s\S]*contextual typing[\s\S]*N\/A.*아니/i);
	assert.match(reactHandlerType, /`query\.select`[\s\S]*one-off contextual callback[\s\S]*UI-agnostic domain function[\s\S]*N\/A/i);

	const reactContracts = await Promise.all(
		["screen-keep-route-flow-visible", "events-name-and-curry-handlers", "typing-function-type-first"].map((ruleId) =>
			readFile(path.join(realSkillRootDir, "react", "contracts", `${ruleId}.md`), "utf8"),
		),
	);
	assert.match(reactContracts[0]!, /(?:`query\.select`|query `select`)[\s\S]*derived-state effect[\s\S]*N\/A/i);
	assert.match(reactContracts[1]!, /DOM React event prop[\s\S]*custom component prop callback/i);
	assert.match(reactContracts[2]!, /curried[\s\S]*one-off contextual callback/i);

	const typescriptRouter = await readFile(path.join(realSkillRootDir, "typescript", "SKILL.md"), "utf8");
	assert.match(typescriptRouter, /byte-equivalent[\s\S]*named shape[\s\S]*callable[\s\S]*input\/output[\s\S]*변경으로 본다/i);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(documentedShape, /기존 named shape[\s\S]*새 callable (?:input|입력)[\s\S]*(?:output|출력)[\s\S]*Selected/i);
	assert.match(documentedShape, /익명[\s\S]*(?:inferred|추론)[\s\S]*(?:query )?`select`[\s\S]*N\/A/i);
	assert.match(documentedShape, /JSDoc[\s\S]*(?:스스로|자기)[\s\S]*(?:활성화|Selected)[\s\S]*(?:하지 않|금지)/i);

	const directImports = await readRule("typescript", "naming-use-direct-imports-and-public-entry-points");
	assert.match(directImports, /^appliesWhen:[^\n]+같은 module path[^\n]+(?:value|type) specifier[^\n]+추가·삭제·전환/m);

	const unusedParameters = await readRule("typescript", "types-mark-unused-parameters-with-underscore");
	assert.match(unusedParameters, /^appliesWhen:[^\n]+curried handler[^\n]+최종 callback[^\n]+(?:생략|사용하지 않)/m);
	assert.match(unusedParameters, /framework alias[\s\S]*매개변수 생략[\s\S]*N\/A.*아니[\s\S]*`_event`/i);

	for (const ruleId of [
		"types-prefer-function-variable-types-over-parameter-annotations",
		"types-reuse-callback-signatures-from-existing-contracts",
	]) {
		const contextualCallback = await readRule("typescript", ruleId);
		assert.match(contextualCallback, /annotation 없는[\s\S]*one-off[\s\S]*contextual(?:ly)? typed[\s\S]*(?:N\/A|제외)/i);
	}

	const existingContract = await readRule("typescript", "types-reuse-existing-contracts-before-new-types");
	assert.match(existingContract, /unchanged contract[\s\S]*새 사용처[\s\S]*(?:N\/A|제외)/i);

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
	assert.match(typescriptContracts[2]!, /curried handler[\s\S]*최종 callback/i);
	assert.match(typescriptContracts[3]!, /CRITICAL rule[\s\S]*full rule/i);
	assert.match(typescriptContracts[4]!, /one-off contextually typed inline callback/i);
	assert.match(typescriptContracts[5]!, /unchanged contract[\s\S]*(?:새 함수 인자|새 사용처|call site)/i);

	const stylesheetFormat = await readRule("css", "naming-default-to-plain-css-when-no-module-convention");
	assert.match(stylesheetFormat, /stylesheet 접근 형식[\s\S]*plain CSS[\s\S]*CSS Modules/i);
	assert.match(stylesheetFormat, /기존 plain CSS[\s\S]*(?:class|selector)[\s\S]*(?:rename|이름 변경)[\s\S]*(?:N\/A|제외)/i);

	const modifierClassification = await readRule("css", "composition-do-not-build-structural-variants-with-modifiers");
	assert.match(modifierClassification, /허용(?:된| 가능한)? (?:domain )?state[\s\S]*Selected[\s\S]*(?:N\/A.*아니|pass)/i);

	const layoutIntent = await readRule("css", "values-keep-layout-intent-explicit");
	assert.match(
		layoutIntent,
		/같은 (?:DOM )?element[\s\S]*base(?:와|\/|·)modifier[\s\S]*기존 `display`[\s\S]*(?:값 그대로|property-value)[\s\S]*(?:N\/A|제외)/i,
	);
	assert.doesNotMatch(layoutIntent, /동작 변화 없이/);

	const variableFallback = await readRule("css", "values-always-provide-css-variable-fallbacks");
	assert.match(
		variableFallback,
		/같은 stylesheet[\s\S]*(?:주입|injection) 경계[\s\S]*기존 `var\(\)`[\s\S]*byte-equivalent[\s\S]*(?:N\/A|제외)/i,
	);

	for (const ruleId of [
		"selector-use-pseudo-classes-for-dom-owned-states",
		"values-separate-domain-state-modifiers-from-dom-interaction-states",
	]) {
		const interactionState = await readRule("css", ruleId);
		assert.match(
			interactionState,
			/(?:hover|focus|disabled)[\s\S]*unconditional base element block[\s\S]*modifier 아래[\s\S]*(?:좁히지 않|두지 않)/i,
		);
	}
	const cssInteractionContracts = await Promise.all(
		["selector-use-pseudo-classes-for-dom-owned-states", "values-separate-domain-state-modifiers-from-dom-interaction-states"].map(
			(ruleId) => readFile(path.join(realSkillRootDir, "css", "contracts", `${ruleId}.md`), "utf8"),
		),
	);
	for (const contract of cssInteractionContracts) {
		assert.match(contract, /base(?: element)? block[\s\S]*modifier 아래/i);
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
	for (const ruleId of [
		"ownership-avoid-barrel-and-react-namespace-imports",
		"typing-function-type-first",
		"events-name-and-curry-handlers",
	]) {
		assert.equal(selected("RTE10-derived-selection-state", ruleId), true);
	}
	for (const scenarioId of ["RTE08-delete-handler-flow", "RTE09-route-runtime-section"]) {
		assert.equal(selected(scenarioId, "events-name-and-curry-handlers"), true);
		assert.equal(selected(scenarioId, "typing-function-type-first"), true);
		assert.equal(notApplicable(scenarioId, "ownership-avoid-barrel-and-react-namespace-imports"), true);
	}
	assert.equal(selected("RTE14-subscription-effectevent", "events-name-and-curry-handlers"), true);
	assert.equal(notApplicable("RTE14-subscription-effectevent", "typing-function-type-first"), true);
	assert.equal(notApplicable("RTE14-subscription-effectevent", "ownership-avoid-barrel-and-react-namespace-imports"), true);
});

test("v17 TypeScript boundaries exclude React props and prevent self-created duplicate contracts", async () => {
	const readRule = async (skillName: "typescript", ruleId: string): Promise<string> => {
		return await readFile(path.join(realSkillRootDir, skillName, "rules", `${ruleId}.md`), "utf8");
	};

	const namedObjectParams = await readRule("typescript", "functions-use-named-object-params-for-complex-signatures");
	assert.match(namedObjectParams, /^appliesWhen:[^\n]+React (?:함수 )?컴포넌트[^\n]+props[^\n]+(?:N\/A|제외)/m);
	assert.match(
		namedObjectParams,
		/기존 named contract[\s\S]*그대로 재사용[\s\S]*`\*Params`[\s\S]*`\*Args`[\s\S]*(?:새로 만들지 않|추가하지 않)/i,
	);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(
		documentedShape,
		/^appliesWhen:[^\n]+(?:external|generated|read-only|shared)[^\n]+(?:unchanged|변경하지 않)[^\n]+(?:N\/A|제외)/m,
	);
	assert.match(
		documentedShape,
		/^appliesWhen:[^\n]+schema root[^\n]+계약 field[^\n]+파생 alias[^\n]+추가·변경[^\n]+named shape[^\n]+callable 역할[^\n]+추가/m,
	);
	assert.doesNotMatch(documentedShape, /^appliesWhen:[^\n]+객체형 상수·field·alias/m);
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
	assert.doesNotMatch(existingContract, /^appliesWhen:[^\n]+재사용 결정을 바꾼다/m);
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
	assert.match(generatedContracts[0]!, /React 함수 컴포넌트[\s\S]*기존 named contract/i);
	assert.match(generatedContracts[1]!, /CRITICAL rule[\s\S]*full rule/i);
	assert.match(generatedContracts[2]!, /positional[\s\S]*object[\s\S]*`\*Params`[\s\S]*(?:스스로|자기|자가)/i);
});

test("v17 semantic contracts reject English-only annotations and effective deep third-party chains", async () => {
	const readRule = async (skillName: "typescript" | "css", ruleId: string): Promise<string> => {
		return await readFile(path.join(realSkillRootDir, skillName, "rules", `${ruleId}.md`), "utf8");
	};

	const koreanComments = await readRule("typescript", "docs-write-concise-korean-comments-about-purpose-and-constraints");
	assert.match(koreanComments, /annotation 본문 전체[\s\S]*(?:ASCII|영문)[\s\S]*(?:한글 주석으로 인정하지 않|실패)/i);
	assert.match(koreanComments, /@summary route-local entry tree props/);
	assert.match(koreanComments, /@summary route-local 엔트리 트리 입력 계약/);

	const documentedShape = await readRule("typescript", "types-document-custom-types-and-shapes");
	assert.match(
		documentedShape,
		/`@summary`[\s\S]*`@field`[\s\S]*태그 존재만으로[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*(?:content|한국어)[^\n]+gate/i,
	);
	const headerDocs = await readRule("typescript", "docs-require-header-jsdoc-on-key-declarations");
	assert.match(
		flattenWhitespace(headerDocs),
		/header tag[\s\S]*(?:영문 label|영문 라벨)[\s\S]*(?:충족하지 않|미충족|완료되지 않)[\s\S]*docs-write-concise-korean-comments-about-purpose-and-constraints[\s\S]*content gate/i,
	);
	assert.doesNotMatch(headerDocs, /\bT\d{2}\b/);

	const descendantDepth = await readRule("css", "selector-avoid-deep-descendant-dependencies");
	assert.match(descendantDepth, /nested (?:source )?block 수[\s\S]*effective selector[\s\S]*(?:combinator|ancestor) chain/i);
	assert.match(descendantDepth, /& \.ant-tree \.ant-tree-node-content-wrapper[\s\S]*(?:2단계|one-level이 아)/i);

	const thirdPartyRoot = await readRule("css", "selector-target-third-party-dom-from-owned-roots");
	assert.match(thirdPartyRoot, /owned root[\s\S]*instance scope[\s\S]*중간 (?:library root|라이브러리 root)[\s\S]*(?:생략|반복하지 않)/i);
	assert.match(thirdPartyRoot, /추가 third-party ancestor[\s\S]*(?:ambiguity|모호성|direct-child)[\s\S]*(?:근거|evidence)/i);
	assert.match(thirdPartyRoot, /& \.ant-tree \.ant-tree-node-content-wrapper/);
	assert.match(thirdPartyRoot, /& \.ant-tree-node-content-wrapper/);

	const typescriptPressure = await readFile(path.join(realSkillRootDir, "typescript", "pressure-tests.md"), "utf8");
	assert.match(typescriptPressure, /@summary route-local entry tree props/);
	assert.match(typescriptPressure, /@summary route-local 엔트리 트리 입력 계약/);
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
	assert.match(generatedContracts[1]!, /annotation 본문 전체[\s\S]*(?:ASCII|영문)/i);
	assert.match(generatedContracts[2]!, /effective selector[\s\S]*(?:combinator|ancestor) chain/i);
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
	assert.equal(entries.length, 21);
	assert.equal(getRulesIndexByteBudget(entries.length), 8_340);
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
	const frontmatterSource = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

	assert.match(frontmatterSource, /^name: convention-css$/m);
	assert.match(frontmatterSource, /^description: Use when /m);
	assert.doesNotMatch(frontmatterSource, /scan|read|load/i);
	assert.equal(wordCount < 400, true, `router has ${wordCount} words`);
	assert.equal(Buffer.byteLength(source, "utf8") < 5_000, true);

	// 1. 변경 범위 판정
	assert.match(body, /## 1\. 변경 범위 판정/);
	assert.match(body, /최소 변경|범위를 넓히지 않는다/);

	// 2. 인덱스 전체 훑기
	assert.match(body, /RULES_INDEX\.md/);
	assert.match(body, /끝까지 훑/);
	assert.match(body, /첫 match에서 멈추지 않는다/);

	// 3. 규칙 읽고 구현
	assert.match(body, /contracts\/<id>\.md/);
	assert.match(body, /`CRITICAL`이면 `rules\/<id>\.md` 원문도 반드시 읽는다/);
	assert.match(body, /`requiresSelected` target은 함께 적용한다/);
	assert.match(body, /`reviewWith` target은[^\n]+자동으로 적용하지는 않는다/);
	assert.match(body, /`completionGate` 규칙은 마무리 시 항상 적용한다/);
	assert.match(body, /다시 훑는다[^\n]*\n?[^\n]*더 걸리는 게 없으면 멈춘다|더 걸리는 게 없으면 멈춘다/);

	// 4~5. 범위 변경과 마무리
	assert.match(body, /## 4\. 범위 변경/);
	assert.match(body, /## 5\. 마무리/);
	assert.match(body, /file\/line과 수정안으로 보고한다/);
	assert.match(body, /통과는 컨벤션을 지켰다는 근거가 아니다/);

	// opt-in full handbook
	assert.match(body, /\[HANDBOOK\.md\]\(\.\/HANDBOOK\.md\)는 전체 handbook이다/);

	// 제거한 강제 장치가 되살아나지 않아야 한다
	assert.doesNotMatch(body, /digest|sha256/i);
	assert.doesNotMatch(body, /exact partition|ordinal/i);
	assert.doesNotMatch(body, /receipt/i);
	assert.doesNotMatch(body, /convention-audit/);
	assert.doesNotMatch(body, /Excluded groups|exclusion group/i);

	// companion 경계
	assert.match(body, /`convention-react`와 `convention-typescript`를 함께 활성화한다/);
	assert.match(body, /순수 CSS 변경이면 둘 다 켜지 않는다/);
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
