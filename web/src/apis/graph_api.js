import { apiGet, apiPost } from './base'

/**
 * 图数据库API模块
 * 包含LightRAG图知识库和Neo4j图数据库两种接口
 * 采用命名空间分组模式，清晰区分接口类型
 */

// =============================================================================
// === LightRAG图知识库接口分组 ===
// =============================================================================

export const lightragApi = {
  /**
   * 获取LightRAG知识图谱子图数据
   * @param {Object} params - 查询参数
   * @param {string} params.db_id - LightRAG数据库ID
   * @param {string} params.node_label - 节点标签（"*"获取全图）
   * @param {number} params.max_depth - 最大深度
   * @param {number} params.max_nodes - 最大节点数
   * @returns {Promise} - 子图数据
   */
  getSubgraph: async (params) => {
    const { db_id, node_label = "*", max_depth = 2, max_nodes = 100 } = params

    if (!db_id) {
      throw new Error('db_id is required')
    }

    const queryParams = new URLSearchParams({
      db_id: db_id,
      node_label: node_label,
      max_depth: max_depth.toString(),
      max_nodes: max_nodes.toString()
    })

    return await apiGet(`/api/graph/lightrag/subgraph?${queryParams.toString()}`, {}, true)
  },

  /**
   * 获取所有可用的LightRAG数据库
   * @returns {Promise} - LightRAG数据库列表
   */
  getDatabases: async () => {
    return await apiGet('/api/graph/lightrag/databases', {}, true)
  },

  /**
   * 获取LightRAG图谱标签列表
   * @param {string} db_id - LightRAG数据库ID
   * @returns {Promise} - 标签列表
   */
  getLabels: async (db_id) => {
    if (!db_id) {
      throw new Error('db_id is required')
    }

    const queryParams = new URLSearchParams({
      db_id: db_id
    })

    return await apiGet(`/api/graph/lightrag/labels?${queryParams.toString()}`, {}, true)
  },

  /**
   * 获取LightRAG图谱统计信息
   * @param {string} db_id - LightRAG数据库ID
   * @returns {Promise} - 统计信息
   */
  getStats: async (db_id) => {
    if (!db_id) {
      throw new Error('db_id is required')
    }

    const queryParams = new URLSearchParams({
      db_id: db_id
    })

    return await apiGet(`/api/graph/lightrag/stats?${queryParams.toString()}`, {}, true)
  }
}

// =============================================================================
// === Neo4j图数据库接口分组 ===
// =============================================================================

export const neo4jApi = {
  /**
   * 获取Neo4j图数据库样例节点
   * @param {string} kgdb_name - Neo4j数据库名称（默认为'neo4j'）
   * @param {number} num - 节点数量
   * @returns {Promise} - 样例节点数据
   */
  getSampleNodes: async (kgdb_name = 'neo4j', num = 100) => {
    const queryParams = new URLSearchParams({
      kgdb_name: kgdb_name,
      num: num.toString()
    })

    return await apiGet(`/api/graph/neo4j/nodes?${queryParams.toString()}`, {}, true)
  },

  /**
   * 根据实体名称查询Neo4j图节点
   * @param {string} entity_name - 实体名称
   * @returns {Promise} - 节点数据
   */
  queryNode: async (entity_name) => {
    if (!entity_name) {
      throw new Error('entity_name is required')
    }

    const queryParams = new URLSearchParams({
      entity_name: entity_name
    })

    return await apiGet(`/api/graph/neo4j/node?${queryParams.toString()}`, {}, true)
  },

  /**
   * 通过JSONL文件添加图谱实体到Neo4j
   * @param {string} file_path - JSONL文件路径
   * @param {string} kgdb_name - Neo4j数据库名称（默认为'neo4j'）
   * @returns {Promise} - 添加结果
   */
  addEntities: async (file_path, kgdb_name = 'neo4j') => {
    return await apiPost('/api/graph/neo4j/add-entities', {
      file_path: file_path,
      kgdb_name: kgdb_name
    }, {}, true)
  },

  /**
   * 为Neo4j图谱节点添加嵌入向量索引
   * @param {string} kgdb_name - Neo4j数据库名称（默认为'neo4j'）
   * @returns {Promise} - 索引结果
   */
  indexEntities: async (kgdb_name = 'neo4j') => {
    return await apiPost('/api/graph/neo4j/index-entities', {
      kgdb_name: kgdb_name
    }, {}, true)
  },

  /**
   * 获取Neo4j图数据库信息
   * @returns {Promise} - 图数据库信息
   */
  getInfo: async () => {
    return await apiGet('/api/graph/neo4j/info', {}, true)
  }
}

// =============================================================================
// === 工具函数分组 ===
// =============================================================================

/**
 * 根据实体类型获取颜色
 * @param {string} entityType - 实体类型
 * @returns {string} - 颜色值
 */
export const getEntityTypeColor = (entityType) => {
  const colorMap = {
    'person': '#FF6B6B',      // 红色 - 人物
    'organization': '#4ECDC4', // 青色 - 组织
    'location': '#45B7D1',    // 蓝色 - 地点
    'geo': '#45B7D1',         // 蓝色 - 地理位置
    'event': '#96CEB4',       // 绿色 - 事件
    'category': '#FFEAA7',    // 黄色 - 分类
    'equipment': '#DDA0DD',   // 紫色 - 设备
    'athlete': '#FF7675',     // 红色 - 运动员
    'record': '#FD79A8',      // 粉色 - 记录
    'year': '#FDCB6E',        // 橙色 - 年份
    'UNKNOWN': '#B2BEC3',     // 灰色 - 未知
    'unknown': '#B2BEC3'      // 灰色 - 未知
  }

  return colorMap[entityType] || colorMap['unknown']
}

/**
 * 根据权重计算边的粗细
 * @param {number} weight - 权重值
 * @param {number} minWeight - 最小权重
 * @param {number} maxWeight - 最大权重
 * @returns {number} - 边的粗细
 */
export const calculateEdgeWidth = (weight, minWeight = 1, maxWeight = 10) => {
  const minWidth = 1
  const maxWidth = 5
  const normalizedWeight = (weight - minWeight) / (maxWeight - minWeight)
  return minWidth + normalizedWeight * (maxWidth - minWidth)
}

// =============================================================================
// === 兼容性导出（可选，用于平滑迁移）===
// =============================================================================

// 保持向后兼容的导出，后续可以移除
export const getGraphNodes = async (params = {}) => {
  console.warn('getGraphNodes is deprecated, use neo4jApi.getSampleNodes instead')
  return neo4jApi.getSampleNodes(params.kgdb_name || 'neo4j', params.num || 100)
}

export const getGraphNode = async (params = {}) => {
  console.warn('getGraphNode is deprecated, use neo4jApi.queryNode instead')
  return neo4jApi.queryNode(params.entity_name)
}

export const addByJsonl = async (file_path, kgdb_name = 'neo4j') => {
  console.warn('addByJsonl is deprecated, use neo4jApi.addEntities instead')
  return neo4jApi.addEntities(file_path, kgdb_name)
}

export const indexNodes = async (kgdb_name = 'neo4j') => {
  console.warn('indexNodes is deprecated, use neo4jApi.indexEntities instead')
  return neo4jApi.indexEntities(kgdb_name)
}

export const getGraphStats = async () => {
  console.warn('getGraphStats is deprecated, use neo4jApi.getInfo instead')
  return neo4jApi.getInfo()
}

// 保持旧的分组导出，便于批量替换
export const graphApi = {
  getSubgraph: lightragApi.getSubgraph,
  getDatabases: lightragApi.getDatabases,
  getLabels: lightragApi.getLabels,
  getStats: lightragApi.getStats,
  ...neo4jApi  // 临时兼容
}