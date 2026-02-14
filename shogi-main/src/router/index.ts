import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('@/pages/CallbackPage.vue'),
    },
    {
      path: '/kifus',
      name: 'kifu-list',
      component: () => import('@/pages/KifuListPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/kifus/new',
      name: 'kifu-create',
      component: () => import('@/pages/KifuCreatePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/kifus/:kid',
      name: 'kifu-detail',
      component: () => import('@/pages/KifuDetailPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/kifus/:kid/edit',
      name: 'kifu-edit',
      component: () => import('@/pages/KifuEditPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/explorer',
      name: 'explorer',
      component: () => import('@/pages/ExplorerPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags',
      name: 'tag-list',
      component: () => import('@/pages/TagListPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags/new',
      name: 'tag-create',
      component: () => import('@/pages/TagCreatePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags/:tid',
      name: 'tag-detail',
      component: () => import('@/pages/TagDetailPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags/:tid/edit',
      name: 'tag-edit',
      component: () => import('@/pages/TagEditPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/delete-account',
      name: 'delete-account',
      component: () => import('@/pages/DeleteAccountPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/shared/:share_code',
      name: 'shared-kifu',
      component: () => import('@/pages/SharedKifuPage.vue'),
    },
  ],
})

// Auth guard — mock: always passes
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    // Will check oidc-client-ts UserManager in production
    // Mock: always authenticated
  }
})

export default router
