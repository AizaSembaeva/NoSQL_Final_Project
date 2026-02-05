import mongoose from "mongoose";
import Product from "../models/Product.js";

export async function createProduct(req, res, next) {
  try {
    const { name, price, category_id, color, sizes, stock, isAvailable } = req.body;

    const product = await Product.create({
      name, price, category_id, color, sizes, stock, isAvailable
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req, res, next) {
  try {
    const {
      search,
      category_id,
      minPrice,
      maxPrice,
      isAvailable,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category_id && mongoose.isValidObjectId(category_id)) filter.category_id = category_id;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortObj = { [sort]: order === "asc" ? 1 : -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function patchStock(req, res, next) {
  try {
    const delta = Number(req.body.delta ?? -1);

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: delta } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
