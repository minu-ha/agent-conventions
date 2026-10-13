import dayjs from "dayjs";

import {date_expiry_month_format} from "@/constant/date";

// date_expiry_month_format은 원래 표시와 같은 YYYY.MM 형식
const expiresAt = dayjs(issuedAt).add(token_expiry_hours, "hour");
const expiresLabel = expiresAt.format(date_expiry_month_format);
