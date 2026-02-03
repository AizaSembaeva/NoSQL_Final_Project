import Category from "../models/Category.js";

export async function createCategory(req, res, next) {
  try {
    const { name, description} = req.body;
    const c = await Category.create({ name, description});
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const list = await Category.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}
