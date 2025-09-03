import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  token: string | null
  userId: number | null
  username: string | null
  userRole: string | null
  isLoggedIn: () => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  login: (credentials: any) => Promise<boolean>
  logout: () => void
  initialize: (admin: any) => Promise<boolean>
  checkFirstRun: () => Promise<boolean>
  getAuthHeaders: () => Record<string, string>
  getUsers: () => Promise<any>
  createUser: (userData: any) => Promise<any>
  updateUser: (userId: number, userData: any) => Promise<any>
  deleteUser: (userId: number) => Promise<any>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      username: null,
      userRole: null,

      isLoggedIn: () => !!get().token,
      isAdmin: () => get().userRole === 'admin' || get().userRole === 'superadmin',
      isSuperAdmin: () => get().userRole === 'superadmin',

      login: async (credentials) => {
        try {
          const formData = new FormData()
          formData.append('username', credentials.username)
          formData.append('password', credentials.password)

          const response = await fetch('/api/auth/token', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '登录失败')
          }

          const data = await response.json()
          set({
            token: data.access_token,
            userId: data.user_id,
            username: data.username,
            userRole: data.role
          })
          return true
        } catch (error) {
          console.error('登录错误:', error)
          throw error
        }
      },

      logout: () => {
        set({
          token: null,
          userId: null,
          username: null,
          userRole: null
        })
      },

      initialize: async (admin) => {
        try {
          const response = await fetch('/api/auth/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(admin)
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '初始化管理员失败')
          }

          const data = await response.json()
          set({
            token: data.access_token,
            userId: data.user_id,
            username: data.username,
            userRole: data.role
          })
          return true
        } catch (error) {
          console.error('初始化管理员错误:', error)
          throw error
        }
      },

      checkFirstRun: async () => {
        try {
          const response = await fetch('/api/auth/check-first-run')
          const data = await response.json()
          return data.first_run
        } catch (error) {
          console.error('检查首次运行状态错误:', error)
          return false
        }
      },

      getAuthHeaders: () => ({
        Authorization: `Bearer ${get().token}`
      }),

      getUsers: async () => {
        try {
          const response = await fetch('/api/auth/users', {
            headers: get().getAuthHeaders()
          })
          if (!response.ok) {
            throw new Error('获取用户列表失败')
          }
          return await response.json()
        } catch (error) {
          console.error('获取用户列表错误:', error)
          throw error
        }
      },

      createUser: async (userData) => {
        try {
          const response = await fetch('/api/auth/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...get().getAuthHeaders()
            },
            body: JSON.stringify(userData)
          })
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '创建用户失败')
          }
          return await response.json()
        } catch (error) {
          console.error('创建用户错误:', error)
          throw error
        }
      },

      updateUser: async (userId, userData) => {
        try {
          const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...get().getAuthHeaders()
            },
            body: JSON.stringify(userData)
          })
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '更新用户失败')
          }
          return await response.json()
        } catch (error) {
          console.error('更新用户错误:', error)
          throw error
        }
      },

      deleteUser: async (userId) => {
        try {
          const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'DELETE',
            headers: get().getAuthHeaders()
          })
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '删除用户失败')
          }
          return await response.json()
        } catch (error) {
          console.error('删除用户错误:', error)
          throw error
        }
      }
    }),
    {
      name: 'user-storage' // unique name
    }
  )
)

export const checkAdminPermission = () => {
  const { isAdmin } = useUserStore.getState()
  if (!isAdmin()) {
    throw new Error('需要管理员权限')
  }
  return true
}

export const checkSuperAdminPermission = () => {
  const { isSuperAdmin } = useUserStore.getState()
  if (!isSuperAdmin()) {
    throw new Error('需要超级管理员权限')
  }
  return true
}
