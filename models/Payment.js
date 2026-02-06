import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  payment_method: String,
  payment_status: String,
  paid_at: Date,
}, { timestamps: true });

paymentSchema.index({ order_id: 1 });

export default mongoose.model("Payment", paymentSchema);
