const mongoose = require("mongoose");

const orders = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  receiptNo: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  paymentBy: {
    type: String,
    required: true,
    enum: ["APPLE", "STRIPE", "CARD"],
  },
  publishDate: { type: String },
  
});
const Orders = mongoose.model("orders", orders);

exports.Orders = Orders;
