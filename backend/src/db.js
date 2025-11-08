// src/db.js
import mongoose from "mongoose";

async function connectDB(uri) {
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, {
    // recommended options are default in latest mongoose
  });
  console.log('MongoDB connected');
}

export default connectDB;
