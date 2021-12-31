const Joi = require("joi");
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  image: { type: String },
  addressLookup: { type: String },
  lotNo: { type: String },
  streetNo: { type: String },
  suburb: { type: String },
  state: { type: String },
  postcode: { type: String },
  startData: { type: String },
  finishDate: { type: String },
  dpNo: { type: String },
  nowCowNo: { type: String },
  ssdNo: { type: String },
  planNo: { type: String },
  status: { type: String, enum: ["COMPLETED", "INPROGRESS", "PENDING"] },
  userId: { type: String },
  publishDate: { type: String },
  lastScreen: { type: String }

});

const Project = mongoose.model("Project", projectSchema);

function validateProject(Project) {
  const schema = Joi.object({
    image: Joi.string(),
    addressLookup: Joi.string(),
    lotNo: Joi.string(),
    streetNo: Joi.string(),
    suburb: Joi.string(),
    state: Joi.string(),
    postcode: Joi.string(),
    startData: Joi.string(),
    finishDate: Joi.string(),
    signature: Joi.string(),
    dpNo: Joi.string(),
    nowCowNo: Joi.string(),
    ssdNo: Joi.string(),
    userId: Joi.string(),
    status: Joi.string(),
    planNo: Joi.string(),
  });

  return schema.validate(Project);
}

exports.Project = Project;
exports.validateProject = validateProject;
