<template>
    <div id="dashboard">
        <div class="container">
            <div class="row">
                <div class="col-xl-6">
                    <h1 class="h3 pb-45 font-weight-bold text-uppercase">
                        <small class="d-block h6 font-weight-light">How's our Air Quality in</small>
                        <span class="site-heading">Miller Beach / Gary / <abbr title="Northwest Indiana">NWI</abbr></span>
                    </h1>
                    <h2 class="small text-uppercase mb-0 text-dark">Currently</h2>
                    <div class="row mb-3">
                        <div class="col-6 py-2">
                            <div class="card h-100 aqi"
                                :class="getAqiScoreClassname((airshit.PM25REALTIME ? airshit.PM25REALTIME['category'] : 'Good'))"
                            >
                                <div class="card-body">
                                    <div class="rotate">
                                        <i class="fa fa-tachometer-alt fa-5x"></i>
                                    </div>
                                    <h3 class="h6 text-uppercase">PM2.5</h3>
                                    <p class="display-4 font-weight-bold mb-0">
                                        <span class="number--blurred" v-if="! airshit.PM25REALTIME"></span>
                                        <span v-else>{{ airshit.PM25REALTIME['aqi'] }}</span>
                                    </p>
                                    <h4 class="lead mb-0 pl-2">
                                        <span class="text--blurred" v-if="! airshit.PM25REALTIME"></span>
                                        <span v-else>{{ airshit.PM25REALTIME['category'] }}</span>
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div class="col-6 py-2">
                            <div class="card h-100 aqi"
                                :class="getAqiScoreClassname((airshit.PM10REALTIME ? airshit.PM10REALTIME['category'] : 'Good'))"
                            >
                                <div class="card-body">
                                    <div class="rotate">
                                        <i class="fa fa-tachometer-alt fa-5x"></i>
                                    </div>
                                    <h3 class="h6 text-uppercase">PM10</h3>
                                    <p class="display-4 font-weight-bold mb-0">
                                        <span class="number--blurred" v-if="! airshit.PM10REALTIME"></span>
                                        <span v-else>{{ airshit.PM10REALTIME['aqi'] }}</span>
                                    </p>
                                    <h4 class="lead mb-0 pl-2">
                                        <span class="text--blurred" v-if="! airshit.PM10REALTIME"></span>
                                        <span v-else>{{ airshit.PM10REALTIME['category'] }}</span>
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="highs mb-3">
                        <h2 class="small text-uppercase mb-2 text-dark">Historical Air Quality Highs</h2>

                        <div class="row no-gutters mb-2">
                            <div class="col-4">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Week High</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname(getTotalAirQualityAqiScore(highs.week))"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-signal fa-3x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted">PM2.5 + PM10</small>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.week"></span>
                                            <span v-else>
                                                {{ getTotalAirQualityAqiScore(highs.week) }}
                                            </span>
                                        </p>
                                        <span class="number--blurred" v-if="! highs.week"></span>
                                        <p v-else class="small mb-0"
                                            :title="formatDateTimeToLocal(highs.week.createdAt, null)"
                                        >
                                            {{ formatDateTimeToLocal(highs.week.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Month High</h5>
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
                                        <h5 class="mb-0 card-title text-uppercase small">Year High</h5>
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

                        <h2 class="small text-uppercase mb-2 text-dark">Historical Industry Highs</h2>

                        <div class="row no-gutters">
                            <div class="col-3">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Ships High</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-ship fa-3x"></i>
                                        </div>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.vessels"></span>
                                            <span v-else>
                                                {{ highs.vessels.count }}
                                                <small style="font-size:0.5rem;">total</small>
                                            </span>
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

                            <div class="col-3">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Flights High</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-plane fa-3x"></i>
                                        </div>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.flights"></span>
                                            <span v-else>
                                                {{ highs.flights.count }}
                                                <small style="font-size:0.5rem;">total</small>
                                            </span>
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

                            <div class="col-3">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Trains High</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-train fa-3x"></i>
                                        </div>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.trains"></span>
                                            <span v-else>
                                                {{ highs.trains.count }}
                                                <small style="font-size:0.5rem;">total</small>
                                            </span>
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

                            <div class="col-3">
                                <div class="card br-0">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Traffic High</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="rotate">
                                            <i class="fa fa-car fa-3x"></i>
                                        </div>
                                        <p class="h4 font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.traffic"></span>
                                            <span v-else>
                                                {{ highs.traffic.sum.toFixed(2) }}
                                                <small style="font-size:0.5rem;">miles</small>
                                            </span>
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

                    <p class="lead text-right text-uppercase">
                        <a href="#" role="button" class="d-inline-block" @click.prevent="showAlert('coming soon!')">see past air quality<i class="fa pl-1 fa-chevron-right" aria-hidden="true"></i></a>
                    </p>

                    <p class="lead">We track <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics#PM" role="button" target="_blank">PM2.5, PM10</a>, temperature, humidity, pressure, and reported weather (including wind speeds, direction, cloud coverage, etc.), so we can (hopefully) determine who, where, what, and how the weather affects the quality of the air we breathe, from a community-funded air sensor in the scenic Miller Beach neighborhood of Gary, Indiana.</p>

                    <p class="lead">Depending on what data is openly available in the future, we may be able to gather additional data from the many industries around the Region, such as <del>train schedules</del><sup><a href="#note-1">[1]</a></sup>, burn schedules, <del>traffic congestion</del>, construction, <del>air traffic</del>, mill non-conformances, <del>cargo/container ships on Lake Michigan</del>, etc.</p>

                    <p class="lead">There are plenty of other pollutants in the air we're not tracking, such as SO₂, NO₂, CO, to name a few. As soon as affordable ways of tracking these pollutants in our neighbourhood, we'll track it and add it to our data.</p>

                    <p class="lead">Not limiting our tracking to air, as soon as affordable community water quality testing becomes available for Lake Michigan, we'll track it and add that to our data, too.</p>
                </div>

                <div class="col-xl-6">
                    <div class="table-responsive">
                        <table class="table text-monospace mb-0">
                            <tbody>
                                <tr>
                                    <td colspan="2">
                                        <span class="small text-uppercase mb-0 text-dark">
                                            Weather
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <p class="lead text-center font-weight-bold mb-0 p-2">
                                            <span class="text--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['summary'] }} - {{ airshit.TEMP_F }}</span>
                                            &nbsp;&deg;F
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">Dew Point</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['dewPoint'].toFixed(0)}}</span>
                                            &nbsp;&deg;F
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">Wind</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <template v-else>
                                                <span class="mr-3">
                                                    {{ airshit.REPORTED_WEATHER['windSpeed'].toFixed(0) }} - {{ airshit.REPORTED_WEATHER['windGust'].toFixed(0) }} <sub>mph</sub> /
                                                </span>
                                                <span class="d-inline-block lead mb-0" :title="`wind bearing from ${airshit.REPORTED_WEATHER['windBearing']}\xB0`" style="`transform: rotate(${degeesToRotation(airshit.REPORTED_WEATHER['windBearing'])}deg)`">
                                                    ↑
                                                </span>
                                            </template>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">Cloud Coverage</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ (airshit.REPORTED_WEATHER['cloudCover'] * 100).toFixed(0) }}</span>
                                            &nbsp; %
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">UV Index</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['uvIndex'].toFixed(0) }}</span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">Pressure</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.PRESSURE_BAR"></span>
                                            <span v-else>{{ (airshit.PRESSURE_BAR * 0.02953).toFixed(2) }}</span>
                                            &nbsp;<sub>in Hg</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">Rain Intensity</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['precipIntensity'] }}</span>
                                            &nbsp;<sub>in of liquid water</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">Humidity</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.HUMIDITY_PERCENT"></span>
                                            <span v-else>{{ airshit.HUMIDITY_PERCENT }}</span>
                                            &nbsp;<sub>%</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">OZone</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
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
                                        <p class="lead font-weight-bold mb-0">Visibility</p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.REPORTED_WEATHER"></span>
                                            <span v-else>{{ airshit.REPORTED_WEATHER['visibility'].toFixed(0) }}</span> <sub>miles</sub>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <span class="small text-uppercase mb-0 text-dark">
                                            Industry <a href="#map">view on map</a>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">
                                            Traffic in <abbr title="See 'Region' below for coordinates">Region</abbr>
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.TRAFFIC"></span>
                                                <span v-else>{{ airshit.TRAFFIC.INCIDENTS.length }}</span>
                                                &nbsp;<small class="small font-weight-light">incidents</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.TRAFFIC"></span>
                                                <span v-else>{{ congestionMiles }}</span>
                                                &nbsp;<small class="small font-weight-light">miles of congestion</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.TRAFFIC"></span>
                                                <span v-else>{{ congestionTime }}</span>
                                                &nbsp;<small class="small font-weight-light">minutes of congestion</small>
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">
                                            Flights over <abbr title="See 'Region' below for coordinates">Region</abbr>
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.FLIGHTS"></span>
                                                <span v-else>{{ airshit.FLIGHTS.GYY.length }}</span>
                                                &nbsp;<small class="small font-weight-light">to/from Gary/GYY</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.FLIGHTS"></span>
                                                <span v-else>{{ airshit.FLIGHTS.MDW.length }}</span>
                                                &nbsp;<small class="small font-weight-light">to/from Midway/MDW</small>
                                            </span>
                                            <span class="separator">
                                                <span class="number--blurred" v-if="! airshit.FLIGHTS"></span>
                                                <span v-else>{{ airshit.FLIGHTS.ORD.length }}</span>
                                                &nbsp;<small class="small font-weight-light">to/from O'Hare/ORD</small>
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">
                                            Ships on <abbr title="See 'Lake' below for coordinates">Lake</abbr>
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.VESSELS"></span>
                                            <span v-else class="separator" v-for="(vessels, type) in vesselsByType" v-bind:key="type">
                                                {{ vessels.length }} <small class="small font-weight-light">{{ type }}(s)</small>
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="lead font-weight-bold mb-0">
                                            Trains in <abbr title="See 'Region' below for coordinates">Region</abbr>
                                        </p>
                                    </td>
                                    <td>
                                        <p class="lead mb-0">
                                            <span class="number--blurred" v-if="! airshit.TRAINS"></span>
                                            <span v-else>{{ airshit.TRAINS.SOUTHSHORE.length }}</span>
                                            &nbsp;<small class="small font-weight-light">southshore<sup><a href="#note-2">[2]</a></sup></small>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th class="pb-0 pt-5 small text-uppercase text-right" colspan="2">

                                        <p class="mb-0" v-if="Object.keys(geography).length > 0">
                                            Sensor located at: <code>{{ geography.sensor.lat }},{{ geography.sensor.lng }}</code><br>
                                            Region (polygon): <a class="pl-1" target="_blank"
                                                :title="getReversedCoordinates(geography.region.land_polygon)"
                                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.land_polygon))}`"
                                            >coordinates</a><br>
                                            Region (square): <a class="pl-1" target="_blank"
                                                :title="getReversedCoordinates(geography.region.land_square)"
                                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.land_square))}`"
                                            >coordinates</a><br>
                                            Lake:<a class="pl-1" target="_blank"
                                                :title="getReversedCoordinates(geography.region.lake)"
                                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.lake))}`"
                                            >coordinates</a><br>
                                            PM2.5/PM10, AIS, temperature, humidity, pressure recorded at sensor<br>
                                            Traffic uses square region, trains/flights use polygon region<br>
                                            <br>
                                            <span class="d-block">
                                                Weather by: <a href="https://darksky.net/poweredby/" target="_blank">darksky.net</a>
                                            </span>
                                            <span class="d-block">
                                                Trains by: <a href="http://southshore.etaspot.net" target="_blank">southshore.etaspot.net</a>
                                            </span>
                                            <span class="d-block">
                                                Traffic by: <a href="http://southshore.etaspot.net" target="_blank">mapquest.com</a>
                                            </span>
                                            <span class="d-block">
                                                Flight Tracking by: <a href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">aviation-edge.com</a>
                                            </span>
                                            <span class="d-block">
                                                Vessel Tracking by: <a href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">FleetMon.com</a>
                                            </span>

                                            <br><span :title="formatDateTimeToLocal(airshit.createdAt, null)"> Last Updated {{ formatDateTimeDiffToLocalHuman(airshit.createdAt) }} ago</span>

                                        </p>
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <!--=JSON.stringify(airshit)-->
                </div>

            </div>
        </div>

        <div class="map-container py-5">
            <div id="map"></div>
            <small class="text-center px-5 w-100 d-block mt-2"><a target="_blank" href="/icons/set/train">Train</a>, <a target="_blank" href="/icons/set/fishing-boat">Fishing Boat</a> and other icons by <a target="_blank" href="https://icons8.com">Icons8</a></small>
        </div>

        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left">
                        Special Thanks / Contributions
                    </h2>
                    <p class="mb-2 text-center text-md-left" style="font-size:2rem;">👏👏👏👏👏</p>
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

                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left mt-4">Notes</h2>
                    <ol class="notes-list small">
                        <li id="note-1">There is no single API or company who offer train/crossing tracking. Considering most of the industry in the region is powered by the railroads, it is unfortunate that we're not able to track all trains, especially the most pollutant coal-transporting cargo trains. Only the NICD provides a free tracking API of their commuter trains.</li>
                        <li id="note-2">NICD/Southshore Line trains are electrically powered.</li>
                    </ol>
                </div>
            </div>
        </div>
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
        title: 'Miller Beach / Gary / NWI Air Quality',
        titleTemplate: null,
        meta: [
          { name: 'description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place." },

            {property: 'og:title', content: 'Miller Beach / Gary / NWI Air Quality'},
            {property: 'og:site_name', content: 'How\'s OUR Air Quality?'},
            // The list of types is available here: http://ogp.me/#types
            {property: 'og:type', content: 'website'},
            // Should the the same as your canonical link, see below.
            {property: 'og:url', content: 'https://millerbeach-air.com/'},
            {property: 'og:image', content: 'https://millerbeach-air.com/images/millerbeach-gary-nwi-air-quality-promo.jpg'},
            // Often the same as your meta description, but not always.
            {property: 'og:description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place."},

            // Twitter card
            {name: 'twitter:card', content: 'summary'},
            {name: 'twitter:site', content: 'https://millerbeach-air.com'},
            {name: 'twitter:title', content: 'Miller Beach / Gary / NWI Air Quality'},
            {name: 'twitter:description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place."},
            // Your twitter handle, if you have one.
            {name: 'twitter:image:src', content: 'https://millerbeach-air.com/images/millerbeach-gary-nwi-air-quality-promo.jpg'},

            // Google / Schema.org markup:
            {itemprop: 'name', content: 'Miller Beach / Gary / NWI Air Quality'},
            {itemprop: 'description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place."},
            {itemprop: 'image', content: 'https://millerbeach-air.com/images/millerbeach-gary-nwi-air-quality-promo.jpg'}
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
    },

    data() {
        return {
            isAqiMeaningsVisible: false,
        }
    },

    created () {
        this.getLatestValues();
    },

    watch: {
        '$route': 'getLatestValues'
    },

    methods: {
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

            L.marker([this.geography.sensor.lat, this.geography.sensor.lng], {icon: sensorIcon}).bindPopup(`
                PM2.5/PM10 sensor, AIS antenna, and reported weather are recorded from this location.
            `).addTo(map);

            for (const airport in this.$store.state.airshit.FLIGHTS) {
                const flights = this.$store.state.airshit.FLIGHTS[airport];
                flights.forEach((flight) => {
                    L.marker([flight.lat, flight.lng], {icon: aircraftIcon, rotationAngle: flight.bearing}).bindPopup(`
                        Aircraft: ${flight.aircraft}<br>
                        Flight: ${flight.flight}<br>
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

        getAqiScoreStatClassname(total) {
            if (_.inRange(total, 0, 50)) {
                return 'aqi-stat--good';
            } else if (_.inRange(total, 51, 100)) {
                return 'aqi-stat--moderate';
            } else if (_.inRange(total, 101, 150)) {
                return 'aqi-stat--unhealthy-sensitive';
            } else if (_.inRange(total, 151, 200)) {
                return 'aqi-stat--unhealthy';
            } else if (_.inRange(total, 201, 300)) {
                return 'aqi-stat--unhealthy-very';
            } else if (total >= 301) {
                return 'aqi-stat--death';
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

        getTotalAirQualityAqiScore(airshit) {
            if (! airshit || ! airshit.PM25REALTIME || ! airshit.PM10REALTIME) {
                return 0;
            }

            const pm25 = airshit.PM25REALTIME.aqi || 0;
            const pm10 = airshit.PM10REALTIME.aqi || 0;

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
