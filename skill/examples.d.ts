/**
 * 예제가 import 없이 쓰는 이름
 *
 * 실제 스택의 이름은 설치된 패키지의 타입을 그대로 가리키고, 예제 세계관의 이름은 여기서 선언합니다
 * tsc 가 Cannot find name 이나 Cannot find module 을 내면 그 이름을 알맞은 절에 더합니다
 */

declare module "*.css";
declare module "*.svg";

interface ImportMeta {
	env: Record<string, string | undefined>;
}

// 실제 스택
declare const useState: typeof import("react").useState;
declare const useEffect: typeof import("react").useEffect;
declare const useMemo: typeof import("react").useMemo;
declare const useContext: typeof import("react").useContext;
declare const useRef: typeof import("react").useRef;
declare const useTransition: typeof import("react").useTransition;
declare const useDeferredValue: typeof import("react").useDeferredValue;
declare const useEffectEvent: typeof import("react").useEffectEvent;
declare const useImperativeHandle: typeof import("react").useImperativeHandle;
declare const startTransition: typeof import("react").startTransition;
declare const memo: typeof import("react").memo;
declare const createContext: typeof import("react").createContext;
declare const Suspense: typeof import("react").Suspense;
declare const Fragment: typeof import("react").Fragment;
declare const Activity: typeof import("react").Activity;
declare const QueryClient: typeof import("@tanstack/react-query").QueryClient;
declare const useSuspenseQuery: typeof import("@tanstack/react-query").useSuspenseQuery;
declare const useSuspenseQueries: typeof import("@tanstack/react-query").useSuspenseQueries;
declare const useQueryClient: typeof import("@tanstack/react-query").useQueryClient;
declare const useQueryErrorResetBoundary: typeof import("@tanstack/react-query").useQueryErrorResetBoundary;
declare const Route: typeof import("react-router").Route;
declare const Routes: typeof import("react-router").Routes;
declare const useNavigate: typeof import("react-router").useNavigate;
declare const useSearchParams: typeof import("react-router").useSearchParams;
declare const parseAsInteger: typeof import("nuqs").parseAsInteger;
declare const parseAsString: typeof import("nuqs").parseAsString;
declare const useQueryStates: typeof import("nuqs").useQueryStates;
declare const isNotNil: typeof import("es-toolkit").isNotNil;
declare const orderBy: typeof import("es-toolkit").orderBy;
declare const sortBy: typeof import("es-toolkit").sortBy;
declare const sumBy: typeof import("es-toolkit").sumBy;
declare const uniq: typeof import("es-toolkit").uniq;
declare const Button: typeof import("@mui/material").Button;
declare const TableCell: typeof import("@mui/material").TableCell;
declare const TableRow: typeof import("@mui/material").TableRow;
declare const clsx: typeof import("clsx").clsx;
declare const dayjs: typeof import("dayjs").default;
type ReactNode = import("react").ReactNode;
type ReactElement = import("react").ReactElement;
type Context<T> = import("react").Context<T>;
type ButtonHTMLAttributes<T> = import("react").ButtonHTMLAttributes<T>;
type CSSProperties = import("react").CSSProperties;
type ButtonProps = import("@mui/material").ButtonProps;
type TableCellProps = import("@mui/material").TableCellProps;
type TableRowProps = import("@mui/material").TableRowProps;
type Ref<T> = import("react").Ref<T>;
type MouseEventHandler<T = Element> = import("react").MouseEventHandler<T>;
type ChangeEventHandler<T = Element> = import("react").ChangeEventHandler<T>;
type HTMLAttributes<T> = import("react").HTMLAttributes<T>;

