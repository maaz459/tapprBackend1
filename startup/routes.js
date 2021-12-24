const express = require("express");
const users = require("../routes/users");
const upload = require("../routes/upload");
const project = require("../routes/project");
const support = require("../routes/support");
const orders = require("../routes/orders");
const replies = require("../routes/replies");


module.exports = function (app) {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/file", upload);
  app.use("/api/project", project);
  app.use("/api/support", support);
  app.use("/api/orders", orders);
  app.use("/api/replies", replies);
};
