import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import BlankLayout from '@/layouts/BlankLayout'

// TODO: Implement lazy loading for components
import HomeView from '@/views/HomeView'
import LoginView from '@/views/LoginView'
import AgentView from '@/views/AgentView'
import AgentSingleView from '@/views/AgentSingleView'
import GraphView from '@/views/GraphView'
import DataBaseView from '@/views/DataBaseView'
import DataBaseInfoView from '@/views/DataBaseInfoView'
import SettingView from '@/views/SettingView'
import EmptyView from '@/views/EmptyView'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      {
        index: true,
        element: <HomeView />
      }
    ]
  },
  {
    path: '/login',
    element: <LoginView />
  },
  {
    path: '/agent',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <AgentView />
      }
    ]
  },
  {
    path: '/agent/:agent_id',
    element: <AgentSingleView />
  },
  {
    path: '/graph',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <GraphView />
      }
    ]
  },
  {
    path: '/database',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DataBaseView />
      },
      {
        path: ':database_id',
        element: <DataBaseInfoView />
      }
    ]
  },
  {
    path: '/setting',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <SettingView />
      }
    ]
  },
  {
    path: '*',
    element: <EmptyView />
  }
])

// TODO: Implement navigation guards after migrating stores and components
// router.beforeEach(async (to, from, next) => { ... });

export default router
