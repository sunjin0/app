import React, { useState, useEffect } from 'react';
import { Button, Flex, FormProps, message, Modal, Select, TableProps, Tooltip } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import userService from "../service/user"
import "./view.css"
import { SearchOutlined } from "@ant-design/icons"
import { isAuth, users } from '../common';

interface Item {
  id: string;
  userName: string;
  enable: any;
  locked: any;
}
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}
const originData: any[] = [];


const onFinishFailed: FormProps<users>["onFinishFailed"] = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};






const User: React.FC = () => {
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
    let inputNode = <Input />;
    if (title === "启用") {
      inputNode = <Select options={
        [
          {
            value: 1,
            label: '正常',
          },
          {
            value: 0,
            label: '禁用',
          },
        ]
      } onChange={(value) => { setEnable(value) }} />
    } else if (title === "锁定") {
      inputNode = <Select options={[
        {
          value: 1,
          label: '是',
        },
        {
          value: 0,
          label: '否',
        },
      ]} onChange={(value) => setLocked(value)} />
    }
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `请输入 ${title}!`,
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
  // model
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };
  const [enable, setEnable] = useState(0)
  const [locked, setLocked] = useState(0)
  // 表格代码
  const [data, setData] = useState(originData);

  const init = async () => {
    const res = await userService.queryPage({});
    const users = res.data.list.map((el: users) => {
      if (el.enable === 1) {
        el.enable = "正常"
      } else {
        el.enable = "禁用"
      }
      if (el.locked === 1) {
        el.locked = "是"
      } else {
        el.locked = "否"
      }
      return el;
    })
    setData(users)
    setTotal(res.data.total)
  }
  const cancel = () => {
    setEditingKey('');
  };
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    init();
  }, []);

  //查询
  const onFinish: FormProps<users>["onFinish"] = (values: users) => {
    console.log('Failed:', values);
    if (values.id === undefined && values.userName === undefined && values.enable === undefined && values.locked === undefined) {
      init();
      return;
    }
    userService.queryPage({ id: values.id, userName: values.userName, enable: values.enable, locked: values.locked }).then((res: any) => {
      const users = res.data.list.map((el: users) => {
        if (el.enable === 1) {
          el.enable = "正常"
        } else {
          el.enable = "禁用"
        }
        if (el.locked === 1) {
          el.locked = "是"
        } else {
          el.locked = "否"
        }
        return el;
      })
      setData(users)
    })

  };
  //分页查询
  const [total, setTotal] = useState(0);
  const pageChange = async (page: number, size: number) => {
    const { data } = await userService.queryPage({ current: page, size: size })
    const users = data.list.map((el: users) => {
      if (el.enable === 1) {
        el.enable = "正常"
      } else {
        el.enable = "禁用"
      }
      if (el.locked === 1) {
        el.locked = "是"
      } else {
        el.locked = "否"
      }
      return el;
    })
    setData(users)
  }
  //添加用户
  const onAddFinish: FormProps<users>["onFinish"] = async (values: users) => {

    if (values.password === undefined && values.userName === undefined) {
      messageApi.open({
        type: 'warning',
        content: "请输入信息.."
      })
      return;
    }
    const res = await userService.save(values)
    handleCancel();
    if (isAuth(res, messageApi)) {
      init()
    }
  };
  const [form] = Form.useForm();

  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;
  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ userName: '', enable: '', locked: '', ...record });
    setEditingKey(record.id);
  };
  //删除
  const update = async (id: any) => {
    if (window.confirm("您确定要删除这条记录吗？")) {

      let res = await userService.remove({}, id)
      if (isAuth(res, messageApi)) {
        let newData = data.filter((v) => v.id != id)
        setData(newData);
        init();
      }
    } else {
      // 用户点击了取消按钮，不执行删除操作
    }
  }

  //修改
  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;
      row.id = key + "";
      const newData = [...data];

      const index = newData.findIndex((item) => key === item.id);
      if (index > -1) {
        if (enable === 1) {
          row.enable = "正常"
        } else {
          row.enable = "禁用"
        }
        if (locked === 1) {
          row.locked = "是"
        } else {
          row.locked = "否"
        }
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        setData(newData);
        setEditingKey('');

        row.enable = enable

        row.locked = locked
        console.log(enable,locked);
        

        const res = await userService.update(row)

        isAuth(res, messageApi);
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
      title: 'id',
      dataIndex: 'id',
      width: '20%',
      editable: false,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      width: '20%',
      editable: true,
    },
    {
      title: '启用',
      dataIndex: 'enable',
      width: '20%',
      editable: true,
    },
    {
      title: '锁定',
      dataIndex: 'locked',
      width: '20%',
      editable: true,
    },
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
          return (
            <div>
              <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                <Button size="small" type="primary"> 编辑</Button>
              </Typography.Link>
              <span className='marginLeft' onClick={() => update(record.id)}>
                <Button size="small" type="primary" danger > 删除</Button>
              </span>
            </div>
          )
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
        title="添加用户信息"
        onCancel={handleCancel}
        footer
      >
        <Form initialValues={{ remember: true }}
          onFinish={onAddFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off" name="horizontal_login">
          <Form.Item<users> name="userName" label="用户名" >
            <Input></Input>
          </Form.Item>
          <Form.Item<users> name="password" label="密码" >
            <Input></Input>
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
        <Form.Item<users> name="id" label="ID" >
          <Input></Input>
        </Form.Item>
        <Form.Item<users> name="userName" label="用户名" >
          <Input></Input>
        </Form.Item>
        <Form.Item<users> name="enable" label="启用" >
          <Select
            optionFilterProp="children"
            style={{ width: 100 }}
            onChange={(value:any) => {
              setEnable(value)
            }}
            defaultValue={{
              value: 1,
              label: '正常',
            }}
            options={[
              {
                value: 1,
                label: '正常',
              },
              {
                value: 0,
                label: '禁用',
              },
            ]}
          />
        </Form.Item>
        <Form.Item<users> name="locked" label="锁定" >
          <Select
            optionFilterProp="children"
            style={{ width: 100 }}
            onChange={(value:any) => {
              setLocked(value)
            }}
            defaultValue={ {
              value: 0,
              label: '否',
            }}
            options={[
              {
                value: 1,
                label: '是',
              },
              {
                value: 0,
                label: '否',
              },
            ]}
          />
        </Form.Item>
        <Tooltip title="search">
          <Button type="primary" icon={<SearchOutlined />} htmlType="submit" >
            搜索
          </Button>
        </Tooltip>
        <Button className="marginLeft" type="primary" onClick={showModal}>
          添加
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
            onChange: pageChange,
            total: total,
            pageSize: 7
          }}
        />
      </Form>
    </div>
  );
};

export default User;