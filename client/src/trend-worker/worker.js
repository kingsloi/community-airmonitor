/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */
/* eslint-disable no-console */

import moment from 'moment';

const sum = (arr) => {
  const filtered = arr.filter(Boolean);
  return (filtered.reduce((a, b) => a + b, 0)).toFixed(0);
};

const avg = (arr)  =>{
  const filtered = arr.filter(Boolean);
  return (sum(filtered) / filtered.length || 0).toFixed(0);
};

const max = (arr) =>{
  const filtered = arr.filter(Boolean);
  return (Math.abs(Math.max(...filtered)) !== Infinity ? Math.max(...filtered) : 0).toFixed(0);
};

addEventListener("message", event => {
  let trends = event.data.message.trends;
  let measurements = event.data.message.measurements;

  let datasets = [
    { name: 'Traffic (max)', data: [] },
    { name: 'Flights (max)', data: [] },
    { name: 'Vessels (max)', data: [] },
    { name: 'Trains (max)', data: [] },
    { name: 'Wind Speed (avg)', data: [] },
    { name: 'Temperature (avg)', data: [] },
    { name: 'Wind Bearing (avg)', data: [] },
  ];

  for (const measurement in measurements) {
    const value = measurements[measurement];
    datasets.push( { name: value.replace('REALTIME', ''), data: [] } )
  }

  const { airshits, weathers, flights, vessels, trains, traffics } = trends;

  let idx;
  let filtered;

  const dates = [];
  const start = moment().subtract(7, 'd');
  const end   = moment().add(1, 'd');

  while (start.isSameOrBefore(end)) {
    dates.push(start.format('YYYY-MM-DD HH:mm:ss'));
    start.add(6, 'hour');
  }

  for (const date of dates) {
    let sum = [];

    // 5:59:59 hours
    const seriesend = moment(date).add(21599, 'second').format('YYYY-MM-DD HH:mm:ss');

    filtered = airshits.filter((a) =>
      moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend)
    );

    for (const measurement in measurements) {
      const value = measurements[measurement];
      const aqis = filtered.map(a => a[value] || {}).map(a => a.aqi >= 0 ? a.aqi : a.concentration);
      sum.push(...aqis.filter(e => e >= 0));

      idx = datasets.findIndex(d => d.name === value.replace('REALTIME', ''));
      datasets[idx].data.push(max(sum));
      sum = [];
    }

    // Weather
    filtered = weathers.filter((a) => moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend));

    // Wind Speed
    idx = datasets.findIndex(d => d.name === 'Wind Speed (avg)');
    datasets[idx]['data'].push(
      avg(filtered.map(a => a['REPORTED_WEATHER'] || {}).map(a => a.windSpeed || 0))
    );

    // Wind Bearing
    idx = datasets.findIndex(d => d.name === 'Wind Bearing (avg)');
    datasets[idx]['data'].push(
      avg(filtered.map(a => a['REPORTED_WEATHER'] || {}).map(a => parseInt(a.windBearing) || 0))
    );

    // Temp
    idx = datasets.findIndex(d => d.name === 'Temperature (avg)');
    datasets[idx]['data'].push(
      avg(filtered.map(a => a['REPORTED_WEATHER'] || {}).map(a => a.apparentTemperature || 0))
    );

    // FLights
    filtered = flights.filter((a) => moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend));
    idx = datasets.findIndex(d => d.name === 'Flights (max)');
    datasets[idx]['data'].push(
      max(filtered.map(a => a['FLIGHTS'] || {}).map(a => a.length || 0))
    );

    // vessels
    filtered = vessels.filter((a) => moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend));
    idx = datasets.findIndex(d => d.name === 'Vessels (max)');
    datasets[idx]['data'].push(
      max(filtered.map(a => a['VESSELS'] || {}).map(a => a.length) || 0)
    );

    // Trains
    filtered = trains.filter((a) => moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend));
    idx = datasets.findIndex(d => d.name === 'Trains (max)');
    datasets[idx]['data'].push(
      max(filtered.map(a => a['SOUTHSHORE'] || {}).map(a => a.length) || 0)
    );

    // traffic
    filtered = traffics.filter((a) => moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend));
    idx = datasets.findIndex(d => d.name === 'Traffic (max)');
    datasets[idx]['data'].push(
      max(filtered.map(a => a['INCIDENTS'] || []).map(a => a.reduce((sum, x) => sum + x.distance, 0) || 0) || [])
    );
  }

  const colors = [
    '#FF9800',
    '#9DD866',
    '#0B84A5',
    '#F6C85F',
    '#CA472F',
    '#5bc0dd',
    '#FFA056',
    '#8DDDD0',
    '#6F4E7C',
    '#60bf60',
  ];

  const options = {
    series: datasets,
    chart: {
      height: 300,
      type: 'heatmap',
      toolbar: {
        show: false,
      }
    },
    plotOptions: {
      heatmap: {
        reverseNegativeShade: false,
        distributed: true,
        useFillColorAsStroke: false,
      },
    },
    dataLabels: {
      enabled: false
    },
    colors: colors,
    xaxis: {
      type: 'datetime',
      categories: dates
    },
    title: {},
    grid: {},
    tooltip: {
      x: {
        format: 'dd MMM yyyy HH:mm',
        formatter: undefined,
      },
    }
  };

  postMessage(JSON.parse(JSON.stringify(options)));
});
