const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const trainSchema = new mongoose.Schema({
  SOUTHSHORE: Array,
}, { timestamps: true });

trainSchema.plugin(mongoosePaginate);

const Train = mongoose.model('Train', trainSchema);

module.exports = Train;
