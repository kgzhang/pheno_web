import React, { useRef, useEffect, useState } from 'react'
import { Select, InputNumber, Button, Tag, message } from 'antd'
import { SearchOutlined, PlusOutlined, MinusOutlined, HomeOutlined } from '@ant-design/icons'
import Sigma from 'sigma'
import { NodeBorderProgram } from '@sigma/node-border'
import EdgeCurveProgram, { EdgeCurvedArrowProgram } from '@sigma/edge-curve'
import { lightragApi } from '@/apis/graph_api'
import { useGraphStore } from '@/stores/graphStore'
import './KnowledgeGraphViewer.less'

interface KnowledgeGraphViewerProps {
  initialDatabaseId?: string
  hideDbSelector?: boolean
  hideStats?: boolean
  hideControls?: boolean
  initialLimit?: number
  initialDepth?: number
}

const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = React.forwardRef((props, ref) => {
  const {
    initialDatabaseId = '',
    hideDbSelector = false,
    hideStats = false,
    hideControls = false,
    initialLimit = 200,
    initialDepth = 2
  } = props

  const {
    setSigmaInstance,
    setSelectedNode,
    setFocusedNode,
    setSelectedEdge,
    clearSelection,
    setEntityTypes,
    setRawGraph,
    setSigmaGraph,
    getEntityColor,
    createGraphFromApiData,
    createSigmaGraph,
    stats,
    selectedNodeData,
    selectedEdgeData,
    entityTypes
  } = useGraphStore()

  const sigmaContainer = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState(initialDatabaseId)
  const [availableDatabases, setAvailableDatabases] = useState<any[]>([])
  const [selectedLabel, setSelectedLabel] = useState('*')
  const [availableLabels, setAvailableLabels] = useState<string[]>([])
  const [searchParams, setSearchParams] = useState({
    max_nodes: initialLimit,
    max_depth: initialDepth
  })

  let sigmaInstance: Sigma | null = null

  const loadGraphData = async () => {
    if (!selectedDatabase) return
    setLoading(true)
    try {
      const [graphResponse, statsResponse] = await Promise.all([
        lightragApi.getSubgraph({
          db_id: selectedDatabase,
          node_label: selectedLabel,
          ...searchParams
        }),
        lightragApi.getStats(selectedDatabase)
      ])
      setEntityTypes(statsResponse.data.entity_types || [])
      const rawGraph = createGraphFromApiData(graphResponse.data.nodes, graphResponse.data.edges)
      setRawGraph(rawGraph)
      const sigmaGraph = createSigmaGraph(rawGraph)
      setSigmaGraph(sigmaGraph)
      if (sigmaInstance) {
        sigmaInstance.setGraph(sigmaGraph)
      }
    } catch (error: any) {
      message.error(error.message || '加载图数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hideDbSelector) {
      lightragApi.getDatabases().then((res) => setAvailableDatabases(res.data.databases || []))
    }
  }, [hideDbSelector])

  useEffect(() => {
    if (selectedDatabase) {
      lightragApi
        .getLabels(selectedDatabase)
        .then((res) => setAvailableLabels(res.data.labels || []))
      loadGraphData()
    }
  }, [selectedDatabase])

  useEffect(() => {
    if (sigmaContainer.current) {
      sigmaInstance = new Sigma(sigmaContainer.current, {
        nodeProgramClasses: { border: NodeBorderProgram },
        edgeProgramClasses: { curve: EdgeCurveProgram, arrow: EdgeCurvedArrowProgram },
        renderEdgeLabels: true
      })
      setSigmaInstance(sigmaInstance)

      sigmaInstance.on('clickNode', ({ node }) => setSelectedNode(node))
      sigmaInstance.on('enterNode', ({ node }) => setFocusedNode(node))
      sigmaInstance.on('leaveNode', () => setFocusedNode(null))
      sigmaInstance.on('clickEdge', ({ edge }) => setSelectedEdge(edge))
      sigmaInstance.on('clickStage', () => clearSelection())
    }
    return () => sigmaInstance?.kill()
  }, [])

  React.useImperativeHandle(ref, () => ({
    loadFullGraph: () => {
      setSelectedLabel('*')
      loadGraphData()
    },
    clearGraph: () => {
      if (sigmaInstance) {
        sigmaInstance.getGraph().clear()
        sigmaInstance.refresh()
      }
    }
  }))

  return (
    <div className="knowledge-graph-viewer">
      {!hideControls && <div className="control-panel">{/* Controls UI */}</div>}
      <div className="sigma-container" ref={sigmaContainer}></div>
      {selectedNodeData && <div className="detail-panel node-panel">{/* Node details */}</div>}
      {selectedEdgeData && <div className="detail-panel edge-panel">{/* Edge details */}</div>}
      <div className="legend">{/* Legend */}</div>
      <div className="graph-controls">{/* Zoom/Reset buttons */}</div>
    </div>
  )
})

export default KnowledgeGraphViewer
