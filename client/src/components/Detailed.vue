<template>
  <div>
    <div class="container">
      <div class="col-12">
        <h1 class="h3 pb-45 font-weight-bold text-uppercase">
          <small class="d-block h6 font-weight-light">Miller Beach / Gary / <abbr title="Northwest Indiana">NWI</abbr> Air Quality Tracker</small>
          <span class="site-heading">"hello, who's there?" The Detailed View</span>
        </h1>
      </div>
    </div>

    <div class="container-fluid mb-5 mt-4 ">
      <div class="row xs-column-reverse
      ">
        <div class="col-xl-7 px-4 my-5 py-5 my-xl-0 py-xl-0" id="data-container" style="min-height: 2000px;">

          <div class="row">
            <div class="col-10">
              <div class="mb-5 w-75 mx-auto" v-if="Object.keys(grouped).length > 0">
                <Slider
                  v-model="dateSlider"
                  :format="dateSliderLabel"
                  :max="dateSliderMax"
                  :min="0"
                  @change="viewAirshitByDate(dateSlider)"
                />
              </div>

              <div class="mb-5 w-75 mx-auto" v-if="airshits.length > 0">
                <Slider
                  v-model="airshitSlider"
                  :format="airshitSliderLabel"
                  :max="airshitSliderMax"
                  :min="0"
                  @update="viewAirshit(airshitSlider)"
                />
              </div>
            </div>
            <div class="col-2">
              <template v-if="playing === false">
                <a href="#" @click.prevent="startTicker"><i class="fa fa-play fa-5x" aria-hidden="true"></i></a>
              </template>
              <template v-else>
                <a href="#" @click.prevent="stopTicker"><i class="fa fa-pause fa-5x" aria-hidden="true"></i></a>
              </template>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <div class="text-center mb-5">

                <div class="form-check-inline">
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input"
                      :checked="currentlyViewable('weather')"
                      @change="updateCurrentlyViewable('weather')"
                    > weather
                  </label>
                </div>
                <div class="form-check-inline">
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input"
                      :checked="currentlyViewable('trains')"
                      @change="updateCurrentlyViewable('trains')"
                    > trains
                  </label>
                </div>
                <div class="form-check-inline">
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input"
                      :checked="currentlyViewable('traffic')"
                      @change="updateCurrentlyViewable('traffic')"
                    > traffic
                  </label>
                </div>
                <div class="form-check-inline">
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input"
                      :checked="currentlyViewable('vessels')"
                      @change="updateCurrentlyViewable('vessels')"
                    > vessels
                  </label>
                </div>
                <div class="form-check-inline">
                  <label class="form-check-label">
                    <input type="checkbox" class="form-check-input"
                      :checked="currentlyViewable('flights')"
                      @change="updateCurrentlyViewable('flights')"
                    > flights
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-5 mb-md-0" v-if="viewing.weather">
              <p class="mb-0 h4">
                <span class="text--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                <template v-else>
                  <span class="highlighted">On {{ datetime(airshit.createdAt).format('LLL') }}</span>, the <span class="highlighted">weather</span> was reported as <span class="highlighted">{{ airshit.REPORTED_WEATHER['summary'].toLowerCase() }}</span> and around <span class="highlighted">{{ airshit.REPORTED_WEATHER['apparentTemperature'].toFixed(0) }}&deg;F</span>, the overall <span class="highlighted">air quality</span> was reported as <span class="highlighted">{{ overallAirQuality }}</span>, there were <span class="highlighted">{{ congestionMiles }} miles</span> of <span class="highlighted">local traffic</span>, <span class="highlighted">{{ overallFlightTotal }} plane{{ overallFlightTotal === 1 ? '' : 's' }}</span> overhead, <span class="highlighted">{{ overallVesselsTotal }} ships</span> on Lake Michigan, and <span class="highlighted">{{ overallTrainsTotal }} trains</span> in <span class="highlighted">our</span> community.
                </template>
              </p>
            </div>

            <div class="col-md-6" v-if="viewing.weather">
              <div class="table-responsive">
                <table class="table text-monospace mb-5 table-sm ">
                  <tbody>
                    <tr>
                      <td colspan="2" style="border-top:0;" class="pt-0">
                        <h2 class="text-left mb-0 h4 text-uppercase text-monospace">
                          <span class="font-weight-bold">Weather</span>
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class="mb-0 text-lowercase">Wind</p>
                      </td>
                      <td>
                        <p class="mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <template v-else>
                            <span class="mr-3">
                              {{ airshit.REPORTED_WEATHER['windSpeed'].toFixed(0) }}-{{ airshit.REPORTED_WEATHER['windGust'].toFixed(0) }} <sub>mph</sub>
                            </span>
                            <span class="d-inline-block mb-0 " :title="`wind bearing from ${airshit.REPORTED_WEATHER['windBearing']}\xB0`" :style="`transform: rotate(${degeesToRotation(airshit.REPORTED_WEATHER['windBearing'])}deg)`">
                              ↑
                            </span>
                          </template>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class="mb-0 text-lowercase">Humidity</p>
                      </td>
                      <td>
                        <p class="mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else>{{ (airshit.REPORTED_WEATHER['humidity'] * 100).toFixed(0) }}</span>
                          &nbsp;<sub>%</sub>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">Dew Point</p>
                      </td>
                      <td>
                        <p class=" mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else>{{ airshit.REPORTED_WEATHER['dewPoint'].toFixed(0)}}</span>
                          &nbsp;<sub>&deg;F</sub>
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">Cloud Coverage</p>
                      </td>
                      <td>
                        <p class=" mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else>{{ (airshit.REPORTED_WEATHER['cloudCover'] * 100).toFixed(0) }}</span>
                          &nbsp; %
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">UV Index</p>
                      </td>
                      <td>
                        <p class=" mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else>{{ airshit.REPORTED_WEATHER['uvIndex'].toFixed(0) }}</span>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">Pressure</p>
                      </td>
                      <td>
                        <p class=" mb-0">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else class="font-weight-bold">{{ (airshit.REPORTED_WEATHER['pressure'] * 0.02953).toFixed(2) }}</span>
                          &nbsp;<sub>in Hg</sub>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">Rain Intensity</p>
                      </td>
                      <td>
                        <p class=" mb-0">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else class="font-weight-bold">{{ parseFloat(airshit.REPORTED_WEATHER['precipIntensity']).toFixed(2) }}</span>
                          &nbsp;<sub>in of liquid water</sub>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">OZone</p>
                      </td>
                      <td>
                        <p class=" mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else>
                            {{ airshit.REPORTED_WEATHER['ozone'].toFixed(0) }}
                          </span>
                          &nbsp;<a href="https://en.wikipedia.org/wiki/Dobson_unit" role="button" target="_blank"><sub>DU</sub></a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p class=" mb-0 text-lowercase">Visibility</p>
                      </td>
                      <td>
                        <p class=" mb-0 font-weight-bold">
                          <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                          <span v-else>{{ airshit.REPORTED_WEATHER['visibility'].toFixed(0) }}</span> <sub>miles</sub>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <div class="table-responsive">
                <table class="table text-monospace mb-0 table-sm small"
                  v-if="viewing.traffic"
                >
                  <tbody>
                    <tr>
                      <td colspan="6" style="border-top:0;" class="pt-0">
                      <h2 class="text-left mb-0 h4 text-uppercase text-monospace">
                        <span class="font-weight-bold">Traffic</span>
                      </h2>
                      </td>
                    </tr>

                    <tr>
                      <td class="font-weight-bold">lat/lng</td>
                      <td class="font-weight-bold">distance (miles)</td>
                      <td class="font-weight-bold">delay (min)</td>
                      <td class="font-weight-bold">description</td>
                      <td class="font-weight-bold">start</td>
                      <td class="font-weight-bold">end</td>
                    </tr>

                    <template v-if="airshit.TRAFFIC && airshit.TRAFFIC.INCIDENTS.length > 0">
                      <template v-for="(incident, index) in airshit.TRAFFIC.INCIDENTS">
                        <tr v-bind:key="index" class="small">
                          <td>{{ incident.lat }},{{ incident.lng }}</td>
                          <td>{{ parseInt(incident.distance) }}</td>
                          <td>{{ incident.freeFlowMinDelay }}</td>
                          <td>{{ incident.shortDesc }}</td>
                          <td>{{ datetime(incident.startTime).format('LLL') }}</td>
                          <td>{{ datetime(incident.endTime).format('LLL') }}</td>
                        </tr>
                      </template>
                    </template>
                    <template v-else>
                      <tr>
                        <td colspan="6">
                          <em>no traffic found</em>
                        </td>
                      </tr>
                    </template>


                  </tbody>
                  <tfoot>
                    <tr>
                      <th class="text-uppercase text-right" colspan="6">
                        <template class="number--blurred" v-if="! airshit.TRAFFIC"></template>
                        <template v-else>
                          <span class="font-weight-bold pr-1">{{ airshit.TRAFFIC.INCIDENTS.length }}</span>
                          <small class="small font-weight-light pr-3">incidents</small>
                          <span class="font-weight-bold pr-1">{{ congestionMiles }}</span>
                          <small class="small font-weight-light pr-3">miles of congestion</small>
                          <span class="font-weight-bold pr-1">{{ congestionTime }}</span>
                          <small class="small font-weight-light pr-3">minutes of congestion</small>
                        </template>
                      </th>
                    </tr>
                  </tfoot>
                </table>

                <table class="table text-monospace mb-0 table-sm small mt-5"
                  v-if="viewing.flights"
                >
                  <tbody>
                    <tr>
                      <td colspan="9" style="border-top:0;" class="pt-0">
                        <h2 class="text-left mb-0 h4 text-uppercase text-monospace">
                          <span class="font-weight-bold">Flights</span>
                        </h2>
                      </td>
                    </tr>

                    <tr>
                      <td class="font-weight-bold">lat/lng</td>
                      <td class="font-weight-bold">flight</td>
                      <td class="font-weight-bold">departing</td>
                      <td class="font-weight-bold">arriving</td>
                      <td class="font-weight-bold">reg</td>
                      <td class="font-weight-bold">aircraft</td>
                      <td class="font-weight-bold">alt</td>
                      <td class="font-weight-bold">bearing</td>
                      <td class="font-weight-bold">speed</td>
                    </tr>

                    <template v-if="overallFlightTotal > 0">
                      <template v-if="airshit.FLIGHTS.ORD && airshit.FLIGHTS.ORD.length > 0">
                        <template v-for="(flight, index) in airshit.FLIGHTS.ORD">
                          <tr v-bind:key="`ord-${index}`" class="small">
                            <td>{{ flight.lat }},{{ flight.lng }}</td>
                            <td>{{ flight.flight }}</td>
                            <td>{{ flight.departing }}</td>
                            <td>{{ flight.arriving }}</td>
                            <td>{{ flight.reg }}</td>
                            <td>{{ flight.aircraft }}</td>
                            <td>{{ flight.alt }}</td>
                            <td>{{ flight.bearing }}</td>
                            <td>{{ flight.speed }}</td>
                          </tr>
                        </template>
                      </template>

                      <template v-if="airshit.FLIGHTS.MDW && airshit.FLIGHTS.MDW.length > 0">
                        <template v-for="(flight, index) in airshit.FLIGHTS.MDW">
                          <tr v-bind:key="`mdw-${index}`" class="small">
                            <td>{{ flight.lat }},{{ flight.lng }}</td>
                            <td>{{ flight.flight }}</td>
                            <td>{{ flight.departing }}</td>
                            <td>{{ flight.arriving }}</td>
                            <td>{{ flight.reg }}</td>
                            <td>{{ flight.aircraft }}</td>
                            <td>{{ flight.alt }}</td>
                            <td>{{ flight.bearing }}</td>
                            <td>{{ flight.speed }}</td>
                          </tr>
                        </template>
                      </template>

                      <template v-if="airshit.FLIGHTS.GYY && airshit.FLIGHTS.GYY.length > 0">
                        <template v-for="(flight, index) in airshit.FLIGHTS.GYY">
                          <tr v-bind:key="`gyy-${index}`" class="small">
                            <td>{{ flight.lat }},{{ flight.lng }}</td>
                            <td>{{ flight.flight }}</td>
                            <td>{{ flight.departing }}</td>
                            <td>{{ flight.arriving }}</td>
                            <td>{{ flight.reg }}</td>
                            <td>{{ flight.aircraft }}</td>
                            <td>{{ flight.alt }}</td>
                            <td>{{ flight.bearing }}</td>
                            <td>{{ flight.speed }}</td>
                          </tr>
                        </template>
                      </template>
                    </template>
                    <template v-else>
                      <tr>
                        <td colspan="9">
                          <em>no flights found</em>
                        </td>
                      </tr>
                    </template>

                  </tbody>

                  <tfoot>
                    <tr>
                      <th class="small text-uppercase text-right" colspan="9">
                        <template class="number--blurred" v-if="! airshit.FLIGHTS"></template>
                        <template v-else>
                          <span class="font-weight-bold">{{ overallFlightTotal }}</span> total flights
                        </template>
                      </th>
                    </tr>
                  </tfoot>
                </table>

                <table class="table text-monospace mb-0 table-sm small mt-5"
                  v-if="viewing.vessels"
                >
                  <tbody>
                    <tr>
                      <td colspan="14" style="border-top:0;" class="pt-0">
                        <h2 class="text-left mb-0 h4 text-uppercase text-monospace">
                          <span class="font-weight-bold">Vessels</span>
                        </h2>
                      </td>
                    </tr>

                    <tr>
                      <td class="font-weight-bold">photo</td>
                      <td class="font-weight-bold">lat/lng</td>
                      <td class="font-weight-bold">id</td>
                      <td class="font-weight-bold">imo</td>
                      <td class="font-weight-bold">name</td>
                      <td class="font-weight-bold">callsign</td>
                      <td class="font-weight-bold">country</td>
                      <td class="font-weight-bold">type</td>
                      <td class="font-weight-bold">width</td>
                      <td class="font-weight-bold">length</td>
                      <td class="font-weight-bold">deadweight</td>
                      <td class="font-weight-bold">destination</td>
                      <td class="font-weight-bold">draught</td>
                      <td class="font-weight-bold">status</td>
                      <td class="font-weight-bold">direction</td>
                    </tr>

                    <template v-if="overallVesselsTotal > 0">
                      <tr v-bind:key="`vessels-${index}`" v-for="(vessel, index) in this.vessels"  class="small">
                        <td>
                          <template v-if="photos.vessels && photos.vessels[vessel.imo]">
                            <a :href="photos.vessels[vessel.imo]" target="_blank">
                              <img :src="photos.vessels[vessel.imo]" class="mw-100" />
                            </a>
                          </template>
                          <template v-else>
                            -
                          </template>
                        </td>
                        <td>{{ vessel.lat }},{{ vessel.lng }}</td>
                        <td>{{ vessel.id }}</td>
                        <td>{{ vessel.imo }}</td>
                        <td>{{ vessel.name }}</td>
                        <td>{{ vessel.callsign }}</td>
                        <td>{{ vessel.country }}</td>
                        <td>{{ vessel.type }}</td>
                        <td>{{ vessel.width }}</td>
                        <td>{{ vessel.length }}</td>
                        <td>{{ vessel.deadweight }}</td>
                        <td>{{ vessel.destination }}</td>
                        <td>{{ vessel.draught }}</td>
                        <td>{{ vessel.status }}</td>
                        <td>{{ vessel.direction }}</td>
                      </tr>
                    </template>
                    <template v-else>
                      <tr>
                        <td colspan="15">
                          <em>no vessels found</em>
                        </td>
                      </tr>
                    </template>

                  </tbody>
                  <tfoot>
                    <tr>
                      <th class="small text-uppercase text-right" colspan="14">
                        <template class="number--blurred" v-if="! airshit.VESSELS"></template>
                        <template v-else>
                          <span class="font-weight-bold">{{ overallVesselsTotal }}</span> total vessels
                        </template>
                      </th>
                    </tr>
                  </tfoot>
                </table>

                <table class="table text-monospace mb-0 table-sm small mt-5"
                  v-if="viewing.trains"
                >
                  <tbody>
                    <tr>
                      <td colspan="3" style="border-top:0;" class="pt-0">
                        <h2 class="text-left mb-0 h4 text-uppercase text-monospace">
                          <span class="font-weight-bold">Trains</span>
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">lat/lng</td>
                      <td class="font-weight-bold">id</td>
                      <td class="font-weight-bold">direction</td>
                    </tr>

                    <template v-if="overallTrainsTotal > 0">
                      <tr v-bind:key="`trains-${index}`" v-for="(train, index) in this.$store.state.airshit.TRAINS.SOUTHSHORE"  class="small">
                        <td>{{ train.lat }},{{ train.lng }}</td>
                        <td>{{ train.id }}</td>
                        <td>{{ train.direction }}</td>
                      </tr>
                    </template>

                    <template v-else>
                      <tr>
                        <td colspan="3">
                          <em>no trains found</em>
                        </td>
                      </tr>
                    </template>

                  </tbody>
                  <tfoot>
                    <tr>
                      <th class="small text-uppercase text-right" colspan="3">
                        <template class="number--blurred" v-if="! airshit.TRAINS"></template>
                        <template v-else>
                          <span class="font-weight-bold">{{ overallTrainsTotal }}</span> total trains
                        </template>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-5 mb-md-5 pb-md-5 mb-lg-0 pb-lg-0 mt-0 mt-xl-n5">
          <div class="sticky-top pt-5">
            <h2 class="text-monospace text-center">{{ datetime(airshit.createdAt).format('LLL') }}</h2>

            <div class="map-container" style="position: relative;">
              <div id="map"></div>

              <div class="" style="position: absolute; bottom: 15px; left: 15px; z-index: 100000;">

                <div class="h4" v-if="airshit.REPORTED_WEATHER">
                  <span class="mr-3">
                    {{ airshit.REPORTED_WEATHER['windSpeed'].toFixed(0) }}-{{ airshit.REPORTED_WEATHER['windGust'].toFixed(0) }} <sub>mph</sub>
                  </span>
                  <span class="d-inline-block mb-0 font-weight-bold h1" :title="`wind bearing from ${airshit.REPORTED_WEATHER['windBearing']}\xB0`" :style="`transform: rotate(${degeesToRotation(airshit.REPORTED_WEATHER['windBearing'])}deg)`">
                    &darr;
                  </span><br/>
                  {{ airshit.REPORTED_WEATHER['apparentTemperature'].toFixed(0) }}&deg;F
                  {{ airshit.REPORTED_WEATHER['summary'].toLowerCase() }}
                </div>

                <div class="card h-100 aqi d-inline-block mr-1" style="min-width:75px;" v-if="airshit.PM25REALTIME"
                  :class="getAqiScoreClassname((airshit.PM25REALTIME ? airshit.PM25REALTIME['category'] : 'Good'))"
                >
                  <div class="card-body small py-1">
                    <p class="text-uppercase font-weight-bold mb-0">PM2.5</p>
                    <p class="font-weight-bold mb-0 lead">
                      <span class="number--blurred" v-if="! airshit.PM25REALTIME"></span>
                      <span v-else>{{ airshit.PM25REALTIME['aqi'] }}</span>
                    </p>
                    <p class="mb-0 text-uppercase font-weight-bold ">
                      <span class="text--blurred" v-if="! airshit.PM25REALTIME"></span>
                      <template v-else>
                        <small class="font-size-80 pl-20 d-block"><span class="text-lowercase">{{  airshit.PM25REALTIME['concentration'] }} &#181;</span>g/m<sup>3</sup></small>
                      </template>
                    </p>
                  </div>
                </div>

                <div class="card h-100 aqi d-inline-block" style="min-width:75px;" v-if="airshit.PM10REALTIME"
                  :class="getAqiScoreClassname((airshit.PM10REALTIME ? airshit.PM10REALTIME['category'] : 'Good'))"
                >
                  <div class="card-body small py-1">
                    <p class="text-uppercase font-weight-bold mb-0">PM10</p>
                    <p class="font-weight-bold mb-0 lead">
                      <span class="number--blurred" v-if="! airshit.PM10REALTIME"></span>
                      <span v-else>{{ airshit.PM10REALTIME['aqi'] }}</span>
                    </p>
                    <p class=" mb-0 text-uppercase font-weight-bold">
                      <span class="text--blurred" v-if="! airshit.PM10REALTIME"></span>
                      <template v-else>
                        <small class="font-size-80 pl-20 d-block"><span class="text-lowercase">{{  airshit.PM10REALTIME['concentration'] }} &#181;</span>g/m<sup>3</sup></small>
                      </template>
                    </p>
                  </div>
                </div>

                <div class="card h-100 d-inline-block border-0" style="min-width:75px;background-color:transparent"
                >
                  <div class="card-body py-1">
                    <template v-if="playing === false">
                      <a href="#" @click.prevent="startTicker"><i class="fa fa-play fa-4x" aria-hidden="true"></i></a>
                    </template>
                    <template v-else>
                      <a href="#" @click.prevent="stopTicker"><i class="fa fa-pause fa-4x" aria-hidden="true"></i></a>
                    </template>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    // import VueApexCharts from 'vue-apexcharts';
    import { API } from '@/api';
    import L from 'leaflet';
    import _ from 'lodash';
    import moment from 'moment';
    require('leaflet-rotatedmarker');
    import Slider from '@vueform/slider/dist/slider.vue2.js';
    const geo = require('geolocation-utils');

    export default {
      components: {
        Slider
      },

      data() {
        return {
          dateSlider: 0,
          airshitSlider: 0,

          map: {},

          markers: {
            airports: [],
            vessels: [],
            trains: [],
            traffic: []
          },

          current: {
            date: null,
            airshit: null
          },

          interval: null,
          playing: false,

          viewing: {
            weather: true,
            flights: true,
            vessels: true,
            trains: true,
            traffic: true
          },
        }
      },

      created() {
        this.getAllGroupedAirShits();
        this.getVesselPhotos();
      },

      mounted() {},

      computed: {
        photos() {
          return this.$store.state.photos;
        },

        airshit() {
          return this.$store.state.airshit;
        },
        airshits() {
          return this.$store.state.airshits;
        },
        grouped() {
          return this.$store.state.grouped;
        },
        geography() {
          return this.$store.state.geography;
        },
        dateSliderMax() {
          if (Object.keys(this.grouped).length > 1) {
            return Object.keys(this.grouped).length - 1;
          }
          return Object.keys(this.grouped).length;
        },
        airshitSliderMax() {
          if (this.airshits > 1) {
            return this.airshits.length - 1;
          }
          return this.airshits.length;
        },
        vesselsByType() {
          const vessels = this.vessels;

          return _.groupBy(vessels, 'type');
        },
        congestionMiles() {
          let total = 0;
          const incidents = this.$store.state.airshit.TRAFFIC.INCIDENTS;

          incidents.map((incident) => {
            total += incident.distance;
          });

          return total.toFixed(0);
        },
        congestionTime() {
          let total = 0;
          const incidents = this.$store.state.airshit.TRAFFIC.INCIDENTS;

          incidents.map((incident) => {
            total += incident.freeFlowMinDelay;
          });

          return total.toFixed(0);
        },

        overallFlightTotal() {
          if (! this.airshit.FLIGHTS) return 0;

          return [
          this.airshit.FLIGHTS.GYY.length,
          this.airshit.FLIGHTS.MDW.length,
          this.airshit.FLIGHTS.ORD.length
          ].reduce((a, b) => { return a + b; });
        },

        overallVesselsTotal() {
          return (this.vessels ? this.vessels.length : 0);
        },

        overallTrainsTotal() {
          return (this.airshit.TRAINS ? this.airshit.TRAINS.SOUTHSHORE.length : 0)
        },

        overallAirQuality() {
            const pm25 = this.getOverallAqiScore(this.airshit.PM25REALTIME && this.airshit.PM25REALTIME.aqi || 0);
            const pm10 = this.getOverallAqiScore(this.airshit.PM10REALTIME && this.airshit.PM10REALTIME.aqi || 0);

            const severity = [
                'good',
                'moderate',
                'unhealthy-sensitive',
                'unhealthy',
                'unhealthy-very',
                'death'
            ];

            return severity[Math.max(severity.indexOf(pm25), severity.indexOf(pm10))];
        },

        vessels() {
            return this.airshit.VESSELS.filter((vessel) => {
              const { lat, lng } = vessel;
              return geo.insidePolygon([lat, lng], this.geography.region.lake);
            });
        }
      },

      methods: {

        currentlyViewable(view) {
          return this.viewing[view];
        },

        updateCurrentlyViewable(view) {
          return this.viewing[view] = (this.viewing[view] === true ? false : true);
        },

        getOverallAqiScore(total) {
            if (_.inRange(total, 0, 50)) {
                return 'good';
            } else if (_.inRange(total, 51, 100)) {
                return 'moderate';
            } else if (_.inRange(total, 101, 150)) {
                return 'unhealthy-sensitive';
            } else if (_.inRange(total, 151, 200)) {
                return 'unhealthy';
            } else if (_.inRange(total, 201, 300)) {
                return 'unhealthy-very';
            } else if (total >= 301) {
                return 'death';
            }
        },

        getAqiScoreClassname(measurement) {
          switch(measurement) {
            case 'Good':
            return 'aqi--good';
            case 'Moderate':
            return 'aqi--moderate';
            case 'Unhealthy for Sensitive Groups':
            return 'aqi--unhealthy-sensitive';
            case 'Unhealthy':
            return 'aqi--unhealthy';
            case 'Very Unhealthy':
            return 'aqi--unhealthy-very';
            case 'Hazardous':
            return 'aqi--death';
          }
        },

        startTicker() {
          const self = this;
          self.playing = true;

          self.interval = setInterval(() => {
            if (self.airshitSlider < self.airshits.length - 1) {
              self.airshitSlider++;
            }
            if (self.airshitSlider === self.airshits.length -1) {
              self.dateSlider++;
              self.viewAirshitByDate(self.dateSlider)
            }
          }, 100);
        },

        stopTicker() {
          clearInterval(this.interval);
          this.playing = false;
        },

        degeesToRotation(angle) {
          return angle;
        },

        viewAirshit(index) {
          const airshit = this.airshits[index];
          const id = airshit._id;
          this.current.airshit = id;
          this.$store.commit('setAirshit', airshit);
          this.clearMarkers();
          this.updateMarkers();
        },

        getVesselPhotos() {
          API.get(`/vessels/photos`).then(response => {
            this.$store.commit('setVesselPhotos', response.data.photos);
          })
          .catch(e => {
            alert('error!');
            console.log(e); // eslint-disable-line no-console
          });
        },

        viewAirshitByDate(index) {
          const date = Object.keys(this.grouped)[index];

          this.current.date = index;
          API.get(`/airshits/date/${date}`).then(response => {
            this.$store.commit('setAirshits', response.data.airshits);
            this.$store.commit('setAirshit', response.data.airshits[0]);
            this.airshitSlider = 0;
          })
          .catch(e => {
            alert('error!');
              console.log(e); // eslint-disable-line no-console
            });
        },

        getAllGroupedAirShits() {
          API.get(`/previous-by-day`).then(response => {
            this.$store.commit('setGrouped', response.data.airshits);
            this.$store.commit('setGeography', response.data.geography);
            this.viewAirshitByDate(1);
            this.initMaps();
          })
          .catch(e => {
            alert('error!');
            console.log(e); // eslint-disable-line no-console
          });
        },

        dateSliderLabel(original) {
          const parsed = parseInt(original);
          return `${this.datetime(Object.keys(this.grouped)[parsed]).format('LL') || 'MISSING'}`;
        },

        airshitSliderLabel(original) {
          const parsed = parseInt(original);
          return `${this.datetime(this.airshits[parsed].createdAt).format('HH:mm')}`;
        },

        datetime(datetime) {
          return moment.utc(datetime).local();
        },

        initMaps() {
          if (! document.getElementById('map')) {
            return;
          }

          const self = this;

          self.map = L.map('map', {scrollWheelZoom: false}).setView([
            self.$store.state.geography.sensor.lat, self.$store.state.geography.sensor.lng
            ], 10);

          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 11
          }).addTo(self.map);

          const LeafIcon = L.Icon.extend({
            options: {
              iconSize:     [20, 20],
              iconAnchor:   [10, 10],
              popupAnchor:  [0, 0]
            }
          });

          const root = process.env.VUE_APP_API_URL;
          const sensorIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-radio-tower-50.png`});
          const shitIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-factory-50.png`});

          [{
            'lat': '41.607175',
            'lng': '-87.337602',
            'name': 'U.S. STEEL CO. GARY WORKS',
          },{
            'lat': '41.622735',
            'lng': '-87.116998',
            'name': 'ARCELORMITTAL BURNS HARBOR, INC',
          },{
            'lat': '41.652604',
            'lng': '-87.457297',
            'name': 'INDIANA HARBOR EAST ',
          },{
            'lat': '41.218647',
            'lng': '-87.023819',
            'name': 'NIPSCO - R.M. SCHAHFER GENERATING STATION',
          },{
            'lat': '41.708132',
            'lng': '-87.521315',
            'name': 'DOMINION RESOURCES - STATE LINE ENERGY, LLC',
          },{
            'lat': '41.720852',
            'lng': '-86.906901',
            'name': 'NIPSCO - MICHIGAN CITY GENERATING STATION ',
          },{
            'lat': '41.662580',
            'lng': '-87.482625',
            'name': 'BP PRODUCTS NORTH AMERICA, INC.',
          },{
            'lat': '41.679816',
            'lng': '-87.417311',
            'name': 'COKENERGY, INC.',
          },{
            'lat': '41.655465',
            'lng': '-87.450172',
            'name': 'ARCELORMITTAL INDIANA HARBOR, INC.',
          }].forEach((shit) => {
            L.marker([shit.lat, shit.lng], {icon: shitIcon}).bindPopup(`
              ${shit.name}
              `).addTo(self.map);
          });

          L.marker([self.geography.sensor.lat, self.geography.sensor.lng], {icon: sensorIcon}).bindPopup(`
            Base Station, PM2.5/PM10 sensor, AIS antenna, and reported weather are recorded from this location.
            `).addTo(self.map);
        },

        clearMarkers() {
          const self = this;

          for(const index in self.markers.airports) {
            self.map.removeLayer(self.markers.airports[index]);
          }

          for(const index in self.markers.trains) {
            self.map.removeLayer(self.markers.trains[index]);
          }

          for(const index in self.markers.traffic) {
            self.map.removeLayer(self.markers.traffic[index]);
          }

          for(const index in self.markers.vessels) {
            self.map.removeLayer(self.markers.vessels[index]);
          }
        },

        updateMarkers() {
          const self = this

          const root = process.env.VUE_APP_API_URL;

          const LeafIcon = L.Icon.extend({
            options: {
              iconSize:     [20, 20],
              iconAnchor:   [10, 10],
              popupAnchor:  [0, 0]
            }
          });

          const aircraftIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-airport-50.png`});
          const trainIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-train-50.png`});
          const boatIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-fishing-boat-50.png`});
          const trafficIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-traffic-jam-50.png`});

          if (self.viewing.flights) {
            for (const airport in this.$store.state.airshit.FLIGHTS) {
              const flights = this.$store.state.airshit.FLIGHTS[airport];

              for (const index in flights) {
                const flight = flights[index];

                const marker = L.marker([flight.lat, flight.lng], {icon: aircraftIcon, rotationAngle: flight.bearing}).bindPopup(`
                  Aircraft: ${flight.aircraft}<br>
                  Flight: <a href="https://www.planemapper.com/flights/${flight.flight}" target="_blank">${flight.flight}</a> <small>(open in new window)</small><br>
                  Departing: ${flight.departing}, Arriving: ${flight.arriving}<br>
                  Speed: ${flight.speed}<br>
                  Bearing: ${flight.bearing}<br>
                  Altitude: ${flight.alt}<br>
                  `);

                self.markers.airports.push(marker);
                self.map.addLayer(self.markers.airports[index]);
              }
            }
          }

          if (self.viewing.trains) {
            for (const line in this.$store.state.airshit.TRAINS) {
              const trains = this.$store.state.airshit.TRAINS[line];
              for (const index in trains) {
                const train = trains[index];
                const trainAngle = (train.direction === 'East' ? 90 : 270);
                const marker = L.marker([train.lat, train.lng], {icon: trainIcon, rotationAngle: trainAngle}).bindPopup(`
                  ID: ${train.id}<br>
                  Direction: ${train.direction}
                  `);

                self.markers.trains.push(marker);
                self.map.addLayer(self.markers.trains[index]);
              }
            }
          }

          if (self.viewing.vessels) {
            for (const index in Object.keys(this.vessels)) {
              const vessel = this.vessels[index];
              const vesselAngle = (vessel.direction ? this.degeesToRotation(vessel.direction) : 0);
              const marker = L.marker([vessel.lat, vessel.lng], {icon: boatIcon, rotationAngle: vesselAngle}).bindPopup(`
                Name: ${vessel.name}<br>
                IMO: ${ vessel.imo || '-' }<br>
                MMSI: ${vessel.id}<br>
                Callsign: ${vessel.callsign}<br>
                Country: ${vessel.country}<br>
                Type: ${vessel.type}<br>
                Length: ${vessel.length}<br>
                Width: ${vessel.width}<br>
                Deadweight: ${vessel.deadweight}<br>
                Destination: ${vessel.destination}<br>
                Draught: ${vessel.draught}<br>
                Status: ${vessel.status}<br>
                Bearing: ${vessel.direction}<br>
                lat: ${vessel.lat}<br>
                lng: ${vessel.lng}<br>
              `);

              self.markers.vessels.push(marker);
              self.map.addLayer(self.markers.vessels[index]);
            }
          }

          if (self.viewing.traffic) {
            for (const index in Object.keys(this.$store.state.airshit.TRAFFIC.INCIDENTS)) {
              const incident = this.$store.state.airshit.TRAFFIC.INCIDENTS[index];
              const marker = L.marker([incident.lat, incident.lng], {icon: trafficIcon}).bindPopup(`
                ${incident.shortDesc}<br>
                <br>
                Distance: ${incident.distance}<br>
                Minute Delay: ${incident.freeFlowMinDelay}<br>
                Started: ${incident.startTime}<br>
                Ending: ${incident.endTime}<br>
                `);

              self.markers.traffic.push(marker);
              self.map.addLayer(self.markers.traffic[index]);
            }
          }
        },
      }
    }
  </script>

  <style src="@vueform/slider/themes/default.css"></style>
