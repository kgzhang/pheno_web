import { create } from 'zustand'
import { message, Modal } from 'antd'
import { databaseApi, documentApi, queryApi } from '@/apis/knowledge_api'

interface DatabaseState {
  database: Record<string, any>
  databaseId: number | null
  selectedFile: Record<string, any> | null
  queryParams: any[]
  meta: Record<string, any>
  graphStats: {
    displayed_nodes: number
    displayed_edges: number
    is_truncated: boolean
  }
  selectedRowKeys: any[]
  state: {
    databaseLoading: boolean
    refrashing: boolean
    searchLoading: boolean
    lock: boolean
    fileDetailModalVisible: boolean
    fileDetailLoading: boolean
    batchDeleting: boolean
    chunkLoading: boolean
    autoRefresh: boolean
    queryParamsLoading: boolean
    isGraphMaximized: boolean
    rightPanelVisible: boolean
  }
  getDatabaseInfo: (id?: number) => Promise<void>
  updateDatabaseInfo: (formData: any) => Promise<void>
  deleteDatabase: () => void
  deleteFile: (fileId: string) => Promise<void>
  handleDeleteFile: (fileId: string) => void
  handleBatchDelete: () => void
  addFiles: (args: { items: any[]; contentType: string; params: any }) => Promise<boolean>
  openFileDetail: (record: any) => Promise<void>
  loadQueryParams: (id?: number) => Promise<void>
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
  toggleAutoRefresh: () => void
  selectAllFailedFiles: () => void
}