// 예제 세계관: 작은 상점 관리자 콘솔의 도메인
type ProductStatus = "draft" | "active" | "hidden";
declare const product_status: {readonly draft: "draft"; readonly active: "active"; readonly hidden: "hidden"};
type ProductStatusFilter = ProductStatus | "all";
interface Product {
	id: string;
	name: string;
	price: number;
	stock: number;
	status: ProductStatus;
	categoryId: string;
	ownerId: string;
	bodyHtml: string;
	updatedAt: string;
}
type ProductRecord = Product;
interface ProductRef {
	id: string;
}
interface ProductRow extends Row {
	status: ProductStatus;
	stock: number;
	lockedAt?: string;
	ownerId: string;
}
interface ProductCategory {
	id: string;
	name: string;
}
interface ProductCategoryNode extends ProductCategory {
	children: ProductCategoryNode[];
}
interface ProductChange {
	productId: string;
	stock: number;
}
interface ProductSummary {
	changeRate: number | null;
}
interface ProductDraft {
	name: string;
	price: number;
	tags: string[];
	attachments: File[];
}
interface ProductFormValues {
	name: string;
	description: string;
	categoryId: string;
}
type ProductEditorFormValues = ProductFormValues;
interface ProductSaveRequest {
	name: string;
	description?: string;
	categoryId?: string;
	price?: number;
	tags?: string[];
	attachmentIds?: string[];
}
interface ProductCreateRequest extends ProductSaveRequest {}
interface ProductListResponse {
	items: Product[];
	total: number;
}
type ProductPage = ProductListResponse;
interface ProductTreeResponse {
	categoryNodes: ProductCategoryNode[];
}

type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";
type OrderStatusCode = "P" | "C" | "D";
interface OrderLine {
	id: string;
	label: string;
	amount: number;
}
interface OrderLineInput {
	product: Product;
	quantity: number;
}
interface OrderTotal {
	currency: string;
	amount: number;
}
interface Order {
	id: string;
	status: OrderStatus;
	total: number;
	orderedAt: string;
	ownerId: string;
	lines: OrderLine[];
	overdueLineIds: string[];
}
interface OrderRow extends Row {
	status: OrderStatus;
	total: number;
	orderedAt: string;
	dueDate: string;
	isCancelled: boolean;
	isDueSoon: boolean;
}
type StatusLabel = "취소" | "임박" | "진행";
interface OrderFilters {
	status?: OrderStatus;
	keyword?: string;
}
interface OrderDraft {
	productId: string;
	quantity: number;
	memo: string;
}
interface OrderSaveRequest {
	quantity: number;
	memo: string;
}
interface OrderSummary {
	orderAmount: Amount;
	orderCount: number;
	statusDescription: string;
	totalAmount: Amount;
}
interface ToOrderSummaryParams {
	orderSummary: OrderSummary;
	stockCount?: number;
}
interface SummaryMetric {
	id: string;
	label: string;
	value: string | number;
}
interface SummaryStatusGroup {
	id: string;
	title: string;
	description: string;
	total: string;
	rows: SummaryMetric[];
}
interface OrderSummaryContent {
	metrics: SummaryMetric[];
	statusGroups: SummaryStatusGroup[];
	stockCount?: number;
}
interface OrderSummaryItem {
	id: string;
	name: string;
	code: string;
}
interface OrderSummaryResponse {
	items: OrderSummaryItem[];
}
interface SummaryRow {
	id: string;
	label: string;
}

type UserRole = "admin" | "staff";
interface UserRecord {
	id: string;
	name: string;
	email: string;
}
interface User extends UserRecord {
	role: UserRole;
	avatarUrl: string;
	nickname?: string;
}
interface UserRow extends Row {
	role: UserRole;
	isActive: boolean;
}
interface UserResponse {
	items: User[];
}
interface UserFormValues {
	name: string;
	email: string;
	role: UserRole;
}
interface Profile {
	id: string;
	displayName: string;
	email: string;
	avatarUrl: string;
}
interface ProfileFormValues {
	displayName: string;
}
interface Session {
	userId: string | null;
}
interface Settings {
	theme: "light" | "dark";
	locale: string;
	supportEmail?: string;
}

interface Amount {
	value: number;
	currency: string;
}
type Tone = "neutral" | "accent" | "positive" | "negative";
interface Row {
	id: string;
	name: string;
}
type RowAction = "edit" | "view";
declare const row_action: {readonly edit: "edit"; readonly view: "view"};
interface Draft {
	title: string;
}
interface PageRequest {
	page: number;
	size: number;
}
interface GeneratedExportRequest {
	format: "csv" | "xlsx";
	requestedAt: string;
}
interface ChartPoint {
	x: number;
	y: number;
}
interface ChartSeries {
	id: string;
	role: string;
	points: ChartPoint[];
	colorToken?: string;
}
interface ChartInstance {
	resize(): void;
	dispose(): void;
	setOption(option: unknown): void;
}
interface TableColumn {
	id: string;
	label: string;
}
interface Capabilities {
	capabilities: string[];
}

declare class MissingEnvironmentValueError extends Error {
	constructor(name: string);
}
declare class NoActiveProductError extends Error {}
declare class NotLoggedInError extends Error {}

// 예제 세계관: constant/ 의 값
declare const api_base_url: string;
declare const pagination_default_page: number;
declare const pagination_default_page_size: number;
declare const date_format: string;
declare const empty_display_text: string;
declare const order_memo_limit: number;
declare const product_tag_limit: number;
declare const query_retry_count: number;
declare const support_email_default: string;
declare const tick_count: number;
declare const token_expiry_hours: number;
declare const pricing_default_currency: string;
declare const locale_supported_values: readonly string[];
declare const status_positive_values: readonly string[];
declare const status_negative_values: readonly string[];
declare const editable_order_statuses: readonly OrderStatus[];
declare const product_list: Product[];
declare const productColumns: TableColumn[];

// 예제 세계관: 컴포넌트와 프롭. 레이어 접두사 ui, wg, pg
type Theme = "light" | "dark";
interface ErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}
interface TreeItem {
	id: string;
	name: string;
	children: TreeItem[];
}
interface TableSort {
	columnId: string;
	direction: "asc" | "desc";
}
interface ChatMessage {
	id: string;
	text: string;
	sentAt: string;
}
interface DailyCount {
	date: string;
	count: number;
}
type ChartOption = Record<string, unknown>;

interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary";
}
declare const UiButton: (props: UiButtonProps) => ReactElement;
declare const UiChart: {
	Toolbar: (props: {variant: string}) => ReactElement;
};
interface UiCollapseProps {
	className?: string;
	variant?: "default" | "compact";
	title?: string;
	children?: ReactNode;
}
declare const UiCollapse: (props: UiCollapseProps) => ReactElement;
declare const UiEmpty: (props: {description: string}) => ReactElement;
interface UiErrorBoundaryProps {
	fallback?: ReactNode;
	fallbackRender?: (props: ErrorFallbackProps) => ReactNode;
	onReset?: () => void;
	children?: ReactNode;
}
declare const UiErrorBoundary: (props: UiErrorBoundaryProps) => ReactElement;
declare const UiFilterIcon: () => ReactElement;
declare const UiInlineErrorState: (props: {retryLabel?: string; onRetry?: () => void}) => ReactElement;
interface UiLineChartProps {
	title: string;
	points: ChartPoint[];
}
declare const UiLineChart: (props: UiLineChartProps) => ReactElement;
declare const UiLineChartSkeleton: () => ReactElement;
declare const UiList: (props: {rows: readonly Row[]}) => ReactElement;
declare const UiLoadingFallback: (props: {ariaLabel?: string}) => ReactElement;
declare const UiPagination: () => ReactElement;
declare const UiRecommendationSkeleton: () => ReactElement;
declare const UiScreenErrorState: () => ReactElement;
declare const UiScreenSkeleton: () => ReactElement;
interface UiSearchInputProps {
	value?: string;
	label?: string;
	onChange?: (value: string) => void;
}
declare const UiSearchInput: (props: UiSearchInputProps) => ReactElement;
declare const UiShareLinkButton: (props: {href: string}) => ReactElement;
declare const UiSpinner: () => ReactElement;
interface UiTableProps<TRow extends Row = Row> {
	rows: readonly TRow[];
	columns?: TableColumn[];
	onRowSelect?: (rows: TRow[]) => void;
	onSave?: (formValues: ProductFormValues) => void;
}
declare const UiTable: <TRow extends Row>(props: UiTableProps<TRow>) => ReactElement;
interface UiTabsProps {
	children?: ReactNode;
}
declare const UiTabs: (props: UiTabsProps) => ReactElement;
interface UiTreeProps {
	items?: TreeItem[];
	expandedItems?: string[];
	onExpandedItemsChange?: (itemIds: string[]) => void;
	selectedItems?: string | null;
	onSelectedItemsChange?: (itemId: string | null) => void;
}
declare const UiTree: (props: UiTreeProps) => ReactElement;
interface UiPanelPartProps {
	children?: ReactNode;
}

declare const WgAppNavigation: () => ReactElement;
interface WgAppShellProps {
	children?: ReactNode;
}
interface WgChartCardProps {
	className?: string;
	variant?: "default" | "compact" | "muted";
	option?: ChartOption;
	dailyCounts: DailyCount[];
}
declare const WgChartCard: (props: WgChartCardProps) => ReactElement;
declare const WgChatComposer: (props: {onSubmit: (text: string) => void}) => ReactElement;
declare const WgChatMessages: (props: {messages: ChatMessage[]}) => ReactElement;
declare const WgOrderTableChildRow: (props: {row: OrderRow}) => ReactElement;
declare const WgOrderTableHeader: (props: {sort: TableSort}) => ReactElement;
declare const WgOrderTableRow: (props: {row: OrderRow}) => ReactElement;
declare const WgProductBrowseActions: () => ReactElement;
declare const WgProductEditActions: () => ReactElement;
declare const WgProductSearchField: () => ReactElement;
interface WgProductStatusBadgeProps {
	children?: ReactNode;
}
interface WgProductTableProps {
	children?: ReactNode;
}
interface WgProfileDialogPartProps {
	children?: ReactNode;
}
interface WgProfileDialogContextValue {
	isBodyOpen: boolean;
	toggleBody: () => void;
}
declare const WgProfileDialogContext: Context<WgProfileDialogContextValue | null>;
declare const WgProfileDialog: {
	Root: (props: WgProfileDialogPartProps) => ReactElement;
	Header: (props: WgProfileDialogPartProps) => ReactElement;
	Body: (props: WgProfileDialogPartProps) => ReactElement;
};
declare const WgProfileSummary: (props: {profile: Profile}) => ReactElement;
interface WgUserCardProps {
	user: User;
	theme?: Theme;
	label?: string;
	onSave?: () => void;
}

declare const LegacyDatePicker: (props: {value: string; onChange: (value: string) => void}) => ReactElement;
interface PgMediaUploadPanelProps {
	files: File[];
}
declare const PgOrderFilterFields: () => ReactElement;
declare const PgOrderFilterPanel: () => ReactElement;
declare const PgProductBulkActionBar: (props: {selectedRows?: ProductRow[]; label?: string}) => ReactElement;
declare const PgProductCreateForm: () => ReactElement;
declare const PgProductDetailChartSection: () => ReactElement;
declare const PgProductFilterSection: (props: {
	keyword?: string;
	categoryId?: string;
	onKeywordChange?: Dispatch<string>;
	onCategoryIdChange?: Dispatch<string | undefined>;
}) => ReactElement;
declare const PgProductList: () => ReactElement;
declare const PgProductListSection: () => ReactElement;
interface PgProductPanelProps {
	isVisible: boolean;
	children?: ReactNode;
}
declare const PgProductRecommendationSection: () => ReactElement;
declare const PgProductRow: (props: {product: Product}) => ReactElement;
declare const PgProductRowDivider: () => ReactElement;
interface PgProductRowsProps {
	products: Product[];
}
declare const PgProductSearchField: () => ReactElement;
declare const PgProductSearchSection: () => ReactElement;
interface PgProductTableProps {
	rows: ProductRow[];
	editHrefBase?: string;
}
declare const PgProductTable: (props: PgProductTableProps) => ReactElement;
interface PgProductTableSectionProps {
	heading?: ReactNode;
	title?: string;
	children?: ReactNode;
}
declare const PgProductTableSection: (props: PgProductTableSectionProps) => ReactElement;
declare const PgProductTreeSection: () => ReactElement;

// 예제 세계관: API 클라이언트, 생성된 쿼리 훅, 뮤테이션, 스토어
type UseSuspenseQueryResult<TData> = import("@tanstack/react-query").UseSuspenseQueryResult<TData>;
type UseQueryResult<TData> = import("@tanstack/react-query").UseQueryResult<TData>;
type UseMutationResult<TData, TVariables> = import("@tanstack/react-query").UseMutationResult<TData, Error, TVariables>;
type NavigateFunction = import("react-router").NavigateFunction;
type Dispatch<T> = import("react").Dispatch<import("react").SetStateAction<T>>;
interface ApiResponse<T> {
	data: T;
}
type ProductListResponseDTO = ApiResponse<ProductListResponse>;
interface ApiQueryOptions<TResponse, TData> {
	query?: {
		select?: (response: ApiResponse<TResponse>) => TData;
	};
}
interface ApiMutationOptions<TData, TVariables> {
	mutation?: {
		onSuccess?: (data: TData, variables: TVariables) => void;
		onError?: (error: Error) => void;
	};
}
interface ApiClient {
	get<T = unknown>(url: string, config?: {params?: unknown}): Promise<T>;
	post<T = unknown>(url: string, body?: unknown): Promise<T>;
}
declare const createClient: (options: {baseUrl?: string; timeoutMs?: number}) => ApiClient;
declare const client: ApiClient;
declare const queryClient: import("@tanstack/react-query").QueryClient;
declare const productListQueryKey: () => readonly unknown[];
declare const productSummaryQueryKey: () => readonly unknown[];
declare const productListQueryOptions: () => ExampleQueryOptions<ProductListResponse>;
declare const categoryListQueryOptions: () => ExampleQueryOptions<{categories: ProductCategory[]}>;
declare const productDetailSummaryQueryOptions: (productId: string) => ExampleQueryOptions<ProductSummary>;
declare const useProductListSuspense: <TData = ProductListResponse>(
	params?: {page?: number; keyword?: string},
	options?: ApiQueryOptions<ProductListResponse, TData>,
) => UseSuspenseQueryResult<TData>;
declare const useGetProductListSuspense: typeof useProductListSuspense;
declare const useProductTreeSuspense: <TData = ProductTreeResponse>(
	params?: Record<string, never>,
	options?: ApiQueryOptions<ProductTreeResponse, TData>,
) => UseSuspenseQueryResult<TData>;
declare const useUserGetItemSuspense: () => UseSuspenseQueryResult<User>;
declare const useProductList: () => UseQueryResult<ProductListResponse>;
declare const useProductQuery: (options: {client: ApiClient; pageSize: number}) => UseQueryResult<ProductListResponse>;
declare const useOrderQuery: (options: {pageSize: number}) => UseQueryResult<OrderRow[]>;
declare const useProductSave: (
	options?: ApiMutationOptions<Product, {data: ProductSaveRequest}>,
) => UseMutationResult<Product, {data: ProductSaveRequest}>;
declare const useProductCreate: (
	options?: ApiMutationOptions<Product, {data: ProductCreateRequest}>,
) => UseMutationResult<Product, {data: ProductCreateRequest}>;
declare const useProductRemove: () => UseMutationResult<void, {params: {productId: string}}>;
interface PermissionStore {
	canEditProduct: boolean;
	setCanEditProduct: (value: boolean) => void;
}
declare const usePermissionStore: {
	(): PermissionStore;
	<T>(selector: (state: PermissionStore) => T): T;
};
interface ThemeStore {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}
declare const useThemeStore: () => ThemeStore;
interface ChatContextValue {
	isEmpty: boolean;
	emptyMessage: string;
	messages: ChatMessage[];
	send: (text: string) => void;
}
declare const useChatContext: () => ChatContextValue;
interface FormHandle<T> {
	values: T;
}
declare const useForm: <T>() => FormHandle<T>;
declare const navigate: NavigateFunction;

