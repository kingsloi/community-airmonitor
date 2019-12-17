<template>
    <div id="dashboard">
        <div class="container">
            <div class="row">
                <div class="col-xl-6">
                    <h1 class="h3 pb-45 font-weight-bold text-uppercase">
                        <small class="d-block h6 font-weight-light">How's our Air Quality in</small>
                        Miller Beach / Gary / <abbr title="Northwest Indiana">NWI</abbr>
                    </h1>
                    <h2 class="small text-uppercase mb-0 text-dark">Currently</h2>
                    <div class="row mb-3">
                        <div class="col-6 py-2">
                            <div class="card h-100 aqi"
                                :class="getAqiScoreClassname((airshit.PM25REALTIME ? airshit.PM25REALTIME['category'] : 'Good'))"
                            >
                                <div class="card-body">
                                    <div class="rotate">
                                        <i class="fa fa-signal fa-5x"></i>
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
                                        <i class="fa fa-signal fa-5x"></i>
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
                    <h2 class="small text-uppercase mb-2 text-dark">Historical Highs</h2>

                    <div class="row mb-3 no-gutters">
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

                    <p class="lead text-right text-uppercase">
                        <a href="/past" role="button">see past air quality<i class="fa pl-1 fa-chevron-right" aria-hidden="true"></i></a>
                    </p>

                    <p class="lead">We track <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics#PM" role="button" target="_blank">PM2.5, PM10</a>, temperature, humidity, pressure, and reported weather (including wind speeds, direction, cloud coverage, etc.), so we can (hopefully) determine who, where, what, and how the weather affects the quality of the air we breathe, from a community-funded air sensor in the scenic Miller Beach neighborhood of Gary, Indiana.</p>

                    <p class="lead">In the future, depending on what data is openly available, we may be able to also gather data from the many industries around in the Region, such as <del>train schedules</del><sup><a href="#note-1">[1]</a></sup>, burn schedules, <del>traffic congestion</del>, construction, <del>air traffic</del>, mill non-conformances, <del>cargo/container ships on Lake Michigan</del>, etc.</p>

                    <p class="lead">There are plenty of other pollutants in the air we're not tracking, such as SO₂, NO₂, CO, to name a few. As soon as affordable ways of tracking these pollutants in our neighbourhood, we'll track it and add it to our data.</p>
                </div>

                <div class="col-xl-6">
                    <div class="table-responsive">
                        <table class="table text-monospace">
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
                                            Industry
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
                                    <th class="pt-5 small text-uppercase text-right" colspan="2">
                                        <p class="mb-0" v-if="geography.region">
                                            Region (polygon):<a class="pl-1" target="_blank"
                                                :title="getReversedCoordinates(geography.region.land_polygon)"
                                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.land_polygon))}`"
                                            >coordinates</a><br>
                                            Region (square):<a class="pl-1" target="_blank"
                                                :title="getReversedCoordinates(geography.region.land_square)"
                                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.land_square))}`"
                                            >coordinates</a><br>
                                            Lake:<a class="pl-1" target="_blank"
                                                :title="getReversedCoordinates(geography.region.lake)"
                                                :href="`https://www.keene.edu/campus/maps/tool/?coordinates=${encodeURIComponent(getReversedCoordinates(geography.region.lake))}`"
                                            >coordinates</a><br>
                                            Temperature, humidity, pressure recorded at sensor<br>
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

                                            <br>Last Updated {{ formatDateTimeDiffToLocalHuman(airshit.createdAt) }} ago

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

        <hr class="my-4 pb-4">

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
                            <img class="d-block mt-2 mx-auto mx-md-0" src="/images/aviation-edge-logo-small-medium.png">
                        </a>
                    </p>
                    <p class="lead partner-logo mb-5 mt-4 mt-xs-0 mb-md-0 text-center text-md-left">
                        Vessel tracking provided by: <a class="d-block" href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" role="button" target="_blank">
                            <img class="d-block mt-2 mx-auto mx-md-0" src="/images/FleetMon-logo-medium-large.png">
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
                                <li>e.g. <a href="https://echo.epa.gov/detailed-facility-report?fid=110000607558" target="_blank">ARCELORMITTAL BURNS HARBOR</a></li>
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
                            ELPC vs. ArcelorMittalLawsuit
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

        <footer class="pt-0 pt-md-5">
            <div class="container">
                <ul class="float-lg-raight list-inline text-center">
                    <li class="d-xs-block d-lg-inline-block py-3 py-lg-0">
                        <a href="https://github.com/kingsloi/community-airmonitor" target="_blank">
                            I'm open source, fork your own!
                        </a>
                    </li>
                    <li class="d-xs-block d-lg-inline-block pl-md-5 py-3 py-lg-0">
                        <a href="https://github.com/kingsloi/community-airmonitor/issues" target="_blank">
                            Issues
                        </a>
                    </li>
                    <li class="d-xs-block d-lg-inline-block pl-md-5 py-3 py-lg-0">
                        <a class="buy-coffee" href="https://www.buymeacoffee.com/kingsloi" target="_blank">
                            <img class="mr-1" src="http://localhost:8080/images/buy-coffee.svg">Buy me a coffee</a>
                    </li>
                </ul>
            </div>
            <div class="container">
                <p class="made-with-love">Made with<i class="fa fa-heart pulse"></i><a href="https://goo.gl/maps/Enx7PD4yEn6YhoF7A" target="_blank">IN Gary</a></p>
            </div>
        </footer>
    </div>
</template>

<script>
import { API } from '@/api';
import moment from 'moment';
import _ from 'lodash';

export default {
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
    return {}
  },

  methods: {
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

    formatDateTimeToLocal(datetime, format = 'dd Do MMM YY HH:mm.') {
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
    }
  },

  created() {
    API.get(`currently`).then(response => {
        this.$store.commit('setAirshit', response.data.airshit);
        this.$store.commit('setGeography', response.data.geography);
        this.$store.commit('setHistoricalHighs', response.data.highs);
    })
    .catch(e => {
        alert('error!');
        console.log(e); // eslint-disable-line no-console
    })
  }
}
</script>

<style scoped>
</style>
