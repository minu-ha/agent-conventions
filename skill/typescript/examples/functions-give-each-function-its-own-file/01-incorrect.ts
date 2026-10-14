// utils.ts
export const toTrimmedName = (name: string) => {
	return name.trim();
};

export const toProductPayload = (values: ProductFormValues) => {
	return {name: toTrimmedName(values.name)};
};

export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: toProductPayload(values)};
};
