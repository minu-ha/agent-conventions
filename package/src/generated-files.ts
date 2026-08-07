import {randomUUID} from "node:crypto";
import type {Stats} from "node:fs";
import {lstat, readFile, readdir, rename, rm, writeFile} from "node:fs/promises";
import path from "node:path";

/**
 * @summary 단일 generated file write 또는 delete 계획
 */
export interface GeneratedFileMutation {
	/**
	 * @field 교체하거나 삭제할 generated file absolute path
	 */
	targetPath: string;
	/**
	 * @field 새 UTF-8 본문이며 undefined이면 기존 generated file 삭제
	 */
	content?: string;
}

/**
 * @summary generated file transaction 완료 결과
 */
export interface GeneratedFileTransactionResult {
	/**
	 * @field 실제로 존재해서 삭제한 generated file 경로
	 */
	deletedPaths: string[];
}

/**
 * @summary generated file transaction에서 사용하는 filesystem operation 경계
 */
export interface GeneratedFileOperations {
	/**
	 * @field target 상태 조회 operation
	 */
	lstat: (targetPath: string) => Promise<Stats>;
	/**
	 * @field same-filesystem atomic rename operation
	 */
	rename: (sourcePath: string, targetPath: string) => Promise<void>;
	/**
	 * @field rollback과 backup cleanup용 remove operation
	 */
	rm: (targetPath: string, options: {force: boolean}) => Promise<void>;
	/**
	 * @field exclusive UTF-8 temp file write operation
	 */
	writeFile: (targetPath: string, content: string, options: {encoding: "utf8"; flag: "wx"}) => Promise<void>;
}

/**
 * @summary rollback에 필요한 상태를 결합한 prepared generated file mutation
 */
interface PreparedMutation extends GeneratedFileMutation {
	/**
	 * @field 기존 target을 임시 보존할 same-directory backup 경로
	 */
	backupPath: string;
	/**
	 * @field transaction 시작 시 target 존재 여부
	 */
	existed: boolean;
	/**
	 * @field 새 본문을 먼저 기록할 same-directory temp 경로
	 */
	temporaryPath?: string;
}

/**
 * @summary production filesystem operation 구현
 */
const defaultGeneratedFileOperations: GeneratedFileOperations = {
	lstat: async (targetPath) => await lstat(targetPath),
	rename: async (sourcePath, targetPath) => await rename(sourcePath, targetPath),
	rm: async (targetPath, options) => await rm(targetPath, options),
	writeFile: async (targetPath, content, options) => await writeFile(targetPath, content, options),
};

/**
 * @api optional generated directory가 실제 directory인지 확인하고 regular file 이름을 정렬해 반환
 */
export const readGeneratedDirectoryFileNames = async (directoryPath: string): Promise<string[]> => {
	let directoryStats: Stats;

	try {
		directoryStats = await lstat(directoryPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}

		throw error;
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
 * @api generated Markdown가 symlink가 아닌 regular file인지 확인한 뒤 UTF-8 본문 반환
 */
export const readGeneratedRegularFile = async (targetPath: string): Promise<string> => {
	const stats = await lstat(targetPath);

	if (!stats.isFile()) {
		throw new Error(`Generated file must be a regular file, not a symlink or directory: ${targetPath}`);
	}

	return await readFile(targetPath, "utf8");
};

/**
 * @api ENOENT를 undefined로 정규화하며 generated target 상태 조회
 */
const readTargetStats = async (targetPath: string, operations: GeneratedFileOperations): Promise<Stats | undefined> => {
	try {
		return await operations.lstat(targetPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return undefined;
		}

		throw error;
	}
};

/**
 * @api rollback과 cleanup filesystem step을 순서대로 실행하며 실패 수집
 */
const runCleanupSteps = async (steps: (() => Promise<void>)[]): Promise<unknown[]> => {
	const errors: unknown[] = [];

	for (const step of steps) {
		try {
			await step();
		} catch (error) {
			errors.push(error);
		}
	}

	return errors;
};

/**
 * @api 같은 디렉터리 temp/backup을 사용해 generated file 집합을 교체하고 실패 시 rollback
 */
export const replaceGeneratedFiles = async (
	mutations: GeneratedFileMutation[],
	operations: GeneratedFileOperations = defaultGeneratedFileOperations,
): Promise<GeneratedFileTransactionResult> => {
	const targetPaths = mutations.map((mutation) => path.resolve(mutation.targetPath));

	if (new Set(targetPaths).size !== targetPaths.length) {
		throw new Error("Generated file transaction must not contain duplicate target paths.");
	}

	const transactionId = `${process.pid}-${randomUUID()}`;
	const preparedMutations: PreparedMutation[] = [];

	for (const [index, mutation] of mutations.entries()) {
		const targetPath = targetPaths[index];
		const stats = await readTargetStats(targetPath, operations);

		if (stats && !stats.isFile()) {
			throw new Error(`Generated file target must be a regular file when it already exists: ${targetPath}`);
		}

		preparedMutations.push({
			targetPath,
			...(mutation.content === undefined ? {} : {content: mutation.content}),
			existed: stats !== undefined,
			backupPath: path.join(path.dirname(targetPath), `.${path.basename(targetPath)}.${transactionId}.backup`),
			...(mutation.content === undefined
				? {}
				: {temporaryPath: path.join(path.dirname(targetPath), `.${path.basename(targetPath)}.${transactionId}.tmp`)}),
		});
	}

	const writtenTemporaryPaths: string[] = [];
	const backedUpMutations: PreparedMutation[] = [];
	const installedMutations: PreparedMutation[] = [];

	try {
		for (const mutation of preparedMutations) {
			if (mutation.content === undefined || !mutation.temporaryPath) {
				continue;
			}

			await operations.writeFile(mutation.temporaryPath, mutation.content, {encoding: "utf8", flag: "wx"});
			writtenTemporaryPaths.push(mutation.temporaryPath);
		}

		for (const mutation of preparedMutations) {
			if (!mutation.existed) {
				continue;
			}

			await operations.rename(mutation.targetPath, mutation.backupPath);
			backedUpMutations.push(mutation);
		}

		for (const mutation of preparedMutations) {
			if (!mutation.temporaryPath) {
				continue;
			}

			await operations.rename(mutation.temporaryPath, mutation.targetPath);
			installedMutations.push(mutation);
		}
	} catch (error) {
		const rollbackSteps: (() => Promise<void>)[] = [
			...[...installedMutations].reverse().map((mutation) => async () => {
				await operations.rm(mutation.targetPath, {force: true});
			}),
			...[...backedUpMutations].reverse().map((mutation) => async () => {
				await operations.rename(mutation.backupPath, mutation.targetPath);
			}),
			...writtenTemporaryPaths.map((temporaryPath) => async () => {
				await operations.rm(temporaryPath, {force: true});
			}),
		];
		const rollbackErrors = await runCleanupSteps(rollbackSteps);

		if (rollbackErrors.length > 0) {
			throw new AggregateError([error, ...rollbackErrors], "Generated file transaction failed and rollback was incomplete.");
		}

		throw error;
	}

	const cleanupErrors = await runCleanupSteps(
		backedUpMutations.map((mutation) => async () => {
			await operations.rm(mutation.backupPath, {force: true});
		}),
	);

	if (cleanupErrors.length > 0) {
		throw new AggregateError(cleanupErrors, "Generated files were replaced but backup cleanup failed.");
	}

	return {
		deletedPaths: preparedMutations
			.filter((mutation) => mutation.content === undefined && mutation.existed)
			.map((mutation) => mutation.targetPath),
	};
};
