<template>
    <div id="dashboard">
        <header class="mb-5 mt-0 container ">
            <h1 class="display-4 pb-0 font-weight-bold text-uppercase mb-0">
                <small class="site-sub-heading d-block h6 font-weight-light mb-2 mb-md-1">the weather, air quality, lake advisories, &amp; industry in/around</small>
                <span class="site-heading mt-n1 d-block">Miller Beach, Gary, Indiana</span>
            </h1>
            <span class="d-inline-block mb-0 h6 mt-0">lasted updated <span class="highlighted">{{ getLatestUpdated() }}</span> ago</span>
        </header>

        <section class="container pb-10" id="visuals">
            <div class="row flex-xl-row-reverse">

                <div class="col-xl-8 ">
                    <div class="map-container" style="position: relative;" @click.prevent="mapMaskActive = false"
                        v-bind:class="{ 'map-container--has-mask': mapMaskActive }"
                    >
                      <div id="map"></div>
                    </div>

                    <p class="text-center mt-2">
                        <small class="px-5 w-100 d-block"><a target="_blank" href="/icons/set/train">Train</a>, <a target="_blank" href="/icons/set/fishing-boat">Fishing Boat</a> and other icons by <a target="_blank" href="https://icons8.com">Icons8</a></small>
                        <small class="px-5 w-100 d-block">Factories listed are <a href="https://www.in.gov/idem/airquality/files/monitoring_criteria_trend_northwest.pdf" target="_blank">Northwest Indiana's Top Ten Emission Sources</a></small>
                    </p>
                    <p class="text-center mt-2" v-if="Object.keys(geography).length > 0">
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
                    </p>
                </div>

                <div class="col-xl-4 mt-5 mt-xl-0 px-xl-3 px-xl-0" id="currently">
                    <div class="stat stat--weather">

                        <h2 class="small text-uppercase clearfix">Weather</h2>
                        <div class="row">
                            <!-- CO -->
                            <div class="col">
                                <div class="aqi-card h-100 aqi">
                                    <div class="card-body small py-1">
                                        <div class="summary" v-if="weather.data">
                                            <span class="mr-2">{{ weather.data.summary.toLowerCase() }},</span>
                                            <span class="mr-2">{{ weather.data.apparentTemperature.toFixed(0) }}&deg;F, </span>
                                            <span class="mr-1">
                                                {{ weather.data.windSpeed.toFixed(0) }}
                                                &mdash;
                                                {{ weather.data.windGust.toFixed(0) }}<small>mph</small>
                                            </span>
                                            <span class="d-inline-block mb-0 font-weight-bold" :title="`wind bearing ${weather.data.windBearing}\xB0`" :style="`transform: rotate(${degeesToRotation(weather.data.windBearing)}deg)`">
                                            &darr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat stat--airquality mt-4">
                        <h2 class="small text-uppercase">Overall Air Quality</h2>
                        <div class="row">
                            <div class="col" >
                                <div class="aqi-card aqi h-100 "
                                  :class="[`aqi--${overallAirQuality}`]"
                                >
                                  <div class="card-body py-1 text-center">
                                    <p class="text-uppercase font-weight-bold mb-0 d-inline-block">{{ overallAirQuality === 'unhealthy-sensitive' ? 'Unhealthy for Sensitive Groups' : overallAirQuality }}</p>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat stat--pm mt-4">
                        <h2 class="small text-uppercase clearfix">Particulate Matter</h2>
                        <!-- <small class="float-right text-muted text-right">updated: {{ airshit.createdAt }}</small> -->
                        <div class="row row-cols-4">

                            <template v-for="pm in measurementTypes.pm">
                                <div class="col" v-if="airshit.data[pm]" v-bind:key="pm">
                                    <div class="aqi-card h-100 "
                                      :class="getAqiScoreClassname((airshit.data[pm] ? airshit.data[pm]['category'] : 'unsure'))"
                                    >
                                        <div class="card-body small py-1">
                                            <p class="text-uppercase font-weight-bold mb-0">{{ getRealPollutantName(pm) }}</p>

                                            <!-- aqi -->
                                            <p class="font-weight-bold mb-0 lead">
                                              <span class="number--blurred" v-if="! airshit.data[pm]"></span>
                                              <span v-else>{{ airshit.data[pm]['aqi'] }}</span>
                                            </p>

                                            <!-- concentration -->
                                            <p class="mb-0 font-weight-bold">
                                                <span class="text--blurred" v-if="! airshit.data[pm]"></span>

                                                <template v-else-if="! airshit.data[pm]['aqi']">
                                                    <span class="lead font-weight-bold text-lowercase d-block">
                                                        {{ airshit.data[pm]['concentration'].toFixed(0) }} </span> ppb
                                                </template>

                                                <template v-else>
                                                    <small class="font-size-80 d-block mx-n1">
                                                        <span class="text-lowercase">{{ airshit.data[pm]['concentration'] }} &#181;</span>g/m<sup>3</sup>
                                                    </small>
                                                </template>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="stat stat--gases mt-4"
                        v-if="airshitContainsGases"
                    >

                        <h2 class="small text-uppercase">Gases</h2>

                        <div class="row">
                            <template v-for="gas in measurementTypes.gases">
                                <div class="col" v-if="airshit.data[gas]" v-bind:key="gas">
                                    <div class="aqi-card h-100 "
                                      :class="getAqiScoreClassname((airshit.data[gas] ? airshit.data[gas]['category'] : 'unsure'))"
                                    >
                                        <div class="card-body small py-1">
                                            <p class="text-uppercase font-weight-bold mb-0">{{ getRealPollutantName(gas) }}</p>

                                            <!-- aqi -->
                                            <p class="font-weight-bold mb-0 lead">
                                              <span class="number--blurred" v-if="! airshit.data[gas]"></span>
                                              <span v-else>{{ airshit.data[gas]['aqi'] }}</span>
                                            </p>

                                            <!-- concentration -->
                                            <p class="mb-0 font-weight-bold">
                                                <span class="text--blurred" v-if="! airshit.data[gas]"></span>

                                                <template v-else-if="airshit.data[gas]['aqi'] === null">
                                                    <span class="lead font-weight-bold text-lowercase d-block">
                                                    {{ airshit.data[gas]['concentration'].toFixed(0) }} </span> {{ airshit.data[gas]['units'] }}
                                                </template>

                                                <template v-else>
                                                    <small class="font-size-80 d-block mx-n1">
                                                        <span class="text-lowercase">{{ airshit.data[gas]['concentration'] }} &#181;</span>g/m<sup>3</sup>
                                                    </small>
                                                </template>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="stat stat--industry mt-4">
                        <h2 class="small text-uppercase">Industry/traffic</h2>
                        <div class="row">
                            <!-- Vessels -->
                            <div class="col">
                                <div class="aqi-card h-100 aqi">
                                  <div class="card-body small py-1">
                                    <div class="rotate small">
                                        <img :src="`${base}/images/maps/icons8-fishing-boat-50.png`" />
                                    </div>
                                    <p class="font-weight-bold mb-0 lead">
                                      <span>{{ overallVesselsTotal }}</span>
                                    </p>
                                    <p class="mb-0 text-uppercase font-weight-bold ">
                                        <small class="font-size-80  d-block">Lake boats</small>
                                    </p>
                                  </div>
                                </div>
                            </div>

                            <!-- Flights -->
                            <div class="col">
                                <div class="aqi-card h-100 aqi">
                                  <div class="card-body small py-1">
                                    <div class="rotate small">
                                        <i class="fa fa-plane fa-3x"></i>
                                    </div>
                                    <p class="font-weight-bold mb-0 lead">
                                      <span>{{ overallFlightTotal }}</span>
                                    </p>
                                    <p class="mb-0 text-uppercase font-weight-bold ">
                                        <small class="font-size-80  d-block">NWI flights</small>
                                    </p>
                                  </div>
                                </div>
                            </div>

                            <!-- Trains -->
                            <div class="col">
                                <div class="aqi-card h-100 aqi">
                                  <div class="card-body small py-1">
                                    <div class="rotate small">
                                        <i class="fa fa-train fa-3x"></i>
                                    </div>
                                    <p class="font-weight-bold mb-0 lead">
                                      <span>{{ overallTrainsTotal }}</span>
                                    </p>
                                    <p class="mb-0 text-uppercase font-weight-bold ">
                                        <small class="font-size-80  d-block">NWI Trains</small>
                                    </p>
                                  </div>
                                </div>
                            </div>

                            <!-- Congestion -->
                            <div class="col">
                                <div class="aqi-card h-100 aqi">
                                  <div class="card-body small py-1">
                                    <div class="rotate small">
                                        <img :src="`${base}/images/maps/icons8-traffic-jam-50.png`" />
                                    </div>
                                    <p class="font-weight-bold mb-0 lead">
                                      <span>{{ congestionMiles }}</span>
                                    </p>
                                    <p class="mb-0 text-uppercase font-weight-bold ">
                                        <small class="font-size-80  d-block">NWI miles</small>
                                    </p>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat stat--advisories mt-4">
                        <h2 class="small text-uppercase">Southernmost Lake Michigan Advisories</h2>
                        <div class="row">
                            <!-- advisories -->
                            <div class="col" >
                                <div class="aqi-card h-100 aqi">
                                  <div class="card-body small py-1">
                                    <p class="font-weight-bold mb-0 lead">
                                      <span>{{ advisories.data.length }}</span>
                                    </p>
                                    <ul class="list-unstyled pl-0 mb-0">
                                        <template v-for="(zoneAdvisories, zone) in advisoriesByZone()">
                                            <li class="text-uppercase font-weight-bold" v-bind:key="zone">{{ lakeZones[zone] }}</li>
                                            <li v-for="advisory in zoneAdvisories" class="text-uppercase font-weight-bold" v-bind:key="`id:${zone}-${advisory.id}`">
                                                <small class="font-size-80 d-block">
                                                    {{ advisory.event }}
                                                </small>
                                                <span class="small d-block divider">&mdash;</span>
                                            </li>
                                        </template>
                                    </ul>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-0 small text-xl-right text-center mt-3" id="poweredbys">
                        <p class="mb-0" v-if="Object.keys(geography).length > 0">
                            <span class="d-block mb-2">
                                AIS, {{ Object.keys(airshit.data).map(e => getRealPollutantName(e)).join(', ') }} recorded at base station.
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-0">(updated {{ formatDateTimeDiffToLocalHuman(airshit.createdAt) }} ago)</span>
                            </span>
                            <span class="d-block">
                                Weather: <a href="https://darksky.net/poweredby/" target="_blank">darksky.net</a>
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-0">(updated {{ formatDateTimeDiffToLocalHuman(weather.createdAt) }} ago)</span>
                            </span>
                            <span class="d-block">
                                Trains: <a href="http://southshore.etaspot.net" target="_blank">southshore.etaspot.net</a>
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-0">(updated {{ formatDateTimeDiffToLocalHuman(trains.createdAt) }} ago)</span>
                            </span>
                            <span class="d-block">
                                Traffic: <a href="http://mapquest.com" target="_blank">mapquest.com</a>
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-0">(updated {{ formatDateTimeDiffToLocalHuman(traffic.createdAt) }} ago)</span>
                            </span>
                            <span class="d-block">
                                Flight Tracking: <a href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">aviation-edge.com</a>
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-0">(updated {{ formatDateTimeDiffToLocalHuman(flights.createdAt) }} ago)</span>
                            </span>
                            <span class="d-block">
                                Vessel Tracking: <a href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">FleetMon.com</a>
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-01">(updated {{ formatDateTimeDiffToLocalHuman(vessels.createdAt) }} ago)</span>
                            </span>
                            <span class="d-block">
                                Lake Advisories: <a href="https://forecast.weather.gov/product.php?site=lot&product=nsh&issuedby=lot" target="_blank">weather.gov</a>
                                <span class="text-right mt-0 ml-1 d-inline-block small mb-01">(updated {{ formatDateTimeDiffToLocalHuman(advisories.createdAt) }} ago)</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section class="container pb-10" id="aqi-table">
            <div class="row">
                <div class="col-xl-12">
                    <header class="mb-5 mt-0">
                        <h2 class="display-4 pb-0 font-weight-bold text-uppercase mb-0">
                            <span class="site-heading mt-n1 d-block">Air Quality Index</span>
                        </h2>
                    </header>

                    <section>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th colspan="2" >Score</th>
                                    <th>Health Impacts</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(0)">
                                        <span class="aqi-stat__stat">Good</span>
                                    </td>
                                    <td width="100">&nbsp;&nbsp;&nbsp;&nbsp;0 &mdash; 50</td>
                                    <td>Minimal impact</td>
                                </tr>
                                <tr>
                                    <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(51)">
                                        <span class="aqi-stat__stat">Moderate</span>
                                    </td>
                                    <td width="100">&nbsp;&nbsp;51 &mdash; 100</td>
                                    <td>May cause minor breathing discomfort to sensitive people.</td>
                                </tr>
                                <tr>
                                    <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(101)">
                                        <span class="aqi-stat__stat">Unhealthy for Sensitive Groups</span>
                                    </td>
                                    <td width="100">101 &mdash; 200</td>
                                    <td>May cause breathing discomfort to people with lung disease such as asthma, and discomfort to people with heart disease, children and older adults.</td>
                                </tr>
                                <tr>
                                    <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(151)">
                                        <span class="aqi-stat__stat">Unhealthy</span>
                                    </td>
                                    <td width="100">201 &mdash; 300</td>
                                    <td>May cause breathing discomfort to people on prolonged exposure, and discomfort to people with heart disease.</td>
                                </tr>
                                <tr>
                                    <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(201)">
                                        <span class="aqi-stat__stat">Very Unhealthy</span>
                                    </td>
                                    <td width="100">301 &mdash; 400</td>
                                    <td>May cause respiratory illness to the people on prolonged exposure. Effect may be more pronounced in people with lung and heart diseases.</td>
                                </tr>
                                <tr>
                                    <td class="aqi-stat font-weight-bold text-uppercase" :class="getAqiScoreStatClassname(401)">
                                        <span class="aqi-stat__stat">Hazardous</span>
                                    </td>
                                    <td width="100">401 &mdash; 500</td>
                                    <td>May cause respiratory impact even on healthy people, and serious health impacts on people with lung/heart disease. The health impacts may be experienced even during light physical activity.</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </section>

        <section class="container pb-10" id="details">
            <header class="mb-5 mt-0">
                <span class="display-4 pb-0 font-weight-bold text-uppercase mb-0">
                    <span class="site-heading mt-n1 d-block">Details</span>
                </span>
            </header>
            <div class="row">
                <div class="col-xl-12 card-item card-item--airquality" id="airquality">
                    <div class="card border-left-0 border-right-0 border-bottom-0 border-top-0">
                        <div class="card-body px-0 pb-3">
                            <h2 class="h5 text-left mb-3 border-top border-bottom pt-2">
                                <span class="font-weight-bold text-uppercase px-3 border-bottom d-block mb-0 pb-3 pt-2">Trends (last 7 days)</span>
                            </h2>

                            <div class="mx-lg-auto w-lg-75" id="chart"></div>

                            <span v-if="loaded.trends === false">
                                <i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>
                                <span class="sr-only">Loading...</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="col-xl-6 mt-5 card-item card-item--weather" id="weather">
                    <div class="card">
                        <div class="card-body pl-0 pr-0 pb-0">
                            <div class="table-responsive">
                                <table class="table text-monospace mb-0">
                                    <tbody>
                                        <tr>
                                            <td colspan="2" style="border-top:0;" class="pt-0">
                                                <h2 class="h5 text-left mb-0 p-2">
                                                    <span class="font-weight-bold text-uppercase">Weather</span>
                                                </h2>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Summary</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 text-uppercase font-weight-bold" v-if="weather.data">
                                                    {{ weather.data.summary }}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Temperature</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 text-uppercase font-weight-bold" v-if="weather.data">
                                                    {{ weather.data.apparentTemperature.toFixed(0) }}&deg;F
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Wind</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0  font-weight-bold">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <template v-else>
                                                        <span class="mr-3">
                                                            {{ weather.data.windSpeed.toFixed(0) }} &mdash; {{ weather.data.windGust.toFixed(0) }}<sub>mph</sub>
                                                        </span>
                                                        <span class="d-inline-block lead mb-0" :title="`wind bearing from ${weather.data.windBearing}\xB0`" :style="`transform: rotate(${degeesToRotation(weather.data.windBearing)}deg)`">
                                                            &darr;
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
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else>{{ (weather.data.humidity * 100).toFixed(0) }}</span>%
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Dew Point</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 font-weight-bold">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else>{{ weather.data.dewPoint.toFixed(0)}}</span><sup>&deg;F</sup>
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Cloud Coverage</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 font-weight-bold">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else>{{ (weather.data.cloudCover * 100).toFixed(0) }}</span>%
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">UV Index</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 font-weight-bold">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else>{{ weather.data.uvIndex.toFixed(0) }}</span>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Pressure</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else class="font-weight-bold">{{ (weather.data.pressure * 0.02953).toFixed(2) }}</span><small>in Hg</small>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">Rain Intensity</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else class="font-weight-bold">{{ parseFloat(weather.data.precipIntensity).toFixed(2) }}</span><small>in of liquid water</small>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">OZone</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 font-weight-bold">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else>{{ weather.data.ozone.toFixed(0) }}</span>
                                                    <small><a href="https://en.wikipedia.org/wiki/Dobson_unit" role="button" target="_blank">DU</a></small>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p class="lead  mb-0 text-lowercase">Visibility</p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 font-weight-bold">
                                                    <span class="number--blurred" v-if="! weather.data"></span>
                                                    <span v-else>{{ weather.data.visibility.toFixed(0) }}</span><small>miles</small>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-6 mt-5 card-item card-item--industry" id="industry">
                    <div class="card">
                        <div class="card-body pl-0 pr-0 pb-0">
                            <div class="table-responsive">
                                <table class="table text-monospace mb-0">
                                    <tbody>
                                        <tr>
                                            <td colspan="2" style="border-top:0;" class="pt-0">
                                                <h2 class="h5 text-left mb-0 p-2">
                                                    <span class="font-weight-bold text-uppercase">Industry</span>
                                                </h2>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase"><abbr title="See 'Region' below for coordinates">Region</abbr> Traffic</p>
                                                <p class="mb-0">
                                                    <a href="#" class="d-block small" @click.prevent="toggle('activeIndustries', 'traffic')">
                                                        {{ ((activeIndustries.indexOf('traffic') > -1 ) ? 'hide' : 'show') }} traffic
                                                    </a>
                                                </p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0 ">
                                                    <span class="separator">
                                                        <span class="number--blurred" v-if="! traffic.data"></span>
                                                        <span v-else class="font-weight-bold">{{ traffic.data.length }}</span>
                                                        <small class="small font-weight-light">incidents</small>
                                                    </span>
                                                    <span class="separator">
                                                        <span class="number--blurred" v-if="! traffic.data"></span>
                                                        <span v-else class="font-weight-bold">{{ congestionMiles }}</span>
                                                        <small class="small font-weight-light">miles of congestion</small>
                                                    </span>
                                                    <span class="separator">
                                                        <span class="number--blurred" v-if="! traffic.data"></span>
                                                        <span v-else class="font-weight-bold">{{ congestionTime }}</span>
                                                        <small class="small font-weight-light">minutes of congestion</small>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr class="p-0 bg-light detailed-industry-table" v-if="activeIndustries.indexOf('traffic') > -1">
                                            <td colspan="2" class="p-0 px-2">
                                                <table class="table table-sm small mb-0 ">
                                                    <thead>
                                                        <tr class="small text-uppercase">
                                                            <th>Summary, Lat/Lng, from-until</th>
                                                            <th>Distance</th>
                                                            <th>Minutes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="incident in traffic.data" v-bind:key="incident.lat">
                                                            <td>
                                                                {{ incident.shortDesc }}
                                                                <small class="d-block pl-0 ml-0">{{ incident.lat }}, {{ incident.lng }}</small>
                                                                <small class="d-block pl-0 ml-0">June 18, 2021 1:57 PM-3:17 PM</small>
                                                            </td>
                                                            <td>{{ incident.distance.toFixed(0) }} miles</td>
                                                            <td>{{ incident.freeFlowMinDelay.toFixed(0) }} mins</td>
                                                        </tr>
                                                        <tr v-if="traffic.data.length === 0">
                                                            <td colspan="3">
                                                                no traffic
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">
                                                    <abbr title="See 'Region' below for coordinates">Region</abbr> Flights
                                                </p>
                                                <p class="mb-0">
                                                    <a href="#" class="d-block small" @click.prevent="toggle('activeIndustries', 'flights')">
                                                        {{ ((activeIndustries.indexOf('flights') > -1 ) ? 'hide' : 'show') }} flights
                                                    </a>
                                                </p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0">
                                                    <span class="separator">
                                                        <span class="number--blurred" v-if="! flights.data"></span>
                                                        <span v-else class="font-weight-bold">{{ getAirportFlights('GYY').length }}</span>
                                                        <small class="small font-weight-light">to/from Gary/GYY</small>
                                                    </span>
                                                    <span class="separator">
                                                        <span class="number--blurred" v-if="! flights.data"></span>
                                                        <span v-else class="font-weight-bold">{{ getAirportFlights('MDW').length }}</span>
                                                        <small class="small font-weight-light">to/from Midway/MDW</small>
                                                    </span>
                                                    <span class="separator">
                                                        <span class="number--blurred" v-if="! flights.data"></span>
                                                        <span v-else class="font-weight-bold">{{ getAirportFlights('ORD').length }}</span>
                                                        <small class="small font-weight-light">to/from O'Hare/ORD</small>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr class="p-0 bg-light detailed-industry-table" v-if="activeIndustries.indexOf('flights') > -1">
                                            <td colspan="2" class="p-0 px-2">
                                                <table class="table table-sm small mb-0">
                                                    <thead>
                                                        <tr class="small text-uppercase">
                                                            <th>Flight / Reg</th>
                                                            <th>Destination</th>
                                                            <th>Arriving</th>
                                                            <th>Type</th>
                                                            <th>Alt, bearing, speed</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="flight in flights.data" v-bind:key="flight.reg">
                                                            <td>{{ flight.flight }} / {{ flight.reg }}</td>
                                                            <td>{{ flight.departing }}</td>
                                                            <td>{{ flight.arriving }}</td>
                                                            <td>{{ flight.aircraft }}</td>
                                                            <td>
                                                                <small class="d-block pl-0 ml-0">{{ flight.alt.toFixed(0) }} ft</small>
                                                                <small class="d-block pl-0 ml-0">{{ flight.bearing }}&deg;</small>
                                                                <small class="d-block pl-0 ml-0">{{ flight.speed.toFixed(0) }}mph</small>
                                                            </td>
                                                        </tr>
                                                        <tr v-if="flights.data.length === 0">
                                                            <td colspan="5">
                                                                no flights
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">
                                                    <abbr title="See 'Lake' below for coordinates">Lake</abbr> Ships
                                                </p>
                                                <p class="mb-0">
                                                    <a href="#" class="d-block small" @click.prevent="toggle('activeIndustries', 'ships')">
                                                        {{ ((activeIndustries.indexOf('ships') > -1 ) ? 'hide' : 'show') }} ships
                                                    </a>
                                                </p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0">
                                                    <span v-if="Object.keys(vesselsByType).length === 0">0 vessels</span>
                                                    <span v-else class="separator" v-for="(data, type) in vesselsByType" v-bind:key="type">
                                                        <span class="font-weight-bold">{{ data.length }}</span><small class="small font-weight-light">{{ type }}(s)</small>
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr class="p-0 bg-light detailed-industry-table" v-if="activeIndustries.indexOf('ships') > -1">
                                            <td colspan="2" class="p-0 px-2">
                                                <table class="table table-sm small mb-0 ">
                                                    <thead>
                                                        <tr class="small text-uppercase">
                                                            <th></th>
                                                            <th>Name, ID, Type, Lat/Lng</th>
                                                            <th>Destination</th>
                                                            <th>COO</th>
                                                            <th>Dimensions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr class="small text-uppercase" v-for="vessel in vessels.data" v-bind:key="vessel.id">
                                                            <td class="p-0">
                                                                <a :href="getVesselPhoto(vessel.imo)" v-if="getVesselPhoto(vessel.imo)" target="_blank">
                                                                    <img width="75px;" :src="getVesselPhoto(vessel.imo)" />
                                                                </a>
                                                            </td>
                                                            <td>
                                                                {{ vessel.name }}
                                                                <span class="d-block pl-0 ml-0">{{ vessel.type }} / {{ vessel.callsign }}</span>
                                                                <span class="d-block pl-0 ml-0">{{ vessel.lat }},{{ vessel.lng }}</span>
                                                            </td>
                                                            <td>{{ vessel.destination }}</td>
                                                            <td>{{ vessel.country }}</td>
                                                            <td>
                                                                <span class="d-block pl-0 ml-0">
                                                                    {{ vessel.width }}<span class="px-0 mx-0">x</span>{{ vessel.length }} (WxL)
                                                                </span>
                                                                <span class="d-block pl-0 ml-0" v-if="vessel.deadweight">{{ vessel.deadweight }} DWT</span>
                                                            </td>
                                                        </tr>

                                                        <tr v-if="vessels.data.length === 0">
                                                            <td colspan="5">
                                                                no vessels
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <p class="lead mb-0 text-lowercase">
                                                    <abbr title="See 'Region' below for coordinates">Region</abbr> Trains
                                                </p>
                                                <p class="mb-0">
                                                    <a href="#" class="d-block small" @click.prevent="toggle('activeIndustries', 'trains')">
                                                        {{ ((activeIndustries.indexOf('trains') > -1 ) ? 'hide' : 'show') }} trains
                                                    </a>
                                                </p>
                                            </td>
                                            <td>
                                                <p class="lead mb-0">
                                                    <span class="number--blurred" v-if="! trains.data"></span>
                                                    <span v-else class="font-weight-bold">{{ trains.data.length }}</span>
                                                    <small class="small font-weight-light">southshore<sup><a href="#note-2">[2]</a></sup></small>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr class="p-0 bg-light detailed-industry-table" v-if="activeIndustries.indexOf('trains') > -1">
                                            <td colspan="2" class="p-0 px-2">
                                                <table class="table table-sm small mb-0 ">
                                                    <thead>
                                                        <tr class="small text-uppercase">
                                                            <th>Lat/Lng</th>
                                                            <th>Train ID</th>
                                                            <th>Heading</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="train in trains.data" v-bind:key="train.lat">
                                                            <td>{{ train.lat }}, {{ train.lng }}</td>
                                                            <td>{{ train.id }}</td>
                                                            <td>{{ train.direction }}</td>
                                                        </tr>
                                                        <tr v-if="trains.data.length === 0">
                                                            <td colspan="3">
                                                                no trains
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-12 mt-5 card-item card-item--advisories" id="advisories">
                    <div class="card">
                        <div class="card-body px-0 pb-3">
                            <h2 class="h5 text-left mb-3">
                                <span class="font-weight-bold text-uppercase px-3 border-bottom d-block mb-0 pb-3 pt-2">Southernmost Lake Michigan Advisories</span>
                            </h2>

                            <div class="row px-3">
                                <div class=" col-sm-12 col-xl-4 mb-4 " v-for="advisory in advisories.data" v-bind:key="advisory.id">
                                    <Div class="card">
                                        <div class="card-body py-4">
                                            <h5 class="card-title mb-2"><a href="">{{ advisory.event }}</a></h5>
                                            <div class="card-text">
                                                <div class="clearfix mb-3">
                                                    <span class="badge badge-secondary ml-0">{{ advisory.severity }}</span>
                                                    <span class="badge badge-secondary ml-1">{{ advisory.certainty }}</span>
                                                    <span class="badge badge-secondary ml-1">{{ advisory.urgency }}</span>
                                                    <span class="badge badge-secondary ml-1">{{ advisory.response }}</span>
                                                </div>

                                                <span class="d-block small text-right font-weight-bold">
                                                    effective:
                                                    <time :datetime="advisory.effective" class="font-weight-light">{{ formatDateTime(advisory.effective) }}</time>
                                                </span>
                                                <span class="d-block small text-right font-weight-bold mb-3">
                                                    expires:
                                                    <time :datetime="advisory.ends" class="font-weight-light d-blosck">{{ formatDateTime(advisory.ends) }}</time>
                                                    <span class="font-weight-light d-block ad-none">
                                                        (in {{  formatDateTimeDiffToHuman(advisory.ends) }})
                                                    </span>
                                                </span>

                                                <h4 class="small text-uppercase font-weight-bold mt-3 mb-0">affected areas</h4>
                                                <small class="d-block">
                                                    <template v-for="zone in advisory.geocode">
                                                        <a href="#" v-bind:key="zone" v-if="geography.region.lake_zones.includes(zone)" class="d-block">
                                                            {{ zone }} - {{ lakeZones[zone] }}
                                                        </a>
                                                    </template>
                                                </small>

                                                <h4 class="small text-uppercase font-weight-bold mt-3 mb-0" v-if="advisory.instruction">instructions</h4>
                                                <p class="" v-if="advisory.instruction">{{ convertToLineBreaks(advisory.instruction) }}</p>

                                                <details class="mt-3">
                                                    <summary class="pb-1">
                                                        <h4 class="small text-uppercase mb-0 font-weight-bold  d-inline-block">summary</h4>
                                                    </summary>
                                                    <p class="font-weight-light mb-0 pt-1 pl-3 ml-3" style="border-left: 5px solid #ccc; white-space: pre-line;"
                                                        v-if="advisory.description"
                                                    >
                                                        {{ convertToLineBreaks(advisory.description) }}
                                                    </p>
                                                </details>
                                            </div>
                                        </div>
                                        <div class="card-footer">
                                            <div class="text-muted d-block clearfix small">
                                                <div class="">
                                                    <span>{{ advisory.senderName }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Div>
                                </div>
                                <div card col-md-6 col-lg-4 v-if="advisories.data.length === 0">
                                    <div class="card-body">&mdash;</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="container pb-10" id="historical-highs">
            <div class="row">

                <div class="col-xl-12">
                    <header class="mb-5 mt-0">
                        <h2 class="display-4 pb-0 font-weight-bold text-uppercase mb-0">
                            <span class="site-heading mt-n1 d-block">Historical Highs <sup><a href="#note-3">[3]</a></sup></span>
                        </h2>
                    </header>

                    <section class="mb-5">
                        <div class="row row-xl-gutterless mb-2">
                            <div class="col-6 col-lg-4 ">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Month</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname(getTotalAirQualityAqiScore(highs.month))"
                                    >
                                        <div class="icon">
                                            <i class="fa fa-signal fa-4x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted metrics">
                                            <span v-if="highs.month && highs.month.PM25REALTIME" class="add">PM2.5</span>
                                            <span v-if="highs.month && highs.month.PM10REALTIME" class="add">PM10</span>
                                            <span v-if="highs.month && highs.month.SO2REALTIME" class="add">SO2</span>
                                            <span v-if="highs.month && highs.month.NO2REALTIME" class="add">NO2</span>
                                            <span v-if="highs.month && highs.month.O3REALTIME" class="add">O3</span>
                                            <span v-if="highs.month && highs.month.COREALTIME" class="add">CO</span>
                                        </small>
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

                            <div class="col-6 pl-0 pl-0 pl-xl-3 col-lg-4">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Year</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname(getTotalAirQualityAqiScore(highs.year))"
                                    >
                                        <div class="icon">
                                            <i class="fa fa-signal fa-4x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted metrics">
                                            <span v-if="highs.year && highs.year.PM25REALTIME" class="add">PM2.5</span>
                                            <span v-if="highs.year && highs.year.PM10REALTIME" class="add">PM10</span>
                                            <span v-if="highs.year && highs.year.SO2REALTIME" class="add">SO2</span>
                                            <span v-if="highs.year && highs.year.NO2REALTIME" class="add">NO2</span>
                                            <span v-if="highs.year && highs.year.O3REALTIME" class="add">O3</span>
                                            <span v-if="highs.year && highs.year.COREALTIME" class="add">CO</span>
                                        </small>
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

                            <div class="col-12 mt-3 mt-lg-0 pl-xl-3 col-lg-4">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">All Time</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                        :class="getAqiScoreStatClassname((highs.alltime) ? highs.alltime.sum : 0)"
                                    >
                                        <div class="icon">
                                            <i class="fa fa-signal fa-4x"></i>
                                        </div>
                                        <small class="d-block font-weight-bold text-uppercase text-muted metrics">
                                            <span v-if="highs.alltime && highs.alltime.PM25REALTIME" class="add">PM2.5</span>
                                            <span v-if="highs.alltime && highs.alltime.PM10REALTIME" class="add">PM10</span>
                                            <span v-if="highs.alltime && highs.alltime.SO2REALTIME" class="add">SO2</span>
                                            <span v-if="highs.alltime && highs.alltime.NO2REALTIME" class="add">NO2</span>
                                            <span v-if="highs.alltime && highs.alltime.O3REALTIME" class="add">O3</span>
                                            <span v-if="highs.alltime && highs.alltime.COREALTIME" class="add">CO</span>
                                        </small>
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
                    </section>

                    <section class="mb-3">
                        <h2 class="small text-uppercase mb-2 text-dark">Historical Industry Highs</h2>

                        <div class="row mb-4">
                            <div class="col-md-6 mb-md-4 mb-2 mb-md-0">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Most Ships</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="icon">
                                            <i class="fa fa-ship fa-5x"></i>
                                        </div>
                                        <p class=" font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.vessels"></span>
                                            <span v-else>
                                                {{ highs.vessels.count }}
                                            </span>
                                            <small class="h5 font-weight-bold text-uppercase text-muted">ships</small>
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

                            <div class="col-md-6 mb-md-4 mb-2 mb-md-0">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Most Flights</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="icon">
                                            <i class="fa fa-plane fa-5x"></i>
                                        </div>

                                        <p class="font-weight-bold my-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.flights"></span>
                                            <span v-else>
                                                {{ highs.flights.count }}
                                            </span>
                                            <small class="h5 font-weight-bold text-uppercase text-muted">flights</small>
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

                            <div class="col-md-6 mt-md-2 mb-2 mb-md-0">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Most Trains</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="icon">
                                            <i class="fa fa-train fa-5x"></i>
                                        </div>
                                        <p class="font-weight-bold mb-0 aqi-stat__stat">
                                            <span class="number--blurred" v-if="! highs.trains"></span>
                                            <span v-else>
                                                {{ highs.trains.count }}
                                            </span>
                                            <small class="h5 font-weight-bold text-uppercase text-muted">trains</small>
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

                            <div class="col-md-6 mt-md-2">
                                <div class="card br-0 overflow-hidden">
                                    <div class="card-header">
                                        <h5 class="mb-0 card-title text-uppercase small">Most Traffic</h5>
                                    </div>
                                    <div class="card-body aqi-stat"
                                    >
                                        <div class="icon">
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
                    </section>
                </div>
            </div>
        </section>

        <section class="container pt-lg-10 pb-lg-20 pb-10 w-lg-50 text-center" id="report">
            <h2 class="display-4 pb-0 font-weight-bold text-uppercase mb-0">
                <span class="site-heading mt-n1 d-block">Report an Incident</span>
            </h2>
            <blockquote class="blockquote">
                <p>To report an environmental emergency, call IDEM’s 24-Hour Emergency Spill Line toll free at <a href="tel:(888) 233-7745">(888) 233-7745</a> or <a href="tel:(317) 233-7745">(317) 233-7745</a></p>
                <footer class="blockquote-footer">
                    visit <cite title="Source Title">
                        <a href="https://www.in.gov/idem/cleanups/investigation-and-cleanup-programs/emergency-response/" target="_blank">in.gov/idem</a>
                    </cite> for more information
                </footer>
            </blockquote>
        </section>

        <footer class="container mb-5" id="thanks">
            <div class="row">
                <div class="col-md-5 mb-10 mb-md-0">
                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left">
                        Special Thanks 👏
                        <div>&mdash;</div>
                    </h2>

                    <p class="lead text-center text-md-left mb-5 w-lg-75">
                        Residents of Miller Beach, Gary, IN for crowd-funding the original <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii" role="button" target="_blank">PurpleAir PA-II</a> sensor.
                    </p>

                    <p class="lead partner-logo mb-5 mb-md-0 text-center text-md-left border border-left-0 border-right-0 py-3">
                        Flight tracking generously provided by: <a class="d-block" href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" role="button" target="_blank">
                            <img class="d-block mt-2 mx-auto mx-md-0" src="/images/aviation-edge-logo-small-medium.png" alt="Aviation Edge">
                        </a>
                    </p>

                    <p class="lead partner-logo mb-5 mt-4 mt-xs-0 mb-md-0 text-center text-md-left">
                        AIS & Vessel tracking provided by: <a class="d-block" href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" role="button" target="_blank">
                            <img class="d-block mt-2 mx-auto mx-md-0" src="/images/FleetMon-logo-medium-large.png" alt="FleetMon">
                        </a>
                    </p>
                </div>

                <div class="col-md-6 support-us offset-md-1">
                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left ">
                        Support Us / Contribute
                        <div>&mdash;</div>
                    </h2>
                    <ul class="">
                        <li>Host more air quality sensors throughout NWI, such as the <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii" target="_blank">Purple Air PA-II</a>. Allow us to track air quality in the greater region, and not just localised to Miller Beach.</li>
                        <li>Contribute to the project's codebase. Submit a <a href="https://github.com/kingsloi/community-airmonitor" target="_blank">pull request</a> with your edits. It's written in Node.js & Vue.js.</li>
                        <li><a href="https://github.com/kingsloi/community-airmonitor" target="_blank">Fork your own version</a>, customise it for your community, and host it. Help bring awareness to your neighbourhood's air quality &amp; industry.</li>
                        <li>Storing data is expensive, support our efforts in longer-term air quality tracking by donating cloud MongoDB hosting.</li>
                        <li>Keep this website up and running by <a href="https://www.buymeacoffee.com/kingsloi" target="_blank">buying the host a coffee</a>.</li>
                        <li>Help get more accurate/localised weather <a href="https://shop.weatherflow.com/products/tempest" target="_blank">purchasing this weather station</a>.</li>
                        <li>We use the free version for both the <a href="https://darksky.net/dev" target="_blank">weather</a> and <a href="https://developer.mapquest.com/plans" target="_blank">traffic</a> services, limiting how many times we can check,, support us by providing a premium key so we can increase how frequently we can check.</li>
                    </ul>
                </div>

                <div class="col-md-6 sources offset-md-3 mt-10">
                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left ">
                        News / Links / Sources
                        <div>&mdash;</div>
                    </h2>
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

                    <h2 class="h4 text-uppercase font-weight-light text-center text-md-left mt-10">
                        Notes
                        <div>&mdash;</div>
                    </h2>
                    <ol class="footnotes small pl-0">
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
/* eslint-disable no-console */
require('leaflet-rotatedmarker');
// const geo = require('geolocation-utils');
// import Worker from "../trend.worker.js";
import trendWorker from '@/trend-worker';

import _ from 'lodash';
import $ from 'jquery';
import L from 'leaflet';
import moment from 'moment';
import ApexCharts from 'apexcharts/dist/apexcharts.esm.js';
import { API } from '@/api';
import megaemitters from '../config/megaemitters.js';
import lmz742 from '../config/742-LMZ.js';
import lmz743 from '../config/743-LMZ.js';
import lmz744 from '../config/744-LMZ.js';
import lmz745 from '../config/745-LMZ.js';
import lmz046 from '../config/046-LMZ.js';

export default {
    metaInfo: {
        title: 'Miller Beach Air Quality, Weather, & Industry Dashboard',
        titleTemplate: null,
        meta: [
          { name: 'description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place." },

            { property: 'og:title', content: 'Miller Beach Air Quality, Weather, & Industry Dashboard' },
            { property: 'og:site_name', content: 'How\'s OUR Air Quality?' },

            { property: 'og:type', content: 'website' },

            { property: 'og:url', content: 'https://millerbeach.community/' },
            { property: 'og:image', content: 'https://millerbeach.community/images/millerbeach-gary-nwi-air-quality-promo.jpg' },

            { property: 'og:description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place." },

            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:site', content: 'https://millerbeach.community' },
            { name: 'twitter:title', content: 'Miller Beach / Gary / NWI Air Quality' },
            { name: 'twitter:description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place." },

            { name: 'twitter:image:src', content: 'https://millerbeach.community/images/millerbeach-gary-nwi-air-quality-promo.jpg' },

            { itemprop: 'name', content: 'Miller Beach / Gary / NWI Air Quality' },
            { itemprop: 'description', content: "A community-powered air quality/industry tracker for the Miller Beach/Gary/NWI region, tracking the air we breathe, ships on Lake Michigan, GYY/ORD/MDW flights, trains, and traffic congestion, all in one place." },
            { itemprop: 'image', content: 'https://millerbeach.community/images/millerbeach-gary-nwi-air-quality-promo.jpg' }
        ]
    },

    computed: {
        base() {
            return process.env.VUE_APP_API_URL;
        },
        airshitContainsGases() {
            return Object.keys(this.airshit.data).filter(e => this.airshit.data[e]).some(metric => this.measurementTypes.gases.indexOf(metric) > -1);
        },
        trend() {
            return this.$store.state.trend;
        },
        airshits() {
            return this.$store.state.airshits;
        },
        airshit() {
            return this.$store.state.airshit;
        },

        advisories() {
            return this.$store.state.advisories;
        },

        flights() {
            return this.$store.state.flights;
        },

        traffic() {
            return this.$store.state.traffic;
        },

        trains() {
            return this.$store.state.trains;
        },

        vessels() {
            return this.$store.state.vessels;
        },

        weather() {
            return this.$store.state.weather;
        },

        highs() {
            return this.$store.state.highs;
        },
        geography() {
            return this.$store.state.geography;
        },
        congestionMiles() {
          let total = 0;
          const incidents = this.$store.state.traffic.data || [];

          incidents.map((incident) => {
            total += incident.distance;
          });

          return total.toFixed(0);
        },
        congestionTime() {
            let total = 0;
            const incidents = this.$store.state.traffic.data || [];

            incidents.map((incident) => {
                total += incident.freeFlowMinDelay;
            });

            return total.toFixed(0);
        },
        vesselsByType() {
            const vessels = this.vessels.data;

            return _.groupBy(vessels, 'type');
        },
        overallAirQuality() {
            const pm25 = this.getOverallAqiScore(this.airshit.data.PM25REALTIME && this.airshit.data.PM25REALTIME.aqi || 0);
            const pm10 = this.getOverallAqiScore(this.airshit.data.PM10REALTIME && this.airshit.data.PM10REALTIME.aqi || 0);
            const so2 = this.getOverallAqiScore(this.airshit.data.SO2REALTIME && this.airshit.data.SO2REALTIME.aqi || 0);
            const no2 = this.getOverallAqiScore(this.airshit.data.NO2REALTIME && this.airshit.data.NO2REALTIME.aqi || 0);
            const o3 = this.getOverallAqiScore(this.airshit.data.O3REALTIME && this.airshit.data.O3REALTIME.aqi || 0);
            const co = this.getOverallAqiScore(this.airshit.data.COREALTIME && this.airshit.data.COREALTIME.aqi || 0);

            const severity = [
                'good',
                'moderate',
                'unhealthy-sensitive',
                'unhealthy',
                'unhealthy-very',
                'death'
            ];

            return severity[Math.max(
                severity.indexOf(pm25), severity.indexOf(pm10),
                severity.indexOf(so2), severity.indexOf(no2), severity.indexOf(o3), severity.indexOf(co)
            )];
        },
        overallFlightTotal() {
            if (! this.flights.data) return 0;

            return [this.flights.data.length].reduce((a, b) => { return a + b; });
        },
        overallVesselsTotal() {
            return this.vessels.data.length;
        },
        overallTrainsTotal() {
            return this.trains.data.length;
        },
    },

    data() {
        return {
            loaded: {
                trends: false,
            },

            activeIndustries: [],

            mapMaskActive: true,

            datasets: [],

            lakeZones: {
                'LMZ742': 'Northerly Island IL, Calumet Harbor IL',
                'LMZ743': 'Calumet Harbor, IL to Gary, IN',
                'LMZ744': 'Gary, IN to Burns Harbor, IN',
                'LMZ745': 'Burns Harbor, IN to Michigan City, IN',
                'LMZ046': 'Michigan City, IN to New Buffalo, MI',
            },

            measurementTypes: {
                pm:     ['PM1REALTIME','PM25REALTIME', 'PM4REALTIME', 'PM10REALTIME'],
                gases:  ['SO2REALTIME', 'NOREALTIME', 'NO2REALTIME', 'O3REALTIME', 'COREALTIME'],
            },

            measurements: {
                'measurement-1': 'PM1REALTIME',
                'measurement-2': 'PM25REALTIME',
                'measurement-3': 'PM4REALTIME',
                'measurement-4': 'PM10REALTIME',

                'measurement-5': 'SO2REALTIME',
                'measurement-6': 'NOREALTIME',
                'measurement-7': 'NO2REALTIME',
                'measurement-8': 'O3REALTIME',
                'measurement-9': 'COREALTIME'
            },
        }
    },

    created () {
        this.getLatestValues();
        this.getHighestValues();
        this.getTrendValues();
    },

    watch: {
        '$route': 'getLatestValues'
    },

    methods: {
        buildChart(trends) {
          trendWorker.send({ trends, measurements: this.measurements })
        },

        getAirportFlights(airport) {
            return this.flights.data.filter((flight) => {
                return flight.departing === airport || flight.arriving === airport;
            });
        },

        toggle(variable, value) {
            this[variable] = this[variable].includes(value) ? this[variable].filter(i => i !== value) : [ ...this[variable], value ];
        },

        removeMapMask() {
            this.mapMaskActive = false;
        },

        getTrendValues() {
            API.get(`/trend`).then(response => {
                const { data: { weathers, airshits, flights, traffics, trains, vessels } } = response;

                this.buildChart({ weathers, airshits, flights, traffics, trains, vessels })
            })
            .catch(e => {
                alert('error!');
                console.log(e); // eslint-disable-line no-console
            });
        },

        getHighestValues() {
            API.get(`/highs`).then(response => {
                this.$store.commit('setHistoricalHighs', response.data);
            })
            .catch(e => {
                alert('error!');
                console.log(e); // eslint-disable-line no-console
            });
        },

        getLatestValues() {
            API.get(`/currently`).then(response => {
                this.$store.commit('setGeography', response.data.geography);

                this.$store.commit('setAirshit', response.data.airshit);

                if (response.data.advisories) this.$store.commit('setAdvisories', response.data.advisories);
                if (response.data.flight) this.$store.commit('setFlight', response.data.flight);
                if (response.data.traffic) this.$store.commit('setTraffic', response.data.traffic);
                if (response.data.train) this.$store.commit('setTrain', response.data.train);
                if (response.data.vessel) this.$store.commit('setVessel', response.data.vessel);
                if (response.data.vesselphotos) this.$store.commit('setVesselPhotos', response.data.vesselphotos);
                if (response.data.weather) this.$store.commit('setWeather', response.data.weather);

                this.initMap();
            })
            .catch(e => {
                alert('error!');
                console.log(e); // eslint-disable-line no-console
            });
        },

        initChart(options) {
            const chart = new ApexCharts(document.querySelector("#chart"), options);

            chart.render();
        },

        initMap() {
            const self = this;
            if (! document.getElementById('map')) {
                return;
            }

            if (document.querySelector('.leaflet-container')) {
                return;
            }

            const root = process.env.VUE_APP_API_URL;

            const map = L.map('map', { scrollWheelZoom: false }).setView([
                this.$store.state.geography.sensor.lat, this.$store.state.geography.sensor.lng
            ], 10);

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

            const sensorIcon        = new LeafIcon({iconUrl: `${root}/images/maps/icons8-radio-tower-50.png`});
            const trainIcon         = new LeafIcon({iconUrl: `${root}/images/maps/icons8-train-50.png`});
            const aircraftIcon      = new LeafIcon({iconUrl: `${root}/images/maps/icons8-airport-50.png`});
            const boatIcon          = new LeafIcon({iconUrl: `${root}/images/maps/icons8-fishing-boat-50.png`});
            const trafficIcon       = new LeafIcon({iconUrl: `${root}/images/maps/icons8-traffic-jam-50.png`});
            const shitIcon          = new LeafIcon({iconUrl: `${root}/images/maps/icons8-factory-50.png`});

            megaemitters.forEach((shit) => {
                L.marker([ shit.lat, shit.lng ], { icon: shitIcon }).bindPopup(`${shit.name}`).addTo(map);
            });

            const advisory = (zone) => this.advisories.data.map(a => a.geocode).filter(a => a.indexOf(zone.toUpperCase()) !== -1 ).length > 0 ? '#ff4433' : '#3388ff';

            L.polygon(
                lmz742.map(ll => ll.reverse()), { color: advisory('lmz742'), fillColor: advisory('lmz742'), fillOpacity: 0.15, opacity: 0.15 }
            )
            .addTo(map)
            .bindPopup(this.generateAdvisoryPopup('lmz742'));

            L.polygon(
                lmz743.map(ll => ll.reverse()), { color: advisory('lmz743'), fillColor: advisory('lmz743'), fillOpacity: 0.15, opacity: 0.15 }
            )
            .addTo(map)
            .bindPopup(this.generateAdvisoryPopup('lmz743'));

            L.polygon(
                lmz744.map(ll => ll.reverse()), { color: advisory('lmz744'), fillColor: advisory('lmz744'), fillOpacity: 0.15, opacity: 0.15 }
            ).addTo(map)
            .bindPopup(this.generateAdvisoryPopup('lmz744'));

            L.polygon(
                lmz745.map(ll => ll.reverse()), { color: advisory('lmz745'), fillColor: advisory('lmz745'), fillOpacity: 0.15, opacity: 0.15 }
            ).addTo(map)
            .bindPopup(this.generateAdvisoryPopup('lmz745'));

            L.polygon(
                lmz046.map(ll => ll.reverse()), { color: advisory('lmz046'), fillColor: advisory('lmz046'), fillOpacity: 0.15, opacity: 0.15 }
            ).addTo(map)
            .bindPopup(this.generateAdvisoryPopup('lmz046'));

            L.marker([this.geography.sensor.lat, this.geography.sensor.lng], { icon: sensorIcon }).bindPopup(`
                Base Station, PM2.5/PM10 sensor, AIS antenna, and reported weather are recorded from this location.
            `).addTo(map);

            this.$store.state.flights.data.forEach((flight) => {
                L.marker([flight.lat, flight.lng], {icon: aircraftIcon, rotationAngle: flight.bearing}).bindPopup(`
                    Aircraft: ${flight.aircraft}<br>
                    Flight: <a href="https://www.planemapper.com/flights/${flight.flight}" target="_blank">${flight.flight}</a> <small>(open in new window)</small><br>
                    Departing: ${flight.departing}, Arriving: ${flight.arriving}<br>
                    Speed: ${flight.speed}<br>
                    Bearing: ${flight.bearing}<br>
                    Altitude: ${flight.alt}<br>
                `).addTo(map);
            });

            this.$store.state.trains.data.forEach((train) => {
                const trainAngle = (train.direction === 'East' ? 90 : 270);
                L.marker([train.lat, train.lng], {icon: trainIcon, rotationAngle: trainAngle}).bindPopup(`
                    ID: ${train.id}<br>
                    Direction: ${train.direction}
                `).addTo(map);
            });

            self.vessels.data.forEach((vessel) => {
                const vesselAngle = (vessel.direction ? this.degeesToRotation(vessel.direction) : 0);
                L.marker([vessel.lat, vessel.lng], {icon: boatIcon, rotationAngle: vesselAngle}).bindPopup(`
                    ${(this.getVesselPhoto(vessel.imo) ? `<img class="mw-100 mb-2" src="${ this.getVesselPhoto(vessel.imo) }" />` : ' ')}
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

            (this.$store.state.traffic.data || []).forEach((incident) => {
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
                case 'unsure':
                default:
                    return 'aqi--unsure';
            }
        },

        getTotalAirQualityAqiScore(airshit) {
            if (! airshit) return 0;

            const pm25 = airshit.PM25REALTIME && airshit.PM25REALTIME.aqi || 0;
            const pm10 = airshit.PM10REALTIME && airshit.PM10REALTIME.aqi || 0;

            const so2 = airshit.SO2REALTIME && airshit.SO2REALTIME.aqi || 0;
            const no2 = airshit.NO2REALTIME && airshit.NO2REALTIME.aqi || 0;
            const o3 = airshit.O3REALTIME && airshit.O3REALTIME.aqi || 0;
            const co = airshit.COREALTIME && airshit.COREALTIME.aqi || 0;

            return pm25 + pm10 + so2 + no2 + o3 + co;
        },

        formatDateTime(datetime, format = 'Do MMM YYYY HH:mm') {
            return moment(datetime).format(format);
        },

        formatDateTimeDiffToHuman(end) {
            const moment1 = moment();
            const moment2 = moment(end)
            return moment.duration(moment1.diff(moment2)).humanize();
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

        convertToLineBreaks(string) {
            const regex = /\\n|\\r\\n|\\n\\r|\\r/g;
            return string.replace(regex, '<br>');
        },

        sum(arr) {
          return (arr.reduce((a, b) => a + b, 0)).toFixed(0);
        },

        avg(arr) {
          return (this.sum(arr) / arr.length || 0).toFixed(0);
        },

        max(arr) {
            return (Math.abs(Math.max(...arr)) !== Infinity ? Math.max(...arr) : 0).toFixed(0);
        },

        getLatestUpdated() {
            const dates = [
                new Date(this.flights.createdAt),
                new Date(this.vessels.createdAt),
                new Date(this.trains.createdAt),
                new Date(this.traffic.createdAt),
                new Date(this.airshit.createdAt)
            ];

            return this.formatDateTimeDiffToLocalHuman(new Date(Math.max(...dates)));
        },

        advisoriesByZone(filter) {
            const { data: advisories } = this.advisories;

            const locations = {};

            let zones = advisories.map(f => f.geocode).flat();

            if (filter) {
                zones = zones.filter(z => z === filter);
            }

            for (const zone of zones) {
                locations[zone] = advisories.filter(a => a.geocode.indexOf(zone) > -1 && this.lakeZones[zone]);
            }

            return locations;
        },

        generateAdvisoryPopup(e) {
            let list = ``;

            const events = this.advisoriesByZone(e.toUpperCase())[e.toUpperCase()] || [].map(a => a.event)

            for (const idx of events) {
                list += `<li>${idx.event}</li>`;
            }

            if (events.length === 0) {
                list = `<li>no reported advisories</li>`;
            }

            return `
                <div>
                    <strong>${this.lakeZones[e.toUpperCase()]}</strong>
                    <ul class="pl-4">
                        ${list}
                    </ul>
                </div>
            `;
        },

        getVesselPhoto(imoNumber) {
            const { photo } = this.$store.state.photos.vessels.find(p => p.imoNumber == imoNumber) || { photo: null };

            if (photo) {
                return photo;
            }

            return null;
        },

        getRealPollutantName(pollutant) {
            let real;
            switch (pollutant) {
                case 'PM25REALTIME':
                    real = 'PM2.5'
                break;
                default:
                    real = pollutant.replace('REALTIME', '');
            }

            return real
        },
    },

    mounted() {
        const self = this;
        $('body').scrollspy({ target: '#site-navigation', offset: 50 });

        trendWorker.worker.onmessage = event => {
            self.initChart(event.data);
            self.loaded.trends = true;
        }
    },
}
</script>

<style scoped>
</style>
