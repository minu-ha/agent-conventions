import type {Stats} from "node:fs";
import {lstat, readFile, readdir, rm, writeFile} from "node:fs/promises";
import path from "node:path";

/**
 * @summary 생성 파일 하나의 쓰기 또는 삭제 계획
 */
export interface GeneratedFileMutation {
	/**
	 * @field 교체하거나 삭제할 생성 파일 절대 경로
	 */
	targetPath: string;
	/**
	 * @field 새 UTF-8 본문. undefined면 기존 생성 파일 삭제
	 */
	content?: string;
}

/**
 * @summary 생성 파일 쓰기 결과
 */
export interface GeneratedFileWriteResult {
	/**
	 * @field 실제로 있어서 삭제한 생성 파일 경로
	 */
	deletedPaths: string[];
}

/**
 * @helper ENOENT를 undefined로 정규화하며 대상 상태 조회
 */
const readTargetStats = async (targetPath: string): Promise<Stats | undefined> => {
	try {
		return await lstat(targetPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return undefined;
		}

		throw error;
	}
};

/**
 * @api 선택적 생성 디렉터리가 실제 디렉터리인지 확인하고 일반 파일 이름을 정렬해 반환
 */
export const readGeneratedDirectoryFileNames = async (directoryPath: string): Promise<string[]> => {
	const directoryStats = await readTargetStats(directoryPath);

	if (directoryStats === undefined) {
		return [];
	}

	if (!directoryStats.isDirectory()) {
		throw new Error(`Generated file path must be a real directory: ${directoryPath}`);
	}

	const entries = await readdir(directoryPath, {withFileTypes: true});

	for (const entry of entries) {
		if (!entry.isFile()) {
			throw new Error(`Generated directory entry must be a regular file: ${path.join(directoryPath, entry.name)}`);
		}
	}

	return entries.map((entry) => entry.name).sort((left, right) => left.localeCompare(right, "en-US"));
};

/**
 * @api 생성 Markdown이 심볼릭 링크가 아닌 일반 파일인지 확인 후 UTF-8 본문 반환
 */
export const readGeneratedRegularFile = async (targetPath: string): Promise<string> => {
	const stats = await lstat(targetPath);

	if (!stats.isFile()) {
		throw new Error(`Generated file must be a regular file, not a symlink or directory: ${targetPath}`);
	}

	return await readFile(targetPath, "utf8");
};

/**
 * @api 생성 파일 집합을 쓰고 지움. 대상이 전부 일반 파일인지 먼저 확인해 디렉터리나 링크 위에 쓰지 않음
 * @description 본문은 호출하는 쪽이 전부 그린 뒤에 넘기므로 렌더링이 실패하면 아무것도 바뀌지 않음
 */
export const replaceGeneratedFiles = async (mutations: GeneratedFileMutation[]): Promise<GeneratedFileWriteResult> => {
	const targetPaths = mutations.map((mutation) => path.resolve(mutation.targetPath));

	if (new Set(targetPaths).size !== targetPaths.length) {
		throw new Error("Generated file transaction must not contain duplicate target paths.");
	}

	const statsByPath = new Map<string, Stats | undefined>();

	for (const targetPath of targetPaths) {
		const stats = await readTargetStats(targetPath);

		if (stats && !stats.isFile()) {
			throw new Error(`Generated file target must be a regular file when it already exists: ${targetPath}`);
		}

		statsByPath.set(targetPath, stats);
	}

	const deletedPaths: string[] = [];

	for (const [index, mutation] of mutations.entries()) {
		const targetPath = targetPaths[index] ?? mutation.targetPath;

		if (mutation.content === undefined) {
			if (statsByPath.get(targetPath) !== undefined) {
				await rm(targetPath, {force: true});
				deletedPaths.push(targetPath);
			}

			continue;
		}

		await writeFile(targetPath, mutation.content, "utf8");
	}

	return {deletedPaths};
};
