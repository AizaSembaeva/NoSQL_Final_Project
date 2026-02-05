import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  patchStock
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getProducts);

router.post("/", authMiddleware, roleMiddleware("admin"), createProduct);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

router.patch("/:id/stock", authMiddleware, roleMiddleware("admin"), patchStock);

export default router;