let refreshInterval: NodeJS.Timeout | null = null

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  database: {},
  databaseId: null,
  selectedFile: null,
  queryParams: [],
  meta: {},
  graphStats: {
    displayed_nodes: 0,
    displayed_edges: 0,
    is_truncated: false
  },
  selectedRowKeys: [],
  state: {
    databaseLoading: false,
    refrashing: false,
    searchLoading: false,
    lock: false,
    fileDetailModalVisible: false,
    fileDetailLoading: false,
    batchDeleting: false,
    chunkLoading: false,
    autoRefresh: false,
    queryParamsLoading: false,
    isGraphMaximized: false,
    rightPanelVisible: true
  },

  getDatabaseInfo: async (id) => {
    const db_id = id || get().databaseId
    if (!db_id) return

    set((state) => ({ state: { ...state.state, lock: true, databaseLoading: true } }))
    try {
      const data = await databaseApi.getDatabaseInfo(db_id)
      set({ database: data })
      await get().loadQueryParams(db_id)
    } catch (error: any) {
      console.error(error)
      message.error(error.message || '获取数据库信息失败')
    } finally {
      set((state) => ({ state: { ...state.state, lock: false, databaseLoading: false } }))
    }
  },

  updateDatabaseInfo: async (formData) => {
    try {
      set((state) => ({ state: { ...state.state, lock: true } }))
      await databaseApi.updateDatabase(get().databaseId!, formData)
      message.success('知识库信息更新成功')
      await get().getDatabaseInfo()
    } catch (error: any) {
      console.error(error)
      message.error(error.message || '更新失败')
    } finally {
      set((state) => ({ state: { ...state.state, lock: false } }))
    }
  },

  deleteDatabase: () => {
    Modal.confirm({
      title: '删除数据库',
      content: '确定要删除该数据库吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        set((state) => ({ state: { ...state.state, lock: true } }))
        try {
          const data = await databaseApi.deleteDatabase(get().databaseId!)
          message.success(data.message || '删除成功')
          // TODO: router.push('/database');
        } catch (error: any) {
          console.error(error)
          message.error(error.message || '删除失败')
        } finally {
          set((state) => ({ state: { ...state.state, lock: false } }))
        }
      }
    })
  },

  deleteFile: async (fileId) => {
    set((state) => ({ state: { ...state.state, lock: true } }))
    try {
      await documentApi.deleteDocument(get().databaseId!, fileId)
      await get().getDatabaseInfo()
    } catch (error: any) {
      console.error(error)
      message.error(error.message || '删除失败')
      throw error
    } finally {
      set((state) => ({ state: { ...state.state, lock: false } }))
    }
  },

  handleDeleteFile: (fileId) => {
    Modal.confirm({
      title: '删除文件',
      content: '确定要删除该文件吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => get().deleteFile(fileId)
    })
  },

  handleBatchDelete: () => {
    const files = get().database.files || {}
    const validFileIds = get().selectedRowKeys.filter((fileId) => {
      const file = files[fileId]
      return file && !(file.status === 'processing' || file.status === 'waiting')
    })

    if (validFileIds.length === 0) {
      message.info('没有可删除的文件')
      return
    }

    Modal.confirm({
      title: '批量删除文件',
      content: `确定要删除选中的 ${validFileIds.length} 个文件吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        set((state) => ({ state: { ...state.state, batchDeleting: true } }))
        let successCount = 0
        let failureCount = 0
        const hide = message.loading(`正在删除文件 0/${validFileIds.length}`, 0)

        try {
          for (let i = 0; i < validFileIds.length; i++) {
            const fileId = validFileIds[i]
            try {
              await get().deleteFile(fileId)
              successCount++
            } catch (error) {
              console.error(`删除文件 ${fileId} 失败:`, error)
              failureCount++
            }
          }
          hide()
          if (successCount > 0 && failureCount === 0) {
            message.success(`成功删除 ${successCount} 个文件`)
          } else if (successCount > 0 && failureCount > 0) {
            message.warning(`成功删除 ${successCount} 个文件，${failureCount} 个文件删除失败`)
          } else if (failureCount > 0) {
            message.error(`${failureCount} 个文件删除失败`)
          }
          set({ selectedRowKeys: [] })
          await get().getDatabaseInfo()
        } catch (error) {
          hide()
          console.error('批量删除出错:', error)
          message.error('批量删除过程中发生错误')
        } finally {
          set((state) => ({ state: { ...state.state, batchDeleting: false } }))
        }
      }
    })
  },

  addFiles: async ({ items, contentType, params }) => {
    if (items.length === 0) {
      message.error(contentType === 'file' ? '请先上传文件' : '请输入有效的网页链接')
      return false
    }

    set((state) => ({ state: { ...state.state, chunkLoading: true } }))
    try {
      const data = await documentApi.addDocuments(get().databaseId!, items, {
        ...params,
        content_type: contentType
      })
      if (data.status === 'success') {
        const itemType = contentType === 'file' ? '文件' : 'URL'
        message.success(data.message || `${itemType}已提交处理，请稍后在列表刷新查看状态`)
        await get().getDatabaseInfo()
        return true
      } else {
        message.error(data.message || '处理失败')
        return false
      }
    } catch (error: any) {
      console.error(error)
      message.error(error.message || '处理请求失败')
      return false
    } finally {
      set((state) => ({ state: { ...state.state, chunkLoading: false } }))
    }
  },

  openFileDetail: async (record) => {
    if (record.status !== 'done') {
      message.error('文件未处理完成，请稍后再试')
      return
    }
    set((state) => ({
      state: { ...state.state, fileDetailModalVisible: true, fileDetailLoading: true, lock: true },
      selectedFile: { ...record, lines: [] }
    }))

    try {
      const data = await documentApi.getDocumentInfo(get().databaseId!, record.file_id)
      if (data.status === 'failed') {
        message.error(data.message)
        set((state) => ({ state: { ...state.state, fileDetailModalVisible: false } }))
        return
      }
      set({ selectedFile: { ...record, lines: data.lines || [] } })
    } catch (error: any) {
      console.error(error)
      message.error(error.message)
      set((state) => ({ state: { ...state.state, fileDetailModalVisible: false } }))
    } finally {
      set((state) => ({ state: { ...state.state, fileDetailLoading: false, lock: false } }))
    }
  },

  loadQueryParams: async (id) => {
    const db_id = id || get().databaseId
    if (!db_id) return

    set((state) => ({ state: { ...state.state, queryParamsLoading: true } }))
    try {
      const response = await queryApi.getKnowledgeBaseQueryParams(db_id)
      const queryParams = response.params?.options || []
      set({ queryParams })

      const supportedParamKeys = new Set(queryParams.map((param: any) => param.key))
      const newMeta = { ...get().meta }
      for (const key in newMeta) {
        if (key !== 'db_id' && !supportedParamKeys.has(key)) {
          delete newMeta[key]
        }
      }
      queryParams.forEach((param: any) => {
        if (!(param.key in newMeta)) {
          newMeta[param.key] = param.default
        }
      })
      set({ meta: newMeta })
    } catch (error) {
      console.error('Failed to load query params:', error)
      message.error('加载查询参数失败')
    } finally {
      set((state) => ({ state: { ...state.state, queryParamsLoading: false } }))
    }
  },

  startAutoRefresh: () => {
    if (get().state.autoRefresh && !refreshInterval) {
      refreshInterval = setInterval(() => {
        get().getDatabaseInfo()
      }, 1000)
    }
  },

  stopAutoRefresh: () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  },

  toggleAutoRefresh: () => {
    set((state) => ({ state: { ...state.state, autoRefresh: !state.state.autoRefresh } }))
    if (get().state.autoRefresh) {
      get().startAutoRefresh()
    } else {
      get().stopAutoRefresh()
    }
  },

  selectAllFailedFiles: () => {
    const files = Object.values(get().database.files || {})
    const failedFiles = files.filter((file) => file.status === 'failed').map((file) => file.file_id)

    const newSelectedKeys = [...new Set([...get().selectedRowKeys, ...failedFiles])]
    set({ selectedRowKeys: newSelectedKeys })

    if (failedFiles.length > 0) {
      message.success(`已选择 ${failedFiles.length} 个失败的文件`)
    } else {
      message.info('当前没有失败的文件')
    }
  }
}))
