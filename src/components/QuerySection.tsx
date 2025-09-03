import React, { useState } from 'react'
import { Button, Input, Select, Form, Spin, message } from 'antd'
import { SendOutlined, SettingOutlined } from '@ant-design/icons'
import { useDatabaseStore } from '@/stores/databaseStore'
import { queryApi } from '@/apis/knowledge_api'
import './QuerySection.less'

interface QuerySectionProps {
  visible?: boolean
  style?: React.CSSProperties
  onToggleVisible?: () => void
}

const QuerySection: React.FC<QuerySectionProps> = ({ visible = true, style, onToggleVisible }) => {
  const { databaseId, queryParams, meta, setMeta } = useDatabaseStore()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleQuery = async () => {
    setLoading(true)
    try {
      const data = await queryApi.queryKnowledgeBase(databaseId!, query, meta)
      setResult(data)
    } catch (error: any) {
      message.error(error.message || '查询失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`query-section ${!visible ? 'collapsed' : ''}`} style={style}>
      <div className="section-header">
        <h3>查询测试</h3>
        <Button type="text" size="small" onClick={onToggleVisible}>
          {visible ? '收起' : '展开'}
        </Button>
      </div>
      <div className="query-content" style={{ display: visible ? 'block' : 'none' }}>
        <Form layout="vertical">
          {queryParams.map((param: any) => (
            <Form.Item key={param.key} label={param.label}>
              <Select
                value={meta[param.key]}
                onChange={(value) => setMeta({ ...meta, [param.key]: value })}
              >
                {param.options.map((option: any) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ))}
        </Form>
        <Input.TextArea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          placeholder="输入查询内容"
        />
        <Button type="primary" onClick={handleQuery} loading={loading} icon={<SendOutlined />}>
          查询
        </Button>
        {loading && <Spin />}
        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  )
}

export default QuerySection
