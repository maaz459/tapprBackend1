const { Reply } = require("../models/replies");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

//Add new Reply
router.post("/", admin, async (req, res) => {
  try {
    let reply = new Reply({
      userId: req.body.userId,
      replyText: req.body.replyText,
      email: req.body.email,
      supportTicketId: req.body.supportTicketId,
      publishDate: moment().toJSON(),
      status: { type: String },
    });
    await reply.save();
    res.status(200).send({ message: "Reply Added" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Get Reply
router.get("/", admin, async (req, res) => {
  try {
    let replies = await Reply.find();
    res.status(200).send(replies);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Get Reply Related to Support Ticket
router.get("/:supportTicketId", auth, async (req, res) => {
  try {
    let replies = await Reply.find({ supportTicketId: req.params.supportTicketId, userId: req.user._id });
    res.status(200).send(replies);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Delete Reply
router.delete("/:id", admin, async (req, res) => {
  try {
    const reply = await Reply.findByIdAndRemove(req.params.id);
    if (!reply) return res.status(404).send({ message: "The Reply with the given ID was not found." });
    res.send(reply);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Update Reply
router.put("/:id", admin, async (req, res) => {
  try {
    let reply = await Reply.findById(req.params.id);

    if (!reply) return res.status(404).send({ message: "The Reply with the given id was not found." });
    reply = await reply.updateOne({
      $set: {
        replyText: req.body.replyText,
      },
    });
    res.status(200).send({ message: "Data Updated" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Update Reply Status
router.put("/changeStatus/:id", auth, async (req, res) => {
  try {
    let reply = await Reply.findById(req.params.id);

    if (!reply) return res.status(404).send({ message: "Invalid Id" });
    reply = await reply.updateOne({
      $set: {
        status: req.body.status,
      },
    });
    res.status(200).send({ message: "Data Updated" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

module.exports = router;
