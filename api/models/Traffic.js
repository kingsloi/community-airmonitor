const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const trafficSchema = new mongoose.Schema({
  INCIDENTS: Array
}, { timestamps: true });

trafficSchema.plugin(mongoosePaginate);

const Traffic = mongoose.model('Traffic', trafficSchema);

module.exports = Traffic;
