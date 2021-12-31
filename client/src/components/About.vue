<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 class="h3 pb-45 font-weight-bold text-uppercase">
                    <small class="d-block h6 font-weight-light">Miller Beach / Gary / <abbr title="Northwest Indiana">NWI</abbr> Air Quality Tracker</small>
                    <span class="site-heading">About & Updates</span>
                </h1>
            </div>
        </div>

        <div class="row">
            <section class="col-12" id="about">
                <h2 class="h6 pb-45 font-weight-bold text-uppercase mb-5">
                    <span class="site-heading text-center d-block">History</span>
                </h2>

                <div class="mb-10 inner">
                    <p>In September 2019, a foul odor rolled through the Miller Beach neighbourhood of Gary IN, causing many residents to experience eye irritation, headaches, and nausea. This came a month after a local steel mill had <a href="https://www.in.gov/idem/cleanwater/2576.htm" target="_blank">exceeded the daily maximum allowance of cyanide and ammonia-nitrogen</a>, releasing a <a href="https://echo.epa.gov/detailed-facility-report?fid=110000607558" target="_blank">considerable amount</a> of both chemicals into a tributary of Lake Michigan which went <a href="https://chicago.cbslocal.com/2019/08/20/arcelormittal-spill-indiana-state/" target="_blank">unreported for days</a>, <a href="https://www.epa.gov/in/arcelormittal-burns-harbor-llc-portage-indiana" target="_blank">killing 1000s</a> of fish, <a href="https://apnews.com/bd9de73946954208b93cf5c9406c83c7" target="_blank">restricting intake</a> of a water filtration plant, <a href="https://www.washingtonpost.com/climate-environment/2019/08/19/cyanide-steel-plant-trickled-into-lake-michigan-days-before-public-was-notified/" target="_blank">closing local beaches</a>, and portions of the <a href="https://www.nps.gov/indu/learn/news/chemical-spill-indu-20190814.htm">Indiana Dunes National Park</a>.

                    <p>Suspected the source was likely from one of the many mills/refineries in the region but with no data to support it, a handful of neighbours purchased a <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii" target="_blank">PurpleAir PA II Air Quality Sensor</a> to check the air quality in their neighbourhood in realtime, bringing awareness to how the local industry affects the air that residents and tourists of Miller Beach, Gary, &amp; Northwest Indiana breathe.</p>

                    <p>By tracking the <a href="https://en.wikipedia.org/wiki/Air_quality_index" role="button" target="_blank">Air Quality Index (AQI)</a>, measuring both <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics#PM" role="button" target="_blank">PM2.5 and PM10</a> particles, temperature, humidity, atmospheric pressure, wind speed, wind direction, cloud coverage, UV index, etc. to determine how the weather and local industry affects the local air quality.</p>

                    <p>There are plenty of other pollutants in the air not being tracked, such as SO₂, NO₂, CO, to name a few. As soon as affordable ways of tracking these pollutants in our neighbourhood are available, they'll be tracked add it to our data.</p>
                </div>
            </section>
        </div>

        <div class="row">
            <div class="col-12">
                <h2 class="h5 pb-45 font-weight-bold text-uppercase mb-5">
                    <span class="site-heading text-center d-block">Updates</span>
                </h2>
            </div>

            <section class="col-lg-6 offset-lg-3">
                <Timeline
                    :timeline-items="timelineItems"
                    :message-when-no-items="messageWhenNoItems"
                    :unique-year="true"
                />
            </section>
        </div>

    </div>
</template>

<script>
    import Timeline from 'timeline-vuejs';
    export default {
        components: {
            Timeline
        },
        data() {
            return {
                messageWhenNoItems: 'There are not items.',
                timelineItems: [
                    {
                        from: new Date(2020, 12),
                        title: 'Added a detailed view of all airshits',
                        description: `available at: <a href="/#/detailed">millerbeach.community/detailed</a>`
                    },
                    {
                        from: new Date(2020, 11),
                        title: 'Shared Proposals/research/files',
                        description: `Any/all research, files, proposals, etc will be hosted at <a href="/files" target="_blank">millerbeach.community/files</a>.`
                    }, {
                        from: new Date(2020, 9),
                        title: 'A new URL & fresh coat of paint',
                        description: `Updated dashboard design and rebranded as <a href="https://millerbeach.community" target="_blank">millerbeach.community</a>.`
                    }, {
                        from: new Date(2019, 10),
                        title: '<a href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">FleetMon</a> Provide AIS/Ship Tracking 🙏',
                        description: `Located at the southernmost point of Lake Michigan, tankers, pushers/tugs can be seen constantly traversing across Lake Michigan (and beyond), making deliveries to/from the local industry. <a href="https://www.fleetmon.com/my/ais-stations?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">FleetMon</a>, a database of ships and ports world-wide, provided a ship-tracking (AIS) antenna and developer access to ships and their routes, on our Lake/in our community 24/7.`
                    }, {
                        from: new Date(2019, 9),
                        title: '<a href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">Aviation Edge</a> Provide Flight Tracking 🙏',
                        description: 'Miller Beach / Gary is within close proximity of Chicago o\'Hare international airport, Midway international airport, and Gary international airport, with hundreds of thousands of flights arriving/departing each year, flying directly over our community 24/7. <a href="https://aviation-edge.com?utm_source=gary-indiana-opensource-air-monitor-footer" target="_blank">Aviation Edge</a> generously provided developer access to their flight database, allowing us to track air travel to/from our local airports.'
                    }, {
                        from: new Date(2019, 9),
                        title: 'This Website Launched 🎉🎉🎉!',
                        description: `A resident of Miller Beach launched this website to provide an easy way to view current air quality, the weather, and industry in their community. Nestled in the middle of the largest steelmaking complex in the US, Gary's air and water are heavily affected by the local industry.`
                    }, {
                        from: new Date(2019, 9),
                        title: 'Neighbours Crowdfunded Air Quality Monitor',
                        description: `Miller Beach/Gary neighbours purchased a <a href="https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii">Purple Air Quality Monitor</a> to track our local air quality around the clock.`
                    }, {
                        from: new Date(2019, 8),
                        title: 'Neighbours Reported Foul Odour Causing Illness',
                        description: 'Using Nextdoor.com, neighbours reported a foul odour rolling through their neighbourhood which caused eye irritation, headaches, and nausea. IDEM were contacted and investigated but couldn\'t find the source of the odour. This helped raise awareness of our local air quality, pollution, and the local industry\'s affect on the quality of the air we\'re breathing.'
                    }, {
                        from: new Date(2019, 7),
                        title: '<a href="https://www.in.gov/idem/cleanwater/2576.htm">ArcelorMittal leak Cyanide into tributary of Lake Michigan</a>',
                        description: `<blockquote>The Indiana Department of Environmental Management (IDEM) and Department of Natural Resources (DNR) are currently responding to a reported fish kill in the East Branch of the Little Calumet River in Portage, Ind.
                            <br/> IDEM has learned that ArcelorMittal experienced exceedances of the daily maximum limit for total cyanide and ammonia-nitrogen. These exceedances appear to be the cause or a significant contributing factor to the mortality of the fish observed on the East Arm of the Little Calumet River. IDEM has requested that the facility initiate a spill response along with increased monitoring of its outfalls to the Little Calumet River. IDEM and DNR ask residents to continue to avoid this area while cleanup and mitigation efforts are ongoing.</blockquote>`
                    }]
            }
        }
    }
</script>

<style scoped>
</style>
