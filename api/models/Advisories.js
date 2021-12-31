const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const advisoriesSchema = new mongoose.Schema({
  ADVISORIES: []
}, { timestamps: true });

advisoriesSchema.plugin(mongoosePaginate);

const Advisories = mongoose.model('Advisories', advisoriesSchema);

module.exports = Advisories;
