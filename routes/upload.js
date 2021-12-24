const multer = require("multer");
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const handleError = (err, res) => {
  res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "./files",
});

router.post("/upload", upload.single("file"), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = `./files/${req.file.originalname}`;
  console.log(targetPath);
  if (
    path.extname(req.file.originalname).toLowerCase() === ".png" ||
    path.extname(req.file.originalname).toLowerCase() === ".jpg" ||
    path.extname(req.file.originalname).toLowerCase() === ".pdf"
  ) {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) return handleError(err, res);
      res.status(200).contentType("text/plain").end(req.file.originalname);
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) return handleError(err, res);
      res.status(403).contentType("text/plain").end("Only png,jpg and pdf files are allowed!");
    });
  }
});
router.get("/:filename", function (req, res) {
  const file = `files/${req.params.filename}`;
  res.download(file);
});
module.exports = router;
