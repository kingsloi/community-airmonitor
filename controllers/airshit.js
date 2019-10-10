const Airshit = require('../models/Airshit');
const moment = require('moment');
const axios = require('axios');
const aqibot = require('aqi-bot');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    Airshit.findOne({}, {}, { sort: { _id : -1 } })
    .exec((err, airshit) => {
        res.render('home', {
            title: 'Miller Beach / NWI Air Quality',
            airshit,
            degeesToCompass: function(angle) {
                const degreePerDirection = 360 / 8;

                /**
                 * Offset the angle by half of the degrees per direction
                 * Example: in 4 direction system North (320-45) becomes (0-90)
                 */
                const offsetAngle = angle + degreePerDirection / 2;

                return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? "↑ N"
                  : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "↗ NE"
                    : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "→ E"
                      : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "↘ SE"
                        : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "↓ S"
                          : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "↙ SW"
                            : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "← W"
                              : "↖ NW";
            },
            timestampToHuman: function(timestamp) {
                const moment1 = moment.unix(timestamp);
                const moment2 = moment();
                return moment.duration(moment1.diff(moment2)).humanize();
            }
        });
    });
};

exports.sync = (req, res) => {

  var hash = req.query.hash;

  if (hash !== process.env.SYNC_SECRET_HASH) {
    res.status(400).end();
  }

  const avg = arr => arr.reduce((a,b) => a + parseInt(b, 10), 0) / arr.length

  const apiKey   = process.env.FORCASEIO_API;
  const location = '41.6198902,-87.2452952';
  const exclude  = 'minutely,hourly,daily,alerts,flags';
  const purpleId = process.env.PURPLE_ID;


  axios.all([
    axios.get(`https://www.purpleair.com/json?show=${purpleId}`),
    axios.get(`https://api.forecast.io/forecast/${apiKey}/${location}?units=si&exclude=${exclude}`),
  ])
  .then(axios.spread((purpleData, weatherData) => {
    const weather = weatherData.data;
    const purple = purpleData.data;

    const one = purple.results[0];
    const two = purple.results[1];

    const PM25Means = [];
    const PM25Cumulative = [];
    const PM10Means = [];
    const PM10Cumulative = [];

    const results = [];
    const sensors = [one, two];

    sensors.forEach(function(sensor) {
      const stats = JSON.parse(sensor.Stats);
      const PM10Measurements = ['pm10_0_atm'];
      const PM25Measurements = ['v', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'];
      PM25Measurements.forEach(function(measurement) {
        if (typeof PM25Cumulative[measurement] === 'undefined') {
          PM25Cumulative[measurement] = [];
        }
        PM25Cumulative[measurement].push(stats[measurement]);
      });

      PM10Measurements.forEach(function(measurement) {
        if (typeof PM10Cumulative[measurement] === 'undefined') {
          PM10Cumulative[measurement] = [];
        }

        PM10Cumulative[measurement].push(sensor[measurement]);
      });
    });

    Object.keys(PM25Cumulative).forEach(function(measurement) {
      PM25Means[measurement] = avg(PM25Cumulative[measurement]);
    });

    Object.keys(PM10Cumulative).forEach(function(measurement) {
      PM10Means[measurement] = avg(PM10Cumulative[measurement]);
    });

    const PM25Mapping = {
      'PM25REALTIME': 'v',
      '10MINUTES': 'v1',
      '30MINUTES': 'v2',
      '1HOUR': 'v3',
      '6HOUR': 'v4',
      '1DAY': 'v5',
      '1WEEK': 'v6',
    };

    const PM10Mapping = {
      'PM10REALTIME': 'pm10_0_atm',
    };

    const promises = [];

    Object.keys(PM25Mapping).forEach((variable) => {
      const aqi = aqibot.AQICalculator.getAQIResult('PM2.5', PM25Means[PM25Mapping[variable]]).then((result) => {
        results[variable] = result;
      }).catch(err => {
        console.log(err);
      });

      promises.push(aqi);
    });

    Object.keys(PM10Mapping).forEach((variable) => {
      const aqi = aqibot.AQICalculator.getAQIResult('PM10', PM10Means[PM10Mapping[variable]]).then((result) => {
        results[variable] = result;
      }).catch(err => {
        console.log(err);
      });

      promises.push(aqi);
    });

    Promise.all(promises)
      .then(result => {

        const shitstamp = new Airshit({
          PM25REALTIME: results['PM25REALTIME'],
          PM10REALTIME: results['PM10REALTIME'],
          LAST_READ_AT: one['LastSeen'],
          TEMP_F: one['temp_f'],
          HUMIDITY_PERCENT: one['humidity'],
          PRESSURE_BAR: one['pressure'],
          REPORTED_WEATHER: weather.currently,
        });

        shitstamp.save(function (err, response) {
          if (err) return console.error(err);
          res.send({ success: true });
        });
      })
      .catch(err => {
        console.log(err);
        res.send({ success: true });
      });
  }))
  .catch((error) => {
    console.log(error);
    next(error);
  });
}

exports.past = (req, res) => {
  Airshit.paginate({}, {
    sort: {'_id': -1},
    limit: req.query.l ? parseInt(req.query.l) : 12,
    page: req.query.page ? req.query.page : 1
  })
  .then((result)=>{
    return res.render('past', {
      title: "Past Miller Beach / NWI Air Quality",
      airshits: result.docs,
      total: result.totalDocs,
      currentPage: result.page,
      limit: result.limit,
      degeesToCompass: function(angle) {
          const degreePerDirection = 360 / 8;

          /**
           * Offset the angle by half of the degrees per direction
           * Example: in 4 direction system North (320-45) becomes (0-90)
           */
          const offsetAngle = angle + degreePerDirection / 2;

          return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? "↑ N"
            : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "↗ NE"
              : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "→ E"
                : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "↘ SE"
                  : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "↓ S"
                    : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "↙ SW"
                      : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "← W"
                        : "↖ NW";
      },
      dateTimeToHuman: function(timestamp) {
          const moment1 = moment(timestamp);
          const moment2 = moment();
          return moment.duration(moment1.diff(moment2)).humanize();
      }
    });
  })
  .catch((err)=>{
    console.log(err);
    return res.send('Error Contacting the database or Some Trouble happened while exec Pagination Script');
  })
};
