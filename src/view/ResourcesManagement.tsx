import React, { useState, useEffect, useRef } from 'react';
import { Button, FormProps, message, Modal, Select, SelectProps, Space, TableProps, Tooltip } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import resourceService from "../service/resources"
import "./view.css"
import { SearchOutlined } from "@ant-design/icons"
import { noAuthMessage, resources, role, route } from '../common';
import roleService from '../service/role';

//字段
type FieldType = {
  id: string;
  userName?: string;
};
type UserRoleField = {
  userId: string,
  roleId: string
}

const onFinishFailed: FormProps<any>["onFinishFailed"] = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

interface Item {
  routes: Array<route>,
  role: Array<role>,
  resources: Array<resources>,
  id: string,
  username: string,
  userRoleId: Array<string>
}

//表格数据
const originData: Item[] = [];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const Resources: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  let renderRef = useRef<boolean>(true);
  //初始化数据
  useEffect(() => {
    if (renderRef.current) {
      renderRef.current = false;
      return;
    }
    init();
    rolesInit();
  }, []);

  // model
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  //初始化
  const init = async () => {
    const res = await resourceService.queryPage({});
    setData(res.data.list);
  }
  const handleCancel = () => {
    setOpen(false);
  };
  //加载角色信息
  const options: SelectProps['options'] = [];
  const handleChange = (value: Array<string>) => {
    console.log(value);
  };
  const [roles, setRoles] = useState(options);
  const rolesInit = async () => {
    const res = await roleService.queryPage({ size: 998 });
   const role= res.data.list.map((el: any) => ({ label: el.description, value: el.id }))
    setRoles(role)
  }
  // 表格代码
  const [data, setData] = useState(originData);


  //查询
  const onFinish: FormProps<FieldType>["onFinish"] = async (values: FieldType) => {
    console.log('Failed:', values);
    if (values.id === undefined && values.userName === undefined) {
      init()
      return;
    }
    const res = await resourceService.queryPage({ id: values.id, userName: values.userName });
    setData(res.data.list);
  };
  //添加
  const onAddFinish: FormProps<UserRoleField>["onFinish"] = async (values: UserRoleField) => {

    if (values.userId === undefined && values.userId === undefined) {
      messageApi.open({
        type: 'warning',
        content: "请输入信息.."
      })
      return;
    }
    const res = await resourceService.saveUserRole(values);
    handleCancel();
    noAuthMessage(res, messageApi);
    init();
  };
  //删除
  const update = async (id:any,role: role[]) => {
    if (window.confirm("您确定要解除这个用户的权限吗？")) {
      let newData = data.filter((v) => v.id != id)
      setData(newData);
      const res = await resourceService.removeUserRole({userId:id,roleIds:role.map(r=>r.id)})
      noAuthMessage(res, messageApi);
      init();
    } else {
      // 用户点击了取消按钮，不执行删除操作
    }
  }
  const [form] = Form.useForm();

  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;
  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', enable: '', locked: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };
  // 修改
  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;
      row.id = key + "";
      const newData = [...data];

      const index = newData.findIndex((item) => key === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
        let { message } = await resourceService.update(row)
        messageApi.open({
          type: "success",
          content: message
        })
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      editable: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      editable: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      editable: true,
      render: (roles: Array<role>) => (
        <>
          {roles.map((role) => (
            <div key={role.id} className='columnsStyle'>
              <span>ID: {role.id}</span>
              <span>角色名: {role.name}</span>
              <span>描述: {role.description}</span>
            </div>
          ))}
        </>
      ),
    },
    {
      title: '路由',
      dataIndex: 'routes',
      key: 'routes',
      editable: true,
      render: (routes: Array<route>) => (
        <>
          {routes.map((route) => (
            <div key={route.id} className='columnsStyle'>
              <span>描述: {route.description}</span>
              <span>路径: {route.path}</span>
            </div>
          ))}
        </>
      ),
    },
    {
      title: '资源',
      dataIndex: 'resources',
      key: 'resources',
      editable: true,
      render: (resources: Array<resources>) => (
        <>
          {resources.map((resource) => (
            <div key={resource.id} className='columnsStyle'>
              <span>描述: {resource.description}</span>
              <span>API: {resource.urls}</span>
            </div>
          ))}
        </>
      ),
    },

    // 其他列配置根据需要添加
    {
      title: '操作',
      dataIndex: '操作',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <span>
              <Typography.Link onClick={() => save(record.id)} style={{ marginRight: 8 }}>
                保存
              </Typography.Link>
              <Popconfirm title="确定取消?" okText="确定"
                cancelText="取消" onConfirm={cancel}>
                <a>取消</a>
              </Popconfirm>
            </span>
          );
        } else {

          if (record.username === "root") {
            return
          } else if (record.role.length === 0) {
            return
          }
          else {
            return (
              <div>
                {/* <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                <Button size="small" type="primary"> 编辑</Button>
              </Typography.Link> */}

                <span className='marginLeft' onClick={() => update(record.id,record.role)}>
                  <Button size="small" type="primary" danger > 解除权限</Button>
                </span>
              </div>
            )
          }
        }
      },
    },
  ];
  const mergedColumns: TableProps['columns'] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'id' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });


  return (
    <div>

      <Modal
        open={open}
        title="添加权限"
        onCancel={handleCancel}
        footer
      >
        <Form initialValues={{ remember: true }}
          onFinish={onAddFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off" name="horizontal_login">
          <Form.Item<UserRoleField> name="userId" label="用户ID" >
            <Input ></Input>
          </Form.Item>
          <Form.Item<UserRoleField> name="roleId" label="角色" >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="请选择角色"
              onChange={handleChange}
              options={roles}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" >
            提交
          </Button>

        </Form>
      </Modal>
      <Form className="marginBottom" initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off" layout="inline" name="horizontal_login">
        <Form.Item<FieldType> name="id" label="ID" >
          <Input></Input>
        </Form.Item>
        <Form.Item<FieldType> name="userName" label="用户名" >
          <Input></Input>
        </Form.Item>

        <Tooltip title="search">
          <Button type="primary" icon={<SearchOutlined />} htmlType="submit" >
            搜索
          </Button>
        </Tooltip>
        <Button className="marginLeft" type="primary">重置</Button>
        <Button className="marginLeft" type="primary" onClick={showModal}>
          添加权限
        </Button>
      </Form>

      <Form form={form} component={false}>
        {contextHolder}
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        >
        </Table>
      </Form>
    </div>
  );
};

export default Resources;