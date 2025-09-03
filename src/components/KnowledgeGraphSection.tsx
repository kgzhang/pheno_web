import React, { useState, useRef } from 'react'
import { Button, Modal, InputNumber, Tag } from 'antd'
import {
  ReloadOutlined,
  ExpandOutlined,
  UpOutlined,
  DownOutlined,
  SettingOutlined
} from '@ant-design/icons'
import KnowledgeGraphViewer from './KnowledgeGraphViewer'
import { useDatabaseStore } from '@/stores/databaseStore'
import './KnowledgeGraphSection.less'

interface KnowledgeGraphSectionProps {
  visible?: boolean
  style?: React.CSSProperties
  onToggleVisible?: () => void
}

const KnowledgeGraphSection: React.FC<KnowledgeGraphSectionProps> = ({
  visible = true,
  style,
  onToggleVisible
}) => {
  const { database, graphStats, toggleGraphMaximize } = useDatabaseStore()
  const [showSettings, setShowSettings] = useState(false)
  const [graphLimit, setGraphLimit] = useState(200)
  const [graphDepth, setGraphDepth] = useState(2)
  const graphViewerRef = useRef<any>(null)

  const isGraphSupported = database.kb_type === 'lightrag'

  const loadGraph = () => {
    graphViewerRef.current?.loadFullGraph()
  }

  return (
    <div className={`graph-section ${!visible ? 'collapsed' : ''}`} style={style}>
      <div className="section-header">
        <div className="header-left">
          <h3 className="section-title">知识图谱</h3>
          {(graphStats.displayed_nodes > 0 || graphStats.displayed_edges > 0) && (
            <div className="graph-stats">
              <Tag color="blue">节点: {graphStats.displayed_nodes}</Tag>
              <Tag color="green">边: {graphStats.displayed_edges}</Tag>
            </div>
          )}
        </div>
        <div className="panel-actions">
          <Button
            type="primary"
            size="small"
            onClick={loadGraph}
            disabled={!isGraphSupported}
            icon={<ReloadOutlined />}
          >
            加载图谱
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => setShowSettings(true)}
            icon={<SettingOutlined />}
          >
            查询参数
          </Button>
          <Button
            type="text"
            size="small"
            onClick={toggleGraphMaximize}
            disabled={!isGraphSupported}
            icon={<ExpandOutlined />}
          >
            最大化
          </Button>
          <Button type="text" size="small" onClick={onToggleVisible}>
            {visible ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </div>
      </div>
      <div
        className="graph-container-compact content"
        style={{ display: visible ? 'block' : 'none' }}
      >
        {!isGraphSupported ? (
          <div className="graph-disabled">
            <h4>知识图谱不可用</h4>
          </div>
        ) : (
          <KnowledgeGraphViewer
            ref={graphViewerRef}
            initialDatabaseId={database.db_id}
            hideDbSelector
            hideStats
            hideControls
            initialLimit={graphLimit}
            initialDepth={graphDepth}
          />
        )}
      </div>
      <Modal
        open={showSettings}
        title="图谱设置"
        footer={null}
        onCancel={() => setShowSettings(false)}
        width={300}
      >
        <InputNumber
          addonBefore="limit"
          value={graphLimit}
          onChange={setGraphLimit as any}
          min={10}
          max={1000}
          step={10}
          style={{ width: '100%', marginBottom: 16 }}
        />
        <InputNumber
          addonBefore="depth"
          value={graphDepth}
          onChange={setGraphDepth as any}
          min={1}
          max={5}
          step={1}
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  )
}

export default KnowledgeGraphSection
