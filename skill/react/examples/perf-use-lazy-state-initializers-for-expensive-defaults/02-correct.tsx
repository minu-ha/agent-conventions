const [searchIndex] = useState(() => toSearchIndex(product_list));
// 서버 렌더링을 하지 않는 클라이언트 전용 화면에서만 저장소를 초기값으로 읽음
const [draftFilter] = useState(() => parseStoredProductFilter(localStorage.getItem("product-filter")));
