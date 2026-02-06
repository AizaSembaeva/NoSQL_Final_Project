import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  color: String,
  sizes: [String],
  stock: Number,
  isAvailable: Boolean, 
}, { timestamps: true });

productSchema.index({ category_id: 1, isAvailable: 1, price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model("Product", productSchema);
