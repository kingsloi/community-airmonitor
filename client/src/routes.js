import DashboardView from './components/Dashboard.vue';
import PageNotFoundView from './components/PageNotFound.vue';
import HistoryView from './components/History.vue';
import PreviousView from './components/Previous.vue';

const routes = [
    {
        path: '/',
        component: DashboardView,
    },
    {
        path: '/history',
        component: HistoryView,
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
        path: '/previous',
        component: PreviousView,
    },
    {
        path: '*',
        component: PageNotFoundView
    }
];

export default routes
