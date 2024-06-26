import React, { useState, useEffect } from 'react';
import { Button, FormProps, message, Modal, Select, SelectProps, Space, TableProps, Tag, Tooltip, TreeSelect } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import roleService from "../service/role"
import "./view.css"
import { SearchOutlined } from "@ant-design/icons"
import { ArrayToTree, isAuth, resources, role, route } from '../common';
const options: SelectProps['options'] = [];

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
  id: any;
  name?: string;
  description: string;
  resources: Array<resources>
  routeIds: Array<string>
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

const { SHOW_PARENT } = TreeSelect;

const Role: React.FC = () => {
  const [treeData, setTreeData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState(originData);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [total, setTotal] = useState(0);
  const [routes, setRoutes] = useState<Array<route>>();
  const onChange = (newValue: string[]) => {

    console.log('onChange ', newValue.filter((v: string) => v !== undefined));
  };
  //权限树
  const tProps = {
    treeData,
    onChange,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: '请选择角色权限',
    style: {
      width: '100%',
    },
  };
  //修改权限树
  const tProps2 = {
    treeData,
    onChange,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: '请选择角色权限',
    style: {
      width: '100%',
    },
  };
  // 编辑的表单
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
    if (title === "权限") {
      inputNode = <TreeSelect popupMatchSelectWidth={200} treeDefaultExpandAll    {...tProps2} />// 默认展开所有节点   
    }

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex === "resources" ? "routeIds" : dataIndex}
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
  //初始化数据
  useEffect(() => {
    init();

  }, []);


  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  // 初始化
  const init = async () => {
    const res = await roleService.queryPage({});
    setData(res.data.list);
    setTotal(res.data.total);
    const route = res.data.other.routes.map((r: route) => ({
      title: r.description,
      value: r.id,
      key: r.id,
      parentId: r.parentId,
      children: [],
    }));
    setRoutes(res.data.other.routes);
    setTreeData(ArrayToTree(route));
  }

  const cancel = () => {
    setEditingKey('');
  };

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



  const isEditing = (record: Item) => record.id === editingKey;
  const edit = (record: Partial<Item> & { id: React.Key }) => {
    const resourceIds = record.resources?.map(res => res.id);
    const routeIds = routes?.map(rou => resourceIds?.includes(rou.resourcesId) ? rou.id : null).filter(v => v !== null)
    form.setFieldsValue({ routeIds: routeIds, ...record });
    setEditingKey(record.id);
  };

  const pageChange = async (page: number, size: number) => {
    const { data } = await roleService.queryPage({ current: page, size: size })
    setData(data.list)
  }
  //删除
  const update = async (id: any) => {
    if (window.confirm("您确定要删除这条记录吗？")) {

      const res = await roleService.remove({}, id)
      if (isAuth(res, messageApi)) {
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
        console.log(row);

        const res = await roleService.update(row)
        if (isAuth(res, messageApi)) {

        }
        init()

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
      key: "id",
      editable: false,
    },
    {
      title: '角色名',
      dataIndex: 'name',
      key: "name",
      editable: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: "description",
      editable: true,
    },
    {
      title: '权限',
      dataIndex: 'resources',
      key: "resources",
      editable: true,
      render: (resources: Array<resources>) => (resources.map((v, i) => <Tag color="#2db7f5">{i + 1}.{v.description}</Tag>))
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
          if (record.id === 1) {
            return;
          }
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
        title="添加角色权限信息"
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
          <Form.Item<FieldType> name="routeIds" label="角色权限" >
            <TreeSelect  {...tProps} />
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
            pageSize: 7,
          }}
        />
      </Form>
    </div>
  );
};

export default Role;