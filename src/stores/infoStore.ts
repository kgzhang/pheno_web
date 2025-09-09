import { create } from 'zustand'
import { brandApi } from '@/apis/system_api'

interface InfoState {
  infoConfig: Record<string, any>
  isLoading: boolean
  isLoaded: boolean
  organization: () => Record<string, any>
  branding: () => Record<string, any>
  features: () => string[]
  footer: () => Record<string, any>
  setInfoConfig: (newConfig: Record<string, any>) => void
  loadInfoConfig: (force?: boolean) => Promise<Record<string, any> | null>
  reloadInfoConfig: () => Promise<Record<string, any> | null>
}

export const useInfoStore = create<InfoState>((set, get) => ({
  infoConfig: {},
  isLoading: false,
  isLoaded: false,

  organization: () =>
    get().infoConfig.organization || {
      name: '病原AI',
      logo: '/favicon.svg',
      avatar: '/avatar.jpg'
    },
  branding: () =>
    get().infoConfig.branding || {
      name: 'PathogenAI',
      title: 'PathogenAI',
      subtitle: '大模型驱动的知识库管理工具',
      description: '结合知识库与知识图谱，提供更准确、更全面的回答'
    },
  features: () =>
    get().infoConfig.features || ['📚 灵活知识库', '🕸️ 知识图谱集成', '🤖 多模型支持'],
  footer: () =>
    get().infoConfig.footer || {
      copyright: '© 病原AI 2025 [WIP] v0.12.138'
    },

  setInfoConfig: (newConfig) => {
    set({ infoConfig: newConfig, isLoaded: true })
  },

  loadInfoConfig: async (force = false) => {
    if (get().isLoaded && !force) {
      return get().infoConfig
    }
    set({ isLoading: true })
    try {
      const response = await brandApi.getInfoConfig()
      if (response.success && response.data) {
        get().setInfoConfig(response.data)
        console.debug('信息配置加载成功:', response.data)
        return response.data
      } else {
        console.warn('信息配置加载失败，使用默认配置')
        return null
      }
    } catch (error) {
      console.error('加载信息配置时发生错误:', error)
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  reloadInfoConfig: async () => {
    set({ isLoading: true })
    try {
      const response = await brandApi.reloadInfoConfig()
      if (response.success && response.data) {
        get().setInfoConfig(response.data)
        console.debug('信息配置重新加载成功:', response.data)
        return response.data
      } else {
        console.warn('信息配置重新加载失败')
        return null
      }
    } catch (error) {
      console.error('重新加载信息配置时发生错误:', error)
      return null
    } finally {
      set({ isLoading: false })
    }
  }
}))
