import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getKbTypeLabel } from '@/utils/kb_utils'
import { Modal, Button } from 'antd'
import { CompressOutlined } from '@ant-design/icons'
import KnowledgeGraphViewer from '@/components/KnowledgeGraphViewer'
import DatabaseHeader from '@/components/DatabaseHeader'
import FileTable from '@/components/FileTable'
import FileDetailModal from '@/components/FileDetailModal'
import FileUploadModal from '@/components/FileUploadModal'
import KnowledgeGraphSection from '@/components/KnowledgeGraphSection'
import QuerySection from '@/components/QuerySection'
import './DataBaseInfoView.less'

const DataBaseInfoView: React.FC = () => {
  const { database_id } = useParams<{ database_id: string }>()
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
    setDatabaseId: (id: number | null) => (state.databaseId = id),
    isGraphMaximized: state.state.isGraphMaximized,
    toggleGraphMaximize: () => (state.state.isGraphMaximized = !state.state.isGraphMaximized),
    toggleRightPanel: () => (state.state.rightPanelVisible = !state.state.rightPanelVisible)
  }))

  const [addFilesModalVisible, setAddFilesModalVisible] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(45)
  const [isDragging, setIsDragging] = useState(false)
  const resizeHandle = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDatabaseId(Number(database_id))
    getDatabaseInfo(Number(database_id))
    startAutoRefresh()
    return () => stopAutoRefresh()
  }, [database_id, setDatabaseId, getDatabaseInfo, startAutoRefresh, stopAutoRefresh])

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
    <div className="database-info-container">
      <DatabaseHeader />
      <Modal
        open={isGraphMaximized}
        footer={null}
        closable={false}
        width="100%"
        wrapClassName="full-modal"
      >
        <div className="maximized-graph-header">
          <h3>知识图谱 (最大化)</h3>
          <Button type="text" onClick={toggleGraphMaximize}>
            <CompressOutlined /> 退出最大化
          </Button>
        </div>
        <div className="maximized-graph-content">
          {database.kb_type !== 'lightrag' ? (
            <div className="graph-disabled">
              <h4>知识图谱不可用</h4>
              <p>
                当前知识库类型 "{getKbTypeLabel(database.kb_type || 'lightrag')}"
                不支持知识图谱功能。
              </p>
            </div>
          ) : (
            <KnowledgeGraphViewer initialDatabaseId={databaseId} hideDbSelector={true} />
          )}
        </div>
      </Modal>
      <FileDetailModal />
      <FileUploadModal visible={addFilesModalVisible} onVisibleChange={setAddFilesModalVisible} />
      <div className="unified-layout">
        <div className="left-panel" style={{ width: `${leftPanelWidth}%` }}>
          <FileTable
            rightPanelVisible={state.rightPanelVisible}
            onShowAddFilesModal={() => setAddFilesModalVisible(true)}
            onToggleRightPanel={toggleRightPanel}
          />
        </div>
        <div className="resize-handle" ref={resizeHandle} onMouseDown={handleMouseDown}></div>
        <div
          className="right-panel"
          style={{
            width: `${100 - leftPanelWidth}%`,
            display: state.rightPanelVisible ? 'flex' : 'none'
          }}
        >
          <KnowledgeGraphSection />
          <div className="resize-handle-horizontal"></div>
          <QuerySection />
        </div>
      </div>
    </div>
  )
}

export default DataBaseInfoView
