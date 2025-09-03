export class AgentValidator {
  static validateAgentId(agentId: string | null, operation = '操作'): boolean {
    if (!agentId) {
      console.warn(`未指定AgentID，无法${operation}`)
      return false
    }
    return true
  }

  static validateAgentIdWithError(
    agentId: string | null,
    operation: string,
    errorHandler: (message: string) => void
  ): boolean {
    if (!agentId) {
      const message = `未指定AgentID，无法${operation}`
      if (errorHandler) {
        errorHandler(message)
      }
      return false
    }
    return true
  }

  static validateChatOperation(
    agentId: string | null,
    chatId: string | null | undefined,
    operation: string,
    errorHandler: (message: string) => void
  ): boolean {
    if (!this.validateAgentIdWithError(agentId, operation, errorHandler)) {
      return false
    }

    if (chatId !== undefined && !chatId) {
      const message = `请先选择对话`
      if (errorHandler) {
        errorHandler(message)
      }
      return false
    }

    return true
  }

  static validateRenameOperation(
    chatId: string | null,
    title: string | null,
    agentId: string | null,
    errorHandler: (message: string) => void
  ): boolean {
    if (!chatId || !title) {
      const message = '未指定对话ID或标题，无法重命名对话'
      if (errorHandler) {
        errorHandler(message)
      }
      return false
    }

    if (!title.trim()) {
      const message = '标题不能为空'
      if (errorHandler) {
        errorHandler(message)
      }
      return false
    }

    return this.validateAgentIdWithError(agentId, '重命名对话', errorHandler)
  }

  static validateShareOperation(
    chatId: string | null,
    agent: any,
    errorHandler: (message: string) => void
  ): boolean {
    if (!chatId || !agent) {
      const message = '请先选择对话'
      if (errorHandler) {
        errorHandler(message)
      }
      return false
    }
    return true
  }

  static validateLoadOperation(agentId: string | null, operation = '加载状态'): boolean {
    if (!agentId) {
      console.warn(`未指定AgentID，无法${operation}`)
      return false
    }
    return true
  }
}
