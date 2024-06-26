import React from "react"
import "./App.css"
// 引入routes组件
import routes from "./route";
// 引入包管理工具
import { renderRoutes, RouteConfig } from "react-router-config";
import { BrowserRouter as Router } from "react-router-dom";
const App: React.FC = () => {
 
  return (
    <div className="APP">
      <Router>
        {/* 设置routes的类型为RouteConfig[]，否则报错 */}
        {renderRoutes(routes as RouteConfig[])}
      </Router>
    </div>
  );
}
export default App