// 예제 세계관: 보조 함수
interface ProductFilter {
	status: ProductStatusFilter;
	keyword: string;
}
interface SearchIndex {
	search(keyword: string): Product[];
}
declare const fetchProducts: (params: {pageSize: number}) => Promise<ProductListResponse>;
declare const fetchFilteredRows: (status: ProductStatusFilter) => Promise<ProductRow[]>;
declare const isProductFilter: (value: unknown) => value is ProductFilter;
declare const parseStoredProductFilter: (raw: string | null) => ProductFilter | undefined;
declare const matchRow: (row: Row, keyword: string) => boolean;
declare const mountChart: (container: HTMLElement) => ChartInstance;
declare const notify: (userId: string) => void;
declare const reportEmptySearch: (keyword: string) => void;
declare const saveRecord: (draft: Draft) => Promise<Draft>;
declare const saveProduct: (request: ProductSaveRequest & {attachments?: string[]}) => Promise<Product>;
declare const uploadAttachments: (files: File[]) => Promise<string[]>;
declare const subscribeToProductChanges: {
	(productIds: string[]): () => void;
	(productId: string, onChange: (change: ProductChange) => void): () => void;
};
declare const subscribeToUserJoined: (onJoined: (userId: string) => void) => () => void;
declare const toChartPoints: (counts: DailyCount[]) => ChartPoint[];
declare const toProductRows: (response: ProductListResponseDTO) => ProductRow[];
declare const toSearchIndex: (products: Product[]) => SearchIndex;
declare const toSubmitErrorMessage: (error: unknown) => string;
declare const toTableColumns: (columns: TableColumn[]) => TableColumn[];
declare const toTickTime: (index: number) => string;
declare const toTreeData: (node: ProductCategoryNode) => TreeItem;
declare const toggleSelection: (id?: string) => void;
declare const toProductCreateRequest: (values: ProductFormValues) => ProductCreateRequest;
declare const toProductSaveRequest: (values: ProductFormValues, attachmentIds?: string[]) => ProductSaveRequest;
declare const toSeriesColorToken: (role: string, index: number) => string;
declare const formatAmount: (amount: Amount) => string;
declare const formatPercent: (rate: number | null) => string;
declare const handleListItemClick: (productId: string) => MouseEventHandler<HTMLButtonElement>;
declare const handleChange: (value: string) => void;
declare const handleFilterToggleClick: MouseEventHandler<HTMLButtonElement>;
declare const setPage: Dispatch<number>;
declare const setRows: Dispatch<ProductRow[]>;
declare const setSelectedCategoryId: Dispatch<string>;
declare const setSelectedUserIds: Dispatch<string[]>;
declare const setStatusFilter: Dispatch<ProductStatusFilter>;
declare const setSubmitErrorMessage: Dispatch<string | null>;
declare const setVisibleRowCount: Dispatch<number>;

// 조각 예제가 바깥에서 받는 변수. 조각은 컴포넌트 본문이나 함수 본문만 보여 주므로 이름만 선언
interface FragmentProps {
	columns: TableColumn[];
	formValues: ProductFormValues;
	isSelected: boolean;
	keyword: string;
	onChange: (change: ProductChange) => void;
	onKeywordChange: ChangeEventHandler<HTMLInputElement>;
	productId: string;
	products: Product[];
	variant: "fill" | "outline" | "default";
	view: "chart" | "table";
}
declare const props: FragmentProps;
declare const amount: Amount;
declare const points: ChartPoint[];
declare const seriesItems: ChartSeries[];
declare const summary: ProductSummary;
declare const summaryText: string;
declare const dailyCounts: DailyCount[];
declare const productRows: ProductRow[];
declare const responseProductSearch: ApiResponse<{rows?: ProductRow[]}>;
declare const productSummary: {averageRate: string};
declare const product: Product;
declare const archivedProducts: Product[];
declare const selectedProduct: Product | null;
declare const productId: string;
declare const order: Order;
declare const rows: OrderRow[];
declare const expandedRows: OrderRow[];
declare const sort: TableSort;
declare const user: User;
declare const users: User[];
declare const session: Session;
declare const settings: Settings;
declare const formValues: ProductFormValues;
declare const query: {pageSize?: number};
declare const productUrlParsers: {
	keyword: ReturnType<typeof parseAsString.withDefault>;
	categoryId: ReturnType<typeof parseAsString.withDefault>;
	page: ReturnType<typeof parseAsInteger.withDefault>;
};
declare const urlParams: {keyword: string; categoryId: string; page: number};
declare const keyword: string;
declare const deferredKeyword: string;
declare const value: string;
declare const tone: Tone;
declare const variant: string;
declare const target: URL;
declare const requestUrl: URL;
declare const issuedAt: string;
declare const today: string;
declare const rawKey: string;
declare const savedFilter: ProductFilter;
declare const selectedLocale: string;
declare const rowOffset: number;
declare const pageCount: number;
declare const draftFiles: File[];
declare const isActive: boolean;
declare const isCritical: boolean;
declare const isDense: boolean;
declare const isDisabled: boolean;
declare const isSelected: boolean;
declare const ownerId: string;
declare const approverId: string;
declare const reviewerId: string;
declare const ownerIds: string[];
declare const allowedProductIds: string[];
declare const watchedProductIds: string[];
declare const canInviteMembers: boolean;
declare const canManageItems: boolean;
declare const response: ApiResponse<ProductListResponse>;
declare const responseDateTime: string;
declare const responseProductListSuspense: UseSuspenseQueryResult<ProductListResponse>;
declare const responseProductSearchSuspense: UseSuspenseQueryResult<ProductListResponse>;
declare const responseProductSummarySuspense: UseSuspenseQueryResult<ProductSummary>;
declare const responseAccessBootstrapSuspense: UseSuspenseQueryResult<Capabilities>;
declare const responseTableColumnsSuspense: UseSuspenseQueryResult<{columns: TableColumn[]}>;
declare const responseOrderSummarySuspense: UseSuspenseQueryResult<{rows: OrderRow[]; filters: OrderFilters}>;
declare const mutationProductSave: UseMutationResult<Product, {data: ProductSaveRequest}>;
declare const mutationProductRemove: UseMutationResult<void, {params: {productId: string}}>;
declare const mutationAttachmentUpload: UseMutationResult<{attachmentIds: string[]}, {files: File[]}>;
declare const mutationMediaSave: UseMutationResult<void, {data: unknown}>;

