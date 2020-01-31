import Vue from 'vue';
import Router from 'vue-router';
import ListPrizes from './components/ListPrizes';
import PrizeDetail from './components/PrizeDetail';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'ListPrizes',
            component: ListPrizes
        },
        {
            path: '/PrizeDetail/:id',
            name: 'PrizeDetail',
            component: PrizeDetail
        }
    ]
  });