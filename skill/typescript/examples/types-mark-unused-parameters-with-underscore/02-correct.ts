/**
 * 로그 싱크 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

// [!code ++]
/**
 * 아무것도 남기지 않는 로그 싱크. 테스트의 출력 끄기용
 */
// [!code ++]
const noopLog: LogSink = (_message, _level) => {};
