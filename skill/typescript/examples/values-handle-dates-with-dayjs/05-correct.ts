// 서버가 이미 표시 타임존으로 준 고정 형식. 시각 변환 없이 분까지만 표시
const response_date_time_minute_length = "YYYY-MM-DDTHH:mm".length;
const compactDateTime = responseDateTime.slice(0, response_date_time_minute_length).replace("T", " ");
