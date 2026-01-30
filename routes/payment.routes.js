import express from "express";

const router = express.Router();

router.post("/", authMiddleware, createPayment);

export default router;
