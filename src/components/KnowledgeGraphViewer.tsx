import React, { useRef, useEffect, useState } from 'react'
import { message } from '@/utils/toast'
import Sigma from 'sigma'
import { DirectedGraph } from 'graphology'
import { NodeBorderProgram } from '@sigma/node-border'
import EdgeCurveProgram, { EdgeCurvedArrowProgram } from '@sigma/edge-curve'
import { lightragApi } from '@/apis/graph_api'
import { useGraphStore } from '@/stores/graphStore'
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
    createGraphFromApiData,
    createSigmaGraph,
    selectedNodeData,
    selectedEdgeData
  } = useGraphStore()

  const sigmaContainer = useRef<HTMLDivElement>(null)
  const [selectedDatabase] = useState(initialDatabaseId)
  const [selectedLabel, setSelectedLabel] = useState('*')
  const [searchParams] = useState({
    max_nodes: initialLimit,
    max_depth: initialDepth
  })

  const sigmaInstanceRef = useRef<Sigma | null>(null)

  const loadGraphData = async () => {
    if (!selectedDatabase) return
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
      if (sigmaInstanceRef.current) {
        sigmaInstanceRef.current.setGraph(sigmaGraph)
      }
    } catch (error: any) {
      message.error(error.message || '加载图数据失败')
    }
  }

  useEffect(() => {
    if (selectedDatabase) {
      loadGraphData()
    }
  }, [selectedDatabase])

  useEffect(() => {
    if (sigmaContainer.current) {
      const sigmaInstance = new Sigma(sigmaContainer.current, new DirectedGraph(), {
        nodeProgramClasses: { border: NodeBorderProgram },
        edgeProgramClasses: { curve: EdgeCurveProgram, arrow: EdgeCurvedArrowProgram },
        renderEdgeLabels: true
      })
      sigmaInstanceRef.current = sigmaInstance
      setSigmaInstance(sigmaInstance)

      sigmaInstance.on('clickNode', ({ node }) => setSelectedNode(node))
      sigmaInstance.on('enterNode', ({ node }) => setFocusedNode(node))
      sigmaInstance.on('leaveNode', () => setFocusedNode(null))
      sigmaInstance.on('clickEdge', ({ edge }) => setSelectedEdge(edge))
      sigmaInstance.on('clickStage', () => clearSelection())
    }
    return () => sigmaInstanceRef.current?.kill()
  }, [])

  React.useImperativeHandle(ref, () => ({
    loadFullGraph: () => {
      setSelectedLabel('*')
      loadGraphData()
    },
    clearGraph: () => {
      if (sigmaInstanceRef.current) {
        sigmaInstanceRef.current.getGraph().clear()
        sigmaInstanceRef.current.refresh()
      }
    }
  }))

  return (
    <div className="knowledge-graph-viewer">
      {!hideControls && <div className="control-panel">{/* Controls UI */}</div>}
      <div className="sigma-container" ref={sigmaContainer}></div>
      {selectedNodeData() ? (
        <div className="detail-panel node-panel">{/* Node details */}</div>
      ) : null}
      {selectedEdgeData() ? (
        <div className="detail-panel edge-panel">{/* Edge details */}</div>
      ) : null}
      <div className="legend">{/* Legend */}</div>
      <div className="graph-controls">{/* Zoom/Reset buttons */}</div>
    </div>
  )
})

export default KnowledgeGraphViewer
