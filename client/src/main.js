import Vue from 'vue'

import routes from './routes'
import store from './store'
import App from './App.vue'

import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'

import VueCompositionAPI from '@vue/composition-api'

import 'bootstrap';

Vue.use(VueRouter);
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
});
Vue.use(VueCompositionAPI);

const router = new VueRouter({
  routes: routes,
  mode: 'hash'
});

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
