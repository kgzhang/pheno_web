import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Input, Tag, message } from 'antd'
import { LeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import HeaderComponent from './HeaderComponent'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getKbTypeLabel, getKbTypeIcon, getKbTypeColor } from '@/utils/kb_utils'
import './DatabaseHeader.less'

const DatabaseHeader: React.FC = () => {
  const navigate = useNavigate()
  const { database, state, updateDatabaseInfo, deleteDatabase: deleteDb } = useDatabaseStore()
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  const backToDatabase = () => {
    navigate('/database')
  }

  const showEditModal = () => {
    form.setFieldsValue({
      name: database.name || '',
      description: database.description || ''
    })
    setIsEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()
      await updateDatabaseInfo(values)
      setIsEditModalVisible(false)
      message.success('更新成功')
    } catch (error) {
      console.error('表单验证失败:', error)
      message.error('更新失败')
    }
  }

  const handleDeleteDatabase = () => {
    Modal.confirm({
      title: '确定要删除这个知识库吗？',
      content: '此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteDb()
        message.success('知识库已删除')
        navigate('/database')
      }
    })
  }

  const kbType = database.kb_type || 'lightrag'
  const KbTypeIcon = getKbTypeIcon(kbType)

  return (
    <>
      <HeaderComponent
        title={database.name || '数据库信息加载中'}
        loading={state.databaseLoading}
        className="database-info-header"
        left={
          <Button onClick={backToDatabase} shape="circle" icon={<LeftOutlined />} type="text" />
        }
        actions={
          <div className="header-info">
            <span className="db-id">
              ID: <span style={{ userSelect: 'all' }}>{database.db_id || 'N/A'}</span>
            </span>
            <span className="file-count">
              {database.files ? Object.keys(database.files).length : 0} 文件
            </span>
            <Tag color="blue">{database.embed_info?.name}</Tag>
            <Tag color={getKbTypeColor(kbType)} className="kb-type-tag">
              <KbTypeIcon className="type-icon" />
              {getKbTypeLabel(kbType)}
            </Tag>
          </div>
        }
      >
        <Button type="link" onClick={showEditModal} style={{ padding: '0px', color: 'inherit' }}>
          <EditOutlined />
        </Button>
      </HeaderComponent>

      <Modal
        open={isEditModalVisible}
        title="编辑知识库信息"
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button danger onClick={handleDeleteDatabase} style={{ float: 'left' }} key="delete">
            <DeleteOutlined /> 删除数据库
          </Button>,
          <Button key="back" onClick={() => setIsEditModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={state.databaseLoading}
            onClick={handleEditSubmit}
          >
            确定
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="知识库名称"
            name="name"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item label="知识库描述" name="description">
            <Input.TextArea placeholder="请输入知识库描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default DatabaseHeader
