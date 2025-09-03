import { apiGet, apiPost, apiAdminGet, apiAdminPost, apiSuperAdminPost } from './base'

export const healthApi = {
  checkHealth: () => apiGet('/api/system/health', {}, false),
  checkOcrHealth: async () => apiAdminGet('/api/system/health/ocr')
}

export const configApi = {
  getConfig: async () => apiAdminGet('/api/system/config'),
  updateConfig: async (key: string, value: any) =>
    apiAdminPost('/api/system/config', { key, value }),
  updateConfigBatch: async (items: Record<string, any>) =>
    apiAdminPost('/api/system/config/update', items),
  restartSystem: async () => apiSuperAdminPost('/api/system/restart', {}),
  getLogs: async () => apiAdminGet('/api/system/logs')
}

export const brandApi = {
  getInfoConfig: () => apiGet('/api/system/info', {}, false),
  reloadInfoConfig: async () => apiPost('/api/system/info/reload', {}, {}, false)
}

export const ocrApi = {
  getStats: async () => apiAdminGet('/api/system/ocr/stats'),
  getHealth: async () => apiAdminGet('/api/system/ocr/health')
}
