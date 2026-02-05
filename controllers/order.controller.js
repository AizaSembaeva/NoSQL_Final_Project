import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

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
      await Product.updateOne(
        { _id: it.productId },
        { $inc: { stock: -it.quantity } }
      );
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
