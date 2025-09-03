import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Input, Select, Tag, message, Spin } from 'antd'
import { BookPlus, Database, Zap } from 'lucide-react'
import { ThunderboltOutlined } from '@ant-design/icons'
import HeaderComponent from '@/components/HeaderComponent'
import ModelSelectorComponent from '@/components/ModelSelectorComponent'
import { useConfigStore } from '@/stores/configStore'
import { databaseApi, typeApi } from '@/apis/knowledge_api'
import { getKbTypeIcon, getKbTypeLabel, getKbTypeColor } from '@/utils/kb_utils'
import './DataBaseView.less'

const { TextArea } = Input

const DataBaseView: React.FC = () => {
  const navigate = useNavigate()
  const { config } = useConfigStore()
  const [databases, setDatabases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [openNewDatabaseModel, setOpenNewDatabaseModel] = useState(false)
  const [supportedKbTypes, setSupportedKbTypes] = useState<any>({})
  const [newDatabase, setNewDatabase] = useState<any>({
    kb_type: 'chroma',
    language: 'English',
    llm_info: {}
  })

  const embedModelOptions = Object.keys(config?.embed_model_names || {}).map((key) => ({
    label: `${key} (${config?.embed_model_names[key]?.dimension})`,
    value: key
  }))

  const languageOptions = [
    { label: '英语 English', value: 'English' },
    { label: '中文 Chinese', value: 'Chinese' }
  ]

  const loadDatabases = async () => {
    setLoading(true)
    try {
      const data = await databaseApi.getDatabases()
      setDatabases(
        data.databases.sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      )
    } catch (error: any) {
      message.error(error.message || '加载数据库列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    typeApi.getKnowledgeBaseTypes().then((data) => setSupportedKbTypes(data.kb_types))
    loadDatabases()
  }, [])

  const createDatabase = async () => {
    if (!newDatabase.name?.trim()) {
      message.error('数据库名称不能为空')
      return
    }
    setCreating(true)
    try {
      await databaseApi.createDatabase({
        database_name: newDatabase.name.trim(),
        description: newDatabase.description?.trim() || '',
        embed_model_name: newDatabase.embed_model_name || config.embed_model,
        kb_type: newDatabase.kb_type,
        additional_params: {
          language: newDatabase.language
        },
        llm_info: newDatabase.llm_info
      })
      message.success('创建成功')
      setOpenNewDatabaseModel(false)
      loadDatabases()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="database-container layout-container">
      <HeaderComponent title="文档知识库">
        <template slot="actions">
          <Button type="primary" onClick={() => setOpenNewDatabaseModel(true)}>
            新建知识库
          </Button>
        </template>
      </HeaderComponent>
      <Modal
        open={openNewDatabaseModel}
        title="新建知识库"
        onOk={createDatabase}
        onCancel={() => setOpenNewDatabaseModel(false)}
        width={800}
        confirmLoading={creating}
      >
        <h3>
          知识库类型<span style={{ color: 'red' }}>*</span>
        </h3>
        <div className="kb-type-cards">
          {Object.entries(supportedKbTypes).map(([key, value]: [string, any]) => (
            <div
              key={key}
              className={`kb-type-card ${newDatabase.kb_type === key ? 'active' : ''}`}
              onClick={() => setNewDatabase({ ...newDatabase, kb_type: key })}
            >
              <div className="card-header">
                {React.createElement(getKbTypeIcon(key), { className: 'type-icon' })}
                <span className="type-title">{getKbTypeLabel(key)}</span>
              </div>
              <div className="card-description">{value.description}</div>
            </div>
          ))}
        </div>
        <h3>
          知识库名称<span style={{ color: 'red' }}>*</span>
        </h3>
        <Input
          value={newDatabase.name}
          onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
          placeholder="新建知识库名称"
          size="large"
        />
        <h3>嵌入模型</h3>
        <Select
          value={newDatabase.embed_model_name}
          options={embedModelOptions}
          style={{ width: '100%' }}
          size="large"
          onChange={(value) => setNewDatabase({ ...newDatabase, embed_model_name: value })}
        />
        {newDatabase.kb_type === 'lightrag' && (
          <>
            <h3 style={{ marginTop: 20 }}>语言</h3>
            <Select
              value={newDatabase.language}
              options={languageOptions}
              style={{ width: '100%' }}
              size="large"
              onChange={(value) => setNewDatabase({ ...newDatabase, language: value })}
            />
            <h3 style={{ marginTop: 20 }}>语言模型 (LLM)</h3>
            <ModelSelectorComponent
              model_name={newDatabase.llm_info.model_name || '请选择模型'}
              model_provider={newDatabase.llm_info.provider || ''}
              onSelectModel={({ provider, name }) =>
                setNewDatabase({ ...newDatabase, llm_info: { provider, name } })
              }
            />
          </>
        )}
        <h3 style={{ marginTop: 20 }}>知识库描述</h3>
        <TextArea
          value={newDatabase.description}
          onChange={(e) => setNewDatabase({ ...newDatabase, description: e.target.value })}
          placeholder="新建知识库描述"
          autoSize={{ minRows: 5, maxRows: 10 }}
        />
      </Modal>
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>正在加载知识库...</p>
        </div>
      ) : (
        <div className="databases">
          <div className="new-database dbcard" onClick={() => setOpenNewDatabaseModel(true)}>
            <div className="top">
              <div className="icon">
                <BookPlus />
              </div>
              <div className="info">
                <h3>新建知识库</h3>
              </div>
            </div>
            <p>导入您自己的文本数据或通过Webhook实时写入数据以增强 LLM 的上下文。</p>
          </div>
          {databases.map((db) => (
            <div
              key={db.db_id}
              className="database dbcard"
              onClick={() => navigate(`/database/${db.db_id}`)}
            >
              <div className="top">
                <div className="icon">
                  {React.createElement(getKbTypeIcon(db.kb_type || 'lightrag'))}
                </div>
                <div className="info">
                  <h3>{db.name}</h3>
                  <p>
                    <span>{Object.keys(db.files || {}).length} 文件</span>
                  </p>
                </div>
              </div>
              <p className="description">{db.description || '暂无描述'}</p>
              <div className="tags">
                <Tag color="blue">{db.embed_info?.name}</Tag>
                <Tag color={getKbTypeColor(db.kb_type || 'lightrag')}>
                  {getKbTypeLabel(db.kb_type || 'lightrag')}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataBaseView
