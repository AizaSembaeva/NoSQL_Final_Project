import express from "express";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getOrdersSummary,
  adminGetOrdersByEmail
} from "../controllers/order.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/summary", authMiddleware, getOrdersSummary);

router.get("/admin/by-email", authMiddleware, roleMiddleware("admin"), adminGetOrdersByEmail);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), updateOrderStatus);

export default router;
