import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { agentApi } from '@/apis/agent_api'
import { handleChatError } from '@/utils/errorHandler'

interface Agent {
  id: string
  name: string
  description: string
  configurable_items: Record<string, any>
}

interface AgentState {
  agents: Record<string, Agent>
  selectedAgentId: string | null
  defaultAgentId: string | null
  agentConfig: Record<string, any>
  originalAgentConfig: Record<string, any>
  availableTools: any[]
  isLoadingAgents: boolean
  isLoadingConfig: boolean
  isLoadingTools: boolean
  error: string | null
  isInitialized: boolean
  selectedAgent: () => Agent | null
  defaultAgent: () => Agent | null
  agentsList: () => Agent[]
  isDefaultAgent: () => boolean
  configurableItems: () => Record<string, any>
  hasConfigChanges: () => boolean
  initialize: () => Promise<void>
  fetchAgents: () => Promise<void>
  fetchDefaultAgent: () => Promise<void>
  setDefaultAgent: (agentId: string) => Promise<void>
  selectAgent: (agentId: string) => void
  loadAgentConfig: (agentId?: string) => Promise<void>
  saveAgentConfig: (agentId?: string) => Promise<void>
  resetAgentConfig: () => void
  updateConfigItem: (key: string, value: any) => void
  updateAgentConfig: (updates: Record<string, any>) => void
  fetchTools: () => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: {},
      selectedAgentId: null,
      defaultAgentId: null,
      agentConfig: {},
      originalAgentConfig: {},
      availableTools: [],
      isLoadingAgents: false,
      isLoadingConfig: false,
      isLoadingTools: false,
      error: null,
      isInitialized: false,

      selectedAgent: () => {
        const { selectedAgentId, agents } = get()
        return selectedAgentId ? agents[selectedAgentId] : null
      },
      defaultAgent: () => {
        const { defaultAgentId, agents } = get()
        return defaultAgentId ? agents[defaultAgentId] : agents[Object.keys(agents)[0]]
      },
      agentsList: () => Object.values(get().agents),
      isDefaultAgent: () => get().selectedAgentId === get().defaultAgentId,
      configurableItems: () => {
        const agent = get().selectedAgent()
        if (!agent || !agent.configurable_items) return {}
        const items = { ...agent.configurable_items }
        Object.keys(items).forEach((key) => {
          const item = items[key]
          if (item && item.x_oap_ui_config) {
            items[key] = { ...item, ...item.x_oap_ui_config }
            delete items[key].x_oap_ui_config
          }
        })
        return items
      },
      hasConfigChanges: () =>
        JSON.stringify(get().agentConfig) !== JSON.stringify(get().originalAgentConfig),

      initialize: async () => {
        if (get().isInitialized) return
        try {
          await get().fetchAgents()
          await get().fetchDefaultAgent()
          const { selectedAgentId, agents, defaultAgentId } = get()
          if (!selectedAgentId || !agents[selectedAgentId]) {
            if (defaultAgentId && agents[defaultAgentId]) {
              get().selectAgent(defaultAgentId)
            } else if (Object.keys(agents).length > 0) {
              get().selectAgent(Object.keys(agents)[0])
            }
          }
          if (get().selectedAgentId) {
            await get().loadAgentConfig()
            await get().fetchTools()
          }
          set({ isInitialized: true })
        } catch (error: any) {
          console.error('Failed to initialize agent store:', error)
          handleChatError(error, 'initialize')
          set({ error: error.message })
        }
      },

      fetchAgents: async () => {
        set({ isLoadingAgents: true, error: null })
        try {
          const response = await agentApi.getAgents()
          const agents = response.agents.reduce((acc: Record<string, Agent>, agent: Agent) => {
            acc[agent.id] = agent
            return acc
          }, {})
          set({ agents })
        } catch (error: any) {
          console.error('Failed to fetch agents:', error)
          handleChatError(error, 'fetch')
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoadingAgents: false })
        }
      },

      fetchDefaultAgent: async () => {
        try {
          const response = await agentApi.getDefaultAgent()
          set({ defaultAgentId: response.default_agent_id })
        } catch (error: any) {
          console.error('Failed to fetch default agent:', error)
          handleChatError(error, 'fetch')
          set({ error: error.message })
        }
      },

      setDefaultAgent: async (agentId) => {
        try {
          await agentApi.setDefaultAgent(agentId)
          set({ defaultAgentId: agentId })
        } catch (error: any) {
          console.error('Failed to set default agent:', error)
          handleChatError(error, 'save')
          set({ error: error.message })
          throw error
        }
      },

      selectAgent: (agentId) => {
        if (get().agents[agentId]) {
          set({
            selectedAgentId: agentId,
            agentConfig: {},
            originalAgentConfig: {}
          })
        }
      },

      loadAgentConfig: async (agentId) => {
        const targetAgentId = agentId || get().selectedAgentId
        if (!targetAgentId) return
        set({ isLoadingConfig: true, error: null })
        try {
          const response = await agentApi.getAgentConfig(targetAgentId)
          set({
            agentConfig: { ...response.config },
            originalAgentConfig: { ...response.config }
          })
        } catch (error: any) {
          console.error('Failed to load agent config:', error)
          handleChatError(error, 'load')
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoadingConfig: false })
        }
      },

      saveAgentConfig: async (agentId) => {
        const targetAgentId = agentId || get().selectedAgentId
        if (!targetAgentId) return
        try {
          await agentApi.saveAgentConfig(targetAgentId, get().agentConfig)
          set({ originalAgentConfig: { ...get().agentConfig } })
        } catch (error: any) {
          console.error('Failed to save agent config:', error)
          handleChatError(error, 'save')
          set({ error: error.message })
          throw error
        }
      },

      resetAgentConfig: () => {
        set({ agentConfig: { ...get().originalAgentConfig } })
      },

      updateConfigItem: (key, value) => {
        set((state) => ({ agentConfig: { ...state.agentConfig, [key]: value } }))
      },

      updateAgentConfig: (updates) => {
        set((state) => ({ agentConfig: { ...state.agentConfig, ...updates } }))
      },

      fetchTools: async () => {
        set({ isLoadingTools: true, error: null })
        try {
          const response = await agentApi.getTools(get().selectedAgentId!)
          set({ availableTools: response.tools })
        } catch (error: any) {
          console.error('Failed to fetch tools:', error)
          handleChatError(error, 'fetch')
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoadingTools: false })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      reset: () => {
        set({
          agents: {},
          selectedAgentId: null,
          defaultAgentId: null,
          agentConfig: {},
          originalAgentConfig: {},
          availableTools: [],
          isLoadingAgents: false,
          isLoadingConfig: false,
          isLoadingTools: false,
          error: null,
          isInitialized: false
        })
      }
    }),
    {
      name: 'agent-storage',
      partialize: (state) => ({
        selectedAgentId: state.selectedAgentId,
        defaultAgentId: state.defaultAgentId
      })
    }
  )
)
