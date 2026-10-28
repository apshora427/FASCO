import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { productRouter } from "./product.routes.js";
import { categoryRouter } from "./category.routes.js";
import { authRouter } from "./auth.routes.js";
import { orderRouter } from "./order.routes.js";
import { couponRouter } from "./coupon.routes.js";
import { subscriberRouter } from "./subscriber.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";

// Every API feature gets its own router + controller and is mounted here:
//   authRouter       → register / verify / login / forgot / reset / me
//   productRouter    → GET product(s) + admin create/update/delete
//   categoryRouter   → GET/POST /category, PUT/DELETE /category/:id
//   orderRouter      → checkout writes orders, admin manages them
//   couponRouter     → discount codes managed from the dashboard
//   subscriberRouter → newsletter signups
//   dashboardRouter  → overview stats + user management
export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(productRouter);
apiRouter.use(categoryRouter);
apiRouter.use(orderRouter);
apiRouter.use(couponRouter);
apiRouter.use(subscriberRouter);
apiRouter.use(dashboardRouter);
