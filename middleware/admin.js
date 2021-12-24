const config = require("config");

module.exports = function (req, res, next) {
  let token = req.header("x-admin-token");
  if (!token) return res.status(401).send("Access denied. No Admin token provided.");

  try {
  if(token === config.get('adminKey')){
    next();
  }else{
    res.status(401).send("Invalid admin token");
  }
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
