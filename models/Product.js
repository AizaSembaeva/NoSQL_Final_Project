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

export default mongoose.model("Product", productSchema);
