// API 配置
export const API_CONFIG = {
  // 基础 API URL，可以通过环境变量 VITE_API_URL 覆盖
  BASE_URL: import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000/v1/',

  // 获取完整的 API URL
  getFullUrl: (path: string): string => {
    // 确保 path 以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    // 确保 BASE_URL 以 / 结尾
    const baseUrl = API_CONFIG.BASE_URL.endsWith('/')
      ? API_CONFIG.BASE_URL
      : `${API_CONFIG.BASE_URL}/`
    return `${baseUrl}${normalizedPath.replace(/^\//, '')}`
  }
}

// 默认导出
export default API_CONFIG
