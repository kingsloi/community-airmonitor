import DashboardView from './components/Dashboard.vue';
import PageNotFoundView from './components/PageNotFound.vue';
import AboutView from './components/About.vue';
import DetailedView from './components/Detailed.vue';

const routes = [
    {
        path: '/',
        component: DashboardView,
    },
    {
        path: '/about',
        component: AboutView,
        auth: false,
        metaTags: [{
            name: 'description',
            content: 'The home page of our example app.'
        }, {
            property: 'og:description',
            content: 'The home page of our example app.'
        }]
    },
    {
        path: '/detailed',
        component: DetailedView,
    },
    {
        path: '*',
        component: PageNotFoundView
    }
];

export default routes
