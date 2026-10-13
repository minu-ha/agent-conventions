const [isOpen, setIsOpen] = useState(false);
// [!code error]
const [theme, setTheme] = useState<Theme>("light");

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
// [!code error]
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
