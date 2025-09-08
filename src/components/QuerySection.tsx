import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Send } from 'lucide-react'
import { useDatabaseStore } from '@/stores/databaseStore'
import { queryApi } from '@/apis/knowledge_api'
import { message } from '@/utils/toast'

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
      const data = await queryApi.queryKnowledgeBase(databaseId!.toString(), query, meta)
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
        <Button variant="ghost" size="sm" onClick={onToggleVisible}>
          {visible ? '收起' : '展开'}
        </Button>
      </div>
      <div className="query-content" style={{ display: visible ? 'block' : 'none' }}>
        <div className="space-y-4">
          {queryParams.map((param: any) => (
            <div key={param.key} className="space-y-2">
              <Label>{param.label}</Label>
              <Select
                value={meta[param.key]}
                onValueChange={(value) => setMeta({ ...meta, [param.key]: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`选择${param.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {param.options.map((option: any) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入查询内容"
          className="min-h-[100px]"
        />
        <Button onClick={handleQuery} disabled={loading} className="gap-2 mt-4">
          <Send className="h-4 w-4" />
          查询
          {loading && <span className="animate-spin">⏳</span>}
        </Button>
        {result && (
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export default QuerySection
