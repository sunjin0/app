import React, { useState, useEffect } from 'react';
import { Button, FormProps, message, Modal, Select, SelectProps, Space, TableProps, Tooltip, TreeSelect } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import roleService from "../service/role"

import "./view.css"
import { SearchOutlined } from "@ant-design/icons"
import { ArrayToTree, isAuth, role, route } from '../common';
const options: SelectProps['options'] = [];

const handleChange = (value: string[]) => {
  console.log(value);
};
//字段
type FieldType = {
  id: string;
  name?: string;
  description: string;
  routeIds: Array<string>
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
const { SHOW_PARENT } = TreeSelect;




const Role: React.FC = () => {
  //路由信息
  const [routes, setRoutes] = useState(Array<string>);
  const [treeData, setTreeData] = useState([])
  const onChange = (newValue: string[]) => {
    console.log('onChange ', newValue);
    setRoutes(newValue);
  };
  const tProps = {
    treeData,
    routes,
    onChange,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: 'Please select',
    style: {
      width: '100%',
    },
  };


  //初始化数据
  useEffect(() => {
    init();

  }, []);


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
    const res = await roleService.queryPage({});
    setData(res.data.list);
    setTotal(res.data.total);
    const route = res.data.other.map((r: route) => ({
      title: r.description,
      value: r.id,
      key: r.id,
      parentId: r.parentId,
      children: [],
    }));
    setTreeData(ArrayToTree(route));
  }

  const cancel = () => {
    setEditingKey('');
  };
  const [messageApi, contextHolder] = message.useMessage();

  //查询
  const onFinish: FormProps<FieldType>["onFinish"] = async (values: FieldType) => {
    console.log('Failed:', values);
    if (values.description === undefined && values.name === undefined) {
      init();
      return;
    }
    const res = await roleService.queryPage({ description: values.description, name: values.name })
    setData(res.data.list)


  };
  //添加用户
  const onAddFinish: FormProps<FieldType>["onFinish"] = async (values: FieldType) => {

    if (values.description === undefined || values.name === undefined || values.routeIds === undefined) {
      messageApi.open({
        type: 'warning',
        content: "请输入信息.."
      })
      return;
    }
    const res = await roleService.save(values);
    handleCancel();
    if (isAuth(res, messageApi)) {
      init()
    }
  };
  const [form] = Form.useForm();

  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;
  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', enable: '', locked: '', ...record });
    setEditingKey(record.id);
  };
  const [total, setTotal] = useState(0);
  const pageChange = async (page: number, size: number) => {
    const { data } = await roleService.queryPage({ current: page, size: size })
    setData(data.list)
  }
  //删除
  const update = async (id: any) => {
    if (window.confirm("您确定要删除这条记录吗？")) {
     
      const res = await roleService.remove({}, id)
      if(isAuth(res, messageApi)){
        let newData = data.filter((v) => v.id != id)
        setData(newData);
        init();
      }
     
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
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
        const res = await roleService.update(row)
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
  //表格列
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
      {contextHolder}
      {/* 添加 */}
      <Modal
        open={open}
        title="添加角色信息"
        onCancel={handleCancel}
        footer
      >
        <Form initialValues={{ remember: true }}
          onFinish={onAddFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off" name="horizontal_login">
          <Form.Item<FieldType> name="name" label="角色姓名" >
            <Input></Input>
          </Form.Item>
          <Form.Item<FieldType> name="description" label="角色描述" >
            <Input></Input>
          </Form.Item>
          <Form.Item<FieldType> name="routeIds" label="路由权限" >
            <TreeSelect {...tProps} />
          </Form.Item>
          <Button type="primary" htmlType="submit" >
            提交
          </Button>

        </Form>
      </Modal>
      {/* 查询表单 */}
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
      {/* 表格 */}
      <Form form={form} component={false}>

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

export default Role;