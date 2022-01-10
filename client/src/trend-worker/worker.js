/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */

import moment from 'moment';


const sum = (arr) => {
  return (arr.reduce((a, b) => a + b, 0)).toFixed(0);
};

const avg = (arr)  =>{
  return (sum(arr) / arr.length || 0).toFixed(0);
};

const max = (arr) =>{
    return (Math.abs(Math.max(...arr)) !== Infinity ? Math.max(...arr) : 0).toFixed(0);
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
    { name: 'AQI (total)', data: [] },
  ];

  const { airshits, weathers, flights, vessels, trains, traffics } = trends;

  let idx;
  let filtered;

  const dates = [];
  const start = moment().subtract(7, 'd');
  const end   = moment().subtract(6, 'h');

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
      const aqis = filtered.map(a => a[value] || {}).map(a => a.aqi >= 0 ? a.aqi : -1);
      sum.push(...aqis.filter(e => e >= 0));
    }

    idx = datasets.findIndex(d => d.name === 'AQI (total)');
    datasets[idx].data.push(max(sum));

    // Weather
    filtered = weathers.filter((a) =>moment(moment(a.createdAt).toISOString()).isBetween(date, seriesend));

    // Wind
    idx = datasets.findIndex(d => d.name === 'Wind Speed (avg)');
    datasets[idx]['data'].push(
      avg(filtered.map(a => a['REPORTED_WEATHER'] || {}).map(a => a.windSpeed || 0))
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
        colorScale: {
          inverse: false,
        },
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
      },
      y: {
        formatter: (value, a) => {
          const { seriesIndex } = a;
          const { name } = datasets[seriesIndex];
          let format = '';
          switch (name) {
            case 'Traffic (max)':
            format = `${value} miles`
            break;
            case 'Wind Speed (avg)':
            format = `${value} mph`
            break;
            case 'Temperature (avg)':
            format = `${value}\xB0F`
            break;
            default:
            format = value;
          }

          return format;
        },
        title: {
          formatter: (seriesName) => {
            let format;
            switch (seriesName) {
              case 'Traffic (max)':
              format = ``
              break;
              case 'Wind Speed (avg)':
              format = ``
              break;
              case 'Temperature (avg)':
              format = ``
              break;
              case 'AQI (total)':
              format = ``
              break;
              case 'Trains (max)':
              format = ``
              break;
              case 'Vessels (max)':
              format = ``
              break;
              case 'Flights (max)':
              format = ``
              break;
              default:
              format = seriesName;
            }

            return format;
          },
        },
      }
    }
  };

  postMessage(JSON.parse(JSON.stringify(options)));
});
