import express from "express";
import { createCategory, getCategories } from "../controllers/category.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", authMiddleware, roleMiddleware("admin"), createCategory);

export default router;
