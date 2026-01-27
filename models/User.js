import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    city: String,
    street: String,
    house: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  passwordHash: String,
  phone: { type: String, required: true },

  role: { type: String, default: "user" },
  address: addressSchema,

  createdAt: { type: Date, default: Date.now },
  isActive: Boolean
}, { timestamps: true });

export default mongoose.model("User", userSchema);
