const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const pick = require("lodash/pick");
const { User, validate, validateLogin } = require("../models/user");
const express = require("express");
const moment = require("moment");
const router = express.Router();
const keys = require("../config/dev");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const config = require("config");

//Check For User Data in DB using JWT Token
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//validate Password of user using JWT Token
router.get("/currentpassword/:id/:password", auth, async (req, res) => {
  let user = await User.findOne({ _id: req.params.id });
  if (!user) return res.status(400).send("Invalid id.");

  const validPassword = await bcrypt.compare(req.params.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password.");

  res.send(user);
});

//Register new user
router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User Already Registered");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    address: req.body.address,
    licenceNumber: req.body.licenceNumber,
    businessAddress: req.body.businessAddress,
    abn: req.body.abn,
    signature: req.body.signature,
    profilePic: req.body.profilePic,
    publishDate: moment().toJSON(),
  });

  const salt = await bcrypt.genSalt(config.get("saltFactor"));
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(pick(user, ["_id", "name", "email"]));
});

//Login
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Not Found");

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) return res.status(400).send("Invalid password.");
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(pick(user, ["_id", "name", "email"]));
});

//Send Forgot Password Link With Token
router.post("/forgotpasswordlink", async (req, res) => {
  if (req.body.email === "") {
    res.status(400).send("email required");
  }

  let user = await User.findOne({
    email: req.body.email,
  });

  if (user === null) {
    res.status(403).send("User Not Exist with this email");
  } else {
    const token = crypto.randomBytes(20).toString("hex");
    user = await user.update({ $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 } });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: keys.email,
        pass: keys.password,
      },
    });

    const mailOptions = {
      from: keys.email,
      to: `${req.body.email}`,
      subject: "Tappr PTY LTD - Link to reset password",
      html:
        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
        `${config.get("passwordResetLink")}/${token}\n\n` +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n\n" +
        "Tapper PTY LTD!",
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        res.status(403).send("Server error");
      } else {
        res.status(200).json("Email Sent");
      }
    });
  }
});

//Check Reset Password Token Check
router.get("/reset/:resetPasswordToken", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.resetPasswordToken,
  });

  if (user === null) {
    res.status(403).send("password reset link is invalid or has expired");
  } else {
    const expiry = user.resetPasswordExpires;
    if (expiry < Date.now()) {
      res.status(404).send("password reset link is invalid or has expired");
    }

    res.status(200).send({
      user: user,
      message: "password reset link ok",
    });
  }
});

//Update Password
router.post("/updatePassword", async (req, res) => {
  if (!req.body.token || !req.body.password) res.status(404).send("Data Incomplete");
  let user = await User.findOne({ resetPasswordToken: req.body.token });
  if (!user) return res.status(404).send("User not found");

  const salt = await bcrypt.genSalt(config.get("saltFactor"));
  password = await bcrypt.hash(req.body.password, salt);

  user = await user.update({
    $set: {
      password: password,
      resetPasswordExpires: "",
      resetPasswordToken: "",
    },
  });

  res.status(200).send("Password Updated");
});

//Update User Profile user data
router.put("/updateProfile", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    if (!user) return res.status(404).send("The user with the given id was not found.");
    user = await user.update({
      $set: {
        address: req.body.address,
        licenceNumber: req.body.licenceNumber,
        businessAddress: req.body.businessAddress,
        abn: req.body.abn,
        signature: req.body.signature,
        profilePic: req.body.profilePic,
        publishDate: moment().toJSON(),
        phone: req.body.phone,
        signatureImage: req.body.signatureImage,
        bussinessLogoImage: req.body.bussinessLogoImage,
      },
    });
    res.status(200).send("Data Updated");
  } catch (err) {
    res.status(409).send(err.message);
  }
});

module.exports = router;