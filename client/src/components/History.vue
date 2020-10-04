<template>
    <div class="container">
        <div class="col-12">
            <h1 class="h3 pb-45 font-weight-bold text-uppercase">
                <small class="d-block h6 font-weight-light">Miller Beach / Gary / <abbr title="Northwest Indiana">NWI</abbr> Air Quality Tracker</small>
                <span class="site-heading">Update History</span>
            </h1>
        </div>
        <div class="col-lg-6 offset-lg-3">
            <Timeline
                :timeline-items="timelineItems"
                :message-when-no-items="messageWhenNoItems"
                :unique-year="true"
            />
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
