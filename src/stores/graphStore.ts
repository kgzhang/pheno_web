import { create } from 'zustand'
import { DirectedGraph } from 'graphology'

interface Node {
  id: string
  labels: string[]
  entity_type: string
  properties: Record<string, any>
  size: number
  x: number
  y: number
  color: string
  degree: number
}

interface Edge {
  id: string
  source: string
  target: string
  type: string
  properties: Record<string, any>
  dynamicId: string
  size: number
  color: string
  originalWeight: number
}

interface RawGraph {
  nodes: Node[]
  edges: Edge[]
  nodeIdMap: Record<string, number>
  edgeIdMap: Record<string, number>
  edgeDynamicIdMap: Record<string, number>
}

interface GraphState {
  selectedNode: string | null
  focusedNode: string | null
  selectedEdge: string | null
  focusedEdge: string | null
  rawGraph: RawGraph | null
  sigmaGraph: DirectedGraph | null
  sigmaInstance: any | null
  entityTypes: any[]
  typeColorMap: Map<string, string>
  isFetching: boolean
  graphIsEmpty: boolean
  moveToSelectedNode: boolean
  stats: {
    total_nodes: number
    total_edges: number
    displayed_nodes: number
    displayed_edges: number
  }
  selectedNodeData: () => Node | null
  selectedEdgeData: () => Edge | null
  isGraphEmpty: () => boolean
  setSigmaInstance: (instance: any) => void
  setSelectedNode: (nodeId: string | null, moveToNode?: boolean) => void
  setFocusedNode: (nodeId: string | null) => void
  setSelectedEdge: (edgeId: string | null) => void
  setFocusedEdge: (edgeId: string | null) => void
  clearSelection: () => void
  setIsFetching: (isFetching: boolean) => void
  setEntityTypes: (types: any[]) => void
  updateTypeColorMap: () => void
  getEntityColor: (entityType: string) => string
  setRawGraph: (rawGraph: RawGraph) => void
  setSigmaGraph: (sigmaGraph: DirectedGraph) => void
  updateStats: () => void
  createGraphFromApiData: (nodesData: any[], edgesData: any[]) => RawGraph
  calculateNodeSize: (node: any) => number
  calculateEdgeSize: (weight: number) => number
  createSigmaGraph: (rawGraph: RawGraph) => DirectedGraph
  reset: () => void
}

