import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeFilled
} from '@ant-design/icons';
import { Layout, Menu, Button, theme } from 'antd';
import { Link, Route, BrowserRouter as Router, useHistory } from 'react-router-dom';
import RoleResources from './RoleResourcesManagement';
import Resources from './ResourcesManagement';
import Role from './RoleManagement';
import User from './UserManagement';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const history = useHistory();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token === undefined || token === null) {
      history.push("/")
    } else {
      history.push("/dashboard")
    }
  }, [])
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Router>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <h1 className='log'>Demo</h1>
          <Menu
            theme="dark"
            mode="inline"
          >
            <Menu.Item key="1"><Link to="/dashboard"><HomeFilled /><span>首页</span></Link></Menu.Item>
            <Menu.Item key="2"><Link to="/user/management"><HomeFilled /><span>用户管理</span></Link></Menu.Item>
            <Menu.Item key="3"><Link to="/role/management"><HomeFilled /><span>角色管理</span></Link></Menu.Item>
            <Menu.Item key="4"><Link to="/resources/management"><HomeFilled /><span>权限管理</span></Link></Menu.Item>
            <Menu.Item key="5"><Link to="/role-resources/management"><HomeFilled /><span>权限分配</span></Link></Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 620,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Route path="/user/management" render={() => (<User />)} />
            <Route path="/role/management" render={() => (<Role />)} />
            <Route path="/resources/management" render={() => (<Resources />)} />
            <Route path="/role-resources/management" render={() => (<RoleResources />)} />
          </Content>

        </Layout>
      </Router>
    </Layout>
  );
};

export default Dashboard;