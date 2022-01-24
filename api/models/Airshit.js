const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const airshitSchema = new mongoose.Schema({

  PM1REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },

  PM25REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },

  PM4REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },

  PM10REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },

  SO2REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
    units: String,
  },

  NOREALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
    units: String,
  },

  NO2REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
    units: String,
  },

  O3REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
    units: String,
  },

  COREALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
    units: String,
  },

  H2SREALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
    units: String,
  },

  type: { type: String },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now }
});

airshitSchema.plugin(mongoosePaginate);

const Airshit = mongoose.model('Airshit', airshitSchema);

module.exports = Airshit;
