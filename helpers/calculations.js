exports.totalAirQuality = function(airshit) {
    return airshit.PM25REALTIME.aqi + airshit.PM10REALTIME.aqi;
};
