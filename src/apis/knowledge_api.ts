import { apiAdminGet, apiAdminPost, apiAdminPut, apiAdminDelete } from './base'

export const databaseApi = {
  getDatabases: async () => {
    return apiAdminGet('/knowledge/databases')
  },
  createDatabase: async (databaseData: any) => {
    return apiAdminPost('/knowledge/databases', databaseData)
  },
  getDatabaseInfo: async (dbId: string) => {
    return apiAdminGet(`/knowledge/databases/${dbId}`)
  },
  updateDatabase: async (dbId: string, updateData: any) => {
    return apiAdminPut(`/knowledge/databases/${dbId}`, updateData)
  },
  deleteDatabase: async (dbId: string) => {
    return apiAdminDelete(`/knowledge/databases/${dbId}`)
  }
}

export const documentApi = {
  addDocuments: async (dbId: string, items: any[], params = {}) => {
    return apiAdminPost(`/knowledge/databases/${dbId}/documents`, {
      items,
      params
    })
  },
  getDocumentInfo: async (dbId: string, docId: string) => {
    return apiAdminGet(`/knowledge/databases/${dbId}/documents/${docId}`)
  },
  deleteDocument: async (dbId: string, docId: string) => {
    return apiAdminDelete(`/knowledge/databases/${dbId}/documents/${docId}`)
  }
}

export const queryApi = {
  queryKnowledgeBase: async (dbId: string, query: string, meta = {}) => {
    return apiAdminPost(`/knowledge/databases/${dbId}/query`, {
      query,
      meta
    })
  },
  queryTest: async (dbId: string, query: string, meta = {}) => {
    return apiAdminPost(`/knowledge/databases/${dbId}/query-test`, {
      query,
      meta
    })
  },
  getKnowledgeBaseQueryParams: async (dbId: string) => {
    return apiAdminGet(`/knowledge/databases/${dbId}/query-params`)
  }
}

export const fileApi = {
  uploadFile: async (file: File, dbId: string | null = null) => {
    const formData = new FormData()
    formData.append('file', file)

    const url = dbId ? `/knowledge/files/upload?db_id=${dbId}` : '/knowledge/files/upload'

    return apiAdminPost(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export const typeApi = {
  getKnowledgeBaseTypes: async () => {
    return apiAdminGet('/knowledge/types')
  },
  getStatistics: async () => {
    return apiAdminGet('/knowledge/stats')
  }
}
