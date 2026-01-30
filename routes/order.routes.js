import express from "express";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getOrdersSummary
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/my", getMyOrders);

router.get("/summary", getOrdersSummary);

router.patch("/:id/status", updateOrderStatus);

export default router;
