import React, { useState, useEffect } from 'react'
import { Table, Button, message, Popconfirm } from 'antd'
import { agentApi } from '@/apis/agent_api'
import { modelIcons } from '@/utils/modelIcon'
import './ModelProvidersComponent.less'

const ModelProvidersComponent: React.FC = () => {
  const [providers, setProviders] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const fetchModels = async () => {
    setLoading(true)
    try {
      const data = await agentApi.getProviderModels('')
      setProviders(data.providers)
    } catch (error: any) {
      message.error(error.message || '获取模型列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleUpdate = async (provider: string, models: string[]) => {
    try {
      await agentApi.updateProviderModels(provider, models)
      message.success('更新成功')
      fetchModels()
    } catch (error: any) {
      message.error(error.message || '更新失败')
    }
  }

  const columns = [
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (text: string) => (
        <>
          <img src={modelIcons[text] || modelIcons.default} alt={text} className="provider-icon" />
          {text}
        </>
      )
    },
    {
      title: 'Enabled Models',
      dataIndex: 'enabled_models',
      key: 'enabled_models',
      render: (models: string[]) => models.join(', ')
    },
    {
      title: 'Available Models',
      dataIndex: 'available_models',
      key: 'available_models',
      render: (models: string[]) => models.join(', ')
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button onClick={() => handleUpdate(record.provider, record.available_models)}>
          Enable All
        </Button>
      )
    }
  ]

  return (
    <div className="model-providers-container">
      <Table
        columns={columns}
        dataSource={Object.values(providers)}
        rowKey="provider"
        loading={loading}
        pagination={false}
      />
    </div>
  )
}

export default ModelProvidersComponent
