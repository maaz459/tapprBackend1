const mongoose = require("mongoose");

const replies = new mongoose.Schema({
  userId: {type: String,required: true,},
  replyText: {type: String,required: true,},
  email: {type: String,required: true,},
  supportTicketId: {type: String,required: true,},
  publishDate: { type: String },
  closeDate: { type: String },
  status: { type: String },


});
const Reply = mongoose.model("replies", replies);

exports.Reply = Reply;
