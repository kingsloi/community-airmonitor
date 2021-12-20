<template>
    <div id="dashboard">
        <div class="container" id="visuals">

            <header>
                <h1 class="display-4 pb-0 font-weight-bold text-uppercase mb-4">
                    <small class="site-sub-heading d-block h6 font-weight-light mb-0">current weather, air quality, &amp; industry in/around</small>
                    <span class="site-heading mt-n1 d-block">Miller Beach, Gary, Indiana</span>
                </h1>
            </header>

            <div class="row">
                <div class="col-xl-4 mt-2">
                    <h2 class="h2 text-left">
                        <span class="text--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                        <div v-else>
                            <span class="highlighted">{{ formatDateTimeDiffToLocalHuman(airshit.createdAt) }}</span> ago
                            the <span class="highlighted">weather</span> was reported as <span class="highlighted">{{ airshit.REPORTED_WEATHER['summary'].toLowerCase() }}</span>and around <span class="highlighted">{{ airshit.REPORTED_WEATHER['apparentTemperature'].toFixed(0) }}&deg;F</span>
                            the overall <span class="highlighted">air quality</span> was reported as <span class="highlighted">{{ overallAirQuality }}</span>
                            there were <span class="highlighted">{{ congestionMiles }} miles</span> of <span class="highlighted">local traffic</span>
                            <span class="highlighted">{{ overallFlightTotal }} plane{{ overallFlightTotal === 1 ? '' : 's' }}</span> overhead
                            <span class="highlighted">{{ overallVesselsTotal }} ships</span> on Lake Michigan,
                            and <span class="highlighted">{{ overallTrainsTotal }} trains</span>
                            in <span class="highlighted">our</span> community.
                        </div>
                    </h2>
                </div>

                <div class="col-xl-8 mt-5 mt-xl-2 px-xl-3 px-0">

                    <div class="map-container" style="position: relative;" @click.prevent="mapMaskActive = false"
                        v-bind:class="{ 'map-container--has-mask': mapMaskActive }"
                    >
                      <div id="map"></div>

                      <div class="" style="position: absolute; bottom: 15px; left: 15px; z-index: 100000;">

                        <div class="h4" v-if="airshit.REPORTED_WEATHER">
                          <span class="mr-3">
                            {{ airshit.REPORTED_WEATHER['windSpeed'].toFixed(0) }}-{{ airshit.REPORTED_WEATHER['windGust'].toFixed(0) }} <sub>mph</sub>
                          </span>
                          <span class="d-inline-block mb-0 font-weight-bold h1" :title="`wind bearing from ${airshit.REPORTED_WEATHER['windBearing']}\xB0`" :style="`transform: rotate(${degeesToRotation(airshit.REPORTED_WEATHER['windBearing'])}deg)`">
                            ↑
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

                      </div>
                    </div>


                    <p class="text-center mt-2">
                        <small class="px-5 w-100 d-block"><a target="_blank" href="/icons/set/train">Train</a>, <a target="_blank" href="/icons/set/fishing-boat">Fishing Boat</a> and other icons by <a target="_blank" href="https://icons8.com">Icons8</a></small>
                        <small class="px-5 w-100 d-block">Factories listed are <a href="https://www.in.gov/idem/airquality/files/monitoring_criteria_trend_northwest.pdf" target="_blank">Northwest Indiana's Top Ten Emission Sources</a></small>
                    </p>

                    <div class="mb-0 small text-xl-right text-center mt-5" id="poweredby">
                        <p class="mb-0" v-if="Object.keys(geography).length > 0">
                            PM2.5/PM10, AIS, recorded at base station.<br><br>
                            Base Station: <code>{{ geography.sensor.lat }},{{ geography.sensor.lng }}</code><br>
                            Lake:<a class="pl-1" target="_blank"
                                :title="getReversedCoordinates(geography.region.lake)"
                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.lake))}`"
                            >coordinates</a><br>
                            Trains/Flights Region: <a class="pl-1" target="_blank"
                                :title="getReversedCoordinates(geography.region.land_polygon)"
                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.land_polygon))}`"
                            >coordinates</a><br>
                            Traffic Region: <a class="pl-1" target="_blank"
                                :title="getReversedCoordinates(geography.region.land_square)"
                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.land_square))}`"
                            >coordinates</a><br>
                            <br>
                            <span class="d-block">
                                Weather by: <a href="https://darksky.net/poweredby/" target="_blank">darksky.net</a>
                            </span>
                            <span class="d-block">
                                Trains by: <a href="http://southshore.etaspot.net" target="_blank">southshore.etaspot.net</a>
                            </span>
                            <span class="d-block">
                                Traffic by: <a href="http://mapquest.com" target="_blank">mapquest.com</a>
                            </span>
                            <span class="d-block">
                                Flight Tracking by: <a href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">aviation-edge.com</a>
                            </span>
                            <span class="d-block">
                                Vessel Tracking by: <a href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">FleetMon.com</a>
                            </span>
                        </p>
                    </div>

                </div>
            </div>
        </div>

        <div class="container" id="results">
            <div id="airquality">
                <h2 class="h5 text-left mb-0 p-2">
                    <span class="font-weight-bold">Historical Air Quality Highs <sup><a href="#note-3">[3]</a></sup></span>
                </h2>
                <div class="row mb-3">

                    <div class="col-xl-12 mt-3">
                        <div class="row no-gutters mb-2">
                            <div class="col-4">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Month</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname(getTotalAirQualityAqiScore(highs.month))"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-signal fa-3x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted">PM2.5 + PM10</small>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.month"></span>
                                            <span v-else>
                                                {{ getTotalAirQualityAqiScore(highs.month) }}
                                            </span>
                                        </p>
                                        <span class="number--blurred" v-if="! highs.month"></span>
                                        <p v-else class="small mb-0"
                                            :title="formatDateTimeToLocal(highs.month.createdAt, null)"
                                        >
                                            {{ formatDateTimeToLocal(highs.month.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="col-4">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Year</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname(getTotalAirQualityAqiScore(highs.year))"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-signal fa-3x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted">PM2.5 + PM10</small>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.year"></span>
                                            <span v-else>
                                                {{ getTotalAirQualityAqiScore(highs.year) }}
                                            </span>
                                        </p>
                                        <span class="number--blurred" v-if="! highs.year"></span>
                                        <p v-else class="small mb-0"
                                            :title="formatDateTimeToLocal(highs.year.createdAt, null)"
                                        >
                                            {{ formatDateTimeToLocal(highs.year.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="col-4">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">All Time</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname((highs.alltime) ? highs.alltime.sum : 0)"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-signal fa-3x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted">PM2.5 + PM10</small>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.alltime"></span>
                                            <span v-else>
                                                {{ highs.alltime.sum }}
                                            </span>
                                        </p>
                                        <span class="number--blurred" v-if="! highs.alltime"></span>
                                        <p v-else class="small mb-0"
                                            :title="formatDateTimeToLocal(highs.alltime.createdAt, null)"
                                        >
                                            {{ formatDateTimeToLocal(highs.alltime.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p class="mb-0 small text-right text-uppercase">
                            <a href="#" role="button" class="mb-2 d-inline-block" @click.prevent="showAqiMeanings()">
                                what do these numbers mean?<i class="fa pl-1" aria-hidden="true"
                                    :class="{
                                        'fa-chevron-down': isAqiMeaningsVisible === true,
                                        'fa-chevron-right': isAqiMeaningsVisible === false,
                                    }"
                                ></i>
                            </a>
                        </p>

                        <div v-if="isAqiMeaningsVisible">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Score</th>
                                        <th>Health Impacts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(0)">
                                            <span class="aqi-stat__stat">Good (0-50)</span>
                                        </td>
                                        <td>Minimal impact</td>
                                    </tr>
                                    <tr>
                                        <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(51)">
                                            <span class="aqi-stat__stat">Moderate (51–100)</span>
                                        </td>
                                        <td>May cause minor breathing discomfort to sensitive people.</td>
                                    </tr>
                                    <tr>
                                        <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(101)">
                                            <span class="aqi-stat__stat">Unhealthy for Sensitive Groups (101–200)</span>
                                        </td>
                                        <td>May cause breathing discomfort to people with lung disease such as asthma, and discomfort to people with heart disease, children and older adults.</td>
                                    </tr>
                                    <tr>
                                        <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(151)">
                                            <span class="aqi-stat__stat">Unhealthy (201–300)</span>
                                        </td>
                                        <td>May cause breathing discomfort to people on prolonged exposure, and discomfort to people with heart disease.</td>
                                    </tr>
                                    <tr>
                                        <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(201)">
                                            <span class="aqi-stat__stat">Very Unhealthy (301-400)</span>
                                        </td>
                                        <td>May cause respiratory illness to the people on prolonged exposure. Effect may be more pronounced in people with lung and heart diseases.</td>
                                    </tr>
                                    <tr>
                                        <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(401)">
                                            <span class="aqi-stat__stat">Hazardous (401–500)</span>
                                        </td>
                                        <td>May cause respiratory impact even on healthy people, and serious health impacts on people with lung/heart disease. The health impacts may be experienced even during light physical activity.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xl-6" id="weather">
                    <div class="table-responsive">
                        <table class="table text-monospace mb-5">
                            <tbody>
                                <tr>
                                    <td colspan="2" style="border-top:0;" class="pt-0 pb-4">
                                        <h2 class="h5 text-left mb-0 p-2">
                                            <span class="font-weight-bold">Current Weather</span>
                                        </h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">Wind</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0  font-weight-bold">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <template v-else>
                                                <span class="mr-3">
                                                    {{ airshit.REPORTED_WEATHER['windSpeed'].toFixed(0) }}-{{ airshit.REPORTED_WEATHER['windGust'].toFixed(0) }} <sub>mph</sub>
                                                </span>
                                                <span class="d-inline-block lead mb-0" :title="`wind bearing from ${airshit.REPORTED_WEATHER['windBearing']}\xB0`" :style="`transform: rotate(${degeesToRotation(airshit.REPORTED_WEATHER['windBearing'])}deg)`">
                                                    ↑
                                                </span>
                                            </template>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">Humidity</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 font-weight-bold">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ (airshit.REPORTED_WEATHER['humidity'] * 100).toFixed(0) }}</span>
                                            &nbsp;<sub>%</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">Dew Point</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 font-weight-bold">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['dewPoint'].toFixed(0)}}</span>
                                            &nbsp;<sub>&deg;F</sub>
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">Cloud Coverage</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 font-weight-bold">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ (airshit.REPORTED_WEATHER['cloudCover'] * 100).toFixed(0) }}</span>
                                            &nbsp; %
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">UV Index</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 font-weight-bold">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['uvIndex'].toFixed(0) }}</span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">Pressure</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else class="font-weight-bold">{{ (airshit.REPORTED_WEATHER['pressure'] * 0.02953).toFixed(2) }}</span>
                                            &nbsp;<sub>in Hg</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">Rain Intensity</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else class="font-weight-bold">{{ parseFloat(airshit.REPORTED_WEATHER['precipIntensity']).toFixed(2) }}</span>
                                            &nbsp;<sub>in of liquid water</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">OZone</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 font-weight-bold">
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
                                        <p class="lead  mb-0 text-lowercase">Visibility</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 font-weight-bold">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['visibility'].toFixed(0) }}</span> <sub>miles</sub>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="col-xl-6" id="industry">
                    <div class="table-responsive">
                        <table class="table text-monospace mb-0">
                            <tbody>
                                <tr>
                                    <td colspan="2" style="border-top:0;" class="pt-0 pb-4">
                                        <h2 class="h5 text-left mb-0 p-2">
                                            <span class="font-weight-bold">Current Industry</span>
                                        </h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">
                                            <abbr title="See 'Region' below for coordinates">Region</abbr> Traffic
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0 ">
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.TRAFFIC"></span>
                                                <span v-else class="font-weight-bold">{{ airshit.TRAFFIC.INCIDENTS.length }}</span>
                                                &nbsp;<small class="small font-weight-light">incidents</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.TRAFFIC"></span>
                                                <span v-else class="font-weight-bold">{{ congestionMiles }}</span>
                                                &nbsp;<small class="small font-weight-light">miles of congestion</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.TRAFFIC"></span>
                                                <span v-else class="font-weight-bold">{{ congestionTime }}</span>
                                                &nbsp;<small class="small font-weight-light">minutes of congestion</small>
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">
                                            <abbr title="See 'Region' below for coordinates">Region</abbr> Flights
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.FLIGHTS"></span>
                                                <span v-else class="font-weight-bold">{{ airshit.FLIGHTS.GYY.length }}</span>
                                                &nbsp;<small class="small font-weight-light">to/from Gary/GYY</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.FLIGHTS"></span>
                                                <span v-else class="font-weight-bold">{{ airshit.FLIGHTS.MDW.length }}</span>
                                                &nbsp;<small class="small font-weight-light">to/from Midway/MDW</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.FLIGHTS"></span>
                                                <span v-else class="font-weight-bold">{{ airshit.FLIGHTS.ORD.length }}</span>
                                                &nbsp;<small class="small font-weight-light">to/from O'Hare/ORD</small>
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">
                                            <abbr title="See 'Lake' below for coordinates">Lake</abbr> Ships
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! vessels"></span>
                                            <span v-else class="separator" v-for="(data, type) in vesselsByType" v-bind:key="type">
                                                <span class="font-weight-bold">{{ data.length }}</span> <small class="small font-weight-light">{{ type }}(s)</small>
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead mb-0 text-lowercase">
                                            <abbr title="See 'Region' below for coordinates">Region</abbr> Trains
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.TRAINS"></span>
                                            <span v-else class="font-weight-bold">{{ airshit.TRAINS.SOUTHSHORE.length }}</span>
                                            &nbsp;<small class="small font-weight-light">southshore<sup><a href="#note-2">[2]</a></sup></small>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th class="pb-0 pt-5 small text-uppercase text-right" colspan="2">


                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="container" id="historical-highs">
            <div class="row">

                <div class="col-xl-12">

                    <h2 class="small text-uppercase mb-2 text-dark">Historical Industry Highs</h2>

                    <div class="row no-gutters mb-4">
                        <div class="col-xl-3 col-6">
                            <div class="card br-0">
                                <div class="card-header">
                                    <h5 class="mb-0 card-title text-uppercase small">Ships</h5>
                                </div>
                                <div class="card-body aqi-stat"
                                >
                                    <div class="rotate">
                                        <i class="fa fa-ship fa-5x"></i>
                                    </div>
                                    <p class=" font-weight-bold mb-0 aqi-stat__stat">
                                        <span class="number--blurred" v-if="! highs.vessels"></span>
                                        <span v-else>
                                            {{ highs.vessels.count }}
                                        </span>
                                        <small class="h5 font-weight-bold text-uppercase text-muted">total</small>
                                    </p>
                                    <span class="number--blurred" v-if="! highs.vessels"></span>
                                    <p v-else class="small mb-0"
                                        :title="formatDateTimeToLocal(highs.vessels.createdAt, null)"
                                    >
                                        {{ formatDateTimeToLocal(highs.vessels.createdAt) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-3 col-6">
                            <div class="card br-0">
                                <div class="card-header">
                                    <h5 class="mb-0 card-title text-uppercase small">Flights</h5>
                                </div>
                                <div class="card-body aqi-stat"
                                >
                                    <div class="rotate">
                                        <i class="fa fa-plane fa-5x"></i>
                                    </div>

                                    <p class="font-weight-bold my-0 aqi-stat__stat">
                                        <span class="number--blurred" v-if="! highs.flights"></span>
                                        <span v-else>
                                            {{ highs.flights.count }}
                                        </span>
                                        <small class="h5 font-weight-bold text-uppercase text-muted">total</small>
                                    </p>
                                    <span class="number--blurred" v-if="! highs.flights"></span>
                                    <p v-else class="small mb-0"
                                        :title="formatDateTimeToLocal(highs.flights.createdAt, null)"
                                    >
                                        {{ formatDateTimeToLocal(highs.flights.createdAt) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-3 col-6">
                            <div class="card br-0">
                                <div class="card-header">
                                    <h5 class="mb-0 card-title text-uppercase small">Trains</h5>
                                </div>
                                <div class="card-body aqi-stat"
                                >
                                    <div class="rotate">
                                        <i class="fa fa-train fa-5x"></i>
                                    </div>
                                    <p class="font-weight-bold mb-0 aqi-stat__stat">
                                        <span class="number--blurred" v-if="! highs.trains"></span>
                                        <span v-else>
                                            {{ highs.trains.count }}
                                        </span>
                                        <small class="h5 font-weight-bold text-uppercase text-muted">total</small>
                                    </p>
                                    <span class="number--blurred" v-if="! highs.trains"></span>
                                    <p v-else class="small mb-0"
                                        :title="formatDateTimeToLocal(highs.trains.createdAt, null)"
                                    >
                                        {{ formatDateTimeToLocal(highs.trains.createdAt) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-3 col-6">
                            <div class="card br-0">
                                <div class="card-header">
                                    <h5 class="mb-0 card-title text-uppercase small">Traffic</h5>
                                </div>
                                <div class="card-body aqi-stat"
                                >
                                    <div class="rotate">
                                        <i class="fa fa-car fa-5x"></i>
                                    </div>

                                    <p class="font-weight-bold mb-0 aqi-stat__stat">
                                        <span class="number--blurred" v-if="! highs.traffic"></span>
                                        <span v-else>
                                            {{ highs.traffic.sum.toFixed(0) }}
                                        </span>
                                        <small class="h5 font-weight-bold text-uppercase text-muted">miles</small>
                                    </p>
                                    <span class="number--blurred" v-if="! highs.traffic"></span>
                                    <p v-else class="small mb-0"
                                        :title="formatDateTimeToLocal(highs.traffic.createdAt, null)"
                                    >
                                        {{ formatDateTimeToLocal(highs.traffic.createdAt) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container" id="introduction" >
            <div class="mb-5 inner">
                <p>In September 2019, a foul odor rolled through the Miller Beach neighbourhood of Gary IN, causing many residents to experience eye irritation, headaches, and nausea. This came a month after a local steel mill had <a href="https://www.in.gov/idem/cleanwater/2576.htm" target="_blank">exceeded the daily maximum allowance of cyanide and ammonia-nitrogen</a>, releasing a <a href="https://echo.epa.gov/detailed-facility-report?fid=110000607558" target="_blank">considerable amount</a> of both chemicals into a tributary of Lake Michigan which went <a href="https://chicago.cbslocal.com/2019/08/20/arcelormittal-spill-indiana-state/" target="_blank">unreported for days</a>, <a href="https://www.epa.gov/in/arcelormittal-burns-harbor-llc-portage-indiana" target="_blank">killing 1000s</a> of fish, <a href="https://apnews.com/bd9de73946954208b93cf5c9406c83c7" target="_blank">restricting intake</a> of a water filtration plant, <a href="https://www.washingtonpost.com/climate-environment/2019/08/19/cyanide-steel-plant-trickled-into-lake-michigan-days-before-public-was-notified/" target="_blank">closing local beaches</a>, and portions of the <a href="https://www.nps.gov/indu/learn/news/chemical-spill-indu-20190814.htm">Indiana Dunes National Park</a>.

                <p>Suspected the source was likely from one of the many mills/refineries in the region but with no data to support it, a handful of neighbours purchased a <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii" target="_blank">PurpleAir PA II Air Quality Sensor</a> to check the air quality in their neighbourhood in realtime, bringing awareness to how the local industry affects the air that residents and tourists of Miller Beach, Gary, &amp; Northwest Indiana breathe.</p>

                <p>By tracking the <a href="https://en.wikipedia.org/wiki/Air_quality_index" role="button" target="_blank">Air Quality Index (AQI)</a>, measuring both <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics#PM" role="button" target="_blank">PM2.5 and PM10</a> particles, temperature, humidity, atmospheric pressure, wind speed, wind direction, cloud coverage, UV index, etc. to determine how the weather and local industry affects the local air quality.</p>

                <p>There are plenty of other pollutants in the air not being tracked, such as SO₂, NO₂, CO, to name a few. As soon as affordable ways of tracking these pollutants in our neighbourhood are available, they'll be tracked add it to our data.</p>
            </div>
        </div>

        <footer class="container">
            <div class="row">
                <div class="col-md-6">
                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left">
                        Special Thanks 👏
                    </h2>
                    <p class="lead text-center text-md-left">
                        <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii" role="button" target="_blank">PurpleAir sensor</a> crowd funded by:
                    </p>
                    <ul class="lead mb-5 funded-by-list">
                        <li>Mary</li>
                        <li>Adam</li>
                        <li>Sloan</li>
                        <li>Leslie</li>
                        <li>Danielle</li>
                        <li>Kingsley</li>
                        <li>Kathy</li>
                        <li>Scott</li>
                        <li>Beth</li>
                        <li>Megan</li>
                    </ul>
                    <p class="lead partner-logo mb-5 mb-md-0 text-center text-md-left">
                        Flight tracking provided by: <a class="d-block" href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" role="button" target="_blank">
                            <img class="d-block mt-2 mx-auto mx-md-0" src="/images/aviation-edge-logo-small-medium.png" alt="Aviation Edge">
                        </a>
                    </p>
                    <p class="lead partner-logo mb-5 mt-4 mt-xs-0 mb-md-0 text-center text-md-left">
                        Vessel tracking provided by: <a class="d-block" href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" role="button" target="_blank">
                            <img class="d-block mt-2 mx-auto mx-md-0" src="/images/FleetMon-logo-medium-large.png" alt="FleetMon">
                        </a>
                    </p>
                </div>
                <div class="col-md-6 sources">
                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left">News / Links / Sources</h2>
                    <ul>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://www.chicagotribune.com/suburbs/post-tribune/ct-ptb-env-indiana-toxic-st-0328-20210326-3x4xhquoqjeglp7lqa7rim5dny-story.html" target="_blank">
                                Indiana leads US in toxic releases per square mile, EPA report states
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://waqi.info/" target="_blank">
                            World's Air Pollution: Real-time Air Quality Index
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://aqicn.org/city/usa/indiana/gary-iitri/" target="_blank">
                            IIT Research Institute's Gary, IN Air Quality Monitor
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://www.in.gov/idem/airquality/pages/monitoring_data/pm25.html" target="_blank">
                            IDEM PM2.5 Monitoring Locations
                            </a>
                            </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://www.wunderground.com/wundermap?lat=41.602&amp;lon=-87.337" target="_blank">
                            Wunderground Weather
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://airnow.gov/index.cfm?action=airnow.local_city&amp;cityid=58" target="_blank">
                            GOV/EPA Gary/Hammond Air Quality
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://echo.epa.gov/facilities/facility-search" target="_blank">
                            EPA Facility Lookup
                            </a>
                            <ul>
                                <li>e.g. <a href="https://echo.epa.gov/detailed-facility-report?fid=110000607558" target="_blank">Arcelormittal Burns Harbor</a></li>
                            </ul>
                        </li>
                        <li class="source">
                            <span class="source__type">Website:</span>
                            <a href="https://www.lung.org/our-initiatives/healthy-air/sota/city-rankings/states/indiana/lake.html" target="_blank">
                            Lake County, IN Air Quality | lung.org
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Lawsuit:</span>
                            <a href="http://elpc.org/newsroom/press-releases/60-day-notice-clean-water-act-lawsuit-arcelormittal-100-violations-permit-since-2015/" target="_blank">
                            ELPC vs. ArcelorMittal Lawsuit
                            </a>
                        </li>
                        <li class="source">
                            <span class="source__type">Study / Whitepaper:</span>
                            <a href="https://www.sciencedirect.com/science/article/pii/S0160412019301941" target="_blank">
                            The first pollution investigation of road sediment in Gary, Indiana: Anthropogenic metals and possible health implications for a socioeconomically disadvantaged area
                            </a>
                        </li>
                    </ul>

                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left mt-4">Support Us / Contribute</h2>
                    <ul class="">
                        <li>Host more <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii" target="_blank">Purple Air Quality Sensors</a> throughout NWI, adding the sensors to our data to track the air quality in the greater region, and not just localised to Miller Beach.</li>
                        <li>We use the free version for both the <a href="https://darksky.net/dev" target="_blank">weather</a> and <a href="https://developer.mapquest.com/plans" target="_blank">traffic</a> services, limiting how many times we can check the air quality per month, support us by providing a premium key so we can increase how frequently we can check.</li>
                        <li><a href="https://github.com/kingsloi/community-airmonitor" target="_blank">Fork your own version</a>, customise it for your community, and host it. Help bring awareness to your neighbourhoods air quality</li>
                        <li>Help get more accurate weather (from the same location as the sensors) <a href="https://www.indiegogo.com/projects/tempest-a-revolutionary-personal-weather-system#/" target="_blank">by purchasing this weather station kickstarter</a> for us.</li>
                        <li>Contribute to the codebase, by submitting a <a href="https://github.com/kingsloi/community-airmonitor" target="_blank">pull request</a> with your edits. It's written in Node.js & Vue.js.</li>
                        <li>Storing data is expensive, support our efforts in longer-term air quality tracking by donating cloud MongoDB hosting.</li>
                        <li>Keep this website up and running by <a href="https://www.buymeacoffee.com/kingsloi" target="_blank">buying the host a coffee</a>.</li>
                    </ul>

                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left mt-4">Notes</h2>
                    <ol class="notes-list small pl-0">
                        <li id="note-1">There is no single API or company who offer train/crossing tracking. Considering most of the industry in the region is powered by the railroads, it is unfortunate that we're not able to track all trains, especially the most pollutant coal-transporting cargo trains. Only the NICD provides a free tracking API of their commuter trains.</li>
                        <li id="note-2">NICD/Southshore Line trains are electrically powered.</li>
                        <li id="note-3">Historical highs show both PM2.5 and PM10 combined together to represent the total air quality.</li>
                    </ol>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
import L from 'leaflet';
require('leaflet-rotatedmarker');
import { API } from '@/api';
import moment from 'moment';
import _ from 'lodash';
const geo = require('geolocation-utils');

export default {
    metaInfo: {
        title: 'Miller Beach Air Quality, Weather, & Industry Dashboard',
        titleTemplate: null,
        meta: [
          { name: 'description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place." },

            {property: 'og:title', content: 'Miller Beach Air Quality, Weather, & Industry Dashboard'},
            {property: 'og:site_name', content: 'How\'s OUR Air Quality?'},
            // The list of types is available here: http://ogp.me/#types
            {property: 'og:type', content: 'website'},
            // Should the the same as your canonical link, see below.
            {property: 'og:url', content: 'https://millerbeach.community/'},
            {property: 'og:image', content: 'https://millerbeach.community/images/millerbeach-gary-nwi-air-quality-promo.jpg'},
            // Often the same as your meta description, but not always.
            {property: 'og:description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place."},

            // Twitter card
            {name: 'twitter:card', content: 'summary'},
            {name: 'twitter:site', content: 'https://millerbeach.community'},
            {name: 'twitter:title', content: 'Miller Beach / Gary / NWI Air Quality'},
            {name: 'twitter:description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place."},
            // Your twitter handle, if you have one.
            {name: 'twitter:image:src', content: 'https://millerbeach.community/images/millerbeach-gary-nwi-air-quality-promo.jpg'},

            // Google / Schema.org markup:
            {itemprop: 'name', content: 'Miller Beach / Gary / NWI Air Quality'},
            {itemprop: 'description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place."},
            {itemprop: 'image', content: 'https://millerbeach.community/images/millerbeach-gary-nwi-air-quality-promo.jpg'}
        ]
    },

    computed: {
        airshit() {
            return this.$store.state.airshit;
        },
        highs() {
            return this.$store.state.highs;
        },
        geography() {
            return this.$store.state.geography;
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
        vesselsByType() {
            const vessels = this.vessels;

            return _.groupBy(vessels, 'type');
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
        overallFlightTotal() {
            if (! this.airshit.FLIGHTS) return 0;

            return [
                this.airshit.FLIGHTS.GYY.length,
                this.airshit.FLIGHTS.MDW.length,
                this.airshit.FLIGHTS.ORD.length
            ].reduce((a, b) => { return a + b; });
        },
        overallVesselsTotal() {
            return this.vessels.length;
        },
        overallTrainsTotal() {
            return this.airshit.TRAINS.SOUTHSHORE.length;
        },
        vessels() {
            return this.$store.state.airshit.VESSELS.filter((vessel) => {
                const { lat, lng } = vessel;
                return geo.insidePolygon([lat, lng], this.geography.region.lake);
            });
        }
    },

    data() {
        return {
            isAqiMeaningsVisible: false,
            mapMaskActive: true,
        }
    },

    created () {
        this.getLatestValues();
    },

    watch: {
        '$route': 'getLatestValues'
    },

    methods: {
        removeMapMask() {
            this.mapMaskActive = false;
        },
        getLatestValues() {
            API.get(`/currently`).then(response => {
                this.$store.commit('setAirshit', response.data.airshit);
                this.$store.commit('setGeography', response.data.geography);
                this.$store.commit('setHistoricalHighs', response.data.highs);
                this.initMaps()
            })
            .catch(e => {
                alert('error!');
                console.log(e); // eslint-disable-line no-console
            });
        },

        initMaps() {
            const self = this;
            if (! document.getElementById('map')) {
                return;
            }

            const map = L.map('map', {scrollWheelZoom: false}).setView([
                this.$store.state.geography.sensor.lat, this.$store.state.geography.sensor.lng
            ], 9);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);

            const LeafIcon = L.Icon.extend({
                options: {
                    iconSize:     [20, 20],
                    iconAnchor:   [10, 10],
                    popupAnchor:  [0, 0]
                }
            });

            const root = process.env.VUE_APP_API_URL;
            const sensorIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-radio-tower-50.png`});
            const trainIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-train-50.png`});
            const aircraftIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-airport-50.png`});
            const boatIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-fishing-boat-50.png`});
            const trafficIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-traffic-jam-50.png`});
            const shitIcon = new LeafIcon({iconUrl: `${root}/images/maps/icons8-factory-50.png`});

            [{
                'lat': '41.607175',
                'lng': '-87.337602',
                'name': 'U .S. STEEL CO. GARY WORKS',
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
                `).addTo(map);
            });

            L.polygon(
                [
                    [
                        -87.520848800000024,
                        41.86284460000001
                    ],
                    [
                        -87.506119100000021,
                        41.840954800000013
                    ],
                    [
                        -87.503970100000018,
                        41.839518800000015
                    ],
                    [
                        -87.496962400000015,
                        41.829031100000016
                    ],
                    [
                        -87.494042000000022,
                        41.827299400000015
                    ],
                    [
                        -87.486009500000023,
                        41.820494800000013
                    ],
                    [
                        -87.485042800000016,
                        41.819866100000013
                    ],
                    [
                        -87.48294180000002,
                        41.817867100000015
                    ],
                    [
                        -87.482364300000015,
                        41.817025700000016
                    ],
                    [
                        -87.481459100000009,
                        41.816420800000017
                    ],
                    [
                        -87.477976000000012,
                        41.811208000000015
                    ],
                    [
                        -87.471859100000017,
                        41.807120800000014
                    ],
                    [
                        -87.453806800000024,
                        41.780103800000013
                    ],
                    [
                        -87.45019120000002,
                        41.765393200000013
                    ],
                    [
                        -87.448784800000027,
                        41.764718800000011
                    ],
                    [
                        -87.434441000000021,
                        41.766012200000013
                    ],
                    [
                        -87.418108900000021,
                        41.764395000000015
                    ],
                    [
                        -87.412108900000021,
                        41.763195000000017
                    ],
                    [
                        -87.405039700000017,
                        41.76104650000002
                    ],
                    [
                        -87.525600400000016,
                        41.733090900000022
                    ],
                    [
                        -87.529509800000014,
                        41.732304400000025
                    ],
                    [
                        -87.528747500000009,
                        41.733634900000027
                    ],
                    [
                        -87.529846100000015,
                        41.740634900000025
                    ],
                    [
                        -87.539443900000009,
                        41.740634900000025
                    ],
                    [
                        -87.539545000000004,
                        41.741034900000024
                    ],
                    [
                        -87.536941499999998,
                        41.741035400000023
                    ],
                    [
                        -87.530145000000005,
                        41.74153500000002
                    ],
                    [
                        -87.530746399999998,
                        41.748233400000018
                    ],
                    [
                        -87.537147500000003,
                        41.750835400000021
                    ],
                    [
                        -87.542846600000004,
                        41.752136200000024
                    ],
                    [
                        -87.543946000000005,
                        41.755135000000024
                    ],
                    [
                        -87.541847200000007,
                        41.756336200000021
                    ],
                    [
                        -87.54034510000001,
                        41.757534800000023
                    ],
                    [
                        -87.543144200000015,
                        41.760032600000024
                    ],
                    [
                        -87.546653700000022,
                        41.758731800000021
                    ],
                    [
                        -87.547645500000016,
                        41.758533400000019
                    ],
                    [
                        -87.550646000000015,
                        41.758934000000018
                    ],
                    [
                        -87.553367600000016,
                        41.760368300000017
                    ],
                    [
                        -87.55484770000001,
                        41.761959000000019
                    ],
                    [
                        -87.555526700000016,
                        41.761730100000015
                    ],
                    [
                        -87.55754850000001,
                        41.763134000000015
                    ],
                    [
                        -87.559246000000016,
                        41.765034000000014
                    ],
                    [
                        -87.56064600000002,
                        41.766033100000016
                    ],
                    [
                        -87.559349300000022,
                        41.769324700000013
                    ],
                    [
                        -87.562647000000027,
                        41.769534000000014
                    ],
                    [
                        -87.565647000000027,
                        41.774133900000017
                    ],
                    [
                        -87.561764000000025,
                        41.776400000000017
                    ],
                    [
                        -87.562858500000019,
                        41.780632000000018
                    ],
                    [
                        -87.569046000000014,
                        41.780532800000017
                    ],
                    [
                        -87.571046900000013,
                        41.78063400000002
                    ],
                    [
                        -87.568848300000013,
                        41.78143350000002
                    ],
                    [
                        -87.576347300000009,
                        41.786033600000017
                    ],
                    [
                        -87.576583800000009,
                        41.788139100000016
                    ],
                    [
                        -87.577248000000012,
                        41.788234000000017
                    ],
                    [
                        -87.576548000000017,
                        41.78833400000002
                    ],
                    [
                        -87.575950600000013,
                        41.788635200000023
                    ],
                    [
                        -87.578548000000012,
                        41.794134000000021
                    ],
                    [
                        -87.576948000000016,
                        41.795034000000022
                    ],
                    [
                        -87.575851400000019,
                        41.795135400000021
                    ],
                    [
                        -87.574848000000017,
                        41.795734000000017
                    ],
                    [
                        -87.575248700000017,
                        41.796932200000015
                    ],
                    [
                        -87.577049200000019,
                        41.796932200000015
                    ],
                    [
                        -87.579448000000014,
                        41.798434000000015
                    ],
                    [
                        -87.580148000000008,
                        41.799634000000012
                    ],
                    [
                        -87.580148000000008,
                        41.802534000000009
                    ],
                    [
                        -87.579551600000002,
                        41.803833000000012
                    ],
                    [
                        -87.580947800000004,
                        41.80433270000001
                    ],
                    [
                        -87.586648000000011,
                        41.81023290000001
                    ],
                    [
                        -87.586649000000008,
                        41.811533000000011
                    ],
                    [
                        -87.590349000000003,
                        41.81363300000001
                    ],
                    [
                        -87.59224900000001,
                        41.816933000000013
                    ],
                    [
                        -87.597351000000003,
                        41.823432900000014
                    ],
                    [
                        -87.598548800000003,
                        41.824432300000012
                    ],
                    [
                        -87.598549000000006,
                        41.82563300000001
                    ],
                    [
                        -87.600549000000001,
                        41.826833000000008
                    ],
                    [
                        -87.601650000000006,
                        41.829733000000004
                    ],
                    [
                        -87.6025499,
                        41.830533000000003
                    ],
                    [
                        -87.602951000000004,
                        41.831333100000002
                    ],
                    [
                        -87.603349800000004,
                        41.832932300000003
                    ],
                    [
                        -87.6048507,
                        41.833534200000003
                    ],
                    [
                        -87.604553199999998,
                        41.834831200000004
                    ],
                    [
                        -87.609451199999995,
                        41.845233900000004
                    ],
                    [
                        -87.609352099999995,
                        41.846233300000002
                    ],
                    [
                        -87.611450099999999,
                        41.850231100000002
                    ],
                    [
                        -87.610849999999999,
                        41.851433
                    ],
                    [
                        -87.610849999999999,
                        41.852832900000003
                    ],
                    [
                        -87.611853800000006,
                        41.855032400000006
                    ],
                    [
                        -87.61210100000001,
                        41.854983000000004
                    ],
                    [
                        -87.612953100000013,
                        41.855632700000001
                    ],
                    [
                        -87.612953100000013,
                        41.857032699999998
                    ],
                    [
                        -87.612251200000017,
                        41.8585323
                    ],
                    [
                        -87.612503000000018,
                        41.860984799999997
                    ],
                    [
                        -87.612651000000014,
                        41.865232999999996
                    ],
                    [
                        -87.61245120000001,
                        41.865234299999997
                    ],
                    [
                        -87.612551000000011,
                        41.865732999999999
                    ],
                    [
                        -87.610549900000009,
                        41.865734099999997
                    ],
                    [
                        -87.610649100000003,
                        41.865234299999997
                    ],
                    [
                        -87.610500999999999,
                        41.865232999999996
                    ],
                    [
                        -87.609848,
                        41.862331299999994
                    ],
                    [
                        -87.610350999999994,
                        41.861332999999995
                    ],
                    [
                        -87.610450700000001,
                        41.859233799999991
                    ],
                    [
                        -87.610050999999999,
                        41.858582999999989
                    ],
                    [
                        -87.610050999999999,
                        41.857735899999987
                    ],
                    [
                        -87.609298699999997,
                        41.856532999999985
                    ],
                    [
                        -87.609450999999993,
                        41.856432999999981
                    ],
                    [
                        -87.609748799999991,
                        41.853534599999982
                    ],
                    [
                        -87.608749299999985,
                        41.853134099999984
                    ],
                    [
                        -87.606353699999985,
                        41.853233299999985
                    ],
                    [
                        -87.606850999999992,
                        41.859932999999984
                    ],
                    [
                        -87.60595099999999,
                        41.860332999999983
                    ],
                    [
                        -87.606050899999985,
                        41.862032899999981
                    ],
                    [
                        -87.606353699999985,
                        41.861934599999984
                    ],
                    [
                        -87.607063799999992,
                        41.863215899999986
                    ],
                    [
                        -87.518624399999993,
                        41.874459299999984
                    ],
                    [
                        -87.520848800000024,
                        41.86284460000001
                    ]
                ].map(ll => ll.reverse()),
                {
                    color: '#3388ff',
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                    opacity: 0.15,
                }
            ).addTo(map)
            .bindPopup("LMZ742: Northerly Island IL, Calumet Harbor IL");

            L.polygon(
                [
                    [
                        -87.580348000000001,
                        41.786034000000001
                    ],
                    [
                        -87.579954000000001,
                        41.784911999999998
                    ],
                    [
                        -87.579635600000003,
                        41.784644999999998
                    ],
                    [
                        -87.57906340000001,
                        41.783588399999999
                    ],
                    [
                        -87.57851500000001,
                        41.783619999999999
                    ],
                    [
                        -87.578451000000015,
                        41.783304000000001
                    ],
                    [
                        -87.578937900000014,
                        41.782737000000004
                    ],
                    [
                        -87.580848000000017,
                        41.782134000000006
                    ],
                    [
                        -87.580674000000016,
                        41.782879000000008
                    ],
                    [
                        -87.580825800000014,
                        41.783588400000006
                    ],
                    [
                        -87.581161400000013,
                        41.783683700000005
                    ],
                    [
                        -87.581119000000015,
                        41.784140000000008
                    ],
                    [
                        -87.58133100000002,
                        41.784266000000009
                    ],
                    [
                        -87.581796000000026,
                        41.785747000000008
                    ],
                    [
                        -87.581748000000019,
                        41.786034000000008
                    ],
                    [
                        -87.580348000000001,
                        41.786034000000001
                    ]
                ].map(ll => ll.reverse()),
                {
                    color: '#3388ff',
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                    opacity: 0.15,
                }
            ).addTo(map)
            .bindPopup("LMZ743: Calumet Harbor, IL to Gary, IN");

            L.polygon(
                [
                    [
                        -87.345618000000002,
                        41.715251600000002
                    ],
                    [
                        -87.332816699999995,
                        41.709113600000002
                    ],
                    [
                        -87.31941119999999,
                        41.707823600000005
                    ],
                    [
                        -87.316200899999984,
                        41.707043200000008
                    ],
                    [
                        -87.31276179999999,
                        41.706685100000009
                    ],
                    [
                        -87.358411999999987,
                        41.628187200000006
                    ],
                    [
                        -87.365440299999989,
                        41.629535600000004
                    ],
                    [
                        -87.374838999999994,
                        41.631735900000002
                    ],
                    [
                        -87.399543699999995,
                        41.6386337
                    ],
                    [
                        -87.404540999999995,
                        41.640533400000002
                    ],
                    [
                        -87.413839899999999,
                        41.643035000000005
                    ],
                    [
                        -87.423439000000002,
                        41.642833700000004
                    ],
                    [
                        -87.429839999999999,
                        41.646034200000003
                    ],
                    [
                        -87.433441099999996,
                        41.648933400000004
                    ],
                    [
                        -87.433640799999992,
                        41.650733600000002
                    ],
                    [
                        -87.434540999999996,
                        41.650535000000005
                    ],
                    [
                        -87.435142499999998,
                        41.653335500000004
                    ],
                    [
                        -87.436743300000003,
                        41.653933900000006
                    ],
                    [
                        -87.438141000000002,
                        41.653335000000006
                    ],
                    [
                        -87.438941900000003,
                        41.654335000000003
                    ],
                    [
                        -87.43754100000001,
                        41.654735000000002
                    ],
                    [
                        -87.437441000000007,
                        41.655335000000001
                    ],
                    [
                        -87.434341900000007,
                        41.656334700000002
                    ],
                    [
                        -87.435740900000013,
                        41.658535000000001
                    ],
                    [
                        -87.433841000000015,
                        41.658435900000001
                    ],
                    [
                        -87.433944700000012,
                        41.659435199999997
                    ],
                    [
                        -87.429241000000019,
                        41.663734999999996
                    ],
                    [
                        -87.427841100000023,
                        41.663535999999993
                    ],
                    [
                        -87.424041000000017,
                        41.665734999999991
                    ],
                    [
                        -87.42084100000001,
                        41.667934999999993
                    ],
                    [
                        -87.418741000000011,
                        41.670234999999991
                    ],
                    [
                        -87.418941000000018,
                        41.671834999999994
                    ],
                    [
                        -87.417841000000024,
                        41.673134999999995
                    ],
                    [
                        -87.416839500000023,
                        41.671836799999994
                    ],
                    [
                        -87.41763960000003,
                        41.671333899999993
                    ],
                    [
                        -87.417138000000023,
                        41.670937299999991
                    ],
                    [
                        -87.415241000000023,
                        41.672434999999993
                    ],
                    [
                        -87.428443900000019,
                        41.68153379999999
                    ],
                    [
                        -87.434441000000021,
                        41.682734999999987
                    ],
                    [
                        -87.435539200000022,
                        41.682533199999988
                    ],
                    [
                        -87.441224800000029,
                        41.679142399999989
                    ],
                    [
                        -87.434738100000033,
                        41.682136499999991
                    ],
                    [
                        -87.429039000000031,
                        41.68093489999999
                    ],
                    [
                        -87.427741000000026,
                        41.680134999999993
                    ],
                    [
                        -87.443054100000026,
                        41.667652099999991
                    ],
                    [
                        -87.449541000000025,
                        41.673234999999991
                    ],
                    [
                        -87.453041000000027,
                        41.673034599999994
                    ],
                    [
                        -87.455841000000021,
                        41.673633499999994
                    ],
                    [
                        -87.45414390000002,
                        41.673634999999997
                    ],
                    [
                        -87.458642000000026,
                        41.675134999999997
                    ],
                    [
                        -87.462456000000032,
                        41.676913999999996
                    ],
                    [
                        -87.46280670000003,
                        41.676738699999994
                    ],
                    [
                        -87.46314230000003,
                        41.675533199999997
                    ],
                    [
                        -87.47074200000003,
                        41.672834999999999
                    ],
                    [
                        -87.471740700000026,
                        41.673133800000002
                    ],
                    [
                        -87.475944500000026,
                        41.675033500000005
                    ],
                    [
                        -87.48114200000002,
                        41.678635000000007
                    ],
                    [
                        -87.485942000000023,
                        41.680635000000009
                    ],
                    [
                        -87.485145500000016,
                        41.682834600000007
                    ],
                    [
                        -87.490844700000011,
                        41.684234600000003
                    ],
                    [
                        -87.501045200000007,
                        41.689033500000001
                    ],
                    [
                        -87.505343000000011,
                        41.691535000000002
                    ],
                    [
                        -87.508941600000014,
                        41.694133700000002
                    ],
                    [
                        -87.511043000000015,
                        41.696535000000004
                    ],
                    [
                        -87.51654400000001,
                        41.703335000000003
                    ],
                    [
                        -87.515243500000011,
                        41.704235000000004
                    ],
                    [
                        -87.520545600000005,
                        41.709933900000003
                    ],
                    [
                        -87.52334590000001,
                        41.708133600000004
                    ],
                    [
                        -87.524044000000004,
                        41.708335000000005
                    ],
                    [
                        -87.526831000000001,
                        41.709773000000006
                    ],
                    [
                        -87.527633600000001,
                        41.710773400000008
                    ],
                    [
                        -87.526230999999996,
                        41.71227300000001
                    ],
                    [
                        -87.528230999999991,
                        41.715173000000007
                    ],
                    [
                        -87.524230899999992,
                        41.717273600000006
                    ],
                    [
                        -87.524216899999999,
                        41.718354000000005
                    ],
                    [
                        -87.524917599999995,
                        41.719543400000006
                    ],
                    [
                        -87.525041999999999,
                        41.720424000000008
                    ],
                    [
                        -87.524993999999992,
                        41.721440000000008
                    ],
                    [
                        -87.524713999999989,
                        41.721980000000009
                    ],
                    [
                        -87.524162199999992,
                        41.722438800000006
                    ],
                    [
                        -87.524140999999986,
                        41.723990000000008
                    ],
                    [
                        -87.525040999999987,
                        41.725090000000009
                    ],
                    [
                        -87.529509799999985,
                        41.732304400000011
                    ],
                    [
                        -87.525600399999988,
                        41.733090900000008
                    ],
                    [
                        -87.405039699999989,
                        41.761046500000006
                    ],
                    [
                        -87.396572099999986,
                        41.758473100000003
                    ],
                    [
                        -87.381038699999991,
                        41.750004800000006
                    ],
                    [
                        -87.367006199999992,
                        41.740320900000007
                    ],
                    [
                        -87.356355099999988,
                        41.731320800000006
                    ],
                    [
                        -87.345618000000002,
                        41.715251600000002
                    ]
                ].map(ll => ll.reverse()),
                {
                    color: '#3388ff',
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                    opacity: 0.15,
                }
            ).addTo(map)
            .bindPopup("LMZ743: Calumet Harbor, IL to Gary, IN");

            L.polygon(
                [
                    [
                        -87.183239599999993,
                        41.723321400000003
                    ],
                    [
                        -87.152736499999989,
                        41.644664800000001
                    ],
                    [
                        -87.156676099999984,
                        41.644618299999998
                    ],
                    [
                        -87.156829799999983,
                        41.639392799999996
                    ],
                    [
                        -87.15715019999999,
                        41.639110499999994
                    ],
                    [
                        -87.157180699999984,
                        41.632835299999996
                    ],
                    [
                        -87.160325999999984,
                        41.632839999999995
                    ],
                    [
                        -87.160240999999985,
                        41.637344099999993
                    ],
                    [
                        -87.174728299999984,
                        41.634342099999991
                    ],
                    [
                        -87.174674999999979,
                        41.635156999999992
                    ],
                    [
                        -87.17536149999998,
                        41.635171899999989
                    ],
                    [
                        -87.175231899999986,
                        41.632835299999989
                    ],
                    [
                        -87.179570999999981,
                        41.631492999999992
                    ],
                    [
                        -87.187650999999988,
                        41.62965299999999
                    ],
                    [
                        -87.190978999999984,
                        41.629268599999989
                    ],
                    [
                        -87.196159299999991,
                        41.628131799999991
                    ],
                    [
                        -87.19686879999999,
                        41.628147099999993
                    ],
                    [
                        -87.197379999999995,
                        41.627921999999991
                    ],
                    [
                        -87.201217599999993,
                        41.627315499999987
                    ],
                    [
                        -87.202210999999991,
                        41.627347999999991
                    ],
                    [
                        -87.203090999999986,
                        41.627059999999993
                    ],
                    [
                        -87.20873899999998,
                        41.626211999999995
                    ],
                    [
                        -87.209342899999982,
                        41.625923099999994
                    ],
                    [
                        -87.219787499999981,
                        41.624370499999998
                    ],
                    [
                        -87.222595199999986,
                        41.624237000000001
                    ],
                    [
                        -87.261535599999988,
                        41.6203346
                    ],
                    [
                        -87.270934999999994,
                        41.619934000000001
                    ],
                    [
                        -87.2873369,
                        41.619535900000002
                    ],
                    [
                        -87.287636800000001,
                        41.622234300000002
                    ],
                    [
                        -87.298437000000007,
                        41.622736000000003
                    ],
                    [
                        -87.324340800000002,
                        41.623035400000006
                    ],
                    [
                        -87.324138099999999,
                        41.624534600000004
                    ],
                    [
                        -87.324836700000006,
                        41.624534600000004
                    ],
                    [
                        -87.324981600000001,
                        41.616996700000001
                    ],
                    [
                        -87.324836700000006,
                        41.615234300000004
                    ],
                    [
                        -87.324338000000012,
                        41.611336000000001
                    ],
                    [
                        -87.32343800000001,
                        41.610436
                    ],
                    [
                        -87.32343800000001,
                        41.609236000000003
                    ],
                    [
                        -87.324637900000013,
                        41.608835900000003
                    ],
                    [
                        -87.325738000000015,
                        41.609236000000003
                    ],
                    [
                        -87.325538600000016,
                        41.624534600000004
                    ],
                    [
                        -87.327507000000011,
                        41.624942700000005
                    ],
                    [
                        -87.355538900000013,
                        41.627636000000003
                    ],
                    [
                        -87.358412000000015,
                        41.628187199999999
                    ],
                    [
                        -87.312761800000018,
                        41.706685100000001
                    ],
                    [
                        -87.308911100000017,
                        41.706138299999999
                    ],
                    [
                        -87.297521900000021,
                        41.706008099999998
                    ],
                    [
                        -87.295947000000027,
                        41.705685899999999
                    ],
                    [
                        -87.294585600000033,
                        41.705924099999997
                    ],
                    [
                        -87.28378560000003,
                        41.705424099999995
                    ],
                    [
                        -87.273688200000024,
                        41.703171599999997
                    ],
                    [
                        -87.267556900000017,
                        41.703432499999998
                    ],
                    [
                        -87.229493100000013,
                        41.707171099999996
                    ],
                    [
                        -87.222885800000014,
                        41.708076999999996
                    ],
                    [
                        -87.221153000000015,
                        41.708558699999998
                    ],
                    [
                        -87.217969000000011,
                        41.709038700000001
                    ],
                    [
                        -87.215712900000014,
                        41.709207800000001
                    ],
                    [
                        -87.214038700000017,
                        41.709636700000004
                    ],
                    [
                        -87.209929500000015,
                        41.710307500000006
                    ],
                    [
                        -87.207231800000017,
                        41.712110100000004
                    ],
                    [
                        -87.200765800000013,
                        41.713396200000005
                    ],
                    [
                        -87.188544800000017,
                        41.721562100000007
                    ],
                    [
                        -87.18469420000001,
                        41.722349500000007
                    ],
                    [
                        -87.183239599999993,
                        41.723321400000003
                    ]
                ].map(ll => ll.reverse()),
                {
                    color: '#3388ff',
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                    opacity: 0.15,
                }
            ).addTo(map)
            .bindPopup("LMZ744: Gary, IN to Burns Harbor, IN");

            L.polygon(
                [
                    [
                        -86.958828100000005,
                        41.791968400000002
                    ],
                    [
                        -86.907693899999998,
                        41.7242988
                    ],
                    [
                        -86.907829199999995,
                        41.724239300000001
                    ],
                    [
                        -86.907429999999991,
                        41.723039
                    ],
                    [
                        -86.906332199999994,
                        41.722240599999999
                    ],
                    [
                        -86.905433599999995,
                        41.722339599999998
                    ],
                    [
                        -86.9044265,
                        41.722740099999996
                    ],
                    [
                        -86.905429999999996,
                        41.721638999999996
                    ],
                    [
                        -86.9062299,
                        41.721338999999993
                    ],
                    [
                        -86.907432499999999,
                        41.721538499999994
                    ],
                    [
                        -86.909728999999999,
                        41.724136299999991
                    ],
                    [
                        -86.913330000000002,
                        41.722537999999993
                    ],
                    [
                        -86.916526700000006,
                        41.716537399999993
                    ],
                    [
                        -86.921928399999999,
                        41.714836099999992
                    ],
                    [
                        -86.922332699999998,
                        41.713836599999993
                    ],
                    [
                        -86.929329899999999,
                        41.711137999999991
                    ],
                    [
                        -86.932747500000005,
                        41.710141499999992
                    ],
                    [
                        -86.933021500000009,
                        41.710197399999991
                    ],
                    [
                        -86.937149000000005,
                        41.708820299999992
                    ],
                    [
                        -86.939950899999999,
                        41.708085999999994
                    ],
                    [
                        -86.943931500000005,
                        41.706676399999992
                    ],
                    [
                        -86.945419300000012,
                        41.706340699999991
                    ],
                    [
                        -86.947807000000012,
                        41.705221999999992
                    ],
                    [
                        -86.950719000000007,
                        41.704261999999993
                    ],
                    [
                        -86.975983000000014,
                        41.694773999999995
                    ],
                    [
                        -86.979583000000019,
                        41.693029999999993
                    ],
                    [
                        -86.986336000000023,
                        41.690725999999991
                    ],
                    [
                        -86.993118200000026,
                        41.687908099999994
                    ],
                    [
                        -86.998848000000024,
                        41.685732999999992
                    ],
                    [
                        -87.00126400000002,
                        41.684612999999992
                    ],
                    [
                        -87.003677300000021,
                        41.68384549999999
                    ],
                    [
                        -87.005599900000021,
                        41.682868899999988
                    ],
                    [
                        -87.013344000000018,
                        41.680276899999988
                    ],
                    [
                        -87.020286500000012,
                        41.677379599999988
                    ],
                    [
                        -87.021279600000014,
                        41.677172999999989
                    ],
                    [
                        -87.027885400000017,
                        41.674659699999992
                    ],
                    [
                        -87.034431400000017,
                        41.672756099999994
                    ],
                    [
                        -87.035980200000012,
                        41.672069499999992
                    ],
                    [
                        -87.036483100000012,
                        41.672019999999989
                    ],
                    [
                        -87.037792900000014,
                        41.671412999999987
                    ],
                    [
                        -87.038369000000017,
                        41.67133299999999
                    ],
                    [
                        -87.044096900000014,
                        41.669188999999989
                    ],
                    [
                        -87.045150700000008,
                        41.668899499999988
                    ],
                    [
                        -87.047279300000014,
                        41.668899499999988
                    ],
                    [
                        -87.048240600000014,
                        41.668212799999985
                    ],
                    [
                        -87.054209000000014,
                        41.665956999999985
                    ],
                    [
                        -87.058143600000008,
                        41.664836799999982
                    ],
                    [
                        -87.065025000000006,
                        41.662180899999981
                    ],
                    [
                        -87.069441000000012,
                        41.660868999999984
                    ],
                    [
                        -87.071647600000006,
                        41.659988399999982
                    ],
                    [
                        -87.076065,
                        41.658644999999979
                    ],
                    [
                        -87.076913000000005,
                        41.658548999999979
                    ],
                    [
                        -87.077453599999998,
                        41.658195399999983
                    ],
                    [
                        -87.081008999999995,
                        41.657172999999986
                    ],
                    [
                        -87.083122199999991,
                        41.656371999999983
                    ],
                    [
                        -87.097200599999994,
                        41.652292999999986
                    ],
                    [
                        -87.099075299999996,
                        41.651508299999989
                    ],
                    [
                        -87.108032199999997,
                        41.649028699999988
                    ],
                    [
                        -87.1096979,
                        41.648756899999988
                    ],
                    [
                        -87.121990999999994,
                        41.645186999999986
                    ],
                    [
                        -87.125794999999997,
                        41.649300999999987
                    ],
                    [
                        -87.125834999999995,
                        41.650301999999989
                    ],
                    [
                        -87.127636899999999,
                        41.649980899999989
                    ],
                    [
                        -87.130715600000002,
                        41.650088899999986
                    ],
                    [
                        -87.1316609,
                        41.649812999999988
                    ],
                    [
                        -87.132649000000001,
                        41.649783899999989
                    ],
                    [
                        -87.133499,
                        41.649405999999992
                    ],
                    [
                        -87.1353759,
                        41.649024899999993
                    ],
                    [
                        -87.138206999999994,
                        41.649203699999994
                    ],
                    [
                        -87.138687099999999,
                        41.649013499999995
                    ],
                    [
                        -87.140749999999997,
                        41.649142999999995
                    ],
                    [
                        -87.1458133,
                        41.650094499999994
                    ],
                    [
                        -87.146147999999997,
                        41.647908999999991
                    ],
                    [
                        -87.146023,
                        41.63800599999999
                    ],
                    [
                        -87.146522500000003,
                        41.637534999999993
                    ],
                    [
                        -87.146923999999999,
                        41.637449999999994
                    ],
                    [
                        -87.147789000000003,
                        41.637393899999992
                    ],
                    [
                        -87.147777000000005,
                        41.637910999999995
                    ],
                    [
                        -87.148858000000004,
                        41.637967999999994
                    ],
                    [
                        -87.148689200000007,
                        41.642715399999993
                    ],
                    [
                        -87.150003000000012,
                        41.642761999999991
                    ],
                    [
                        -87.149887000000007,
                        41.643218899999994
                    ],
                    [
                        -87.149188900000013,
                        41.643291099999992
                    ],
                    [
                        -87.148950000000013,
                        41.644706699999993
                    ],
                    [
                        -87.152736500000017,
                        41.644664799999994
                    ],
                    [
                        -87.183239600000022,
                        41.723321399999996
                    ],
                    [
                        -87.177684800000023,
                        41.727033099999993
                    ],
                    [
                        -87.145816000000025,
                        41.733372199999991
                    ],
                    [
                        -87.137801200000027,
                        41.732624699999988
                    ],
                    [
                        -87.136161200000032,
                        41.732987099999988
                    ],
                    [
                        -87.134660800000034,
                        41.732936899999991
                    ],
                    [
                        -87.130717000000033,
                        41.733366199999992
                    ],
                    [
                        -87.129893000000038,
                        41.73323169999999
                    ],
                    [
                        -87.125835000000038,
                        41.733579199999987
                    ],
                    [
                        -87.122604600000031,
                        41.732936599999988
                    ],
                    [
                        -87.118659600000029,
                        41.732682199999985
                    ],
                    [
                        -87.11639660000003,
                        41.733334299999989
                    ],
                    [
                        -87.098600200000035,
                        41.738748799999989
                    ],
                    [
                        -87.084408500000038,
                        41.743795399999989
                    ],
                    [
                        -87.081389800000039,
                        41.744708899999992
                    ],
                    [
                        -87.079149800000039,
                        41.745839099999991
                    ],
                    [
                        -87.075730100000044,
                        41.746595499999991
                    ],
                    [
                        -87.074874300000047,
                        41.747120699999989
                    ],
                    [
                        -87.074090300000051,
                        41.74737669999999
                    ],
                    [
                        -87.071563000000054,
                        41.747796199999989
                    ],
                    [
                        -87.058361500000061,
                        41.752522099999986
                    ],
                    [
                        -87.053829600000057,
                        41.753792499999989
                    ],
                    [
                        -87.047821800000051,
                        41.755985599999988
                    ],
                    [
                        -87.045212800000044,
                        41.757215099999989
                    ],
                    [
                        -87.029925200000051,
                        41.762832899999992
                    ],
                    [
                        -87.029298500000053,
                        41.763243299999992
                    ],
                    [
                        -87.026956000000055,
                        41.764051499999994
                    ],
                    [
                        -87.018272200000055,
                        41.767636099999997
                    ],
                    [
                        -87.015351700000053,
                        41.768218299999994
                    ],
                    [
                        -87.013226600000053,
                        41.769542099999995
                    ],
                    [
                        -87.010359000000051,
                        41.770520499999996
                    ],
                    [
                        -87.007851800000054,
                        41.771712099999995
                    ],
                    [
                        -87.006398800000056,
                        41.772001099999997
                    ],
                    [
                        -87.005258400000059,
                        41.7727358
                    ],
                    [
                        -86.979997100000062,
                        41.782222699999998
                    ],
                    [
                        -86.979162800000069,
                        41.782393299999995
                    ],
                    [
                        -86.976923800000066,
                        41.783408099999995
                    ],
                    [
                        -86.97381170000007,
                        41.784350799999999
                    ],
                    [
                        -86.972597200000067,
                        41.785060999999999
                    ],
                    [
                        -86.970091100000062,
                        41.785644300000001
                    ],
                    [
                        -86.967182100000059,
                        41.786706200000005
                    ],
                    [
                        -86.966275900000056,
                        41.786994200000002
                    ],
                    [
                        -86.958828100000005,
                        41.791968400000002
                    ]
                ].map(ll => ll.reverse()),
                {
                    color: '#3388ff',
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                    opacity: 0.15,
                }
            ).addTo(map)
            .bindPopup("LMZ745: Burns Harbor, IN to Michigan City, IN");

            L.polygon(
                [
                    [
                        -86.749599900000007,
                        41.800300999999997
                    ],
                    [
                        -86.777227000000011,
                        41.784739999999999
                    ],
                    [
                        -86.802427400000013,
                        41.771939199999998
                    ],
                    [
                        -86.801925600000018,
                        41.771240200000001
                    ],
                    [
                        -86.804028000000017,
                        41.771039999999999
                    ],
                    [
                        -86.824485300000021,
                        41.7604179
                    ],
                    [
                        -86.837226800000025,
                        41.754440299999999
                    ],
                    [
                        -86.860929000000027,
                        41.743839000000001
                    ],
                    [
                        -86.875198300000022,
                        41.7380104
                    ],
                    [
                        -86.888930000000016,
                        41.732638999999999
                    ],
                    [
                        -86.909126200000017,
                        41.726936299999998
                    ],
                    [
                        -86.908927900000023,
                        41.726638699999995
                    ],
                    [
                        -86.905929500000028,
                        41.727439799999992
                    ],
                    [
                        -86.905303900000021,
                        41.725341699999994
                    ],
                    [
                        -86.907693900000027,
                        41.724298799999993
                    ],
                    [
                        -86.958828100000034,
                        41.791968399999995
                    ],
                    [
                        -86.940998800000031,
                        41.803876099999997
                    ],
                    [
                        -86.931755700000025,
                        41.807082599999994
                    ],
                    [
                        -86.91552310000003,
                        41.811663599999996
                    ],
                    [
                        -86.893630300000027,
                        41.820439999999998
                    ],
                    [
                        -86.86146410000002,
                        41.835051199999995
                    ],
                    [
                        -86.840858300000022,
                        41.845667599999999
                    ],
                    [
                        -86.840139900000025,
                        41.846188900000001
                    ],
                    [
                        -86.816533600000028,
                        41.858178800000005
                    ],
                    [
                        -86.806355700000026,
                        41.863909100000008
                    ],
                    [
                        -86.749599900000007,
                        41.800300999999997
                    ]
                ].map(ll => ll.reverse()),
                {
                    color: '#3388ff',
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                    opacity: 0.15,
                }
            ).addTo(map)
            .bindPopup("LMZ046: Michigan City, IN to New Buffalo, MI");

            L.marker([this.geography.sensor.lat, this.geography.sensor.lng], {icon: sensorIcon}).bindPopup(`
                Base Station, PM2.5/PM10 sensor, AIS antenna, and reported weather are recorded from this location.
            `).addTo(map);

            for (const airport in this.$store.state.airshit.FLIGHTS) {
                const flights = this.$store.state.airshit.FLIGHTS[airport];
                flights.forEach((flight) => {
                    L.marker([flight.lat, flight.lng], {icon: aircraftIcon, rotationAngle: flight.bearing}).bindPopup(`
                        Aircraft: ${flight.aircraft}<br>
                        Flight: <a href="https://www.planemapper.com/flights/${flight.flight}" target="_blank">${flight.flight}</a> <small>(open in new window)</small><br>
                        Departing: ${flight.departing}, Arriving: ${flight.arriving}<br>
                        Speed: ${flight.speed}<br>
                        Bearing: ${flight.bearing}<br>
                        Altitude: ${flight.alt}<br>
                    `).addTo(map);
                });
            }

            for (const line in this.$store.state.airshit.TRAINS) {
                const trains = this.$store.state.airshit.TRAINS[line];
                trains.forEach((train) => {
                    const trainAngle = (train.direction === 'East' ? 90 : 270);
                    L.marker([train.lat, train.lng], {icon: trainIcon, rotationAngle: trainAngle}).bindPopup(`
                        ID: ${train.id}<br>
                        Direction: ${train.direction}
                    `).addTo(map);
                });
            }

            self.vessels.forEach((vessel) => {
                const vesselAngle = (vessel.direction ? this.degeesToRotation(vessel.direction) : 0);
                L.marker([vessel.lat, vessel.lng], {icon: boatIcon, rotationAngle: vesselAngle}).bindPopup(`
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
                `).addTo(map);
            });

            this.$store.state.airshit.TRAFFIC.INCIDENTS.forEach((incident) => {
                L.marker([incident.lat, incident.lng], {icon: trafficIcon}).bindPopup(`
                    ${incident.shortDesc}<br>
                    <br>
                    Distance: ${incident.distance}<br>
                    Minute Delay: ${incident.freeFlowMinDelay}<br>
                    Started: ${incident.startTime}<br>
                    Ending: ${incident.endTime}<br>
                `).addTo(map);
            });
        },

        degeesToRotation(angle) {
            return angle;
            // return (angle + 180) % 360;
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

        getAqiScoreStatClassname(total) {
            return `aqi-stat--${this.getOverallAqiScore(total)}`;
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

        getTotalAirQualityAqiScore(airshit) {
            if (! airshit) return 0;

            const pm25 = airshit.PM25REALTIME && airshit.PM25REALTIME.aqi || 0;
            const pm10 = airshit.PM10REALTIME && airshit.PM10REALTIME.aqi || 0;

            return pm25 + pm10;
        },

        formatDateTimeToLocal(datetime, format = 'Do MMM YY HH:mm') {
            return moment.utc(datetime).local().format(format);
        },

        formatDateTimeDiffToLocalHuman(datetime) {
            const moment1 = moment.utc(datetime);
            const moment2 = moment().utc();
            return moment.duration(moment1.diff(moment2)).humanize();
        },

        getReversedCoordinates(region) {
            return region.map((coordinates) => {
                return [...coordinates].reverse();
            }).join('\r\n');
        },

        showAlert(msg) {
            return alert(msg);
        },

        showAqiMeanings() {
            this.isAqiMeaningsVisible = ! this.isAqiMeaningsVisible;
        },
    },

    mounted() {
    },
}
</script>

<style scoped>
</style>
