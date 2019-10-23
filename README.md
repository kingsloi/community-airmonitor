# Community Air Monitor
> Tracking PM2.5/PM10 via a Purple Air Sensor, weather, traffic congestion, trains schedules, and more, in the [Miller Beach](https://en.wikipedia.org/wiki/Miller_Beach) neighbourhood of [Gary, IN](https://en.wikipedia.org/wiki/Gary,_Indiana).

> — [https://millerbeach-air.com](https://millerbeach-air.com)

In August 2019, [ArcelorMittal leaked cyanide into the Little Calumet River in Portage, IN](https://www.washingtonpost.com/climate-environment/2019/08/19/cyanide-steel-plant-trickled-into-lake-michigan-days-before-public-was-notified/), killing fish, forcing the closure of the Indiana Dunes National Park, and the many beaches along the Lake Michigan shoreline, affecting the livelihood of the many thousands of people who rely on the Lake/beach daily, but also the many tourists who were visiting the region, during the peak of summer. A few months later in October 2019, neighbours reported a foul odour that was causing eye irritation, headaches, and nausea. Northwest Indiana is described as housing "the largest steelmaking complex in North America" with:

 - BP Whiting Refinery
 - U.S. Steel's East Chicago Tin
 - ArcelorMittal Indiana Harbor in East Chicago
 - Gary Works, once the world's largest steel mill, now the largest mill in North America. [source](https://en.wikipedia.org/wiki/Gary_Works)

all within 15 miles of Gary, IN. Suspecting the foul odor was caused by one of the many mills in the region, and sick of constant air/water polluting, a handful of residents of Gary residents crowd-funded a [Purple Air PA-II](https://www2.purpleair.com/collections/air-quality-sensors/products/purpleair-pa-ii) air sensor to track the air quality in our community. Pulling in other sources of pollutants such as car congestion, train traffic, mill train traffic/coal/fuel/steel deliveries, flights overhead to/from ORD, MDW, GYY, tanker traffic in Lake Michigan, etc., we may be able to determine who, where, and how is impacting the air we breathe. As soon as other means of affordable/open tracking other pollutants, water quality, etc. we'll add and track it here.

Getting Started
---------------
Create & host your own community air monitor site:
```bash
git clone https://github.com/kingsloi/community-airmonitor.git
cd community-airmonitor
npm install
cp .env.example .env
vi .env
node app.js

# Update stats manually
curl http://localhost:8080/sync?hash=YOUR_HASH_SET_IN_ENV_FILE

# Update stats automatically every 10 minutes
crontab -e
*/10 * * * * curl --request GET 'http://localhost:8080/sync?hash=YOUR_HASH_SET_IN_ENV_FILE'
```

## Sources:
- https://darksky.net/dev/docs
- http://southshore.etaspot.net/
- https://github.com/cscape/miamitransit-docs/wiki/ETA-Transit-API
- https://developer.mapquest.com/documentation/traffic-api/incidents/get/
- https://indianaeconomicdigest.com/MobileContent/Most-Recent/Steel/Article/Indiana-companies-received-916-exemptions-to-Section-232-steel-tariffs/31/110/95205
- https://aviation-edge.com
- https://aviation-edge.com/developers/
