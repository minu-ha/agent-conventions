// src/service/msw/handlers.ts
import type { RequestHandler } from "msw";

import { handlers } from "@/service/__kubb/msw/handlers";
import { get_orders_handler } from "@/service/msw/orders/get-orders";

/**
 * 개발, mock 앱 E2E, story 통합의 반복 응답. once, generator, 공유 가변 상태 제외
 */
// [!code ++]
export const mock_handlers = [get_orders_handler, ...handlers] satisfies RequestHandler[];
