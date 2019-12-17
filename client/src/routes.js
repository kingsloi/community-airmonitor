import DashboardView from './components/Dashboard.vue';
import PageNotFound from './components/PageNotFound.vue';

const routes = [
    {
        path: '/login',
        component: DashboardView
    },
    {
        path: '/',
        component: DashboardView,
        auth: true,
        children: [
            { path: '', component: DashboardView, name: 'Dashboard' },
            { path: '/tables', component: DashboardView, name: 'Tables' },
        ]
    },
    {
        path: '*',
        component: PageNotFound
    }
];

export default routes
