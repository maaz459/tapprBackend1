const { FAQ, supportTicket } = require("../models/support");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

//Add new FAQ
router.post("/faq", admin, async (req, res) => {
  try {
    let faq = await FAQ.findOne({ question: req.body.question });
    if (faq) return res.status(400).send({ message: "This question is already available" });

    faq = new FAQ({
      question: req.body.question,
      answer: req.body.answer,
      publishDate: moment().toJSON(),
    });
    await faq.save();
    res.status(200).send({ message: "Question Added" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Get FAQs
router.get("/faq", async (req, res) => {
  try {
    let faq = await FAQ.find();
    res.status(200).send(faq);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Delete FAQ
router.delete("/faq/:id", admin, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndRemove(req.params.id);
    if (!faq) return res.status(404).send({ message: "The FAQ with the given ID was not found." });
    res.send(faq);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Update FAQ
router.put("/faq/:id", admin, async (req, res) => {
  try {
    let faq = await FAQ.findById(req.params.id);

    if (!faq) return res.status(404).send({ message: "The FAQ with the given id was not found." });
    faq = await faq.update({
      $set: {
        question: req.body.question,
        answer: req.body.answer,
      },
    });
    res.status(200).send({ message: "Data Updated" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Add new Ticket
router.post("/ticket", auth, async (req, res) => {
  try {
    let support = new supportTicket({
      issue: req.body.issue,
      connectType: req.body.connectType,
      description: req.body.description,
      screens: req.body.screens,
      publishDate: moment().toJSON(),
      userId: req.user._id,
      email: req.user.email,
      status: req.user.status,
    });
    await support.save();
    if (support) res.status(200).send({ message: "Ticket Added" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Get FAQs
router.get("/ticket", auth, async (req, res) => {
  try {
    let support = await supportTicket.find({ userId: req.user._id });
    res.status(200).send(support);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Delete FAQ
router.delete("/ticket/:id", auth, async (req, res) => {
  try {
    const support = await supportTicket.findOneAndRemove({ _id: req.params.id, userId: req.user._id });
    if (!support) return res.status(404).send({ message: "The Ticket with the given ID was not found." });
    res.send(support);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Update FAQ
router.put("/ticket/:id", auth, async (req, res) => {
  try {
    let support = await supportTicket.findOne({ _id: req.params.id, userId: req.user._id });

    if (!support) return res.status(404).send({ message: "The Ticket with the given id was not found." });
    support = await support.update({
      $set: {
        issue: req.body.issue,
        connectType: req.body.connectType,
        description: req.body.description,
        screens: req.body.screens,
        status: req.body.status,
      },
    });
    res.status(200).send({ message: "Data Updated" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Update Ticket Status
router.put("/ticket/changeStatus/:id", admin, async (req, res) => {
  try {
    let support = await supportTicket.findById(req.params.id);

    if (!support) return res.status(404).send({ message: "Invalid Id" });
    support = await support.updateOne({
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
