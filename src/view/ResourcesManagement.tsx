
import React, { useState } from 'react';
import { Button, TableProps } from 'antd';
import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import "./view.css"

interface Item {
  ID: string;
  userName: string;
  enable: number;
  locked: number;
}

const originData: Item[] = [];
for (let i = 1; i < 100; i++) {
  originData.push({
    ID: i.toString(),
    userName: `Edward ${i}`,
    enable: 1,
    locked: 0,
  });
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
  const [form] = Form.useForm();
  const [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.ID === editingKey;

  const edit = (record: Partial<Item> & { ID: React.Key }) => {
    form.setFieldsValue({ userName: '', enable: '', locked: '', ...record });
    setEditingKey(record.ID + "");
  };
  const confirm = () => {
    alert("保存成功...")
  }
  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.ID);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
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
      dataIndex: 'ID',
      width: '20%',
      editable: true,
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
              <Typography.Link onClick={() => save(record.ID)} style={{ marginRight: 8 }}>
                保存
              </Typography.Link>
              <Popconfirm title="确定取消?"  okText="确定"
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
              <span className='marginLeft'>
                <Popconfirm
                  title="你确定删除?"
                  onConfirm={confirm}
                  onCancel={cancel}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button size="small" type="primary" danger > 删除</Button>
                </Popconfirm>

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
        inputType: col.dataIndex === 'ID' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
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
          onChange: cancel,
        }}
      />
    </Form>
  );
};

export default Resources;