import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getKbTypeLabel } from '@/utils/kb_utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'
import KnowledgeGraphViewer from '@/components/KnowledgeGraphViewer'
import DatabaseHeader from '@/components/DatabaseHeader'
import FileTable from '@/components/FileTable'
import FileDetailModal from '@/components/FileDetailModal'
import FileUploadModal from '@/components/FileUploadModal'
import KnowledgeGraphSection from '@/components/KnowledgeGraphSection'
import QuerySection from '@/components/QuerySection'

const DataBaseInfoView: React.FC = () => {
  const { databaseId } = useParams<{ databaseId: string }>()
  const {
    database,
    state,
    getDatabaseInfo,
    startAutoRefresh,
    stopAutoRefresh,
    databaseId,
    setDatabaseId,
    isGraphMaximized,
    toggleGraphMaximize,
    toggleRightPanel
  } = useDatabaseStore((state) => ({
    database: state.database,
    state: state.state,
    getDatabaseInfo: state.getDatabaseInfo,
    startAutoRefresh: state.startAutoRefresh,
    stopAutoRefresh: state.stopAutoRefresh,
    databaseId: state.databaseId,
    setDatabaseId: (id: number | null) => ({ databaseId: id }),
    isGraphMaximized: state.state.isGraphMaximized,
    toggleGraphMaximize: () => (state.state.isGraphMaximized = !state.state.isGraphMaximized),
    toggleRightPanel: () => (state.state.rightPanelVisible = !state.state.rightPanelVisible)
  }))

  const [addFilesModalVisible, setAddFilesModalVisible] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(45)
  const [isDragging, setIsDragging] = useState(false)
  const resizeHandle = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDatabaseId(Number(databaseId))
    getDatabaseInfo(Number(databaseId))
    startAutoRefresh()
    return () => stopAutoRefresh()
  }, [databaseId, setDatabaseId, getDatabaseInfo, startAutoRefresh, stopAutoRefresh])

  const handleMouseDown = () => {
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    const container = document.querySelector('.unified-layout') as HTMLElement
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
    setLeftPanelWidth(Math.max(20, Math.min(60, newWidth)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DatabaseHeader />
      <Dialog open={isGraphMaximized} onOpenChange={toggleGraphMaximize}>
        <DialogContent className="max-w-none w-full h-full p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">知识图谱 (最大化)</h3>
              <Button variant="ghost" onClick={toggleGraphMaximize}>
                <Minimize2 className="h-4 w-4 mr-2" /> 退出最大化
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              {database.kb_type !== 'lightrag' ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <h4 className="text-xl font-medium mb-2">知识图谱不可用</h4>
                  <p className="text-gray-600">
                    当前知识库类型 "{getKbTypeLabel(database.kb_type || 'lightrag')}"
                    不支持知识图谱功能。
                  </p>
                </div>
              ) : (
                <KnowledgeGraphViewer
                  initialDatabaseId={databaseId?.toString()}
                  hideDbSelector={true}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <FileDetailModal />
      <FileUploadModal visible={addFilesModalVisible} onVisibleChange={setAddFilesModalVisible} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col" style={{ width: `${leftPanelWidth}%` }}>
          <FileTable
            rightPanelVisible={state.rightPanelVisible}
            onShowAddFilesModal={() => setAddFilesModalVisible(true)}
            onToggleRightPanel={toggleRightPanel}
          />
        </div>
        <div
          className="w-2 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors"
          ref={resizeHandle}
          onMouseDown={handleMouseDown}
        ></div>
        <div
          className="flex flex-col"
          style={{
            width: `${100 - leftPanelWidth}%`,
            display: state.rightPanelVisible ? 'flex' : 'none'
          }}
        >
          <div className="flex flex-col flex-1 overflow-hidden">
            <KnowledgeGraphSection />
            <div className="h-2 cursor-row-resize bg-gray-200 hover:bg-blue-500 transition-colors"></div>
            <QuerySection />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataBaseInfoView
