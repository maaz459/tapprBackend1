const { Orders } = require("../models/orders");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("../middleware/auth");
const keys = require("../config/dev");
const nodemailer = require("nodemailer");
const config = require("config");
//Add new Order
router.post("/", auth, async (req, res) => {
  try {
    let order = new Orders({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      projectId: req.body.projectId,
      amount: req.body.amount,
      paymentBy: req.body.paymentBy,
      receiptNo: moment().format("dmmyyyyHHMMSS"),
      publishDate: moment().toJSON(),
    });
    const newSavedOrder = await order.save();
    res.send(newSavedOrder);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: keys.email,
        pass: keys.password,
      },
    });

    const mailOptions = {
      from: keys.email,
      to: `${req.user.email}`,
      subject: "Tappr PTY LTD - Order Successfull",
      html: "Your Order Successfull With Receipt No " + ` ${newSavedOrder.receiptNo} `,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        res.status(400).send({ message: "Server error" });
      } else {
        res.status(200).json({ message: "Email Sent" });
      }
    });

    res.status(200).send({ message: "Order Added" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Get Order
router.get("/:orderId", auth, async (req, res) => {
  try {
    let orders = await Orders.find({ userId: req.user._id, _id: req.params.orderId });
    res.status(200).send(orders);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Get All Order
router.get("/", auth, async (req, res) => {
  try {
    let orders = await Orders.find({ userId: req.user._id });
    res.status(200).send(orders);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Delete Order
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Orders.findByIdAndRemove({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).send({ message: "The FAQ with the given ID was not found." });
    res.send(order);
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Update Order
router.put("/:orderId", auth, async (req, res) => {
  try {
    let order = await Orders.findById(req.params.orderId);
    if (!order) return res.status(404).send({ message: "The order with the given id was not found." });
    order = await order.updateOne({
      $set: {
        receiptNo: req.body.receiptNo,
        amount: req.body.amount,
        paymentBy: req.body.paymentBy,
      },
    });
    res.status(200).send({ message: "Data Updated" });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

//Resend Order Email
router.get("/resendEmail/:orderId", auth, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.orderId);
    if (order) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: keys.email,
          pass: keys.password,
        },
      });

      const mailOptions = {
        from: keys.email,
        to: `${req.user.email}`,
        subject: "Tappr PTY LTD - Order Successfull",
        html: "Your Order Successfull With Receipt No " + ` ${order.receiptNo} `,
      };

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          res.status(400).send({ message: "Server error" });
        } else {
          res.status(200).json({ message: "Email Sent" });
        }
      });
    } else {
      res.status(400).send({ message: "No Order Present" });
    }
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

module.exports = router;
