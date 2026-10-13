/**
 * 짧고 고정된 지원 로케일 목록 기준 판정
 */
export const isSupportedLocale = (locale: string): boolean => {
	return locale_supported_values.includes(locale);
};

// [!code ++]
const selectedLocaleSupported = isSupportedLocale(selectedLocale);
