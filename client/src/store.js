import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    geography: {},

    highs: {},

    grouped: {},

    airshits: [],

    airshit: {
        data: {
            PM1REALTIME: null,
            PM25REALTIME: null,
            PM4REALTIME: null,
            PM10REALTIME: null,

            SO2REALTIME: null,
            NOREALTIME: null,
            NO2REALTIME: null,
            O3REALTIME: null,
            COREALTIME: null,
            H2SREALTIME: null,
        },
        createdAt: null,
        updatedAt: null,
    },

    advisories: { data: [], createdAt: null, updatedAt: null },
    flights: { data: [], createdAt: null, updatedAt: null },
    traffic: { data: [], createdAt: null, updatedAt: null },
    trains: { data: [], createdAt: null, updatedAt: null },
    vessels: { data: [], createdAt: null, updatedAt: null },

    weather: {
        data: {
            summary: '',
            apparentTemperature: 0,
            windSpeed: 0,
            windGust: 0,
            windBearing: 0,
            humidity: 0,
            dewPoint: 0,
            cloudCover: 0,
            uvIndex: 0,
            pressure: 0,
            precipIntensity: 0,
            ozone: 0,
            visibility: 0,
        },
        createdAt: null,
        updatedAt: null,
    },

    photos: {
        vessels: {}
    },
};

const mutations = {
    setGrouped (state, payload) {
        state.grouped = payload;
    },
    setAirshits (state, payload) {
        state.airshits = payload;
    },
    setGeography (state, payload) {
        state.geography = payload;
    },
    setHistoricalHighs (state, payload) {
        state.highs = payload;
    },
    setVesselPhotos (state, payload) {
        state.photos.vessels = payload;
    },
    setAirshit (state, payload) {
        const {
            PM1REALTIME, PM25REALTIME, PM4REALTIME, PM10REALTIME,

            SO2REALTIME,
            O3REALTIME,
            COREALTIME,
            CO2REALTIME,
            NOREALTIME, NO2REALTIME,

            H2SREALTIME,

            createdAt,
            updatedAt
        } = payload;

        state.airshit.data = {
            PM1REALTIME, PM25REALTIME, PM4REALTIME, PM10REALTIME,

            SO2REALTIME,
            O3REALTIME,
            COREALTIME,
            CO2REALTIME,
            NOREALTIME, NO2REALTIME,

            H2SREALTIME,
        };

        state.airshit.createdAt = createdAt;
        state.airshit.updatedAt = updatedAt;
    },
    setAdvisories (state, payload) {
        const { ADVISORIES, createdAt, updatedAt } = payload;
        state.advisories.data = ADVISORIES;
        state.advisories.createdAt = createdAt;
        state.advisories.updatedAt = updatedAt;
    },
    setFlight (state, payload) {
        const { FLIGHTS, createdAt, updatedAt } = payload;
        state.flights.data = FLIGHTS;
        state.flights.createdAt = createdAt;
        state.flights.updatedAt = updatedAt;
    },
    setTraffic (state, payload) {
        const { INCIDENTS, createdAt, updatedAt } = payload;
        state.traffic.data = INCIDENTS;
        state.traffic.createdAt = createdAt;
        state.traffic.updatedAt = updatedAt;
    },
    setTrain (state, payload) {
        const { SOUTHSHORE, createdAt, updatedAt } = payload;
        state.trains.data = SOUTHSHORE;
        state.trains.createdAt = createdAt;
        state.trains.updatedAt = updatedAt;
    },
    setVessel (state, payload) {
        const { VESSELS, createdAt, updatedAt } = payload;
        state.vessels.data = VESSELS;
        state.vessels.createdAt = createdAt;
        state.vessels.updatedAt = updatedAt;
    },
    setWeather (state, payload) {
        const { REPORTED_WEATHER, createdAt, updatedAt } = payload;
        state.weather.data = REPORTED_WEATHER;
        state.weather.createdAt = createdAt;
        state.weather.updatedAt = updatedAt;
    },
};

export default new Vuex.Store({ state, mutations });
