const Advisories = require('../models/Advisories');
const Airshit = require('../models/Airshit');
const Flight = require('../models/Flight');
const Traffic = require('../models/Traffic');
const Train = require('../models/Train');
const Vessel = require('../models/Vessel');
const VesselPhoto = require('../models/VesselPhoto');
const Weather = require('../models/Weather');

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

  const start = today.format('YYYY-MM-DD HH:mm:ss');
  const end   = today.subtract(7, 'd').format('YYYY-MM-DD HH:mm:ss');

  const trend = await Airshit.find({ createdAt: {'$gte': end, '$lte': start } });

  return res.json({
    trend,

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

/**
 * GET /highs
 * Update the records.
 */
exports.highs = (req, res) => {
  const today = moment();

  const startMonth = today.startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const endMonth = moment(startMonth).endOf('month').format('YYYY-MM-DD HH:mm:ss');

  const startYear = today.startOf('year').format('YYYY-MM-DD HH:mm:ss');
  const endYear = moment(startYear).endOf('year').format('YYYY-MM-DD HH:mm:ss');

  async.series([
    (callback) => { // month high
      Airshit.find({ createdAt: {'$gte': startMonth, '$lte': endMonth}}).exec(callback);
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

exports.getPurpleAirAirQuality = async () => {
  const purpleId = process.env.PURPLE_AIR_ID;

  const avg = (arr) => arr.reduce((a, b) => a + parseFloat(b), 0).toFixed(5) / arr.length;

  try {
    const { data: { results } } = await axios.get(`https://www.purpleair.com/json?show=${purpleId}`);

    // PurpleAir/Air Quality
    // Purple returns 2 results from the two sensors on each device
    // we read both, and just average them. We do this for PM2.5/10
    const [ one, two ] = results;

    const { pm2_5_atm: pm2_5a, pm10_0_atm: pm10a, LastSeen: PM_LAST_READ_AT } = one;
    const { pm2_5_atm: pm2_5b, pm10_0_atm: pm10b } = two;

    const aqi25 = await aqibot.AQICalculator.getAQIResult('PM2.5', avg([pm2_5a, pm2_5b]));
    const aqi10 = await aqibot.AQICalculator.getAQIResult('PM10', avg([pm10a, pm10b]));

    return { PM25REALTIME: aqi25, PM10REALTIME: aqi10, PM_LAST_READ_AT };
  } catch (e) {
    console.error(e);
    return { PM25REALTIME: {}, PM10REALTIME: {}, PM_LAST_READ_AT: null };
  }
}

exports.getAdvancedAirQuality = async () => {
  try {
    // const { data: { token } } = await axios.post(`https://apitest.aqmeshdata.net/api/Authenticate`, {
    //   username: process.env.AQMESH_USERNAME,
    //   password: process.env.AQMESH_PASSWORD
    // });
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJPQVFNLUFQSSIsImp0aSI6ImEzNGYyNGVjLTlmNjctNDQ2MS1hOTk4LTQ3MDhiMGM2ZjhhOCIsIk1lbWJlcnNoaXBJZCI6IjExOTkiLCJTZXNzaW9uSWQiOiI2ZGI3MDJlMC1lZTQ0LTQ1NjItOTBkYS0yOWQwMTY5NjA2MTMiLCJJUF9BZGRyZXNzIjoiNDUuMjIuMzcuMTMxIiwiZXhwIjoxNjQwODIyMTAyLCJpc3MiOiJBUU1lc2guU2VjdXJpdHkuQmVhcmVyIiwiYXVkIjoiQVFNZXNoLlNlY3VyaXR5LkJlYXJlciJ9.wZHL2FA-EljODjoPeYmAxYgYC5_hg49J0elBTw4lJy4`;
    // console.log(token);

    // const { data } = await axios.get(`https://apitest.aqmeshdata.net/api/Pods/Assets`, {
    //   headers: {
    //     'authorization': `Bearer ${token}`
    //   }
    // });

  // const locations = [
  //   {
  //     location_number: 915,
  //     location_name: 'Location 2410103',
  //     location_notes: null,
  //     location_owner_number: 21,
  //     location_latitude: 52.201599,
  //     location_longitude: -1.726683,
  //     location_altitude: null,
  //     pod_number: 1204
  //   }, { location_number: 911,
  //     location_name: 'Location 2410103',
  //     location_notes: null,
  //     location_owner_number: 21,
  //     location_latitude: 52.201599,
  //     location_longitude: -1.726683,
  //     location_altitude: null,
  //     pod_number: 1204,
  //   }
  // ].map(p => p.location_number);

  // const promises = []

  // for (const i in locations) {
  //   const location = locations[i];
  //   const { data } = await axios.get(`https://apitest.aqmeshdata.net/api/LocationData/next/${location}/1/11`, {
  //     headers: {
  //       'authorization': `Bearer ${token}`
  //     }
  //   });
  //   promises.push(data);
  // }
    const gases = [
      {
        "gas_reading_number": 3256954,
        "location_number": 510,
        "pod_serial_number": 2410149,
        "owner_number": 8,
        "reading_datestamp": "2019-04-19T09:15:00",
        "gas_p1": 10,
        "gas_p2": 900,
        "gas_p3": 3600,
        "gasprotocol_version": "v4.2.3",
        "battery_voltage": 3.3,
        "temperature_f": 54.7,
        "pressure": 1024.5,
        "humidity": 69.5,
        "noise_level":-1000.0,
        "peak_noise":-1000.0,
        "co_sensor_serial_number": "162640361",
        "co_state": "Reading",
        "co_prescaled": 444.39,
        "co_slope": 1.0574,
        "co_offset":-76.2663,
        "co_units": "μg/m³",
        "no_sensor_serial_number": "160360435",
        "no_state": "Reading",
        "no_prescaled": 5.83,
        "no_slope": 1.0000,
        "no_offset": 0.0000,
        "no_units": "μg/m³",
        "so2_sensor_serial_number": "164642759",
        "so2_state": "Reading",
        "so2_prescaled":-1.09,
        "so2_slope": 1.0000,
        "so2_offset": 0.0000,
        "so2_units": "μg/m³",
        "no2_sensor_serial_number": "202363414",
        "no2_state": "Reading",
        "no2_prescaled": 3.59,
        "no2_slope": 1.0000,
        "no2_offset": 0.0000,
        "no2_units": "μg/m³",
        "o3_sensor_serial_number": "245500944",
        "o3_state": "Reading",
        "o3_prescaled": 57.06,
        "o3_slope": 1.0000,
        "o3_offset": 0.0000,
        "o3_units": "μg/m³",
        "h2s_sensor_serial_number": null,
        "h2s_state": "Not Fitted",
        "h2s_prescaled":-1000.00,
        "h2s_slope": null,
        "h2s_offset": null,
        "h2s_units": "μg/m³","eo_sensor_serial_number": null,
        "eo_state": "Not Fitted",
        "eo_prescaled": -1000.00,
        "eo_slope": null,
        "eo_offset": null,
        "eo_units": "μg/m³",
        "uart_type": "CO2","uart_sensor_serial_number": null,
        "uart_state": "Not Fitted",
        "uart_prescaled": -1000.00,
        "uart_slope": null,
        "uart_offset": null,
        "uart_units": "mg/m³",
        "aux1_sensor_serial_number": null,
        "aux1_type": "Not Fitted",
        "aux1_state": "Not Fitted",
        "aux1_prescaled": -1000.00,
        "aux1_slope": 1.0000,
        "aux1_offset": 0.0000,
        "aux1_units": null,
        "aux2_sensor_serial_number": null,
        "aux2_type": "Not Fitted",
        "aux2_state": "Not Fitted",
        "aux2_prescaled": -1000.00,
        "aux2_slope": 1.0000,
        "aux2_offset": 0.0000,
        "aux2_units": null,
        "aux3": 1494.00,
        "aux4": 0.00
      }
    ];

    const pm = [
      {
        "particle_reading_number": 15613118,
        "location_number": 510,
        "pod_serial_number": 2410149,
        "owner_number": 8,
        "reading_datestamp": "2019-03-08T15:11:00",
        "particle_p1": 30,
        "particle_p2": 60,
        "particle_p3": 3600,
        "particleprotocol_version": "v3.0",
        "reading_status": "Other Fault Zero",
        "battery_voltage": 3.0,
        "battery_low": false,
        "super_cap_voltage": 4.0,
        "temperature_f": 48.920000,
        "humidity": 66.2,
        "pressure": 1003.1,
        "particle_modem_overlap": false,
        "pm10_prescale": -893.00,
        "pm10_slope": 1.0000,
        "pm10_offset": 0.0000,
        "pm_course_prescale": -1000.0,
        "pm_course_slope": 1.0,
        "pm_course_offset": 0.0,
        "pm4_prescale": -893.00,
        "pm4_slope": 1.0000,
        "pm4_offset": 0.0000,
        "pm2_5_prescale": -893.00,
        "pm2_5_slope": 1.0000,
        "pm2_5_offset": 0.0000,
        "pm1_prescale": -893.00,
        "pm1_slope": 1.0000,
        "pm1_offset": 0.0000,
        "pm_total_prescale": -893.00,
        "pm_total_slope": 1.0000,
        "pm_total_offset": 0.0000
      }
    ]
/*
    console.log(
      pm.map((e) => ({
        pm1_prescale: e.pm1_prescale,
        pm2_5_prescale: e.pm2_5_prescale,
        pm10_prescale: e.pm10_prescale,
      }))
    );

    console.log(
      gases.map((e) => ({
        co_prescaled: e.co_prescaled,
        no_prescaled: e.no_prescaled,
        so2_prescaled: e.so2_prescaled,
        no2_prescaled: e.no2_prescaled,
        o3_prescaled: e.o3_prescaled,
        h2s_prescaled: e.h2s_prescaled,
        eo_prescaled: e.eo_prescaled,
        uart_prescaled: e.uart_prescaled
      }))
    );
*/

    const aqiso2 = await aqibot.AQICalculator.getAQIResult('SO2', 13.370);
    const aqino2 = await aqibot.AQICalculator.getAQIResult('NO2', 13.370);
    const aqio3 = await aqibot.AQICalculator.getAQIResult('O3', 13.370);
    const aqico = await aqibot.AQICalculator.getAQIResult('CO', 13.370);

    const aqi25 = await aqibot.AQICalculator.getAQIResult('PM2.5', 50.54);
    const aqi10 = await aqibot.AQICalculator.getAQIResult('PM10', 39.145);

    return {
      PM25REALTIME: aqi25,
      PM10REALTIME: aqi10,

      SO2REALTIME: aqiso2,
      NO2REALTIME: aqino2,
      O3REALTIME: aqio3,
      COREALTIME: aqico,

      GASES_LAST_READ_AT: gases[0].reading_datestamp,
      PM_LAST_READ_AT: pm[0].reading_datestamp,
    };
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
    airquality: { purpleair: {}, advanced: {} }
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
      case 'airquality-purpleair':
        const purpleair = await module.exports.getPurpleAirAirQuality();

        model = new Airshit(purpleair);
        await model.save();

        metrics.airquality.purpleair = purpleair;
      break;
      case 'airquality-advanced':
        const advanced = await module.exports.getAdvancedAirQuality();

        model = new Airshit(advanced);
        await model.save();

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

    const {
      VESSELS,
      REPORTED_WEATHER,
      FLIGHTS,
      TRAINS,
      TRAFFIC,
      createdAt, updatedAt,
      TEMP_F,
      HUMIDITY_PERCENT,
      PRESSURE_BAR,
      LAST_READ_AT
    } = airshitobj;

    if (TEMP_F) {
      await Airshit.updateOne({ _id: airshit.id }, { $unset: {"TEMP_F": 1} });
    }

    if (HUMIDITY_PERCENT) {
      await Airshit.updateOne({ _id: airshit.id }, { $unset: {"HUMIDITY_PERCENT": 1} });
    }

    if (PRESSURE_BAR) {
      await Airshit.updateOne({ _id: airshit.id }, { $unset: {"PRESSURE_BAR": 1} });
    }

    if (LAST_READ_AT) {
      await Airshit.updateOne({ _id: airshit.id }, { $rename: { "LAST_READ_AT": "PM_LAST_READ_AT" } });
    }

    if (VESSELS.length >= 0) {
      await new Vessel({ VESSELS, createdAt, updatedAt }).save();
    }

    await Airshit.updateOne({ _id: airshit.id }, { $unset: {"VESSELS": 1} });

    if (REPORTED_WEATHER) {
      await new Weather({ REPORTED_WEATHER, createdAt, updatedAt }).save();
    }

    await Airshit.updateOne({ _id: airshit.id }, { $unset: {"REPORTED_WEATHER": 1} });

    let ALL_FLIGHTS = [];

    if (FLIGHTS) {
      if (FLIGHTS.GYY) {
        ALL_FLIGHTS = [ ...ALL_FLIGHTS, ...FLIGHTS.GYY ]
      }

      if (FLIGHTS.MDW) {
        ALL_FLIGHTS = [ ...ALL_FLIGHTS, ...FLIGHTS.MDW ]
      }

      if (FLIGHTS.ORD) {
        ALL_FLIGHTS = [ ...ALL_FLIGHTS, ...FLIGHTS.ORD ]
      }

      await new Flight({ FLIGHTS: ALL_FLIGHTS, createdAt, updatedAt }).save();
    }

    await Airshit.updateOne({ _id: airshit.id }, { $unset: {"FLIGHTS": 1} });

    if (TRAINS && TRAINS.SOUTHSHORE.length > 0) {
      await new Train({ SOUTHSHORE: TRAINS.SOUTHSHORE, createdAt, updatedAt }).save();
    }

    await Airshit.updateOne({ _id: airshit.id }, { $unset: {"TRAINS": 1} });

    if (TRAFFIC && TRAFFIC.INCIDENTS.length > 0) {
      await new Traffic({ INCIDENTS: TRAFFIC.INCIDENTS, createdAt, updatedAt }).save();
    }

    await Airshit.updateOne({ _id: airshit.id }, { $unset: {"TRAFFIC": 1} });

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

  const vessels = await Vessel.find();
  const mapped = _.reduce(vessels, (carry, vessel) => {
    carry[vessel.imoNumber] = vessel.photo;
    return carry;
  }, {});

  return res.json({ photos: mapped });
}

exports.searchVesselPhoto = async (req, res) => {
  const { vessel } = req.params;
  const shippingApiKey = process.env.FLEETMON_API_KEY;

  const found = await Vessel.findOne({ imoNumber: vessel });

  if (found) {
    return res.json({ success: false, photo: found.photo });
  }

  const response = await axios.get(`https://apiv2.fleetmon.com/vessel/photo/large?apikey=${shippingApiKey}&imo_number=${vessel}`);

  if (response.data.vessels.length > 0) {
    const photo = response.data.vessels[0].image_url;

    const vesselstamp = new Vessel({
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
