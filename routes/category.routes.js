import express from "express";

const router = express.Router();

router.get("/", getCategories);
router.post("/", authMiddleware, roleMiddleware("admin"), createCategory);

export default router;
