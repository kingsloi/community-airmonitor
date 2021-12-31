const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const flightSchema = new mongoose.Schema({
  FLIGHTS: [],
  createdAt: {
      type: Date,
      default: Date.now
  },
  updatedAt: {
      type: Date,
      default: Date.now
  },
}, { timestamps: true });

flightSchema.plugin(mongoosePaginate);

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
