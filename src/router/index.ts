import { createRouter, createWebHashHistory } from 'vue-router';
import { generateRoutes } from './generator';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homepage',
      component: () => import('@/views/index.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        ...generateRoutes({
          rootAsParent: true,
        }),
      ],
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return {
      top: 0,
      behavior: 'smooth',
    };
  },
});
export default router;