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
                <div class="col-xl-6 mt-2">
                    <h2 class="h2 text-left">
                        <span class="text--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                        <div v-else>
                            <span class="highlighted">{{ formatDateTimeDiffToLocalHuman(airshit.createdAt) }}</span> ago, the <span class="highlighted">weather</span> was reported as
                            <span class="highlighted">{{ airshit.REPORTED_WEATHER['summary'].toLowerCase() }}</span> and around <span class="highlighted">{{ airshit.REPORTED_WEATHER['apparentTemperature'].toFixed(0) }}&deg;F</span>, the overall <span class="highlighted">air quality</span> was reported as <span class="highlighted">{{ overallAirQuality }}</span>, there were <span class="highlighted">{{ congestionMiles }} miles</span> of <span class="highlighted">local traffic</span>, <span class="highlighted">{{ overallFlightTotal }} plane{{ overallFlightTotal === 1 ? '' : 's' }}</span> overhead, <span class="highlighted">{{ overallVesselsTotal }} ships</span> on Lake Michigan, and <span class="highlighted">{{ overallTrainsTotal }} trains</span> in <span class="highlighted">our</span> community.
                        </div>
                    </h2>
                </div>

                <div class="col-xl-6 mt-5 mt-xl-2 px-xl-3 px-0">


                    <div class="map-container" @click.prevent="mapMaskActive = false"
                         v-bind:class="{ 'map-container--has-mask': mapMaskActive }"
                    >
                        <div id="map"></div>
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
                    <span class="font-weight-bold">Current Air Quality</span>
                </h2>
                <div class="row mb-3">
                    <div class="col-xl-6 py-2">
                        <div class="card h-100 aqi"
                            :class="getAqiScoreClassname((airshit.PM25REALTIME ? airshit.PM25REALTIME['category'] : 'Good'))"
                        >
                            <div class="card-body">
                                <div class="rotate">
                                    <i class="fa fa-tachometer-alt fa-5x"></i>
                                </div>
                                <h3 class="h6 text-uppercase font-weight-bold">PM2.5</h3>
                                <p class="small">sources include all combustion including vehicles, some industrial processes, etc.</p>
                                <p class="display-4 font-weight-bold mb-0">
                                    <span class="number--blurred" v-if="! airshit.PM25REALTIME"></span>
                                    <span v-else>{{ airshit.PM25REALTIME['aqi'] }}</span>
                                </p>
                                <h4 class="lead mb-0 text-uppercase font-weight-bold">
                                    <span class="text--blurred" v-if="! airshit.PM25REALTIME"></span>
                                    <template v-else>
                                        <span>{{ airshit.PM25REALTIME['category'] }}</span>
                                        <small class="font-size-50 pl-20 mt-1 d-block">raw: <span class="text-lowercase">{{  airshit.PM25REALTIME['concentration'] }} &#181;</span>g/m<sup>3</sup></small>
                                    </template>
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-6 py-2">
                        <div class="card h-100 aqi"
                            :class="getAqiScoreClassname((airshit.PM10REALTIME ? airshit.PM10REALTIME['category'] : 'Good'))"
                        >
                            <div class="card-body">
                                <div class="rotate">
                                    <i class="fa fa-tachometer-alt fa-5x"></i>
                                </div>
                                <h3 class="h6 text-uppercase font-weight-bold">PM10</h3>
                                <p class="small">sources include dust from construction sites, landfills and agriculture, industrial sources, pollen, bacteria, etc.</p>
                                <p class="display-4 font-weight-bold mb-0">
                                    <span class="number--blurred" v-if="! airshit.PM10REALTIME"></span>
                                    <span v-else>{{ airshit.PM10REALTIME['aqi'] }}</span>
                                </p>
                                <h4 class="lead mb-0 text-uppercase font-weight-bold">
                                    <span class="text--blurred" v-if="! airshit.PM10REALTIME"></span>
                                    <template v-else>
                                        <span>{{ airshit.PM10REALTIME['category'] }}</span>
                                        <small class="font-size-50 pl-20 mt-1 d-block">raw: <span class="text-lowercase">{{  airshit.PM10REALTIME['concentration'] }} &#181;</span>g/m<sup>3</sup></small>
                                    </template>
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-12 mt-3">
                        <h2 class="small text-uppercase mb-2 text-dark">Historical Air Quality Highs <sup><a href="#note-3">[3]</a></sup></h2>

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
                                            <span class="number--blurred" v-if="! airshit.VESSELS"></span>
                                            <span v-else class="separator" v-for="(vessels, type) in vesselsByType" v-bind:key="type">
                                                <span class="font-weight-bold">{{ vessels.length }}</span> <small class="small font-weight-light">{{ type }}(s)</small>
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

                <p>We track the <a href="https://en.wikipedia.org/wiki/Air_quality_index" role="button" target="_blank">Air Quality Index (AQI)</a>, measuring both <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics#PM" role="button" target="_blank">PM2.5 and PM10</a> particles, temperature, humidity, atmospheric pressure, wind speed, wind direction, cloud coverage, UV index, etc. to determine how the weather and local industry affects the local air quality.</p>

                <p>There are plenty of other pollutants in the air we're not tracking, such as SO₂, NO₂, CO, to name a few. As soon as affordable ways of tracking these pollutants in our neighbourhood are available, we'll track it and add it to our data.</p>
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
            const vessels = this.$store.state.airshit.VESSELS;

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
            return this.airshit.VESSELS.length;
        },
        overallTrainsTotal() {
            return this.airshit.TRAINS.SOUTHSHORE.length;
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

            this.$store.state.airshit.VESSELS.forEach((vessel) => {
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
            return (angle + 180) % 360;
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
        }
    },

    mounted() {
    }
}
</script>

<style scoped>
</style>
