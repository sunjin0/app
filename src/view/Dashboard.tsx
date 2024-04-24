import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeFilled
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Flex, Space } from 'antd';
import { Link, Route, BrowserRouter as Router, useHistory, Redirect } from 'react-router-dom';
import Resources from './ResourcesManagement';
import Role from './RoleManagement';
import User from './UserManagement';
import Home from './Home';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [paths, setPaths] = useState([])
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token === undefined || token === null) {
      history.push("/")
    } else {
      history.push("/dashboard")
    }
    const path = JSON.parse(localStorage.getItem("path") || "");
    if (path !== undefined || path !== null) {
      setPaths(path);
    }

  }, [])
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const exit = () => {
    localStorage.removeItem("token");
    history.push("/")
  }
  const [layoutLeft,setLayoutLeft]=useState(true)
  return (
    <Router>
      <Layout>

        <Sider trigger={null} style={{ position: 'fixed', left: 0, top: 0, bottom: 0 }} collapsible collapsed={collapsed}>
          <h1 className='log'>Demo</h1>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['9']}
          >
            <Menu.Item key="9"><Link to="/home"><HomeFilled /><span>首页</span></Link></Menu.Item>
            {
              paths.map((item: any, index) => (
                // 注意：map 方法中需要提供一个唯一的 key 属性
                <Menu.Item key={index}><Link to={item.path}><HomeFilled /><span>{item.description}</span></Link></Menu.Item>
              ))
            }
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: layoutLeft?200:80 }}>
          <Header style={{ padding: 0, background: colorBgContainer }}>
           <Space >
           <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() =>{ setCollapsed(!collapsed); setLayoutLeft(!layoutLeft)}}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Button onClick={exit}>退出</Button>
           </Space>
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
            <Route path="/home" render={() => (<Home />)} />
            <Route path="/user/management" render={() => (<User />)} />
            <Route path="/role/management" render={() => (<Role />)} />
            <Route path="/resources/management" render={() => (<Resources />)} />
            <Redirect to="/home" />
          </Content>

        </Layout>

      </Layout>
    </Router>
  );
};

export default Dashboard;