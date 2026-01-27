import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  description: { type: String, default: "" },
});

export default mongoose.model("Category", categorySchema);
