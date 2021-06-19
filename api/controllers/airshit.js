const Airshit = require('../models/Airshit');
const moment = require('moment');
const axios = require('axios');
const aqibot = require('aqi-bot');
const geo = require('geolocation-utils');
const regionArea = require('../config/region');
const { generatePageRange } = require('../helpers/pagination');
const async = require('async');
const calculations = require('../helpers/calculations');
const _ = require('lodash');
const fs = require('fs');
const cache = require('express-redis-cache')();

/**
 * GET /
 * Home page.
 */
exports.currently = (req, res) => {
  const today = moment();

  const startMonth = today.startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const endMonth = moment(startMonth).endOf('month').format('YYYY-MM-DD HH:mm:ss');

  const startYear = today.startOf('year').format('YYYY-MM-DD HH:mm:ss');
  const endYear = moment(startYear).endOf('year').format('YYYY-MM-DD HH:mm:ss');

  async.series([
    (callback) => { // latest
      Airshit.findOne({}, {}, { sort: { _id: -1 } }).exec(callback);
    },
    (callback) => { // month high
      Airshit.find({createdAt: {'$gte': startMonth, '$lte': endMonth}}).exec(callback);
    },
    (callback) => { // year high
      Airshit.find({createdAt: {'$gte': startYear, '$lte': endYear}}).exec(callback);
    },
    (callback) => { // all time high
      Airshit.aggregate([
        {
          $project: {
            sum: {
              $add: [{
                $max: {
                  $sum: [
                    { $ifNull: ['$PM25REALTIME.aqi', 0] },
                    { $ifNull: ['$PM10REALTIME.aqi', 0] },
                  ],
                },
              }],
            },
            createdAt: '$createdAt',
          },
        },
        { $sort: { sum: -1 } },
        { $limit: 1 },
      ]).exec(callback);
    },
    (callback) => { // vessels high
      Airshit.aggregate([
        {
          $project: {
            count: {
              $max: { $size: { $ifNull: ['$VESSELS', []] } },
            },
            createdAt: '$createdAt',
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]).exec(callback);
    },
    (callback) => { // flights high
      Airshit.aggregate([
        {
          $project: {
            count: {
              $add: [
                { $max: { $size: { $ifNull: ['$FLIGHTS.GYY', []] } } },
                { $max: { $size: { $ifNull: ['$FLIGHTS.ORD', []] } } },
                { $max: { $size: { $ifNull: ['$FLIGHTS.MDW', []] } } },
              ],
            },
            createdAt: '$createdAt',
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]).exec(callback);
    },
    (callback) => { // trains high
      Airshit.aggregate([
        {
          $project: {
            count: {
              $add: [
                { $max: { $size: { $ifNull: ['$TRAINS.SOUTHSHORE', []] } } },
              ],
            },
            createdAt: '$createdAt',
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]).exec(callback);
    },
    (callback) => { // traffic high
      Airshit.aggregate([
        {
          $project: {
            sum: {
              $add: [
                { $max: { $sum: { $ifNull: ['$TRAFFIC.INCIDENTS.distance', []] } } },
              ],
            },
            createdAt: '$createdAt',
          },
        },
        { $sort: { sum: -1 } },
        { $limit: 1 },
      ]).exec(callback);
    },
  ], (err, results) => {
    if (err) {
      console.log(err);
      return res.send('Error Contacting the database or Some Trouble happened while exec Pagination Script');
    }

    // Latest
    const latest = results[0];

    // AQI Month
    const highestInMonth = Math.max(...results[1].map((airshit) => {
      return calculations.totalAirQuality(airshit);
    }));
    const highestMonthDay = results[1].find((airshit) => {
      return calculations.totalAirQuality(airshit) === highestInMonth;
    });

    // AQI Year
    const highestInYear = Math.max(...results[2].map((airshit) => {
      return calculations.totalAirQuality(airshit);
    }));
    const highestYearDay = results[2].find((airshit) => {
      return calculations.totalAirQuality(airshit) === highestInYear;
    });

    // All Time
    const highestAllTimeDay = results[3][0];

    // Vessels
    const highestVessels = results[4][0];
    // Flights
    const highestFlights = results[5][0];
    // Trains
    const highestTrains = results[6][0];
    // Traffic
    const highestTraffic = results[7][0];

    res.json({
      airshit: latest,
      geography: {
        sensor: {
          lat: process.env.LOCATION_LAT,
          lng: process.env.LOCATION_LON,
        },
        region: {
          land_polygon: regionArea.landPolygon(),
          land_square: regionArea.landSquare(),
          lake: regionArea.lakePolygon(),
        },
      },
      highs: {
        month: highestMonthDay,
        year: highestYearDay,
        alltime: highestAllTimeDay,

        vessels: highestVessels,
        flights: highestFlights,
        trains: highestTrains,
        traffic: highestTraffic,
      },
    });
  });
};

exports.sync = (req, res) => {
  const { hash } = req.query;

  // https://www.keene.edu/campus/maps/tool/
  const regionAsPolygon = regionArea.landPolygon();
  const regionAsSquare = regionArea.landSquare();
  const lakeAsPolygon = regionArea.lakePolygon();

  if (hash !== process.env.SYNC_SECRET_HASH) {
    res.status(400).end();
  }

  const avg = (arr) => arr.reduce((a, b) => a + parseInt(b, 10), 0) / arr.length;

  const purpleId = process.env.PURPLE_AIR_ID;

  const airportEndpoints = [];
  const flightsApiKey = process.env.AVIATION_EDGE_API_KEY;
  const airports = process.env.NEARBY_AIRPORTS_IATAS.split(',');

  const location = `${process.env.LOCATION_LAT},${process.env.LOCATION_LON}`;
  const weatherApiKey = process.env.FORCASTIO_API_KEY;
  const exclude = 'minutely,hourly,daily,alerts,flags';
  const trafficApiKey = process.env.MAPQUEST_API_KEY;
  const trafficBounds = regionAsSquare.join(',');
  const shippingApiKey = process.env.FLEETMON_API_KEY;

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
    axios.get('http://southshore.etaspot.net/service.php?service=get_vehicles&includeETAData=1&orderedETAArray=1&token=TESTING'),
    axios.get(`https://www.mapquestapi.com/traffic/v2/incidents?&outFormat=json&boundingBox=${encodeURIComponent(trafficBounds)}&key=${trafficApiKey}&filters=incidents,congestion`),
    axios.get(`https://apiv2.fleetmon.com/regional_ais/?apikey=${shippingApiKey}`),
    ...airportEndpoints,
  ])
    .then(axios.spread((purpleData, weatherData, trainData, trafficData, shippingData, ...airportsData) => {
      const purple = purpleData.data;
      const weather = weatherData.data;
      const southshore = trainData.data;
      const traffic = trafficData.data;
      const shipping = shippingData.data;
      const airportData = [...airportsData].map((r) => r.data);

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

      sensors.forEach((sensor) => {
        const stats = JSON.parse(sensor.Stats);

        // PM 2.5
        const PM25Measurements = ['v', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'];
        PM25Measurements.forEach((measurement) => {
          if (typeof PM25Cumulative[measurement] === 'undefined') {
            PM25Cumulative[measurement] = [];
          }
          PM25Cumulative[measurement].push(stats[measurement]);
        });

        // PM 10
        const PM10Measurements = ['pm10_0_atm'];
        PM10Measurements.forEach((measurement) => {
          if (typeof PM10Cumulative[measurement] === 'undefined') {
            PM10Cumulative[measurement] = [];
          }

          PM10Cumulative[measurement].push(sensor[measurement]);
        });
      });

      // average both PM2.5 and PM10 from sensor A & B.
      Object.keys(PM25Cumulative).forEach((measurement) => {
        PM25Means[measurement] = avg(PM25Cumulative[measurement]);
      });
      Object.keys(PM10Cumulative).forEach((measurement) => {
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
        PM25REALTIME: 'v',
      // '10MINUTES': 'v1',
      // '30MINUTES': 'v2',
      // '1HOUR': 'v3',
      // '6HOUR': 'v4',
      // '1DAY': 'v5',
      // '1WEEK': 'v6',
      };

      const PM10Mapping = {
        PM10REALTIME: 'pm10_0_atm',
      };

      // PM2.5 AQI
      Object.keys(PM25Mapping).forEach((variable) => {
        const aqi = aqibot.AQICalculator.getAQIResult('PM2.5', PM25Means[PM25Mapping[variable]]).then((result) => {
          results[variable] = result;
        }).catch((err) => {
          console.log(err);
        });

        promises.push(aqi);
      });

      // PM10 AQI
      Object.keys(PM10Mapping).forEach((variable) => {
        const aqi = aqibot.AQICalculator.getAQIResult('PM10', PM10Means[PM10Mapping[variable]]).then((result) => {
          results[variable] = result;
        }).catch((err) => {
          console.log(err);
        });

        promises.push(aqi);
      });

      // Shipping / Vessels
      const { vessels } = shipping;

      const vesselsTravelingOnThru = vessels.filter((vessel) => geo.insidePolygon([vessel.position.latitude, vessel.position.longitude], lakeAsPolygon) && vessel.position.nav_status === 'under way using engine');

      const runningShips = _.map(vesselsTravelingOnThru, (vessel) => ({
        id: vessel.mmsi_number,
        imo: vessel.imo_number,
        name: vessel.name,
        callsign: vessel.callsign,
        country: vessel.country,
        type: vessel.type,
        width: vessel.width,
        length: vessel.length,
        deadweight: vessel.dwt,
        destination: vessel.voyage.destination,
        draught: vessel.voyage.draught,
        lat: vessel.position.latitude,
        lng: vessel.position.longitude,
        status: vessel.position.nav_status,
        direction: vessel.position.true_heading,
      }));

      // Trains
      const trains = southshore.get_vehicles;

      const southshoreTravelingOnThru = trains.filter((train) => geo.insidePolygon([train.lat, train.lng], regionAsPolygon) && train.inService);

      const southshoreTrains = southshoreTravelingOnThru.map((train) => ({
        id: train.trainID,
        lat: train.lat,
        lng: train.lng,
        direction: train.direction,
      }));

      // Traffic / Incidents
      const incidents = traffic.incidents.map((incident) => ({
        lat: incident.lat,
        lng: incident.lng,
        distance: incident.distance,
        freeFlowMinDelay: incident.delayFromFreeFlow,
        shortDesc: incident.shortDesc,
        startTime: incident.startTime,
        endTime: incident.endTime,
      }));

      // Flights
      let flights = airportData.map((airport) => {
      // If airport doesn't have departing/arriving flights
        if (airport.error) {
          return [];
        }

        // Are planes over the region?
        const flightsTravelingOnThru = airport.filter((flight) => {
          const { geography } = flight;
          const { latitude, longitude } = geography;

          return geo.insidePolygon([latitude, longitude], regionAsPolygon);
        });

        // For each flight in region, map them into a format
        // we can work with, removing all unnecessary data
        return flightsTravelingOnThru.map((info) => {
          const {
            geography, aircraft, speed, departure, arrival, flight,
          } = info;
          const {
            latitude, longitude, altitude, direction,
          } = geography;

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
            arriving: arrival.iataCode,
          };
        });
      });

      // concatenate multiple flight arrays into a single array
      flights = flights.reduce((a, e) => a.concat(e), []);

      // Group both departing and arriving flights by airport
      const departingFlights = _.groupBy(flights, (f) => f.departing);
      const arrivingFlights = _.groupBy(flights, (f) => f.arriving);

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
        .then((result) => {
          const shitstamp = new Airshit({
            PM25REALTIME: results.PM25REALTIME,
            PM10REALTIME: results.PM10REALTIME,
            LAST_READ_AT: one.LastSeen,
            TEMP_F: one.temp_f,
            HUMIDITY_PERCENT: one.humidity,
            PRESSURE_BAR: one.pressure,
            REPORTED_WEATHER: weather.currently,
            TRAINS: {
              SOUTHSHORE: southshoreTrains,
            },
            TRAFFIC: {
              INCIDENTS: incidents,
            },
            FLIGHTS: flightsOverRegion,
            VESSELS: runningShips,
          });

          shitstamp.save((err, response) => {
            if (err) return console.error(err);
            cache.del('/currently', (error, deleted) => {
              if (error) throw error;
            });

            res.send({ success: true });
          });
        })
        .catch((err) => {
          console.log(err);
          res.send({ success: false });
        });
    }))
    .catch((error) => {
      console.log(error);
      res.send({ success: false });
    });
};

exports.past = (req, res) => {
  Airshit.find({}, { _id: 1, createdAt: 1 }).sort( { _id: -1 } )
    .then((result) => {

      const grouped = _.groupBy(result, (airshit) => {
        return moment(airshit.createdAt).startOf('day').format();
      });

      return res.json({
        airshits: grouped,
        geography: {
          sensor: {
            lat: process.env.LOCATION_LAT,
            lng: process.env.LOCATION_LON,
          },
          region: {
            land_polygon: regionArea.landPolygon(),
            land_square: regionArea.landSquare(),
            lake: regionArea.lakePolygon(),
          },
        },
      })
    })
    .catch((err) => {
      console.log(err);
      return res.send('Error Contacting the database or Some Trouble happened while exec Pagination Script');
    });
};

exports.airshit = (req, res) => {
  const { airshit: id } = req.params;
  Airshit.findOne({ _id: id }).then((result) => res.json({ airshit: result }));
};

exports.airshitByDate = (req, res) => {
  const { date: original } = req.params;
  const date = moment.utc(original).format('YYYY-MM-DD');
  const start = moment(`${date} 00:00:00`).format();
  const end = moment(`${date} 23:59:59`).format();
  Airshit.find({ createdAt: { $gte: start, $lt: end } }).then((result) => res.json({ airshits: result }));
};
