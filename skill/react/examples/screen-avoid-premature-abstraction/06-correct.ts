/**
 * 화면이 보낼 값 조립을 한 함수 안에서 마무리. 단계마다 보조 함수를 만들지 않음
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	// 1. 사용자가 넣은 앞뒤 공백을 서버로 보내기 전에 정리
	const name = formValues.name.trim();
	const description = formValues.description.trim();

	// 2. API가 받는 페이로드 형태로 조립
	return {categoryId: formValues.categoryId, description, name};
};
