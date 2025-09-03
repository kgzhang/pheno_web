import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';
import { useUserStore } from '@/stores/user';
import { useAgentStore } from '@/stores/agent';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: BlankLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/HomeView.vue'),
          meta: { keepAlive: true, requiresAuth: false }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/agent',
      name: 'AgentMain',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'AgentComp',
          component: () => import('../views/AgentView.vue'),
          meta: { keepAlive: true, requiresAuth: true, requiresAdmin: true }
        }
      ]
    },
    {
      path: '/agent/:agent_id',
      name: 'AgentSinglePage',
      component: () => import('../views/AgentSingleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/graph',
      name: 'graph',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'GraphComp',
          component: () => import('../views/GraphView.vue'),
          meta: { keepAlive: false, requiresAuth: true, requiresAdmin: true }
        }
      ]
    },
    {
      path: '/database',
      name: 'database',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'DatabaseComp',
          component: () => import('../views/DataBaseView.vue'),
          meta: { keepAlive: true, requiresAuth: true, requiresAdmin: true }
        },
        {
          path: ':database_id',
          name: 'DatabaseInfoComp',
          component: () => import('../views/DataBaseInfoView.vue'),
          meta: { keepAlive: false, requiresAuth: true, requiresAdmin: true }
        }
      ]
    },
    {
      path: '/setting',
      name: 'setting',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'SettingComp',
          component: () => import('../views/SettingView.vue'),
          meta: { keepAlive: true, requiresAuth: true, requiresAdmin: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/EmptyView.vue'),
      meta: { requiresAuth: false }
    },
  ]
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth === true);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const isAdmin = userStore.isAdmin;

  // 如果路由需要认证但用户未登录
  if (requiresAuth && !isLoggedIn) {
    // 保存尝试访问的路径，登录后跳转
    sessionStorage.setItem('redirect', to.fullPath);
    next('/login');
    return;
  }

  // 如果路由需要管理员权限但用户不是管理员
  if (requiresAdmin && !isAdmin) {
    // 如果是普通用户，跳转到默认智能体页面
    try {
      const agentStore = useAgentStore();
      // 等待 store 初始化完成
      if (!agentStore.isInitialized) {
        await agentStore.initialize();
      }
      
      const defaultAgent = agentStore.defaultAgent;
      if (defaultAgent && defaultAgent.id) {
        next(`/agent/${defaultAgent.id}`);
      } else {
        // 如果没有默认智能体，可以考虑跳转到第一个可用的智能体，或者一个特定的页面
        const agentIds = Object.keys(agentStore.agents);
        if (agentIds.length > 0) {
          next(`/agent/${agentIds[0]}`);
        } else {
          // 没有可用的智能体，跳转到首页
          next('/');
        }
      }
    } catch (error) {
      console.error('获取智能体信息失败:', error);
      next('/');
    }
    return;
  }

  // 如果用户已登录但访问登录页
  if (to.path === '/login' && isLoggedIn) {
    next('/');
    return;
  }

  // 其他情况正常导航
  next();
});

export default router
