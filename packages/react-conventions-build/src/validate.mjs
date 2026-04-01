import {
  parseFrontmatter,
  readReactMetadata,
  readReactRuleFileNames,
  readReactRules,
  readReactSections,
} from "./shared.mjs";

const metadata = await readReactMetadata();
const sections = await readReactSections();
const ruleFileNames = await readReactRuleFileNames();
const rules = await readReactRules();

if (!metadata.version || !metadata.organization || !metadata.abstract) {
  throw new Error("metadata.json must include version, organization, and abstract.");
}

if (sections.length === 0) {
  throw new Error("rules/_sections.md must define at least one section.");
}

const validPrefixes = new Set(sections.map((section) => section.prefix));

for (const rule of rules) {
  if (!validPrefixes.has(rule.prefix)) {
    throw new Error(`Unknown prefix "${rule.prefix}" in ${rule.fileName}.`);
  }

  for (const requiredKey of ["title", "impact", "impactDescription", "tags"]) {
    if (!rule[requiredKey]) {
      throw new Error(`${rule.fileName} is missing frontmatter key "${requiredKey}".`);
    }
  }

  if (!rule.body.includes("**Incorrect") || !rule.body.includes("**Correct")) {
    throw new Error(`${rule.fileName} must contain Incorrect and Correct sections.`);
  }
}

console.log(`Validated ${ruleFileNames.length} rule files across ${sections.length} sections.`);
