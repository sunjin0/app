import React, { useState, useEffect } from 'react';
import { Button, FormProps, message, Modal, Select, Space, TableProps, Tooltip } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import roleService from "../service/role"
import "./view.css"
import { SearchOutlined } from "@ant-design/icons"
import { log } from 'console';
//字段
type FieldType = {
  id: string;
  name?: string;
  description: string;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

interface Item {
  id: string;
  name?: string;
  description: string;
}
//表格数据
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

const Role: React.FC = () => {
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
  //初始化数据
  useEffect( () => {
    roleService.queryPage({}).then((res: any) => {
     setData(res.data.list)
    })
  }, []);
  //查询
  const onFinish: FormProps<FieldType>["onFinish"] = (values: FieldType) => {
    console.log('Failed:', values);
    if (values.description === undefined && values.name === undefined) {
      roleService.queryPage({}).then((res: any) => {
        setData(res.data.list)
      })
      return;
    }
    roleService.queryPage({ description: values.description, name: values.name }).then((res: any) => {
      setData(res.data.list)
    })

  };
  //添加用户
  const onAddFinish: FormProps<FieldType>["onFinish"] = async (values: FieldType) => {

    if (values.description === undefined && values.name === undefined) {
      messageApi.open({
        type: 'warning',
        content: "请输入信息.."
      })
      return;
    }
    const { message } = await roleService.save(values)
    messageApi.open({
      type: "success",
      content: message
    })
    handleCancel();
  };
  const [form] = Form.useForm();

  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;
  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', enable: '', locked: '', ...record });
    setEditingKey(record.id);
  };
  const update = async (id: any) => {
    if (window.confirm("您确定要删除这条记录吗？")) {
      let newData = data.filter((v) => v.id != id)
      setData(newData);
      let { message } = await roleService.remove({}, id)
      messageApi.open({
        type: "success",
        content: message
      })
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
        let { message } = await roleService.update(row)
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

      editable: false,
    },
    {
      title: '角色名',
      dataIndex: 'name',

      editable: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
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
          <Form.Item<FieldType> name="name" label="角色名" >
            <Input></Input>
          </Form.Item>
          <Form.Item<FieldType> name="description" label="描述" >
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
        <Form.Item<FieldType> name="name" label="角色名" >
          <Input></Input>
        </Form.Item>
        <Form.Item<FieldType> name="description" label="描述" >
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

export default Role;