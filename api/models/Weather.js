const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const weatherSchema = new mongoose.Schema({
  REPORTED_WEATHER: {
    apparentTemperature: Number,
    dewPoint: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windGust: Number,
    windBearing: String,
    cloudCover: Number,
    uvIndex: Number,
    visibility: Number,
    ozone: Number,
    summary: String,
    precipIntensity: String,
    precipType: String
  },
}, { timestamps: true });

weatherSchema.plugin(mongoosePaginate);

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
