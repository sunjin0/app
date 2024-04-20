import React, { useEffect } from 'react';
import { Button, Form, type FormProps, Input, message } from 'antd';
import "../view/view.css"
import { generateImageVerificationCode } from "../utils/util"
import { login } from "../service/login/index"
import { useHistory } from "react-router-dom"
import { log } from 'console';
type FieldType = {
  userName?: string;
  password?: string;
  code?: string;
};


const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const Login: React.FC = () => {
  const history = useHistory();
  let img = React.useRef("");
  const [messageApi, contextHolder] = message.useMessage();
  let [code, setCode] = React.useState("");
  useEffect(() => {
    generateImageVerificationCode(6).then((res: any) => {
      img.current = res.url;
      setCode(res.code);
    });
    const token = localStorage.getItem("token");
    if (token === undefined || token === null) {
      history.push("/")
    } else {
      history.push("/dashboard")
    }

  }, []);

  const changCode = () => {
    generateImageVerificationCode(6).then((res: any) => {
      img.current = res.url;
      setCode(res.code);

    });
  }
  const onFinish: FormProps<FieldType>["onFinish"] = (values: FieldType) => {
    if (values.code?.toUpperCase() !== code.toUpperCase()) {
      messageApi.open(
        {
          type: 'error',
          content: '验证码错误！',
        })
      return;
    }
    login(values).then((res:any) => {
      console.log(res);

      if (res.code === "200") {
        messageApi.open(
          {
            type: 'info',
            content: "登陆成功",
          })
        history.push("/dashboard");
        localStorage.setItem("path",JSON.stringify(res.data.path))
      } else {
        messageApi.open(
          {
            type: 'error',
            content: res.data + "",
          })
      }
    })




  };
  return (

    <div className='Login'>
      {contextHolder}
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="用户名"
          name="userName"
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          label="验证码"
          name="code"
          rules={[{ required: true, message: '请输入验证码!' }]}
        >
          <div className='code'>
            <Input />
            <div onClick={changCode}>
              <img src={img.current} />
            </div>

          </div>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            登陆
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;