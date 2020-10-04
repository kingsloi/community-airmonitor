exports.totalAirQuality = function(airshit) {
    const pm25 = airshit.PM25REALTIME && airshit.PM25REALTIME.aqi || 0;
    const pm10 = airshit.PM10REALTIME && airshit.PM10REALTIME.aqi || 0;

    return pm25 + pm10;
};
