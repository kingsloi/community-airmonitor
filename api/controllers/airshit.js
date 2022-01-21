const Advisories = require('../models/Advisories');
const Airshit = require('../models/Airshit');
const Flight = require('../models/Flight');
const Traffic = require('../models/Traffic');
const Train = require('../models/Train');
const Vessel = require('../models/Vessel');
const VesselPhoto = require('../models/VesselPhoto');
const Weather = require('../models/Weather');

const { gases } = require('../seeds/gases.js');
const { pms } = require('../seeds/pms.js');

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


exports.currently = async (req, res) => {
  const today = moment();

  const vesselphotos = await VesselPhoto.find();

  const advisories   = await Advisories.findOne({}, {}, { sort: { _id: -1 } });
  const airshit      = await Airshit.findOne({}, {}, { sort: { _id: -1 } });
  const flight       = await Flight.findOne({}, {}, { sort: { _id: -1 } });
  const traffic      = await Traffic.findOne({}, {}, { sort: { _id: -1 } });
  const train        = await Train.findOne({}, {}, { sort: { _id: -1 } });
  const vessel       = await Vessel.findOne({}, {}, { sort: { _id: -1 } });

  const weather      = await Weather.findOne({}, {}, { sort: { _id: -1 } });

  return res.json({
    advisories,
    airshit,
    flight,
    traffic,
    train,
    vessel,
    vesselphotos,
    weather,

    geography: {
      sensor: { lat: process.env.LOCATION_LAT, lng: process.env.LOCATION_LON, },
      region: {
        lake: regionArea.lakePolygon(),
        lake_zones: process.env.LAKE_MICHIGAN_ZONES.split(','),
        land_square: regionArea.landSquare(),
        land_polygon: regionArea.landPolygon(),
      },
    }
  });
};

exports.trend = async (req, res) => {
  const today = moment().add(1, 'd');
  const start = today.format('YYYY-MM-DD HH:mm:ss');
  const end   = today.subtract(7, 'd').format('YYYY-MM-DD HH:mm:ss');

  const weathers      = await Weather.find({ createdAt: {'$gte': end, '$lte': start } });
  const advisories    = await Advisories.find({ createdAt: {'$gte': end, '$lte': start } });
  const airshits      = await Airshit.find({ createdAt: {'$gte': end, '$lte': start } });
  const flights       = await Flight.find({ createdAt: {'$gte': end, '$lte': start } });
  const traffics      = await Traffic.find({ createdAt: {'$gte': end, '$lte': start } });
  const trains        = await Train.find({ createdAt: {'$gte': end, '$lte': start } });
  const vessels       = await Vessel.find({ createdAt: {'$gte': end, '$lte': start } });

  return res.json({ weathers, advisories, airshits, flights, traffics, trains, vessels });
};

