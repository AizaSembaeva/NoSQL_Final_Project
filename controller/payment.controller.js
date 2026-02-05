import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

export async function createPayment(req, res, next) {
  try {
    const { order_id, payment_method } = req.body;

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const payment = await Payment.create({
      order_id,
      payment_method: payment_method || "card",
      payment_status: "paid",
      paid_at: new Date(),
    });

    await Order.updateOne(
      { _id: order_id },
      { $set: { status: "paid" } }
    );

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}
