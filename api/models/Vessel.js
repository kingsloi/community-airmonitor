const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const vesselSchema = new mongoose.Schema({
  VESSELS: []
}, { timestamps: true });

vesselSchema.plugin(mongoosePaginate);

const Vessel = mongoose.model('Vessel', vesselSchema);

module.exports = Vessel;
