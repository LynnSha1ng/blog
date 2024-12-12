import { createRouter, createWebHashHistory } from 'vue-router';
import { generateRoutes } from './generator';

const routeNoSmooth = [':postName'];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/index.vue'),
      children: [
        {
          path: '',
          name: 'homeView',
          component: () => import('@/views/_home/HomeView.vue'),
        },
        ...generateRoutes({
          rootAsParent: true,
        }),
      ],
    },
    {
      path: '/about',
      name: 'aboutView',
      component: () => import('@/views/_about/AboutView.vue'),
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    const behavior = routeNoSmooth.includes(to.name!.toString())
      ? 'auto'
      : 'smooth';

    return {
      top: 0,
      behavior,
    };
  },
});

export default router;
