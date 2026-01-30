import express from "express";

const router = express.Router();

router.post("/", createOrder);
router.get("/my", getMyOrders);

router.get("/summary", getOrdersSummary);

router.patch("/:id/status", updateOrderStatus);

export default router;
