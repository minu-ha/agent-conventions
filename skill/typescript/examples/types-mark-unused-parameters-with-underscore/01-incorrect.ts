/**
 * 로그 싱크 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

// [!code error]
const noopLog: LogSink = () => {
// [!code error]
	// 아무 일도 하지 않는 싱크
// [!code error]
};
