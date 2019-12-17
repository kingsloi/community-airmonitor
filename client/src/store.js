import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    geography: {},
    highs: {},
    airshit: {},
    airshits: [],
};

const mutations = {
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
