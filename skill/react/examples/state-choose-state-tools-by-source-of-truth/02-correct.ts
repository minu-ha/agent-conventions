const [isOpen, setIsOpen] = useState(false);
// [!code ++]
const themeStore = useThemeStore();

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
