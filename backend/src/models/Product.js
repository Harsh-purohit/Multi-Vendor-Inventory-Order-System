import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    name: String,
    price: Number,
    stockQty: { type: Number, default: 0 },
    initialStock: { type: Number, default: 0 },
    description: String,
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
