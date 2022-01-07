const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const airshitSchema = new mongoose.Schema({
  PM_LAST_READ_AT: String,
  GASES_LAST_READ_AT: String,

  PM25REALTIME: {
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
  },

  NO2REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },

  O3REALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },

  COREALTIME: {
    concentration: Number,
    aqi: Number,
    category: String,
  },
}, { timestamps: true });

airshitSchema.plugin(mongoosePaginate);

const Airshit = mongoose.model('Airshit', airshitSchema);

module.exports = Airshit;