exports.highs = (req, res) => {
  const today = moment();

  const startMonth = today.startOf('month').toDate();
  const endMonth = moment(startMonth).endOf('month').toDate();

  const startYear = today.startOf('year').toDate();
  const endYear = moment(startYear).endOf('year').toDate();

  async.series([
    (callback) => { // month high
      Airshit.find({ createdAt: {'$gte': startMonth, '$lte': endMonth}}).exec(callback);
    },
    (callback) => { // year high
      Airshit.find({ createdAt: {'$gte': startYear, '$lte': endYear}}).exec(callback);
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
                    { $ifNull: ['$SO2REALTIME.aqi', 0] },
                    { $ifNull: ['$NO2REALTIME.aqi', 0] },
                    { $ifNull: ['$O3REALTIME.aqi', 0] },
                    { $ifNull: ['$COREALTIME.aqi', 0] },
                  ],
                },
              }],
            },
            PM25REALTIME: '$PM25REALTIME',
            PM10REALTIME: '$PM10REALTIME',
            SO2REALTIME: '$SO2REALTIME',
            NO2REALTIME: '$NO2REALTIME',
            O3REALTIME: '$O3REALTIME',
            COREALTIME: '$COREALTIME',
            createdAt: '$createdAt',
          },
        },
        { $sort: { sum: -1 } },
        { $limit: 1 },
      ]).exec(callback);
    },
    (callback) => { // vessels high
      Vessel.aggregate([
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
      Flight.aggregate([
        {
          $project: {
            count: {
              $add: [
                { $max: { $size: { $ifNull: ['$FLIGHTS', []] } } },
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
      Train.aggregate([
        {
          $project: {
            count: {
              $add: [
                { $max: { $size: { $ifNull: ['$SOUTHSHORE', []] } } },
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
      Traffic.aggregate([
        {
          $project: {
            sum: {
              $add: [
                { $max: { $sum: { $ifNull: ['$INCIDENTS.distance', []] } } },
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

    // AQI Month
    const highestInMonth = Math.max(...results[0].map((airshit) => {
      return calculations.totalAirQuality(airshit);
    }));
    const highestMonthDay = results[0].find((airshit) => {
      return calculations.totalAirQuality(airshit) === highestInMonth;
    });

    // AQI Year
    const highestInYear = Math.max(...results[1].map((airshit) => {
      return calculations.totalAirQuality(airshit);
    }));
    const highestYearDay = results[1].find((airshit) => {
      return calculations.totalAirQuality(airshit) === highestInYear;
    });

    // All Time
    const highestAllTimeDay = results[2][0];

    // Vessels
    const highestVessels = results[3][0];
    // Flights
    const highestFlights = results[4][0];
    // Trains
    const highestTrains = results[5][0];
    // Traffic
    const highestTraffic = results[6][0];

    res.json({
      month: highestMonthDay,
      year: highestYearDay,
      alltime: highestAllTimeDay,

      vessels: highestVessels,
      flights: highestFlights,
      trains: highestTrains,
      traffic: highestTraffic,
    });
  });
};

exports.getFlights = async () => {
  const endpoints = [];
  const polygon = regionArea.landPolygon();

  // Get aviation-edge API key & airport IATAS codes
  const apikey = process.env.AVIATION_EDGE_API_KEY;
  const iatas  = process.env.NEARBY_AIRPORTS_IATAS.split(',');

  try {
    // Loop through each IATA, build URL for both arrival and departure calls
    iatas.forEach((airport) => {
      ['arr', 'dep'].forEach((direction) => {
        endpoints.push(axios.get(`https://aviation-edge.com/v2/public/flights?key=${apikey}&${direction}Iata=${airport}`));
      });
    });

    // Loop through all endpoints
    const responses = await axios.all(endpoints);

    // Extract the responses data, combine into 1 array
    const data = [...responses].map((r) => r.data).filter(e => e.success !== false);
    const flattened = [].concat(...data);

    const flights = flattened.filter((flight) => {
      const { geography } = flight;
      const { latitude, longitude } = geography;

      return geo.insidePolygon([latitude, longitude], polygon);
    });

    return flights.map((info) => {
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
        arriving: arrival.iataCode,
      };
    });
  } catch (e) {
    console.error(e);

    return [];
  }
}

exports.getVessels = async () => {
  const apikey = process.env.FLEETMON_API_KEY;
  const lakeAsPolygon = regionArea.lakePolygon();

  try {
    const { data } = await axios.get(`https://apiv2.fleetmon.com/regional_ais/?apikey=${apikey}`);
    const { vessels } = data;

    const vesselsTravelingOnThru = vessels.filter((vessel) => {
      return vessel.position.nav_status === 'under way using engine';
    }).filter((vessel) => {
      return geo.insidePolygon([vessel.position.latitude, vessel.position.longitude], lakeAsPolygon);
    });

    return _.map(vesselsTravelingOnThru, (vessel) => ({
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
  } catch (e) {
    console.error(e);
    return [];
  }
}

exports.getWeather = async () => {
  const location = `${process.env.LOCATION_LAT},${process.env.LOCATION_LON}`;
  const weatherApiKey = process.env.FORCASTIO_API_KEY;
  const exclude = 'minutely,hourly,daily,alerts,flags';

  try {
    const { data: { currently } } = await axios.get(`https://api.forecast.io/forecast/${weatherApiKey}/${location}?units=us&exclude=${exclude}`);
    return currently;
  } catch (e) {
    console.error(e);
    return {};
  }
}

exports.getTraffic = async () => {
  const trafficApiKey = process.env.MAPQUEST_API_KEY;
  const regionAsSquare = regionArea.landSquare();
  const trafficBounds = regionAsSquare.join(',');

  try {
    const { data, data: { incidents} } = await axios.get(`https://www.mapquestapi.com/traffic/v2/incidents?&outFormat=json&boundingBox=${encodeURIComponent(trafficBounds)}&key=${trafficApiKey}&filters=incidents,congestion`);

    return incidents.map((incident) => ({
      lat: incident.lat,
      lng: incident.lng,
      distance: incident.distance,
      freeFlowMinDelay: incident.delayFromFreeFlow,
      shortDesc: incident.shortDesc,
      startTime: incident.startTime,
      endTime: incident.endTime,
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

exports.getTrains = async () => {
  const regionAsPolygon = regionArea.landPolygon();

  try {
    const { data: { get_vehicles: trains } } = await axios.get('http://southshore.etaspot.net/service.php?service=get_vehicles&includeETAData=1&orderedETAArray=1&token=TESTING');

    const southshoreTravelingOnThru = trains.filter((train) => geo.insidePolygon([train.lat, train.lng], regionAsPolygon) && train.inService);

    return southshoreTravelingOnThru.map((train) => ({
      id: train.trainID,
      lat: train.lat,
      lng: train.lng,
      direction: train.direction,
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

exports.getAdvisories = async () => {
  const regionAsPolygon = regionArea.landPolygon();

  // LMZ742: Northerly Island IL, Calumet Harbor IL
  // LMZ743: Calumet Harbor, IL to Gary, IN
  // LMZ744: Gary, IN to Burns Harbor, IN
  // LMZ745: Burns Harbor, IN to Michigan City, IN
  // LMZ046: Michigan City, IN to New Buffalo, MI
  // https://api.weather.gov/zones/forecast/zone>
  const lakeshore = process.env.LAKE_MICHIGAN_ZONES.split(',');

  try {
    const { data: { features } } = await axios.get(`https://api.weather.gov/alerts/active/area/LM`);

    const advisories = features.filter((f) => f.properties.geocode.UGC.filter(element => lakeshore.includes(element)).length !== 0);

    const mapped = advisories.map((a) => {
      const {
        properties: {
          id,
          areaDesc, geocode,
          effective, ends,
          severity, certainty, urgency, event, response,
          headline, description, instruction,
          senderName
        }
      } = a;

      return {
        id,
        areaDesc, geocode: geocode.UGC,
        effective, ends,
        severity, certainty, urgency, event, response,
        headline, description, instruction,
        senderName
      }
    });

    return mapped;
  } catch (e) {
    console.error(e);
    return [];
  }
}

exports.getSimpleAirQuality = async () => {
  const purpleId = process.env.PURPLE_AIR_ID;

  const avg = (arr) => arr.reduce((a, b) => a + parseFloat(b), 0).toFixed(5) / arr.length;

  try {
    const { data: { results } } = await axios.get(`https://www.purpleair.com/json?show=${purpleId}`);

    // PurpleAir/Air Quality
    // Purple returns 2 results from the two sensors on each device
    // we read both, and just average them. We do this for PM2.5/10
    const [ one, two ] = results;

    const { pm2_5_atm: pm2_5a, pm10_0_atm: pm10a } = one;
    const { pm2_5_atm: pm2_5b, pm10_0_atm: pm10b } = two;

    const aqi25 = await aqibot.AQICalculator.getAQIResult('PM2.5', avg([pm2_5a, pm2_5b]));
    const aqi10 = await aqibot.AQICalculator.getAQIResult('PM10', avg([pm10a, pm10b]));

    return { PM25REALTIME: aqi25, PM10REALTIME: aqi10 };
  } catch (e) {
    console.error(e);
    return { PM25REALTIME: {}, PM10REALTIME: {} };
  }
}

exports.getAdvancedAirQuality = async () => {
  try {
    const { data: { token } } = await axios.post(`https://api.aqmeshdata.net/api/Authenticate`, {
      username: process.env.AQMESH_USERNAME,
      password: process.env.AQMESH_PASSWORD
    });

    const { data } = await axios.get(`https://api.aqmeshdata.net/api/Pods/Assets_V1`, {
      headers: {
        'authorization': `Bearer ${token}`
      }
    });

    const locations = data.map(p => p.location_number);

    const promises = [];

    for (const i in locations) {
      const location = locations[i];

      // GAS, F, ppb: https://apitest.aqmeshdata.net/api/LocationData/next/${location}/1/10
      // PM, F, ppb   : https://apitest.aqmeshdata.net/api/LocationData/next/${location}/2/11
      const sensors = ['1/10', '2/11'];

      for (const x in sensors) {
        const params = sensors[x];

        const { data } = await axios.get(`https://api.aqmeshdata.net/api/LocationData/next/${location}/${params}`, {
          headers: {
            'authorization': `Bearer ${token}`
          }
        });
        promises.push(data);
      }
    }

    const [ gases, pms ] = await Promise.all(promises);

    const measurements = [];

    let combined = [...pms, ...gases];

    combined.sort((a, b)=> new Date(a.reading_datestamp) - new Date(b.reading_datestamp));

    const grouped = _.groupBy(combined, (p) => moment(p.reading_datestamp).format('YYYY-MM-DD HH:mm'));

    // loop through all combined pollutants
    for await (const timestamp of Object.keys(grouped)) {

      const pollutants = grouped[timestamp];

      // loop through all pollutants, grab their measurement, and get the AQI for it
      for await (const measurement of pollutants) {
        // const measurement = pollutants[idx];
        // return;
        // Only get the data we're interested in
        await ['pm1', 'pm2_5', 'pm4', 'pm10', 'co', 'no', 'no2', 'so2', 'o3', 'h2s', 'eo', 'aux1', 'aux2'].forEach(async (pollutant) => {

          // Normalise pollutant name
          const key = `${pollutant.replace('_','').toUpperCase()}REALTIME`;

          // grab the pollutant values
          // PM = reading_status === 'OK'
          // Gas = <gas>_state === 'Reading'
          let value, units;
          if (pollutant.startsWith('pm') && measurement['reading_status'] === 'OK') {
            value = measurement[`${pollutant}_prescale`];
          } else if (
            measurement[`${pollutant}_state`] === 'Reading' ||
            measurement[`${pollutant}_state`] === 'Rebased' ||
            measurement[`${pollutant}_state`] === 'OK'
          ) {
            value = measurement[`${pollutant}_prescaled`];
            units = measurement[`${pollutant}_units`];
          }

          // filter 'em
          if (value === null || value === undefined || value === '' || value === false) return;

          if (! measurements[timestamp]) {
            measurements[timestamp] = {};
          }

          // try get the AQI result
          try {
            const { concentration, aqi, category } = await aqibot.AQICalculator.getAQIResult(pollutant.toUpperCase().replace('_','.'), value);
            measurements[timestamp][key] = { concentration, aqi, category, units };
          } catch (e) {
            measurements[timestamp][key] = { concentration: value, aqi: null, category: null, units };
          }
        });
      }
    }

    return measurements;
  } catch (e) {
    console.error(e);
    return {};
  }
}

exports.sync = async (req, res) => {
  const { hash, metrics: m } = req.query;

  if (hash !== process.env.SYNC_SECRET_HASH) {
    res.status(400).end();
  }

  let metrics = {
    trains: [],
    flights: [],
    vessels: [],
    traffic: [],
    advisories: [],

    weather: {},
    airquality: { simple: {}, advanced: [] }
  };

  await Promise.all(m.split(',').map(async (measurement) => {
    let model;

    switch(measurement) {
      case 'flights':
        const flights = await module.exports.getFlights();

        model = new Flight({ FLIGHTS: flights });
        await model.save();

        metrics.flights = flights;
      break;
      case 'vessels':
        const vessels = await module.exports.getVessels();

        model = new Vessel({ VESSELS: vessels });
        await model.save();

        metrics.vessels = vessels;
      break;
      case 'weather':
        const weather = await module.exports.getWeather();

        model = new Weather({ REPORTED_WEATHER: weather });
        await model.save();

        metrics.weather = weather;
      break;
      case 'traffic':
        const traffic = await module.exports.getTraffic();

        model = new Traffic({ INCIDENTS: traffic });
        await model.save();

        metrics.traffic = traffic;
      break;
      case 'trains':
        const trains = await module.exports.getTrains();

        model = new Train({ SOUTHSHORE: trains });
        await model.save();

        metrics.trains = trains;
      break;
      case 'advisories':
        const advisories = await module.exports.getAdvisories();

        model = new Advisories({ ADVISORIES: advisories });
        await model.save();

        metrics.advisories = advisories;
      break;
      case 'airquality-simple':
        const simple = await module.exports.getSimpleAirQuality();

        model = new Airshit({
          ...simple,
          type: 'simple'
        });
        await model.save();

        metrics.airquality.simple = simple;
      break;
      case 'airquality-advanced':
        const advanced = await module.exports.getAdvancedAirQuality();

        for await (const datetime of Object.keys(advanced)) {

          const record = advanced[datetime];

          model = new Airshit({
            ...record,
            createdAt: datetime,
            type: 'advanced'
          });

          await model.save();
        }

        metrics.airquality.advanced = advanced;
      break;
      default:
    }
  }))
  .then(() => {
    return res.json({ success: true, metrics });
  })
  .catch((e) => {
    console.error(e);
    return res.json({ success: false, metrics });
  });
};

exports.migrate = async (req, res) => {
  const { hash } = req.query;

  if (hash !== process.env.SYNC_SECRET_HASH) {
    res.status(400).end();
  }

  for await (const airshit of Airshit.find()) {
    let airshitobj = airshit.toObject();

    await Airshit.updateOne({ _id: airshit.id }, { $set: { type: 'simple' } });

    console.log(`${airshit.id} migrated`);
  }
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

exports.getVesselPhotos = async (req, res) => {
  const { vessel } = req.params;

  const shippingApiKey = process.env.FLEETMON_API_KEY;

  const vessels = await VesselPhoto.find();
  const mapped = _.reduce(vessels, (carry, vessel) => {
    carry[vessel.imoNumber] = vessel.photo;
    return carry;
  }, {});

  return res.json({ photos: mapped });
}

exports.searchVesselPhoto = async (req, res) => {
  const { vessel } = req.params;
  const { hash } = req.query;

  if (hash !== process.env.SYNC_SECRET_HASH) {
    res.status(400).end();
  }

  const shippingApiKey = process.env.FLEETMON_API_KEY;

  const found = await VesselPhoto.findOne({ imoNumber: vessel });

  if (found) {
    return res.json({ success: false, photo: found.photo });
  }

  const response = await axios.get(`https://apiv2.fleetmon.com/vessel/photo/large?apikey=${shippingApiKey}&imo_number=${vessel}`);

  if (response.data.vessels.length > 0) {
    const photo = response.data.vessels[0].image_url;

    const vesselstamp = new VesselPhoto({
      imoNumber: vessel, photo
    });

    vesselstamp.save((err, save) => {
      if (err) return console.error(err);

      cache.del('/vessels/photos', (error, deleted) => {
        if (error) throw error;
      });

      return res.json({ success: true, photo });
    });
  }

  return res.json({ success: false, photo: null });
}