// 아직 남은 이름
type ExampleQueryOptions<T> = {queryKey: readonly unknown[]; queryFn: () => Promise<T>};
declare const products: Product[];

// 예제 세계관: `@/` 모듈. 예제가 import 하는 것만 선언. 모듈 안에서 같은 이름을 다시 내보내려고 Shape, Component 별칭을 거침
type UiButtonPropsShape = UiButtonProps;
type ChartSeriesShape = ChartSeries;
type UiPanelPartPropsShape = UiPanelPartProps;
type WgProfileDialogPartPropsShape = WgProfileDialogPartProps;
type UiPanelPartComponent = (props: UiPanelPartProps) => ReactElement;
type WgProfileDialogPartComponent = (props: WgProfileDialogPartProps) => ReactElement;
type UiLineChartComponent = (props: UiLineChartProps) => ReactElement;
type UiTabsComponent = (props: UiTabsProps) => ReactElement;
type PgProductTableSectionComponent = (props: PgProductTableSectionProps) => ReactElement;
interface UiTabsContextValue {
	selectedId: string;
	onSelect: (id: string) => void;
}
declare module "@/component/ui/button/ui-button" {
	export type UiButtonProps = UiButtonPropsShape;
	export const UiButton: (props: UiButtonPropsShape) => ReactElement;
}
declare module "@/component/ui/line-chart/_constant/series" {
	export const chart_series_line: {readonly id: "line"; readonly role: "line"};
}
declare module "@/component/ui/line-chart/_type/chart-series" {
	export type ChartSeries = ChartSeriesShape;
}
declare module "@/component/ui/line-chart/ui-line-chart" {
	export const UiLineChart: UiLineChartComponent;
}
declare module "@/component/ui/panel/_type/panel-part" {
	export type UiPanelPartProps = UiPanelPartPropsShape;
}
declare module "@/component/ui/panel/_ui-panel-body" {
	export const UiPanelBody: UiPanelPartComponent;
}
declare module "@/component/ui/panel/_ui-panel-footer" {
	export const UiPanelFooter: UiPanelPartComponent;
}
declare module "@/component/ui/panel/_ui-panel-header" {
	export const UiPanelHeader: UiPanelPartComponent;
}
declare module "@/component/ui/panel/_ui-panel-root" {
	export const UiPanelRoot: UiPanelPartComponent;
}
declare module "@/component/ui/panel/ui-panel" {
	export const UiPanel: {
		Root: UiPanelPartComponent;
		Header: UiPanelPartComponent;
		Body: UiPanelPartComponent;
		Footer: UiPanelPartComponent;
	};
}
declare module "@/component/ui/tabs/_hook/use-tabs" {
	export const UiTabsContext: Context<UiTabsContextValue | null>;
}
declare module "@/component/ui/tabs/ui-tabs" {
	export const UiTabs: UiTabsComponent;
}
declare module "@/component/widget/product-table/wg-product-table" {
	export const WgProductTable: (props: WgProductTableProps) => ReactElement;
}
declare module "@/component/widget/product-toolbar/_wg-product-toolbar-root" {
	export const WgProductToolbarRoot: (props: {children?: ReactNode}) => ReactElement;
}
declare module "@/component/widget/product-toolbar/wg-product-toolbar" {
	export const WgProductToolbar: {
		Root: (props: {children?: ReactNode}) => ReactElement;
	};
}
declare module "@/component/widget/profile-dialog/_type/profile-dialog-part" {
	export type WgProfileDialogPartProps = WgProfileDialogPartPropsShape;
}
declare module "@/component/widget/profile-dialog/_wg-profile-dialog-body" {
	export const WgProfileDialogBody: WgProfileDialogPartComponent;
}
declare module "@/component/widget/profile-dialog/_wg-profile-dialog-header" {
	export const WgProfileDialogHeader: WgProfileDialogPartComponent;
}
declare module "@/component/widget/profile-dialog/_wg-profile-dialog-root" {
	export const WgProfileDialogRoot: WgProfileDialogPartComponent;
}
declare module "@/component/widget/user-card/_wg-user-card-avatar" {
	export const WgUserCardAvatar: (props: {src: string; alt: string; theme?: Theme}) => ReactElement;
}
declare module "@/config/env" {
	export const env_api_base_url: string;
}
declare module "@/constant/api" {
	export const api_request_timeout_ms: number;
}
declare module "@/constant/date" {
	export const date_expiry_month_format: string;
	export const date_input_format: string;
}
declare module "@/constant/pagination" {
	export const pagination_default_page_size: number;
}
declare module "@/constant/preview" {
	export const preview_row_count: number;
}
declare module "@/constant/retry" {
	export const retry_max_attempts: number;
}
declare module "@/page/(main)/orders/pg-orders" {
	export const PgOrders: () => ReactElement;
}
declare module "@/page/(main)/pg-main-outlet" {
	export const PgMainOutlet: () => ReactElement;
}
declare module "@/page/(main)/products/pg-products" {
	export const PgProducts: () => ReactElement;
}
declare module "@/page/pg-outlet" {
	export const PgOutlet: () => ReactElement;
}
declare module "@/page/product-detail/_function/to-summary" {
	export const toSummary: (response: ApiResponse<ProductSummary>) => ProductSummary;
}
declare module "@/page/product-detail/_pg-section-heading" {
	export const PgSectionHeading: (props: {title: string}) => ReactElement;
}
declare module "@/page/product-detail/pg-product-detail" {
	export const PgProductDetail: () => ReactElement;
}
declare module "@/page/product-detail/product-summary/pg-product-summary" {
	export const PgProductSummary: (props: {heading?: ReactNode}) => ReactElement;
}
declare module "@/page/product-detail/product-table-section/_pg-review-section" {
	export const PgReviewSection: () => ReactElement;
}
declare module "@/page/product-detail/product-table-section/pg-product-table-section" {
	export const PgProductTableSection: PgProductTableSectionComponent;
}
declare module "@/page/products/_function/to-media-upload-payload" {
	export const toMediaUploadPayload: (files: File[]) => FormData;
}
declare module "@/page/profile/_function/to-profile-save-request" {
	export const toProfileSaveRequest: (values: ProfileFormValues) => {displayName: string};
}
declare module "@/type/user-profile" {
	export type UserProfile = Profile;
}
declare module "@/util/date/to-display-date" {
	export const toDisplayDate: (value: string) => string;
}

