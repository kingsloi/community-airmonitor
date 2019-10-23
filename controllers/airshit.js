const Airshit = require('../models/Airshit');
const moment = require('moment');
const axios = require('axios');
const aqibot = require('aqi-bot');
const geo = require('geolocation-utils');
const region = require('../config/region');
const { generatePageRange } = require('../helpers/pagination');
const async = require('async');
const calculations = require('../helpers/calculations');
const _ = require('lodash');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  const today = moment();
  const startWeek = today.startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
  const endWeek = moment(startWeek).endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');

  const startMonth = today.startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const endMonth = moment(startMonth).endOf('month').format('YYYY-MM-DD HH:mm:ss');

  const startYear = today.startOf('year').format('YYYY-MM-DD HH:mm:ss');
  const endYear = moment(startYear).endOf('year').format('YYYY-MM-DD HH:mm:ss');

  async.series([
    (callback) => { // latest
      Airshit.findOne({}, {}, { sort: { _id : -1 } }).exec(callback);
    },
    (callback) => { // week high
      Airshit.find({createdAt: {'$gte': startWeek, '$lte': endWeek}}).exec(callback);
    },
    (callback) => { // month high
      Airshit.find({createdAt: {'$gte': startMonth, '$lte': endMonth}}).exec(callback);
    },
    (callback) => { // year high
      Airshit.find({createdAt: {'$gte': startYear, '$lte': endYear}}).exec(callback);
    },
  ], function(err, results) {
      // Week
      const highestInWeek = Math.max(...results[1].map((airshit) => {
        return calculations.totalAirQuality(airshit);
      }));
      const highestWeekDay = results[1].find((airshit) => {
        return calculations.totalAirQuality(airshit) === highestInWeek;
      });
      // Month
      const highestInMonth = Math.max(...results[2].map((airshit) => {
        return calculations.totalAirQuality(airshit);
      }));
      const highestMonthDay = results[2].find((airshit) => {
        return calculations.totalAirQuality(airshit) === highestInMonth;
      });
      // Year
      const highestInYear = Math.max(...results[3].map((airshit) => {
        return calculations.totalAirQuality(airshit);
      }));
      const highestYearDay = results[3].find((airshit) => {
        return calculations.totalAirQuality(airshit) === highestInYear;
      });

      res.render('home', {
          slug: 'home',
          title: 'Current Miller Beach / NWI Air Quality',
          airshit: results[0],
          region: region.coordinates(),
          location: {
            lat: process.env.LOCATION_LAT || '41.619829',
            lon: process.env.LOCATION_LON || '-87.245317',
          },
          highs: {
            week: highestWeekDay,
            month: highestMonthDay,
            year: highestYearDay,
          }
      });
  });
};

