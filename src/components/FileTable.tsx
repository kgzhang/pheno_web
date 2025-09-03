import React, { useState, useMemo } from 'react'
import { Button, Table, Input, Tooltip } from 'antd'
import { PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { ChevronLast } from 'lucide-react'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getFileIcon, getFileIconColor, formatRelativeTime } from '@/utils/file_utils'
import './FileTable.less'

interface FileTableProps {
  rightPanelVisible: boolean
  onShowAddFilesModal: () => void
  onToggleRightPanel: () => void
}

const FileTable: React.FC<FileTableProps> = ({
  rightPanelVisible,
  onShowAddFilesModal,
  onToggleRightPanel
}) => {
  const {
    database,
    state,
    selectedRowKeys,
    setSelectedRowKeys,
    handleBatchDelete,
    selectAllFailedFiles,
    openFileDetail,
    handleDeleteFile,
    getDatabaseInfo,
    toggleAutoRefresh
  } = useDatabaseStore()
  const [filenameFilter, setFilenameFilter] = useState('')

  const files = useMemo(() => Object.values(database.files || {}), [database.files])

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.filename?.toLowerCase().includes(filenameFilter.toLowerCase())
    )
  }, [files, filenameFilter])

  const columns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      render: (text: string, record: any) => (
        <Button type="link" onClick={() => openFileDetail(record)}>
          {React.createElement(getFileIcon(text), {
            style: { marginRight: 6, color: getFileIconColor(text) }
          })}
          {text}
        </Button>
      )
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: number) => (
        <Tooltip title={formatRelativeTime(text * 1000)}>
          <span>{formatRelativeTime(text * 1000)}</span>
        </Tooltip>
      )
    },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          onClick={() => handleDeleteFile(record.file_id)}
          icon={<DeleteOutlined />}
        />
      )
    }
  ]

  return (
    <div className="file-table-container">
      <div className="panel-header">
        <Button type="primary" onClick={onShowAddFilesModal} icon={<PlusOutlined />}>
          添加文件
        </Button>
        <div className="panel-actions">
          <Button type="text" onClick={() => getDatabaseInfo()} icon={<ReloadOutlined />} />
          <Button onClick={toggleAutoRefresh} type={state.autoRefresh ? 'primary' : 'default'}>
            Auto
          </Button>
          <Input.Search
            value={filenameFilter}
            onChange={(e) => setFilenameFilter(e.target.value)}
            placeholder="搜索文件名"
            style={{ width: 120 }}
          />
          <Button
            type="text"
            onClick={onToggleRightPanel}
            icon={<ChevronLast />}
            className={rightPanelVisible ? 'expanded' : ''}
          />
        </div>
      </div>
      {selectedRowKeys.length > 0 && (
        <div className="batch-actions-compact">
          <span>{selectedRowKeys.length} 项</span>
          <Button type="text" size="small" onClick={selectAllFailedFiles}>
            选择失败
          </Button>
          <Button type="text" danger onClick={handleBatchDelete} icon={<DeleteOutlined />} />
        </div>
      )}
      <Table
        columns={columns}
        dataSource={filteredFiles}
        rowKey="file_id"
        size="small"
        pagination={{ pageSize: 20 }}
        rowSelection={{ selectedRowKeys, onChange: (keys: any) => setSelectedRowKeys(keys) }}
      />
    </div>
  )
}

export default FileTable
