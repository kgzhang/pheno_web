import { create } from 'zustand'
import { configApi } from '@/apis/system_api'

interface ConfigState {
  config: Record<string, any>
  setConfig: (newConfig: Record<string, any>) => void
  setConfigValue: (key: string, value: any) => void
  setConfigValues: (items: Record<string, any>) => void
  refreshConfig: () => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: {},
  setConfig: (newConfig) => set({ config: newConfig }),
  setConfigValue: (key, value) => {
    set((state) => ({ config: { ...state.config, [key]: value } }))
    configApi.updateConfigBatch({ [key]: value }).then((data) => {
      console.debug('Success:', data)
      set({ config: data })
    })
  },
  setConfigValues: (items) => {
    set((state) => ({ config: { ...state.config, ...items } }))
    configApi.updateConfigBatch(items).then((data) => {
      console.debug('Success:', data)
      set({ config: data })
    })
  },
  refreshConfig: () => {
    configApi.getConfig().then((data) => {
      console.log('config', data)
      set({ config: data })
    })
  }
}))