exports.sync = (req, res) => {
  const hash = req.query.hash;

  // https://www.keene.edu/campus/maps/tool/
  const coordinates = region.coordinates();

  if (hash !== process.env.SYNC_SECRET_HASH) {
    res.status(400).end();
  }

  const avg = arr => arr.reduce((a,b) => a + parseInt(b, 10), 0) / arr.length

  const purpleId = process.env.PURPLE_AIR_ID;

  const airportEndpoints = [];
  const flightsApiKey = process.env.AVIATION_EDGE_API_KEY;
  const airports = process.env.NEARBY_AIRPORTS_IATAS.split(',');

  const location = `${process.env.LOCATION_LAT || '41.619829'},${process.env.LOCATION_LON || '-87.245317'}`;
  const weatherApiKey   = process.env.FORCASTIO_API_KEY;
  const exclude  = 'minutely,hourly,daily,alerts,flags';
  const trafficApiKey   = process.env.MAPQUEST_API_KEY;
  const trafficBounds = coordinates.join(',');

  // Each nearby airport
  // get the arr-iving and dep-arting flights at the airport
  airports.forEach((airport) => {
    ['arr', 'dep'].forEach((direction) => {
      airportEndpoints.push(axios.get(`https://aviation-edge.com/v2/public/flights?key=${flightsApiKey}&${direction}Iata=${airport}`));
    });
  });

  axios.all([
    axios.get(`https://www.purpleair.com/json?show=${purpleId}`),
    axios.get(`https://api.forecast.io/forecast/${weatherApiKey}/${location}?units=us&exclude=${exclude}`),
    axios.get(`http://southshore.etaspot.net/service.php?service=get_vehicles&includeETAData=1&orderedETAArray=1&token=TESTING`),
    axios.get(`https://www.mapquestapi.com/traffic/v2/incidents?&outFormat=json&boundingBox=${encodeURIComponent(trafficBounds)}&key=${trafficApiKey}&filters=congestion`),
    ...airportEndpoints
  ])
  .then(axios.spread((purpleData, weatherData, southshoreData, trafficData, ...airportsData) => {
    const purple = purpleData.data;
    const weather = weatherData.data;
    const southshore = southshoreData.data;
    const traffic = trafficData.data;
    const airportData = [...airportsData].map(r => r.data);

    // PurpleAir/Air Quality
    // Purple returns 2 results from the two sensors on each device
    // we read both, and just average them. We do this for PM2.5/10
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

      // PM 2.5
      const PM25Measurements = ['v', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'];
      PM25Measurements.forEach(function(measurement) {
        if (typeof PM25Cumulative[measurement] === 'undefined') {
          PM25Cumulative[measurement] = [];
        }
        PM25Cumulative[measurement].push(stats[measurement]);
      });

      // PM 10
      const PM10Measurements = ['pm10_0_atm'];
      PM10Measurements.forEach(function(measurement) {
        if (typeof PM10Cumulative[measurement] === 'undefined') {
          PM10Cumulative[measurement] = [];
        }

        PM10Cumulative[measurement].push(sensor[measurement]);
      });
    });

    // average both PM2.5 and PM10 from sensor A & B.
    Object.keys(PM25Cumulative).forEach(function(measurement) {
      PM25Means[measurement] = avg(PM25Cumulative[measurement]);
    });

    Object.keys(PM10Cumulative).forEach(function(measurement) {
      PM10Means[measurement] = avg(PM10Cumulative[measurement]);
    });

    // AQI promises
    const promises = [];

    // We only care about mapping real time. We could
    // potentially store the others, but it seems
    // redundant to store them when we could
    // generate them ourselves if we ever
    // needed to later, saving DB bloat.
    const PM25Mapping = {
      'PM25REALTIME': 'v',
      // '10MINUTES': 'v1',
      // '30MINUTES': 'v2',
      // '1HOUR': 'v3',
      // '6HOUR': 'v4',
      // '1DAY': 'v5',
      // '1WEEK': 'v6',
    };

    const PM10Mapping = {
      'PM10REALTIME': 'pm10_0_atm',
    };

    // PM2.5 AQI
    Object.keys(PM25Mapping).forEach((variable) => {
      const aqi = aqibot.AQICalculator.getAQIResult('PM2.5', PM25Means[PM25Mapping[variable]]).then((result) => {
        results[variable] = result;
      }).catch(err => {
        console.log(err);
      });

      promises.push(aqi);
    });

    // PM2.5 AQI
    Object.keys(PM10Mapping).forEach((variable) => {
      const aqi = aqibot.AQICalculator.getAQIResult('PM10', PM10Means[PM10Mapping[variable]]).then((result) => {
        results[variable] = result;
      }).catch(err => {
        console.log(err);
      });

      promises.push(aqi);
    });

    // Trains
    const trains = southshore.get_vehicles;

    const southshoreTravelingOnThru = trains.filter(function(train) {
      return geo.insidePolygon([train.lat, train.lng], coordinates) && train.inService;
    });

    const southshoreTrains = southshoreTravelingOnThru.map(function(train) {
      return {
        id: train.trainID,
        lat: train.lat,
        lng: train.lng,
        direction: train.direction
      }
    });

    // Traffic / Incidents
    const incidents = traffic.incidents.map((incident) => {
      return {
        lat: incident.lat,
        lng: incident.lng,
        distance: incident.distance,
        freeFlowMinDelay: incident.delayFromFreeFlow
      }
    });

let flights = airportData.map((airport) => {
      // If airport doesn't have departing/arriving flights
      if (airport.error) {
        return [];
      }

      // Are planes over the region?
      const flightsTravelingOnThru = airport.filter((flight) => {
        const { geography } = flight;
        const { latitude, longitude } = geography;

        return geo.insidePolygon([latitude, longitude], coordinates);
      });

      // For each flight in region, map them into a format
      // we can work with, removing all unnecessary data
      return flightsTravelingOnThru.map((info) => {
        const { geography, aircraft, speed, departure, arrival, flight } = info;
        const { latitude, longitude, altitude, direction } = geography;

        return {
          alt: altitude,
          bearing: direction,
          lat: latitude,
          lng: longitude,
          speed: speed.horizontal,
          flight: flight.iataNumber,
          reg: aircraft.regNumber,
          aircraft: aircraft.iataCode,
          departing: departure.iataCode,
          arriving: arrival.iataCode
        }
      });
    })

    // concatenate multiple flight arrays into a single array
    flights = flights.reduce((a, e) => a.concat(e), []);

    // Group both departing and arriving flights by airport
    const departingFlights = _.groupBy(flights, function(f) { return f.departing});
    const arrivingFlights = _.groupBy(flights, function(f) { return f.arriving});

    // merge all flights by airport
    flights = { ...departingFlights, ...arrivingFlights };

    // from all flights by airport, only get the ones
    // we have defined as nearby
    const flightsOverRegion = {};
    airports.forEach((airport) => {
      flightsOverRegion[airport] = [];
      if (typeof flights[airport] !== 'undefined') {
        flightsOverRegion[airport] = flights[airport];
      }
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
          TRAINS: {
            SOUTHSHORE: southshoreTrains
          },
          TRAFFIC: {
            INCIDENTS: incidents
          },
          FLIGHTS: flightsOverRegion
        });

        shitstamp.save(function (err, response) {
          if (err) return console.error(err);
          res.send({ success: true });
        });
      })
      .catch(err => {
        console.log(err);
        res.send({ success: false });
      });
  }))
  .catch((error) => {
    console.log(error);
    res.send({ success: false });
  });
}

