const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  publishDate: { type: String },
});
const FAQ = mongoose.model("FAQ", faqSchema);

const supportSchema = new mongoose.Schema({
  issue: { type: String },
  connectType: { type: String, enum: ["EMAIL", "PHONE"] },
  description: { type: String },
  screens: { type: [String], value: [String] },
  email: { type: String},
  userId: { type: String, required: true },
  publishDate: { type: String },
  status: { type: String },

});
const supportTicket = mongoose.model("supportTicket", supportSchema);

exports.FAQ = FAQ;
exports.supportTicket = supportTicket;
