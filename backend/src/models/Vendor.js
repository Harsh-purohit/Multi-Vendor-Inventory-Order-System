import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