// 테스트 예제가 사용하는 앱 계약. 러너 API는 설치된 패키지의 실제 타입을 사용합니다
declare module "@/util/number/format-quantity" {
	export const formatQuantity: (value: number | null) => string;
}
declare module "@/util/date/normalize-date-range" {
	/**
	 * 기간 보정의 입력과 출력
	 */
	export interface DateRange {
		/**
		 * 시작 날짜, 입력에서 빈 문자열 허용
		 */
		startDate: string;
		/**
		 * 종료 날짜, 입력에서 빈 문자열 허용
		 */
		endDate: string;
	}
	export const normalizeDateRange: (range: DateRange) => DateRange;
}
declare module "@/service/orders" {
	/**
	 * 서버가 반환하는 주문
	 */
	export interface OrderDto {
		/**
		 * 주문 식별자
		 */
		id: string;
		/**
		 * 주문 수량
		 */
		quantity: number;
		/**
		 * 주문 처리 상태
		 */
		status: "open" | "closed";
	}
	export const getOrder: (id: string) => Promise<OrderDto>;
}
declare module "@/page/orders/_function/to-order-rows" {
	/**
	 * 목록이 표시하는 주문 행
	 */
	export interface OrderRow {
		/**
		 * 주문 식별자
		 */
		id: string;
		/**
		 * 형식이 적용된 수량
		 */
		quantityLabel: string;
	}
	export const toOrderRows: (orders: import("@/service/orders").OrderDto[]) => OrderRow[];
}
