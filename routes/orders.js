const { Orders } = require("../models/orders");
const { Project } = require("../models/project");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("../middleware/auth");
const keys = require("../config/dev");
const nodemailer = require("nodemailer");
const config = require("config");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
var handlebars = require("handlebars");

var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      callback(err);
      throw err;
    } else {
      callback(null, html);
    }
  });
};

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

//Send Email of Project Details
router.post("/sendProjectDetail/:orderId", auth, async (req, res) => {
  const orderId = req.params.orderId;
  const body = req.body;
  try {
    if (!body.to) return res.status(400).send({ message: "to is not Present in data" });
    const order = await Orders.findById(orderId);
    if (order) {
      const projectId = order.projectId;
      const project = await Project.findById(projectId);

      if (project) {
        // get the base64 string
        var base64String = project.image.replace(/^data:image\/[a-z]+;base64,/, "");
        const fileName = `${Date.now()}-tappr-projectFile.pdf`;
        const path = `files/${fileName}`;

        await loadImage(Buffer.from(base64String, "base64")).then(async (img) => {
          const canvas = createCanvas(img.width, img.height, "pdf");
          const ctx = canvas.getContext("2d");

          ctx.drawImage(img, 0, 0, img.width, img.height);
          const base64image = canvas.toBuffer();
          // write the file to a pdf file
          fs.writeFile(path, base64image, function (err) {
            console.log("File created");
          });
        });
        console.log("hello2");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: keys.email,
            pass: keys.password,
          },
        });
        readHTMLFile("receipt.html", function (err, html) {
          var template = handlebars.compile(html);
          var replacements = {
            username: "Tappr",
            receiptNo: order.receiptNo,
            createdDate: moment(Date.now()).format("MMMM D, YYYY"),
            time: moment(Date.now()).format("hh:mm"),
            item: fileName,
            amount: `$${order.amount}`,
            total: `$${order.amount}`,
          };
          var htmlToSend = template(replacements);
          const mailOptions = {
            from: keys.email,
            to: `${req.body.to}`,
            cc: req.body.cc,
            subject: `Tappr PTY LTD - Project File Receipt No ${order.receiptNo}`,
            html: htmlToSend,
            attachments: [
              {
                path: path,
              },
            ],
          };
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              fs.unlinkSync(`./${path}`);
              return res.status(400).send({ message: "Server error" });
            } else {
              fs.unlinkSync(`./${path}`);
              return res.status(200).json({ message: "Email Sent" });
            }
          });
        });
      } else {
        return res.status(400).send({ message: "Project Is Not Present" });
      }
    } else {
      return res.status(400).send({ message: "Invalid Order Id" });
    }
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

module.exports = router;
