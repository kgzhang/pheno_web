import { apiGet, apiPost, apiDelete, apiPut, apiAdminGet, apiAdminPost } from './base'

export const agentApi = {
  sendAgentMessage: (agentId: string, data: any) => apiPost(`/api/chat/agent/${agentId}`, data),
  simpleCall: (query: string) => apiPost('/api/chat/call', { query }),
  getDefaultAgent: () => apiGet('/api/chat/default_agent'),
  getAgents: () => apiGet('/api/chat/agent'),
  getAgentDetail: (agentId: string) => apiGet(`/api/chat/agent/${agentId}`),
  getAgentHistory: (agentId: string, threadId: string) =>
    apiGet(`/api/chat/agent/${agentId}/history?thread_id=${threadId}`),
  getProviderModels: (provider: string) => apiGet(`/api/chat/models?model_provider=${provider}`),
  updateProviderModels: (provider: string, models: string[]) =>
    apiPost(`/api/chat/models/update?model_provider=${provider}`, models),
  getAgentConfig: (agentName: string) => apiAdminGet(`/api/chat/agent/${agentName}/config`),
  saveAgentConfig: (agentName: string, config: any) =>
    apiAdminPost(`/api/chat/agent/${agentName}/config`, config),
  setDefaultAgent: (agentId: string) =>
    apiAdminPost('/api/chat/set_default_agent', { agent_id: agentId }),
  getTools: (agentId: string) => apiGet(`/api/chat/tools?agent_id=${agentId}`)
}

export const threadApi = {
  getThreads: (agentId: string) => apiGet(`/api/chat/threads?agent_id=${agentId}`),
  createThread: (agentId: string, title?: string, metadata?: any) =>
    apiPost('/api/chat/thread', {
      agent_id: agentId,
      title: title || '新的对话',
      metadata: metadata || {}
    }),
  updateThread: (threadId: string, title: string, description: string) =>
    apiPut(`/api/chat/thread/${threadId}`, {
      title,
      description
    }),
  deleteThread: (threadId: string) => apiDelete(`/api/chat/thread/${threadId}`)
}
