import { apiGet, apiPost, apiDelete, apiPut, apiAdminGet, apiAdminPost } from './base'

export const agentApi = {
  sendAgentMessage: (agentId: string, data: any) => apiPost(`/chat/agent/${agentId}`, data),
  simpleCall: (query: string) => apiPost('/chat/call', { query }),
  getDefaultAgent: () => apiGet('/chat/default_agent'),
  getAgents: () => apiGet('/chat/agent'),
  getAgentDetail: (agentId: string) => apiGet(`/chat/agent/${agentId}`),
  getAgentHistory: (agentId: string, threadId: string) =>
    apiGet(`/chat/agent/${agentId}/history?thread_id=${threadId}`),
  getProviderModels: (provider: string) => apiGet(`/chat/models?model_provider=${provider}`),
  updateProviderModels: (provider: string, models: string[]) =>
    apiPost(`/chat/models/update?model_provider=${provider}`, models),
  getAgentConfig: (agentName: string) => apiAdminGet(`/chat/agent/${agentName}/config`),
  saveAgentConfig: (agentName: string, config: any) =>
    apiAdminPost(`/chat/agent/${agentName}/config`, config),
  setDefaultAgent: (agentId: string) =>
    apiAdminPost('/chat/set_default_agent', { agent_id: agentId }),
  getTools: (agentId: string) => apiGet(`/chat/tools?agent_id=${agentId}`)
}

export const threadApi = {
  getThreads: (agentId: string) => apiGet(`/chat/threads?agent_id=${agentId}`),
  createThread: (agentId: string, title?: string, metadata?: any) =>
    apiPost('/chat/thread', {
      agent_id: agentId,
      title: title || '新的对话',
      metadata: metadata || {}
    }),
  updateThread: (threadId: string, title: string, description: string) =>
    apiPut(`/chat/thread/${threadId}`, {
      title,
      description
    }),
  deleteThread: (threadId: string) => apiDelete(`/chat/thread/${threadId}`)
}
