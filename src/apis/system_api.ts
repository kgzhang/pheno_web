import { apiGet, apiPost, apiAdminGet, apiAdminPost, apiSuperAdminPost } from './base'

export const healthApi = {
  checkHealth: () => apiGet('/system/health', {}, false),
  checkOcrHealth: async () => apiAdminGet('/system/health/ocr')
}

export const configApi = {
  getConfig: async () => apiAdminGet('/system/config'),
  updateConfig: async (key: string, value: any) => apiAdminPost('/system/config', { key, value }),
  updateConfigBatch: async (items: Record<string, any>) =>
    apiAdminPost('/system/config/update', items),
  restartSystem: async () => apiSuperAdminPost('/system/restart', {}),
  getLogs: async () => apiAdminGet('/system/logs')
}

export const brandApi = {
  getInfoConfig: () => apiGet('/system/info', {}, false),
  reloadInfoConfig: async () => apiPost('/system/info/reload', {}, {}, false)
}

export const ocrApi = {
  getStats: async () => apiAdminGet('/system/ocr/stats'),
  getHealth: async () => apiAdminGet('/system/ocr/health')
}
