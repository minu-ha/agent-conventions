import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildRuleAnchor,
  buildSectionAnchor,
  reactPaths,
  readReactMetadata,
  readReactRules,
  readReactSections,
  replaceRuleHeading,
} from "./shared.mjs";

const metadata = await readReactMetadata();
const sections = await readReactSections();
const rules = await readReactRules();
const lines = [];

lines.push("# React Conventions");
lines.push("");
lines.push(`**Version ${metadata.version}**  `);
lines.push(`${metadata.organization}  `);
lines.push(`${metadata.date}`);
lines.push("");
lines.push("> **Note:**  ");
lines.push("> This document is mainly for agents and LLMs to follow when maintaining,  ");
lines.push("> generating, or refactoring React codebases in this convention set.  ");
lines.push("> The source of truth lives in `rules/*.md`; this file is a compiled guide.");
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Abstract");
lines.push("");
lines.push(metadata.abstract);
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Table of Contents");
lines.push("");

for (const section of sections) {
  const sectionRules = rules
    .filter((rule) => rule.prefix === section.prefix)
    .sort((left, right) => left.title.localeCompare(right.title));

  lines.push(`${section.order}. [${section.title}](${buildSectionAnchor(section.order, section.title)}) — **${section.impact}**`);

  for (const [ruleIndex, rule] of sectionRules.entries()) {
    lines.push(`   - ${section.order}.${ruleIndex + 1} [${rule.title}](${buildRuleAnchor(section.order, ruleIndex + 1, rule.title)})`);
  }
}

lines.push("");
lines.push("---");
lines.push("");

for (const section of sections) {
  const sectionRules = rules
    .filter((rule) => rule.prefix === section.prefix)
    .sort((left, right) => left.title.localeCompare(right.title));

  lines.push(`## ${section.order}. ${section.title}`);
  lines.push("");
  lines.push(`**Impact: ${section.impact}**`);
  lines.push("");
  lines.push(section.description);
  lines.push("");

  for (const [ruleIndex, rule] of sectionRules.entries()) {
    lines.push(replaceRuleHeading(rule.body.trim(), section.order, ruleIndex + 1, rule.title));
    lines.push("");
  }
}

lines.push("## References");
lines.push("");

for (const reference of metadata.references) {
  lines.push(`- ${reference}`);
}

lines.push("");

await writeFile(reactPaths.outputPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(reactPaths.skillDir, reactPaths.outputPath)}`);
