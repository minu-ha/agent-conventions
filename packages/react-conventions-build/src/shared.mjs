import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, "..");
const repoDir = path.resolve(packageDir, "..", "..");
const skillDir = path.join(repoDir, "skill", "react");
const rulesDir = path.join(skillDir, "rules");
const outputPath = path.join(skillDir, "AGENTS.md");
const metadataPath = path.join(skillDir, "metadata.json");
const sectionsPath = path.join(rulesDir, "_sections.md");

export const reactPaths = {
  outputPath,
  repoDir,
  rulesDir,
  sectionsPath,
  skillDir,
  metadataPath,
};

export const parseFrontmatter = (source) => {
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

export const parseSections = (source) => {
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

export const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export const buildRuleAnchor = (sectionOrder, ruleOrder, title) => {
  return `#${sectionOrder}${ruleOrder}-${slugify(title)}`;
};

export const buildSectionAnchor = (sectionOrder, title) => {
  return `#${sectionOrder}-${slugify(title)}`;
};

export const replaceRuleHeading = (body, sectionOrder, ruleOrder, title) => {
  return body.replace(/^## .+$/m, `### ${sectionOrder}.${ruleOrder} ${title}`);
};

export const readReactMetadata = async () => {
  return JSON.parse(await readFile(metadataPath, "utf8"));
};

export const readReactSections = async () => {
  return parseSections(await readFile(sectionsPath, "utf8"));
};

export const readReactRuleFileNames = async () => {
  return (await readdir(rulesDir))
    .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("_"))
    .sort();
};

export const readReactRules = async () => {
  const ruleFileNames = await readReactRuleFileNames();
  const rules = [];

  for (const ruleFileName of ruleFileNames) {
    const source = await readFile(path.join(rulesDir, ruleFileName), "utf8");
    const { frontmatter, body } = parseFrontmatter(source);
    const prefix = ruleFileName.split("-")[0];

    rules.push({
      fileName: ruleFileName,
      prefix,
      title: frontmatter.title,
      impact: frontmatter.impact,
      impactDescription: frontmatter.impactDescription,
      tags: frontmatter.tags,
      body,
    });
  }

  return rules;
};
