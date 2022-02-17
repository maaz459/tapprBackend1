require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/payment-sheet", async (req, res) => {
  const data = req.body;
  try {
    if (!data.amount) res.status(400).send({ message: "Amount is not Present" });
    if (!data.currency) res.status(400).send({ message: "Currency is not Present" });

    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2020-08-27" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_KEY,
    });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
});

module.exports = router;
