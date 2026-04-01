#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(currentDir, "..");
const rulesDir = path.join(skillDir, "rules");
const outputPath = path.join(skillDir, "AGENTS.md");
const metadataPath = path.join(skillDir, "metadata.json");
const sectionsPath = path.join(rulesDir, "_sections.md");

const parseFrontmatter = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing frontmatter block.");
  }

  const [, frontmatterSource, body] = match;
  const frontmatter = {};

  for (const line of frontmatterSource.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    frontmatter[key] = rawValue;
  }

  return {
    frontmatter,
    body,
  };
};

const parseSections = (source) => {
  const matches = [...source.matchAll(/^## (\d+)\. (.+) \(([^)]+)\)\n\*\*Impact:\*\* (.+)\n\*\*Description:\*\* ([^\n]+)$/gm)];

  if (matches.length === 0) {
    throw new Error("No sections found in rules/_sections.md.");
  }

  return matches.map((match) => {
    const [, order, title, prefix, impact, description] = match;
    return {
      order: Number(order),
      title,
      prefix,
      impact,
      description,
    };
  });
};

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const buildRuleAnchor = (sectionOrder, ruleOrder, title) => {
  return `#${sectionOrder}${ruleOrder}-${slugify(title)}`;
};

const buildSectionAnchor = (sectionOrder, title) => {
  return `#${sectionOrder}-${slugify(title)}`;
};

const replaceRuleHeading = (body, sectionOrder, ruleOrder, title) => {
  return body.replace(/^## .+$/m, `### ${sectionOrder}.${ruleOrder} ${title}`);
};

const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
const sectionsSource = await readFile(sectionsPath, "utf8");
const sections = parseSections(sectionsSource);
const ruleFileNames = (await readdir(rulesDir))
  .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("_"))
  .sort();

const rules = [];

for (const ruleFileName of ruleFileNames) {
  const filePath = path.join(rulesDir, ruleFileName);
  const source = await readFile(filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(source);
  const prefix = ruleFileName.split("-")[0];

  rules.push({
    filePath,
    fileName: ruleFileName,
    prefix,
    title: frontmatter.title,
    impact: frontmatter.impact,
    impactDescription: frontmatter.impactDescription,
    tags: frontmatter.tags,
    body,
  });
}

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

await writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(skillDir, outputPath)}`);
