import { useUserStore, checkAdminPermission, checkSuperAdminPermission } from '@/stores/userStore'
import { message } from '@/utils/toast'

export async function apiRequest(
  url: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<any> {
  try {
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    if (requiresAuth) {
      const { isLoggedIn, getAuthHeaders } = useUserStore.getState()
      if (!isLoggedIn()) {
        throw new Error('用户未登录')
      }
      Object.assign(requestOptions.headers!, getAuthHeaders())
    }

    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      let errorMessage = `请求失败: ${response.status}, ${response.statusText}`
      let errorData = null

      try {
        errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        // ignore
      }

      if (response.status === 401) {
        const { isLoggedIn, logout } = useUserStore.getState()
        if (isLoggedIn()) {
          const isTokenExpired =
            errorData &&
            (errorData.detail?.includes('令牌已过期') ||
              errorData.detail?.includes('token expired'))
          message.error(isTokenExpired ? '登录已过期，请重新登录' : '认证失败，请重新登录')
          logout()
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        }
        throw new Error('未授权，请先登录')
      } else if (response.status === 403) {
        throw new Error('没有权限执行此操作')
      } else if (response.status === 500) {
        throw new Error('Server 500 Error, please check the log')
      }

      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

export function apiGet(url: string, options: RequestInit = {}, requiresAuth = true): Promise<any> {
  return apiRequest(url, { method: 'GET', ...options }, requiresAuth)
}

export function apiAdminGet(url: string, options: RequestInit = {}): Promise<any> {
  checkAdminPermission()
  return apiGet(url, options, true)
}

export function apiSuperAdminGet(url: string, options: RequestInit = {}): Promise<any> {
  checkSuperAdminPermission()
  return apiGet(url, options, true)
}

export function apiPost(
  url: string,
  data: any = {},
  options: RequestInit = {},
  requiresAuth = true
): Promise<any> {
  return apiRequest(url, { method: 'POST', body: JSON.stringify(data), ...options }, requiresAuth)
}

export function apiAdminPost(url: string, data: any = {}, options: RequestInit = {}): Promise<any> {
  checkAdminPermission()
  return apiPost(url, data, options, true)
}

export function apiSuperAdminPost(
  url: string,
  data: any = {},
  options: RequestInit = {}
): Promise<any> {
  checkSuperAdminPermission()
  return apiPost(url, data, options, true)
}

export function apiPut(
  url: string,
  data: any = {},
  options: RequestInit = {},
  requiresAuth = true
): Promise<any> {
  return apiRequest(url, { method: 'PUT', body: JSON.stringify(data), ...options }, requiresAuth)
}

export function apiAdminPut(url: string, data: any = {}, options: RequestInit = {}): Promise<any> {
  checkAdminPermission()
  return apiPut(url, data, options, true)
}

export function apiSuperAdminPut(
  url: string,
  data: any = {},
  options: RequestInit = {}
): Promise<any> {
  checkSuperAdminPermission()
  return apiPut(url, data, options, true)
}

export function apiDelete(
  url: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<any> {
  return apiRequest(url, { method: 'DELETE', ...options }, requiresAuth)
}

export function apiAdminDelete(url: string, options: RequestInit = {}): Promise<any> {
  checkAdminPermission()
  return apiDelete(url, options, true)
}

export function apiSuperAdminDelete(url: string, options: RequestInit = {}): Promise<any> {
  checkSuperAdminPermission()
  return apiDelete(url, options, true)
}
