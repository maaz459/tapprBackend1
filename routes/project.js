const auth = require("../middleware/auth");
const express = require("express");
const moment = require("moment");
const router = express.Router();
const { Project, validateProject } = require("../models/project");

// Get All Projects
router.get("/", auth, async (req, res) => {
  try {
    const project = await Project.find({ userId: req.user._id });
    res.status(200).send(project);
  } catch (err) {
    res.status(409).send(err.message);
  }
});

// Get Project By Id
router.get("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ _id: req.params.id });

    if (project.userId === req.user._id) {
      res.status(200).send(project);
    } else {
      res.status(404).send("Wrong Project Id");
    }
  } catch (err) {
    res.status(409).send(err.message);
  }
});

//Add new Project
router.post("/", auth, async (req, res) => {
  try {
    const project = new Project({
      publishDate: moment().toJSON(),
      image: req.body.image,
      addressLookup: req.body.addressLookup,
      lotNo: req.body.lotNo,
      streetNo: req.body.streetNo,
      suburb: req.body.suburb,
      state: req.body.state,
      postcode: req.body.postcode,
      startData: req.body.startData,
      finishDate: req.body.finishDate,
      signature: req.body.signature,
      dpNo: req.body.dpNo,
      nowCowNo: req.body.nowCowNo,
      ssdNo: req.body.ssdNo,
      userId: req.user._id,
      status: req.body.status,
      planNo: req.body.planNo,
    });
    await project.save();
    res.status(200).send(project);
  } catch (err) {
    res.status(409).send(err.message);
  }
});

//Update Project Data
router.put("/update/:id", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ _id: req.params.id });

    if (!project) return res.status(404).send("The project with the given id was not found.");

    if (project.userId === req.user._id) {
      console.log(req.body);
      project = await project.updateOne({
        $set: {
          image: req.body.image,
          addressLookup: req.body.addressLookup,
          lotNo: req.body.lotNo,
          streetNo: req.body.streetNo,
          suburb: req.body.suburb,
          state: req.body.state,
          postcode: req.body.postcode,
          startData: req.body.startData,
          finishDate: req.body.finishDate,
          signature: req.body.signature,
          dpNo: req.body.dpNo,
          nowCowNo: req.body.nowCowNo,
          ssdNo: req.body.ssdNo,
          userId: req.user._id,
          status: req.body.status,
          planNo: req.body.planNo,
        },
      });
      res.status(200).send("Data updated");
    } else {
      res.send(404).send("Wrong project ID");
    }
  } catch (err) {
    res.status(409).send(err.message);
  }
});

//Search Project
router.get("/search/:filterWord", auth, async (req, res) => {
  try {
    const filter = req.params.filterWord;
    const project = await Project.find({ addressLookup: { $regex: filter }, userId: req.user._id });
    if (project.length > 0) {
      res.status(200).send(project);
    } else {
      const project = await Project.find({ dpNo: { $regex: filter }, userId: req.user._id });
      if (project.length > 0) {
        res.status(200).send(project);
      } else {
        const project = await Project.find({ planNo: { $regex: filter }, userId: req.user._id });
        res.status(200).send(project);
      }
    }
  } catch (err) {
    res.status(409).send(err.message);
  }
});

module.exports = router;
