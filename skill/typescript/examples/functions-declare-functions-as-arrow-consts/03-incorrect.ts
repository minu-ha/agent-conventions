export const cellFormatterByValueType = {
// [!code error]
	text(value: string): string {
		return value.trim();
	},
} as const;
