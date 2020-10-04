<template>
  <div>
    <div class="container">
        <div class="col-12">
            <h1 class="h3 pb-45 font-weight-bold text-uppercase">
                <small class="d-block h6 font-weight-light">Miller Beach / Gary / <abbr title="Northwest Indiana">NWI</abbr> Air Quality Tracker</small>
                <span class="site-heading">Update History</span>
            </h1>
        </div>
    </div>
    <div class="container-fluid">
      <apexchart type="line" height="500" :options="chartOptions" :series="series"></apexchart>
    </div>
  </div>
</template>

<script>
    import VueApexCharts from 'vue-apexcharts';

    export default {
        components: {
            apexchart: VueApexCharts,
        },
        data() {
            return {
          series: [{
            name: 'Trains',
            type: 'column',
            data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
          }, {
            name: 'Cars',
            type: 'column',
            data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
          }, {
            name: 'Flights',
            type: 'column',
            data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
          }, {
            name: 'Weather (&deg;F)',
            type: 'line',
            data: [20, 29, 37, 36, 44, 45, 50, 58]
          }, {
            name: 'PM25',
            type: 'line',
            data: [20, 29, 37, 36, 44, 45, 50, 58]
          }, {
            name: 'PM10',
            type: 'line',
            data: [10, 19, 27, 26, 34, 35, 40, 48]
          }],
          chartOptions: {
            // chart: {
            //   height: 350,
            //   type: 'line',
            //   stacked: false
            // },
            dataLabels: {
              enabled: false
            },
            stroke: {
              width: [1, 1, 4]
            },
            title: {
              // text: 'XYZ - Stock Analysis (2009 - 2016)',
              // align: 'left',
              // offsetX: 110
            },
            xaxis: {
              categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
            },
            yaxis: [
              {
                axisTicks: {
                  show: true,
                },
                axisBorder: {
                  show: true,
                  color: '#008FFB'
                },
                labels: {
                  style: {
                    colors: '#008FFB',
                  }
                },
                title: {
                  text: "Income (thousand crores)",
                  style: {
                    color: '#008FFB',
                  }
                },
                tooltip: {
                  enabled: true
                }
              },
              {
                seriesName: 'Cars',
                opposite: true,
                axisTicks: {
                  show: true,
                },
                axisBorder: {
                  show: true,
                  color: '#00E396'
                },
                labels: {
                  style: {
                    colors: '#00E396',
                  }
                },
                title: {
                  text: "Operating Cashflow (thousand crores)",
                  style: {
                    color: '#00E396',
                  }
                },
              },
              {
                seriesName: 'Weather',
                opposite: true,
                axisTicks: {
                  show: true,
                },
                axisBorder: {
                  show: true,
                  color: '#00E396'
                },
                labels: {
                  style: {
                    colors: '#00E396',
                  }
                },
                title: {
                  text: "Operating Cashflow (thousand crores)",
                  style: {
                    color: '#00E396',
                  }
                },
              },
              {
                seriesName: 'Flights',
                opposite: true,
                axisTicks: {
                  show: true,
                },
                axisBorder: {
                  show: true,
                  color: '#00E396'
                },
                labels: {
                  style: {
                    colors: '#00E396',
                  }
                },
                title: {
                  text: "Operating Cashflow (thousand crores)",
                  style: {
                    color: '#00E396',
                  }
                },
              },
              {
                seriesName: 'Boats',
                opposite: true,
                axisTicks: {
                  show: true,
                },
                axisBorder: {
                  show: true,
                  color: '#FEB019'
                },
                labels: {
                  style: {
                    colors: '#FEB019',
                  },
                },
                title: {
                  text: "Revenue (thousand crores)",
                  style: {
                    color: '#FEB019',
                  }
                }
              },
            ],
            tooltip: {
              fixed: {
                enabled: true,
                position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
                offsetY: 30,
                offsetX: 60
              },
            },
            legend: {
              horizontalAlign: 'left',
              offsetX: 40
            }
          },
        }
        },
    }
</script>

<style scoped>
</style>
