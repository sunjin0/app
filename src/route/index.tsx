// 导入路由组件
import Login from '../view/Login';
// 导入路由管理工具
import { RouteConfig } from 'react-router-config';

import React from 'react';

const Dashboard = React.lazy(() => import('../view/Dashboard'))
const User = React.lazy(() => import('../view/UserManagement'))
const Role = React.lazy(() => import('../view/RoleManagement'))
const Resources = React.lazy(() => import('../view/ResourcesManagement'))
const RoleResources = React.lazy(() => import('../view/RoleResourcesManagement'))
const routes: RouteConfig = [
  {
    path: '/',
    exact: true,
    component: Login
  },
  {
    path: '/dashboard',
    exact: true,
    component: Dashboard,
    children:[{
      name: "用户管理",
      path: '/user/management',
      exact: true,
      component: User,
  
    },
    {
      name: "角色管理",
      path: '/role/management',
      exact: true,
      component: Role,
  
    },
    {
      name: '权限管理',
      path: '/resources/management',
      exact: true,
      component: Resources,
  
    },
    {
      name: '权限分配',
      path: '/role-resources/management',
      exact: true,
      component: RoleResources,
  
    },]
  },
  // {
  //   name: '404',
  //   path: '*',
  //   exact: true,
  //   component: ()=>{return<h1>404 找不到页面....</h1>},
  // }
  



]

export default routes;