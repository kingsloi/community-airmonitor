exports.totalAirQuality = function(airshit) {
    if (! airshit || ! airshit.PM25REALTIME || ! airshit.PM10REALTIME) {
        return 0;
    }

    const pm25 = airshit.PM25REALTIME.aqi || 0;
    const pm10 = airshit.PM10REALTIME.aqi || 0;

    return pm25 + pm10;
};