export const useGraphStore = create<GraphState>((set, get) => ({
  selectedNode: null,
  focusedNode: null,
  selectedEdge: null,
  focusedEdge: null,
  rawGraph: null,
  sigmaGraph: null,
  sigmaInstance: null,
  entityTypes: [],
  typeColorMap: new Map(),
  isFetching: false,
  graphIsEmpty: false,
  moveToSelectedNode: false,
  stats: {
    total_nodes: 0,
    total_edges: 0,
    displayed_nodes: 0,
    displayed_edges: 0
  },

  selectedNodeData: () => {
    const { selectedNode, rawGraph } = get()
    if (!selectedNode || !rawGraph) return null
    return rawGraph.nodes.find((node) => node.id === selectedNode) || null
  },

  selectedEdgeData: () => {
    const { selectedEdge, rawGraph } = get()
    if (!selectedEdge || !rawGraph) return null
    return (
      rawGraph.edges.find((edge) => edge.dynamicId === selectedEdge || edge.id === selectedEdge) ||
      null
    )
  },

  isGraphEmpty: () => {
    const { rawGraph } = get()
    return !rawGraph || rawGraph.nodes.length === 0
  },

  setSigmaInstance: (instance) => set({ sigmaInstance: instance }),
  setSelectedNode: (nodeId, moveToNode = false) => {
    set({ selectedNode: nodeId, moveToSelectedNode: moveToNode })
    if (nodeId) {
      set({ selectedEdge: null })
    }
  },
  setFocusedNode: (nodeId) => set({ focusedNode: nodeId }),
  setSelectedEdge: (edgeId) => {
    set({ selectedEdge: edgeId })
    if (edgeId) {
      set({ selectedNode: null })
    }
  },
  setFocusedEdge: (edgeId) => set({ focusedEdge: edgeId }),
  clearSelection: () =>
    set({ selectedNode: null, focusedNode: null, selectedEdge: null, focusedEdge: null }),
  setIsFetching: (isFetching) => set({ isFetching }),
  setEntityTypes: (types) => {
    set({ entityTypes: types })
    get().updateTypeColorMap()
  },
  updateTypeColorMap: () => {
    const colorPalette = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#FF7675',
      '#FD79A8',
      '#FDCB6E',
      '#B2BEC3'
    ]
    const typeColorMap = new Map<string, string>()
    get().entityTypes.forEach((type, index) => {
      typeColorMap.set(type.type, colorPalette[index % colorPalette.length])
    })
    typeColorMap.set('person', '#FF6B6B')
    typeColorMap.set('organization', '#4ECDC4')
    typeColorMap.set('location', '#45B7D1')
    typeColorMap.set('geo', '#45B7D1')
    typeColorMap.set('event', '#96CEB4')
    typeColorMap.set('category', '#FFEAA7')
    typeColorMap.set('unknown', '#B2BEC3')
    set({ typeColorMap })
  },
  getEntityColor: (entityType) => get().typeColorMap.get(entityType) || '#B2BEC3',
  setRawGraph: (rawGraph) => {
    set({ rawGraph, graphIsEmpty: !rawGraph || rawGraph.nodes.length === 0 })
    get().updateStats()
  },
  setSigmaGraph: (sigmaGraph) => set({ sigmaGraph }),
  updateStats: () => {
    const { rawGraph } = get()
    if (rawGraph) {
      set({
        stats: {
          total_nodes: rawGraph.nodes.length,
          total_edges: rawGraph.edges.length,
          displayed_nodes: rawGraph.nodes.length,
          displayed_edges: rawGraph.edges.length
        }
      })
    }
  },
  createGraphFromApiData: (nodesData, edgesData) => {
    const rawGraph: RawGraph = {
      nodes: [],
      edges: [],
      nodeIdMap: {},
      edgeIdMap: {},
      edgeDynamicIdMap: {}
    }
    const nodeDegrees: Record<string, number> = {}

    edgesData.forEach((edge) => {
      const sourceId = String(edge.source)
      const targetId = String(edge.target)
      nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1
      nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1
    })

    nodesData.forEach((node, index) => {
      const nodeId = String(node.id)
      const labels = node.labels || [node.entity_type || 'unknown']
      const entityType = node.entity_type || labels[0] || 'unknown'
      const degree = nodeDegrees[nodeId] || 0
      const processedNode: Node = {
        id: nodeId,
        labels: Array.isArray(labels) ? labels.map(String) : [String(labels)],
        entity_type: String(entityType),
        properties: {
          entity_id: String(node.properties?.entity_id || node.entity_id || nodeId),
          entity_type: String(entityType),
          description: String(node.properties?.description || node.description || ''),
          file_path: String(node.properties?.file_path || node.file_path || ''),
          ...(node.properties || {})
        },
        size: get().calculateNodeSize({ degree }),
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        color: get().getEntityColor(String(entityType)),
        degree
      }
      rawGraph.nodes.push(processedNode)
      rawGraph.nodeIdMap[nodeId] = index
    })

    edgesData.forEach((edge, index) => {
      const sourceId = String(edge.source)
      const targetId = String(edge.target)
      const dynamicId = `${sourceId}-${targetId}-${index}`
      const weight = Number(edge.properties?.weight || edge.weight || 1.0)
      const processedEdge: Edge = {
        id: String(edge.id),
        source: sourceId,
        target: targetId,
        type: edge.type || 'DIRECTED',
        properties: {
          weight: weight,
          keywords: String(edge.properties?.keywords || edge.keywords || ''),
          description: String(edge.properties?.description || edge.description || ''),
          file_path: String(edge.properties?.file_path || edge.file_path || ''),
          ...(edge.properties || {})
        },
        dynamicId: dynamicId,
        size: get().calculateEdgeSize(weight),
        color: '#666',
        originalWeight: weight
      }
      rawGraph.edges.push(processedEdge)
      rawGraph.edgeIdMap[edge.id] = index
      rawGraph.edgeDynamicIdMap[dynamicId] = index
    })

    return rawGraph
  },
  calculateNodeSize: (node) => {
    const baseSizeM = 15
    const degree = node.degree || 0
    return Math.min(baseSizeM + degree * 3, 40)
  },
  calculateEdgeSize: (weight) => {
    const minSize = 3
    const maxSize = 8
    const normalizedWeight = Math.max(0, Math.min(1, (weight - 1) / 9))
    return minSize + normalizedWeight * (maxSize - minSize)
  },
  createSigmaGraph: (rawGraph) => {
    const sigmaGraph = new DirectedGraph()
    rawGraph.nodes.forEach((node) => {
      sigmaGraph.addNode(String(node.id), {
        label: String(node.properties?.entity_id || node.id),
        size: Number(node.size) || 15,
        color: String(node.color) || '#B2BEC3',
        x: Number(node.x) || Math.random() * 1000,
        y: Number(node.y) || Math.random() * 1000,
        originalData: node
      })
    })
    rawGraph.edges.forEach((edge) => {
      if (sigmaGraph.hasNode(String(edge.source)) && sigmaGraph.hasNode(String(edge.target))) {
        const sigmaEdgeId = edge.dynamicId || `${edge.source}->${edge.target}`
        if (!sigmaGraph.hasEdge(sigmaEdgeId)) {
          sigmaGraph.addEdgeWithKey(sigmaEdgeId, String(edge.source), String(edge.target), {
            size: Number(edge.size) || 1,
            color: String(edge.color) || '#666',
            label: String(edge.properties?.keywords || edge.properties?.description || ''),
            originalWeight: Number(edge.originalWeight) || 1,
            originalData: edge
          })
        }
      }
    })
    return sigmaGraph
  },
  reset: () =>
    set({
      selectedNode: null,
      focusedNode: null,
      selectedEdge: null,
      focusedEdge: null,
      rawGraph: null,
      sigmaGraph: null,
      moveToSelectedNode: false,
      graphIsEmpty: false,
      stats: { total_nodes: 0, total_edges: 0, displayed_nodes: 0, displayed_edges: 0 }
    })
}))
