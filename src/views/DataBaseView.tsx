import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/utils/toast'
import { BookPlus } from 'lucide-react'
import HeaderComponent from '@/components/HeaderComponent'
import ModelSelectorComponent from '@/components/ModelSelectorComponent'
import { useConfigStore } from '@/stores/configStore'
import { databaseApi, typeApi } from '@/apis/knowledge_api'
import { getKbTypeIcon, getKbTypeLabel, getKbTypeColor } from '@/utils/kb_utils'

import { Textarea } from '@/components/ui/textarea'

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
      toast.error(error.message || '加载数据库列表失败')
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
      toast.error('数据库名称不能为空')
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
      toast.success('创建成功')
      setOpenNewDatabaseModel(false)
      loadDatabases()
    } catch (error: any) {
      toast.error(error.message || '创建失败')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <HeaderComponent title="文档知识库">
        <div slot="actions">
          <Button onClick={() => setOpenNewDatabaseModel(true)}>新建知识库</Button>
        </div>
      </HeaderComponent>
      <Dialog open={openNewDatabaseModel} onOpenChange={setOpenNewDatabaseModel}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>新建知识库</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                知识库类型<span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(supportedKbTypes).map(([key, value]: [string, any]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      newDatabase.kb_type === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setNewDatabase({ ...newDatabase, kb_type: key })}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {React.createElement(getKbTypeIcon(key), { className: 'h-5 w-5' })}
                      <span className="font-medium">{getKbTypeLabel(key)}</span>
                    </div>
                    <div className="text-sm text-gray-600">{value.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">
                知识库名称<span className="text-red-500">*</span>
              </h3>
              <Input
                value={newDatabase.name}
                onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
                placeholder="新建知识库名称"
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">嵌入模型</h3>
              <Select
                value={newDatabase.embed_model_name}
                onValueChange={(value) =>
                  setNewDatabase({ ...newDatabase, embed_model_name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择嵌入模型" />
                </SelectTrigger>
                <SelectContent>
                  {embedModelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newDatabase.kb_type === 'lightrag' && (
              <>
                <div>
                  <h3 className="font-medium mb-2">语言</h3>
                  <Select
                    value={newDatabase.language}
                    onValueChange={(value) => setNewDatabase({ ...newDatabase, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-medium mb-2">语言模型 (LLM)</h3>
                  <ModelSelectorComponent
                    model_name={newDatabase.llm_info.model_name || '请选择模型'}
                    model_provider={newDatabase.llm_info.provider || ''}
                    onSelectModel={({ provider, name }) =>
                      setNewDatabase({ ...newDatabase, llm_info: { provider, name } })
                    }
                  />
                </div>
              </>
            )}

            <div>
              <h3 className="font-medium mb-2">知识库描述</h3>
              <Textarea
                value={newDatabase.description}
                onChange={(e) => setNewDatabase({ ...newDatabase, description: e.target.value })}
                placeholder="新建知识库描述"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewDatabaseModel(false)}>
              取消
            </Button>
            <Button onClick={createDatabase} disabled={creating}>
              {creating ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {loading ? (
        <div className="loading-container">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p>正在加载知识库...</p>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto">
          <div
            className="bg-white rounded-lg shadow p-6 mb-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-blue-500"
            onClick={() => setOpenNewDatabaseModel(true)}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">新建知识库</h3>
                <p className="text-gray-600 mt-1">导入您自己的文本数据或通过Webhook实时写入数据以增强 LLM 的上下文。</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {databases.map((db) => (
              <div
                key={db.db_id}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/database/${db.db_id}`)}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-2 rounded">
                    {React.createElement(getKbTypeIcon(db.kb_type || 'lightrag'), { className: 'h-6 w-6' })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{db.name}</h3>
                    <p className="text-gray-600 mt-1">
                      <span>{Object.keys(db.files || {}).length} 文件</span>
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">{db.description || '暂无描述'}</p>
                <div className="flex items-center space-x-2 mt-4">
                  <Badge variant="secondary">{db.embed_info?.name}</Badge>
                  <Badge variant="outline" className={getKbTypeColor(db.kb_type || 'lightrag')}>
                    {getKbTypeLabel(db.kb_type || 'lightrag')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DataBaseView
