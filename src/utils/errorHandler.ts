import { message } from 'antd'

interface ErrorOptions {
  showMessage?: boolean
  logToConsole?: boolean
  customMessage?: string | null
  severity?: 'error' | 'warning' | 'info'
}

export class ErrorHandler {
  static handleError(error: Error, context = '操作', options: ErrorOptions = {}) {
    const {
      showMessage = true,
      logToConsole = true,
      customMessage = null,
      severity = 'error'
    } = options

    if (logToConsole) {
      console.error(`${context}失败:`, error)
    }

    if (showMessage) {
      const displayMessage = customMessage || this.getErrorMessage(error, context)

      switch (severity) {
        case 'warning':
          message.warning(displayMessage)
          break
        case 'info':
          message.info(displayMessage)
          break
        case 'error':
        default:
          message.error(displayMessage)
          break
      }
    }

    return error
  }

  static getErrorMessage(error: Error, context: string): string {
    if (error?.message) {
      return `${context}失败: ${error.message}`
    }
    return `${context}失败`
  }

  static handleNetworkError(error: any, context = '网络请求') {
    let customMessage = null

    if (error?.code === 'NETWORK_ERROR') {
      customMessage = '网络连接失败，请检查网络设置'
    } else if (error?.status === 401) {
      customMessage = '认证失败，请重新登录'
    } else if (error?.status === 403) {
      customMessage = '权限不足，无法执行此操作'
    } else if (error?.status === 404) {
      customMessage = '请求的资源不存在'
    } else if (error?.status >= 500) {
      customMessage = '服务器错误，请稍后重试'
    }

    return this.handleError(error, context, { customMessage })
  }

  static handleChatError(error: Error, operation: string) {
    const contextMap: Record<string, string> = {
      send: '发送消息',
      create: '创建对话',
      delete: '删除对话',
      rename: '重命名对话',
      load: '加载对话',
      export: '导出对话',
      stream: '流式处理'
    }

    const context = contextMap[operation] || operation
    return this.handleError(error, context)
  }

  static handleValidationError(message: string) {
    return this.handleError(new Error(message), '输入验证', {
      severity: 'warning',
      customMessage: message
    })
  }

  static async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context: string,
    options: ErrorOptions = {}
  ): Promise<T> {
    try {
      return await asyncFn()
    } catch (error: any) {
      this.handleError(error, context, options)
      throw error
    }
  }

  static createHandler(context: string, options: ErrorOptions = {}) {
    return (error: Error) => this.handleError(error, context, options)
  }
}

export const handleChatError = ErrorHandler.handleChatError.bind(ErrorHandler)
export const handleNetworkError = ErrorHandler.handleNetworkError.bind(ErrorHandler)
export const handleValidationError = ErrorHandler.handleValidationError.bind(ErrorHandler)
export const handleAsync = ErrorHandler.handleAsync.bind(ErrorHandler)

export default ErrorHandler
