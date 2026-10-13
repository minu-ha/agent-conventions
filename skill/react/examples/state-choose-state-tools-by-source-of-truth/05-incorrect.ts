// 테마는 레이아웃과 모든 화면이 읽는데 Context를 루트에 두고 화면마다 Provider를 찾아 올라감
const ThemeContext = createContext<Theme>("light");
