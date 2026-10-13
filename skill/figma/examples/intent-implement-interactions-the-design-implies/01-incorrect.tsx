/**
 * 상품 표의 컬럼 정의
 */
const productColumns = [
	{key: "name", label: "상품명"},
// [!code error]
	{key: "price", label: <span>판매가 <img src={sortIcon} /></span>},
];
