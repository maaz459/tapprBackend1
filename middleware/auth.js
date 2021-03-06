const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  let token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    token = token.replace(/^Bearer\s/, "");
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
