
import React, { useState, useEffect } from 'react';
import { Button, FormProps, message, Modal, TableProps, Tooltip } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import userService from "../service/user"
import "./view.css"
import { SearchOutlined } from "@ant-design/icons"
type FieldType = {
  userName?: string;
  id?: string;
  password: string;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

interface Item {
  id: string;
  userName: string;
  enable: number;
  locked: number;
}

const originData: any[] = [];

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

const RouteManagement: React.FC = () => {
  // model
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };


  const handleCancel = () => {
    setOpen(false);
  };

  // 表格代码
  const [data, setData] = useState(originData);
  const init = async () => {
    const { data, code } = await userService.queryPage({});
    if (code === "403") {
      messageApi.open({
        type: "warning",
        content: data
      })
      return;
    }
    setData(data.list)
  }
  useEffect(() => {

    init();
  }, []);
  const onFinish: FormProps<FieldType>["onFinish"] = (values: FieldType) => {
    console.log('Failed:', values);
    if (values.id === undefined && values.userName === undefined) {
      init();
      return;
    }
    userService.queryPage({ id: values.id, userName: values.userName }).then((res: any) => {
      setData(res.data.list)
    })

  };
  //添加用户
  const onAddFinish: FormProps<FieldType>["onFinish"] = async (values: FieldType) => {

    if (values.password === undefined && values.userName === undefined) {
      messageApi.open({
        type: 'warning',
        content: "请输入信息.."
      })
      return;
    }
    const { message } = await userService.save(values)
    handleCancel();
    messageApi.open({
      type: "success",
      content: message
    })
    init();

  };
  const [form] = Form.useForm();

  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;
  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ userName: '', enable: '', locked: '', ...record });
    setEditingKey(record.id);
  };
  const update = async (id: any) => {
    if (window.confirm("您确定要删除这条记录吗？")) {
      let newData = data.filter((v) => v.id != id)
      setData(newData);
      let { message } = await userService.remove({}, id)
      messageApi.open({
        type: "success",
        content: message
      });
      init();
    } else {
      // 用户点击了取消按钮，不执行删除操作
    }



  }
  const cancel = () => {
    setEditingKey('');
  };
  const [messageApi, contextHolder] = message.useMessage();

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
        let { message } = await userService.update(row)
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
          <Form.Item<FieldType> name="userName" label="用户名" >
            <Input></Input>
          </Form.Item>
          <Form.Item<FieldType> name="password" label="密码" >
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
            onChange: cancel,
          }}
        />
      </Form>
    </div>
  );
};

export default RouteManagement;