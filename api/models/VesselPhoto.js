const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const vesselPhotoSchema = new mongoose.Schema({
  imoNumber: { type: String, unique: false },
  photo: String,
}, { timestamps: true });

vesselPhotoSchema.plugin(mongoosePaginate);

const VesselPhoto = mongoose.model('VesselPhoto', vesselPhotoSchema);

module.exports = VesselPhoto;
