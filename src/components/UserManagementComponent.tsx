import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { useUserStore } from '@/stores/userStore'
import './UserManagementComponent.less'

const UserManagementComponent: React.FC = () => {
  const { getUsers, createUser, updateUser, deleteUser, isSuperAdmin } = useUserStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data.users)
    } catch (error: any) {
      message.error(error.message || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setIsModalVisible(true)
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId)
      message.success('删除成功')
      fetchUsers()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await updateUser(editingUser.id, values)
        message.success('更新成功')
      } else {
        await createUser(values)
        message.success('创建成功')
      }
      setIsModalVisible(false)
      fetchUsers()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <span>
          <Button type="link" onClick={() => handleEditUser(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteUser(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </span>
      )
    }
  ]

  return (
    <div className="user-management-container">
      <h3>用户管理</h3>
      <Button type="primary" onClick={handleAddUser} style={{ marginBottom: 16 }}>
        添加用户
      </Button>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改' : ''} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              {isSuperAdmin() && <Select.Option value="superadmin">SuperAdmin</Select.Option>}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagementComponent
