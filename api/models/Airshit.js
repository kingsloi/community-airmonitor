const mongoose = require('mongoose');
const _ = require('lodash');
const calculations = require('../helpers/calculations');
const mongoosePaginate = require('mongoose-paginate-v2');

const airshitSchema = new mongoose.Schema({
  LAST_READ_AT: String,
  TEMP_F: String,
  HUMIDITY_PERCENT: String,
  PRESSURE_BAR: String,
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
  TRAINS: {
    SOUTHSHORE: Array,
  },
  TRAFFIC: {
    INCIDENTS: Array
  },
  FLIGHTS: {
      ORD: Array,
      MDW: Array,
      GYY: Array
  },
  VESSELS: [],
}, { timestamps: true });

airshitSchema.plugin(mongoosePaginate);

/**
 *
 */
airshitSchema.pre('save', function save(next) {
  next();
});


/**
 *
 */
airshitSchema.methods.trainsCount = function trainsCount() {
  let total = 0;
  const trains = this.TRAINS;
  const tracks = Object.keys(trains);

  tracks.map((track) => {
    // todo, figure out how to reduce without $init being outputted
    if (track !== '$init') {

      if (_.some(trains[track], _.isObject)) {
        total += trains[track].length;
      } else if (_.some(trains[track], _.isNumber)) {
        total += parseInt(trains[track], 10);
      }
    }
  });

  return total;
};

airshitSchema.methods.flightsCount = function flightsCount() {
  let total = 0;
  const trains = this.FLIGHTS;
  const tracks = Object.keys(trains);

  tracks.map((track) => {
    // todo, figure out how to reduce without $init being outputted
    if (track !== '$init') {

      if (_.some(trains[track], _.isObject)) {
        total += trains[track].length;
      } else if (_.some(trains[track], _.isNumber)) {
        total += parseInt(trains[track], 10);
      }
    }
  });

  return total;
};

airshitSchema.methods.congestionMiles = function congestionMiles() {
  let total = 0;
  const incidents = this.TRAFFIC.INCIDENTS;

  incidents.map((incident) => {
    total += incident.distance;
  });

  return total.toFixed(0);
};

airshitSchema.methods.congestionTime = function congestionTime() {
  let total = 0;
  const incidents = this.TRAFFIC.INCIDENTS;

  incidents.map((incident) => {
    total += incident.freeFlowMinDelay;
  });

  return total.toFixed(0);
};

airshitSchema.methods.totalAirQuality = function totalAirQuality() {
  return calculations.totalAirQuality(this);
};

const Airshit = mongoose.model('Airshit', airshitSchema);

module.exports = Airshit;
