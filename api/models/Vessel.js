const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  imoNumber: { type: String, unique: true },
  photo: String,
}, { timestamps: true });

const Vessel = mongoose.model('Vessel', vesselSchema);

module.exports = Vessel;
