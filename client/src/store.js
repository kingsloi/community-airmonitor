import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    geography: {},
    highs: {},
    grouped: {},
    airshit: {
        PM25REALTIME: null,
        PM10REALTIME: null,
        REPORTED_WEATHER: null,
        TRAINS: { SOUTHSHORE: [] },
        TRAFFIC: { INCIDENTS: [] },
        FLIGHTS: { ORD: [], MDW: [], GYY: [] },
        VESSELS: [],
    },
    airshits: [],
};

const mutations = {
    setGrouped (state, payload) {
        state.grouped = payload;
    },
    setAirshits (state, payload) {
        state.airshits = payload;
    },
    setAirshit (state, payload) {
        state.airshit = payload;
    },
    setGeography (state, payload) {
        state.geography = payload;
    },
    setHistoricalHighs (state, payload) {
        state.highs = payload;
    },
};

export default new Vuex.Store({
  state,
  mutations
})
