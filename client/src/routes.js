import DashboardView from './components/Dashboard.vue';
import PageNotFound from './components/PageNotFound.vue';

const routes = [
    {
        path: '/',
        component: DashboardView,
        auth: false,
        children: [{
            path: '',
            component: DashboardView,
            name: 'Dashboard'
        }],
        metaTags: [{
            name: 'description',
            content: 'The home page of our example app.'
        }, {
            property: 'og:description',
            content: 'The home page of our example app.'
        }]
    },
    {
        path: '*',
        component: PageNotFound
    }
];

export default routes
