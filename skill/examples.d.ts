/**
 * 예제가 import 없이 쓰는 이름
 *
 * 실제 스택의 이름은 설치된 패키지의 타입을 그대로 가리키고, 예제 세계관의 이름은 여기서 선언합니다
 * tsc 가 Cannot find name 을 내면 그 이름을 알맞은 절에 더합니다
 */

declare module "@/*";
declare module "*.css";
declare module "*.svg";
declare module "@/component/ui/button/ui-button" {
	export type UiButtonProps = any;
}
declare module "@/component/ui/line-chart/_type/chart-series" {
	export type ChartSeries = any;
}
declare module "@/component/ui/panel/_type/panel-part" {
	export type UiPanelPartProps = any;
}
declare module "@/component/widget/profile-dialog/_type/profile-dialog-part" {
	export type WgProfileDialogPartProps = any;
}
declare module "@/type/user-profile" {
	export type UserProfile = any;
}

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
type ProductListResponseDTO = ProductListResponse;
type ProductPage = ProductListResponse;
interface ProductTreeResponse {
	nodes: ProductCategoryNode[];
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
	points?: ChartPoint[];
	children?: ReactNode;
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
	dailyCounts?: DailyCount[];
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
declare const PgProductFilterSection: (props: {keyword?: string}) => ReactElement;
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

// 예제 세계관: 아직 any 인 이름
type ExampleQueryOptions<T = any> = {queryKey: readonly unknown[]; queryFn: () => Promise<T>};
declare const useForm: <T>(...args: any[]) => any;
declare const allowedProductIds: any;
declare const amount: any;
declare const approverId: any;
declare const archivedProducts: any;
declare const canInviteMembers: any;
declare const canManageItems: any;
declare const categoryListQueryOptions: () => ExampleQueryOptions<{categories: ProductCategory[]}>;
declare const client: any;
declare const createClient: any;
declare const deferredKeyword: any;
declare const draftFiles: any;
declare const expandedRows: any;
declare const fetchFilteredRows: any;
declare const fetchProducts: any;
declare const formValues: any;
declare const formatAmount: any;
declare const formatPercent: any;
declare const handleChange: any;
declare const handleFilterToggleClick: any;
declare const handleListItemClick: any;
declare const isActive: any;
declare const isCritical: any;
declare const isDense: any;
declare const isDisabled: any;
declare const isProductFilter: any;
declare const isSelected: any;
declare const issuedAt: any;
declare const keyword: any;
declare const matchRow: any;
declare const mountChart: any;
declare const mutationAttachmentUpload: any;
declare const mutationMediaSave: any;
declare const mutationProductRemove: any;
declare const mutationProductSave: any;
declare const navigate: any;
declare const notify: any;
declare const order: any;
declare const ownerId: any;
declare const ownerIds: any;
declare const pageCount: any;
declare const parseStoredProductFilter: any;
declare const points: any;
declare const product: any;
declare const productDetailSummaryQueryOptions: (...args: any[]) => ExampleQueryOptions;
declare const productId: any;
declare const productListQueryKey: any;
declare const productListQueryOptions: () => ExampleQueryOptions<{products: Product[]}>;
declare const productSummary: any;
declare const productSummaryQueryKey: any;
declare const productUrlParsers: any;
declare const products: any[];
declare const props: any;
declare const query: any;
declare const queryClient: any;
declare const rawKey: any;
declare const reportEmptySearch: any;
declare const requestUrl: any;
declare const response: any;
declare const responseAccessBootstrapSuspense: any;
declare const responseDateTime: any;
declare const responseProductListSuspense: any;
declare const responseProductSearchSuspense: any;
declare const responseProductSummarySuspense: any;
declare const responseTableColumnsSuspense: any;
declare const reviewerId: any;
declare const rowOffset: any;
declare const rows: any;
declare const saveProduct: any;
declare const saveRecord: any;
declare const savedFilter: any;
declare const selectedLocale: any;
declare const selectedProduct: any;
declare const seriesItems: any;
declare const session: any;
declare const setPage: any;
declare const setRows: any;
declare const setSelectedTagId: any;
declare const setSelectedUserIds: any;
declare const setStatusFilter: any;
declare const setSubmitErrorMessage: any;
declare const setVisibleRowCount: any;
declare const settings: any;
declare const sort: any;
declare const subscribeToProductChanges: any;
declare const subscribeToUserJoined: any;
declare const summary: any;
declare const target: any;
declare const toChartPoints: any;
declare const toProductCreateRequest: any;
declare const toProductRows: any;
declare const toProductSaveRequest: any;
declare const toSearchIndex: any;
declare const toSeriesColorToken: any;
declare const toSubmitErrorMessage: any;
declare const toTableColumns: any;
declare const toTickTime: any;
declare const toTreeData: any;
declare const today: any;
declare const toggleSelection: any;
declare const tone: any;
declare const uploadAttachments: any;
declare const urlParams: any;
declare const useChatContext: any;
declare const useGetProductListSuspense: any;
declare const useOrderQuery: any;
declare const usePermissionStore: any;
declare const useProductCreate: any;
declare const useProductList: any;
declare const useProductListSuspense: any;
declare const useProductQuery: any;
declare const useProductRemove: any;
declare const useProductSave: any;
declare const useProductTreeSuspense: any;
declare const useThemeStore: any;
declare const useUserGetItemSuspense: any;
declare const user: any;
declare const users: any;
declare const value: any;
declare const variant: any;
declare const watchedProductIds: any;
