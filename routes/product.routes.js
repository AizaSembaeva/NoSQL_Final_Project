import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  patchStock
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id",  deleteProduct);

router.patch("/:id/stock", patchStock);

export default router;
