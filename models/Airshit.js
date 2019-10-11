const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const airshitSchema = new mongoose.Schema({
  LAST_READ_AT: { type: String },
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
    SOUTHSHORE: Number,
  },
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

  // todo, figure out how to reduce without $init being outputted
  Object.keys(trains).map((train) => {
    console.log(trains[train], typeof trains[train]);
    if (typeof trains[train] === 'number') {
      total += trains[train];
    }
  });

  return total;
};

const Airshit = mongoose.model('Airshit', airshitSchema);

module.exports = Airshit;
