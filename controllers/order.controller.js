import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const ALLOWED_STATUSES = new Set(["pending", "paid", "cancelled"]);

function dayRange(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;

  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  return { start, end };
}

export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items required" });
    }

    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productsMap = new Map(products.map(p => [p._id.toString(), p]));

    let totalPrice = 0;
    const orderItems = [];

    for (const i of items) {
      const p = productsMap.get(i.productId);
      if (!p) return res.status(404).json({ message: `Product not found: ${i.productId}` });

      const qty = Number(i.quantity || 1);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ message: "quantity must be a positive number" });
      }

      if (p.stock < qty) {
        return res.status(400).json({ message: `Not enough stock for ${p.name}` });
      }

      totalPrice += p.price * qty;

      orderItems.push({
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: qty,
      });
    }

    const order = await Order.create({
      user_id: userId,
      orderDate: new Date(),
      status: "pending",
      items: orderItems,
      totalPrice,
    });

    for (const it of orderItems) {
      const updated = await Product.findByIdAndUpdate(
        it.productId,
        { $inc: { stock: -it.quantity } },
        { new: true }
      );

      if (updated) {
        const fixedStock = Math.max(Number(updated.stock ?? 0), 0);
        const shouldBeAvailable = fixedStock > 0;

        if (fixedStock !== updated.stock || updated.isAvailable !== shouldBeAvailable) {
          await Product.updateOne(
            { _id: updated._id },
            { $set: { stock: fixedStock, isAvailable: shouldBeAvailable } }
          );
        }
      }
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!ALLOWED_STATUSES.has(String(status))) {
      return res.status(400).json({ message: "Invalid status. Allowed: pending, paid, cancelled" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function adminGetOrdersByEmail(req, res, next) {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const date = String(req.query.date || "").trim();

    if (!email) return res.status(400).json({ message: "email query param required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const filter = { user_id: user._id };

    if (date) {
      const range = dayRange(date);
      if (!range) return res.status(400).json({ message: "Invalid date format" });
      filter.orderDate = { $gte: range.start, $lt: range.end };
    }

    const orders = await Order.find(filter).sort({ orderDate: -1, createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrdersSummary(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const result = await Order.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$user_id",
          totalSpent: { $sum: "$totalPrice" },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    res.json(result[0] || { _id: userId, totalSpent: 0, ordersCount: 0 });
  } catch (err) {
    next(err);
  }
}
