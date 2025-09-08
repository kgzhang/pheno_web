import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, RefreshCw, Trash2, ChevronLast, Search } from 'lucide-react'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getFileIcon, getFileIconColor, formatRelativeTime } from '@/utils/file_utils'

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

  const files = useMemo(
    () => Object.values(database.files || {}) as Record<string, any>[],
    [database.files]
  )

  const filteredFiles = useMemo(() => {
    return files.filter((file: Record<string, any>) =>
      file.filename?.toLowerCase().includes(filenameFilter.toLowerCase())
    )
  }, [files, filenameFilter])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-1 p-1 shrink-0">
        <Button onClick={onShowAddFilesModal} className="gap-2">
          <Plus className="h-4 w-4" />
          添加文件
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => getDatabaseInfo()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant={state.autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            Auto
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={filenameFilter}
              onChange={(e) => setFilenameFilter(e.target.value)}
              placeholder="搜索文件名"
              className="pl-8 w-32"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleRightPanel}
            className={rightPanelVisible ? 'bg-accent' : ''}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {selectedRowKeys.length > 0 && (
        <div className="flex items-center justify-between p-1 bg-accent rounded-md mb-1 text-sm shrink-0">
          <span>{selectedRowKeys.length} 项</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={selectAllFailedFiles}>
              选择失败
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRowKeys.length === filteredFiles.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRowKeys(filteredFiles.map((f: Record<string, any>) => f.file_id))
                    } else {
                      setSelectedRowKeys([])
                    }
                  }}
                />
              </TableHead>
              <TableHead>文件名</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file: Record<string, any>) => (
              <TableRow
                key={file.file_id}
                className={selectedRowKeys.includes(file.file_id) ? 'bg-accent/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRowKeys.includes(file.file_id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRowKeys([...selectedRowKeys, file.file_id])
                      } else {
                        setSelectedRowKeys(selectedRowKeys.filter((id) => id !== file.file_id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="link" onClick={() => openFileDetail(file)}>
                    {(() => {
                      const IconComponent = getFileIcon(file.filename)
                      return (
                        <IconComponent
                          className="mr-2 h-4 w-4"
                          style={{ color: getFileIconColor(file.filename) }}
                        />
                      )
                    })()}
                    {file.filename}
                  </Button>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatRelativeTime((file.created_at || 0) * 1000)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatRelativeTime((file.created_at || 0) * 1000)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{file.status}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile(file.file_id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default FileTable
