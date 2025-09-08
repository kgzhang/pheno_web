import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import HeaderComponent from './HeaderComponent'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getKbTypeLabel, getKbTypeIcon, getKbTypeColor } from '@/utils/kb_utils'
import { confirm } from '@/utils/confirm'
import { message } from '@/utils/toast'
import './DatabaseHeader.less'

const DatabaseHeader: React.FC = () => {
  const navigate = useNavigate()
  const { database, state, updateDatabaseInfo, deleteDatabase: deleteDb } = useDatabaseStore()
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: ''
  })

  const backToDatabase = () => {
    navigate('/database')
  }

  const showEditModal = () => {
    setEditFormData({
      name: database.name || '',
      description: database.description || ''
    })
    setIsEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      if (!editFormData.name.trim()) {
        message.error('请输入知识库名称')
        return
      }
      await updateDatabaseInfo(editFormData)
      setIsEditModalVisible(false)
      message.success('更新成功')
    } catch (error: any) {
      console.error('更新失败:', error)
      message.error(error.message || '更新失败')
    }
  }

  const handleDeleteDatabase = async () => {
    const result = await confirm({
      title: '确定要删除这个知识库吗？',
      content: '此操作不可撤销。'
    })

    if (result) {
      await deleteDb()
      message.success('知识库已删除')
      navigate('/database')
    }
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
          <Button variant="ghost" size="icon" onClick={backToDatabase}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
        actions={
          <div className="header-info">
            <span className="db-id">
              ID: <span style={{ userSelect: 'all' }}>{database.db_id || 'N/A'}</span>
            </span>
            <span className="file-count">
              {database.files ? Object.keys(database.files).length : 0} 文件
            </span>
            <Badge variant="secondary">{database.embed_info?.name}</Badge>
            <Badge
              variant="outline"
              className="kb-type-tag"
              style={{ backgroundColor: getKbTypeColor(kbType), color: 'white' }}
            >
              <KbTypeIcon className="type-icon" />
              {getKbTypeLabel(kbType)}
            </Badge>
          </div>
        }
      >
        <Button variant="ghost" size="icon" onClick={showEditModal}>
          <Edit className="h-4 w-4" />
        </Button>
      </HeaderComponent>

      <Dialog open={isEditModalVisible} onOpenChange={setIsEditModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑知识库信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">知识库名称</Label>
              <Input
                id="name"
                placeholder="请输入知识库名称"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">知识库描述</Label>
              <Input
                id="description"
                placeholder="请输入知识库描述"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleDeleteDatabase}>
              <Trash2 className="h-4 w-4 mr-2" />
              删除数据库
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalVisible(false)}>
                取消
              </Button>
              <Button onClick={handleEditSubmit} disabled={state.databaseLoading}>
                {state.databaseLoading ? '保存中...' : '确定'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DatabaseHeader
