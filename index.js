const express = require("express");
const config = require("config");
const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();

const port = process.env.PORT || config.get("port");
const host = process.env.PORT || config.get("host");

const server = app.listen(port, () => console.log(`Server listening at ${host}:${port}`));

module.exports = server;
