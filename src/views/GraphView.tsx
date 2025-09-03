import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Modal, Input, Upload, message, Tag, Empty } from 'antd'
import {
  UploadOutlined,
  SyncOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import HeaderComponent from '@/components/HeaderComponent'
import { neo4jApi } from '@/apis/graph_api'
import { useUserStore } from '@/stores/userStore'
import { Graph } from '@antv/g6'
import './GraphView.less'

const GraphView: React.FC = () => {
  const { getAuthHeaders } = useUserStore()
  const [graphInfo, setGraphInfo] = useState<any>(null)
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: []
  })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fileList, setFileList] = useState<any[]>([])
  const container = useRef<HTMLDivElement>(null)
  let graphInstance: Graph | null = null

  const loadGraphInfo = async () => {
    try {
      const data = await neo4jApi.getInfo()
      setGraphInfo(data.data)
    } catch (error: any) {
      message.error(error.message || '加载图数据库信息失败')
    }
  }

  const loadSampleNodes = async () => {
    setLoading(true)
    try {
      const data = await neo4jApi.getSampleNodes()
      setGraphData({ nodes: data.result.nodes, edges: data.result.edges })
    } catch (error: any) {
      message.error(error.message || '加载节点失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGraphInfo()
    loadSampleNodes()
  }, [])

  useEffect(() => {
    if (graphData.nodes.length > 0 && container.current) {
      if (graphInstance) {
        graphInstance.destroy()
      }
      graphInstance = new Graph({
        container: container.current,
        width: container.current.offsetWidth,
        height: container.current.offsetHeight,
        autoFit: true,
        layout: { type: 'd3-force', preventOverlap: true },
        node: {
          style: {
            labelText: (d: any) => d.data.label
          }
        },
        edge: {
          style: {
            labelText: (d: any) => d.data.label,
            endArrow: true
          }
        },
        behaviors: ['drag-element', 'zoom-canvas', 'drag-canvas']
      })
      graphInstance.read({
        nodes: graphData.nodes.map((node) => ({ id: String(node.id), data: { label: node.name } })),
        edges: graphData.edges.map((edge, i) => ({
          id: `edge-${i}`,
          source: edge.source_id,
          target: edge.target_id,
          data: { label: edge.type }
        }))
      })
    }
  }, [graphData])

  const handleFileUpload = ({ fileList }: any) => setFileList(fileList)

  const addDocumentByFile = async () => {
    // Implement file upload logic
  }

  return (
    <div className="graph-container layout-container">
      <HeaderComponent title="图数据库">
        <template slot="actions">
          <Button type="primary" onClick={() => setShowModal(true)} icon={<UploadOutlined />}>
            上传文件
          </Button>
        </template>
      </HeaderComponent>
      <div className="container-outter">
        {graphData.nodes.length > 0 ? (
          <div className="main" ref={container}></div>
        ) : (
          <Empty style={{ padding: '4rem 0' }} />
        )}
      </div>
      <Modal
        open={showModal}
        title="上传文件"
        onOk={addDocumentByFile}
        onCancel={() => setShowModal(false)}
      >
        <Upload.Dragger
          fileList={fileList}
          action="/api/knowledge/files/upload"
          headers={getAuthHeaders()}
          onChange={handleFileUpload}
        >
          <p className="ant-upload-text">点击或者把文件拖拽到这里上传</p>
          <p className="ant-upload-hint">目前仅支持上传 jsonl 文件。</p>
        </Upload.Dragger>
      </Modal>
    </div>
  )
}

export default GraphView