exports.past = (req, res) => {

  const params = {};

  if (req.query.date_from && req.query.date_to) {
    let date_from = Date.parse(req.query.date_from);

    if (isNaN(date_from) == false) {
      date_from = moment(date_from).format('YYYY-MM-DD HH:mm:ss')
    }

    let date_to = Date.parse(req.query.date_to);

    if (isNaN(date_to) == false) {
      date_to = moment(date_to).format('YYYY-MM-DD HH:mm:ss')
    }

    const from = moment(req.query.date_from).format('YYYY-MM-DD HH:mm:ss');
    const to = moment(req.query.date_to).format('YYYY-MM-DD HH:mm:ss');
    params['createdAt'] = {'$gte': from, '$lte': to};
  }

  Airshit.paginate(params, {
    sort: {'_id': -1},
    limit: req.query.l ? parseInt(req.query.l) : 48,
    page: req.query.page ? req.query.page : 1
  })
  .then((result) => {
    return res.render('past', {
      slug: 'past',
      title: "Past Miller Beach / NWI Air Quality",
      airshits: result.docs,
      total: result.totalPages,
      currentPage: result.page,
      limit: result.limit,
      possiblePages: generatePageRange(result.page, result.totalPages),
      filters: {
        date_from: req.query.date_from || '',
        date_to: req.query.date_to || '',
      }
    });
  })
  .catch((err)=>{
    console.log(err);
    return res.send('Error Contacting the database or Some Trouble happened while exec Pagination Script');
  })
};

exports.history = (req, res) => {
  return res.render('history-and-updates', {
    slug: 'history-and-updates',
    title: "History & Updates | Miller Beach / NWI Air Quality",
  });
};
