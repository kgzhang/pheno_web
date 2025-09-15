import { apiGet, apiPost } from './base'

interface SubgraphParams {
  db_id: string
  node_label?: string
  max_depth?: number
  max_nodes?: number
}

export const lightragApi = {
  getSubgraph: async (params: SubgraphParams) => {
    const { db_id, node_label = '*', max_depth = 2, max_nodes = 100 } = params
    if (!db_id) {
      throw new Error('db_id is required')
    }
    const queryParams = new URLSearchParams({
      db_id,
      node_label,
      max_depth: max_depth.toString(),
      max_nodes: max_nodes.toString()
    })
    return await apiGet(`/graph/lightrag/subgraph?${queryParams.toString()}`, {}, true)
  },
  getDatabases: async () => {
    return await apiGet('/graph/lightrag/databases', {}, true)
  },
  getLabels: async (db_id: string) => {
    if (!db_id) {
      throw new Error('db_id is required')
    }
    const queryParams = new URLSearchParams({ db_id })
    return await apiGet(`/graph/lightrag/labels?${queryParams.toString()}`, {}, true)
  },
  getStats: async (db_id: string) => {
    if (!db_id) {
      throw new Error('db_id is required')
    }
    const queryParams = new URLSearchParams({ db_id })
    return await apiGet(`/graph/lightrag/stats?${queryParams.toString()}`, {}, true)
  }
}

export const neo4jApi = {
  getSampleNodes: async (kgdb_name = 'neo4j', num = 100) => {
    const queryParams = new URLSearchParams({
      kgdb_name,
      num: num.toString()
    })
    return await apiGet(`/graph/neo4j/nodes?${queryParams.toString()}`, {}, true)
  },
  queryNode: async (entity_name: string) => {
    if (!entity_name) {
      throw new Error('entity_name is required')
    }
    const queryParams = new URLSearchParams({ entity_name })
    return await apiGet(`/graph/neo4j/node?${queryParams.toString()}`, {}, true)
  },
  addEntities: async (file_path: string, kgdb_name = 'neo4j') => {
    return await apiPost('/graph/neo4j/add-entities', { file_path, kgdb_name }, {}, true)
  },
  indexEntities: async (kgdb_name = 'neo4j') => {
    return await apiPost('/graph/neo4j/index-entities', { kgdb_name }, {}, true)
  },
  getInfo: async () => {
    return await apiGet('/graph/neo4j/info', {}, true)
  }
}

export const getEntityTypeColor = (entityType: string): string => {
  const colorMap: Record<string, string> = {
    person: '#FF6B6B',
    organization: '#4ECDC4',
    location: '#45B7D1',
    geo: '#45B7D1',
    event: '#96CEB4',
    category: '#FFEAA7',
    equipment: '#DDA0DD',
    athlete: '#FF7675',
    record: '#FD79A8',
    year: '#FDCB6E',
    UNKNOWN: '#B2BEC3',
    unknown: '#B2BEC3'
  }
  return colorMap[entityType] || colorMap['unknown']
}

export const calculateEdgeWidth = (weight: number, minWeight = 1, maxWeight = 10): number => {
  const minWidth = 1
  const maxWidth = 5
  const normalizedWeight = (weight - minWeight) / (maxWeight - minWeight)
  return minWidth + normalizedWeight * (maxWidth - minWidth)
}

export const graphApi = {
  ...lightragApi,
  ...neo4jApi
}
