// 导入路由组件
import Login from '../view/Login';
// 导入路由管理工具
import { RouteConfig } from 'react-router-config';

import React from 'react';

const Dashboard = React.lazy(() => import('../view/Dashboard'))
const User = React.lazy(() => import('../view/UserManagement'))
const Role = React.lazy(() => import('../view/RoleManagement'))
const Resources = React.lazy(() => import('../view/ResourcesManagement'))
const RoleResources = React.lazy(() => import('../view/RouteManagement'))
const Home = React.lazy(() => import('../view/Home'))
const routes: RouteConfig = [
  {
    path: '/',
    exact: true,
    component: Login
  },
  {
    path: '/dashboard',
    exact: false,
    component: Dashboard,
    children: [
      {
        name: "首页",
        path: '/home',
        exact: false,
        component: Home,
    
      },
      {
      name: "用户管理",
      path: '/user/management',
      exact: false,
      component: User,
    
    },
    {
      name: "角色管理",
      path: '/role/management',
      exact: false,
      component: Role,
    
    },
    {
      name: '权限管理',
      path: '/resources/management',
      exact: false,
      component: Resources,
    
    },
    {
      name: '权限分配',
      path: '/role_route/management',
      exact: false,
      component: RoleResources,
    
    },
     ]
  },
  


  // {
  //   name: '404',
  //   path: '*',
  //   exact: false,
  //   component: ()=>{return<h1>404 找不到页面....</h1>},
  // }




]

export default routes;