exports.totalAirQuality = function(airshit) {
    const pm25 = airshit.PM25REALTIME && airshit.PM25REALTIME.aqi || 0;
    const pm10 = airshit.PM10REALTIME && airshit.PM10REALTIME.aqi || 0;

    const so2 = airshit.SO2REALTIME && airshit.SO2REALTIME.aqi || 0;
    const no2 = airshit.NO2REALTIME && airshit.NO2REALTIME.aqi || 0;
    const o3 = airshit.O3REALTIME && airshit.O3REALTIME.aqi || 0;
    const co = airshit.COREALTIME && airshit.COREALTIME.aqi || 0;

    return pm25 + pm10 + so2 + no2 + o3 + co;
};
