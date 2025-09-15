import { createBrowserRouter } from "react-router-dom";
import React, { Suspense } from "react";
import AppLayout from "@/layouts/AppLayout";
import BlankLayout from "@/layouts/BlankLayout";
import LoadingComponent from "@/components/LoadingComponent";

// 懒加载组件
const lazyLoad = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<LoadingComponent visible={true} />}>
    <Component />
  </Suspense>
);

// 视图组件懒加载
const HomeView = React.lazy(() => import("@/views/HomeView"));
const LoginView = React.lazy(() => import("@/views/LoginView"));
const AgentView = React.lazy(() => import("@/views/AgentView"));
const AgentSingleView = React.lazy(() => import("@/views/AgentSingleView"));
const GraphView = React.lazy(() => import("@/views/GraphView"));
const DataBaseView = React.lazy(() => import("@/views/DataBaseView"));
const DataBaseInfoView = React.lazy(() => import("@/views/DataBaseInfoView"));
const SettingView = React.lazy(() => import("@/views/SettingView"));
const EmptyView = React.lazy(() => import("@/views/EmptyView"));

// 路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      {
        index: true,
        element: lazyLoad(HomeView),
      },
    ],
  },
  {
    path: "/login",
    element: lazyLoad(LoginView),
  },
  {
    path: "/agent",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: lazyLoad(AgentView),
      },
    ],
  },
  {
    path: "/agent/:agentId",
    element: lazyLoad(AgentSingleView),
  },
  {
    path: "/graph",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: lazyLoad(GraphView),
      },
    ],
  },
  {
    path: "/database",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: lazyLoad(DataBaseView),
      },
      {
        path: ":databaseId",
        element: lazyLoad(DataBaseInfoView),
      },
    ],
  },
  {
    path: "/setting",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: lazyLoad(SettingView),
      },
    ],
  },
  {
    path: "*",
    element: lazyLoad(EmptyView),
  },
]);

export default router;
