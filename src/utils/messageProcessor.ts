export class MessageProcessor {
  static convertToolResultToMessages(msgs: any[]): any[] {
    const toolResponseMap = new Map()

    for (const item of msgs) {
      if (item.type === 'tool' && item.tool_call_id) {
        toolResponseMap.set(item.tool_call_id, item)
      }
    }

    return msgs.map((item) => {
      if (item.type === 'ai' && item.tool_calls && item.tool_calls.length > 0) {
        return {
          ...item,
          tool_calls: item.tool_calls.map((toolCall: any) => ({
            ...toolCall,
            tool_call_result: toolResponseMap.get(toolCall.id) || null
          }))
        }
      }
      return item
    })
  }

  static convertServerHistoryToMessages(serverHistory: any[]): any[] {
    const mergedHistory = this.convertToolResultToMessages(serverHistory)
    const conversations: any[] = []
    let currentConv: any = null

    for (const item of mergedHistory) {
      if (item.type === 'human') {
        currentConv = {
          messages: [item],
          status: 'loading'
        }
        conversations.push(currentConv)
      } else if (item.type === 'ai' && currentConv) {
        currentConv.messages.push(item)
        if (item.response_metadata?.finish_reason === 'stop') {
          item.isLast = true
          currentConv.status = 'finished'
          currentConv = null
        }
      }
    }

    return conversations
  }

  static mergeMessageChunk(chunks: any[]): any | null {
    if (chunks.length === 0) return null

    const result = JSON.parse(JSON.stringify(chunks[0]))
    result.content = result.content || ''

    for (let i = 1; i < chunks.length; i++) {
      const chunk = chunks[i]

      if (chunk.content) {
        result.content += chunk.content
      }

      if (chunk.reasoning_content) {
        if (!result.reasoning_content) {
          result.reasoning_content = ''
        }
        result.reasoning_content += chunk.reasoning_content
      }

      if (chunk.additional_kwargs?.reasoning_content) {
        if (!result.additional_kwargs) result.additional_kwargs = {}
        if (!result.additional_kwargs.reasoning_content) {
          result.additional_kwargs.reasoning_content = ''
        }
        result.additional_kwargs.reasoning_content += chunk.additional_kwargs.reasoning_content
      }

      this._mergeToolCalls(result, chunk)
    }

    if (result.type === 'AIMessageChunk') {
      result.type = 'ai'
      if (result.additional_kwargs?.tool_calls) {
        result.tool_calls = result.additional_kwargs.tool_calls
      }
    }

    return result
  }

  private static _mergeToolCalls(result: any, chunk: any) {
    if (chunk.additional_kwargs?.tool_calls) {
      if (!result.additional_kwargs) result.additional_kwargs = {}
      if (!result.additional_kwargs.tool_calls) result.additional_kwargs.tool_calls = []

      for (const toolCall of chunk.additional_kwargs.tool_calls) {
        const existingToolCall = result.additional_kwargs.tool_calls.find(
          (t: any) => t.id === toolCall.id || t.index === toolCall.index
        )

        if (existingToolCall) {
          if (existingToolCall.function && toolCall.function) {
            existingToolCall.function.arguments += toolCall.function.arguments
          }
        } else {
          result.additional_kwargs.tool_calls.push(JSON.parse(JSON.stringify(toolCall)))
        }
      }
    }
  }

  static async processResponseChunk(
    data: any,
    onGoingConv: any,
    state: any,
    getAgentHistory: () => Promise<void>,
    handleError: (error: Error, operation: string) => void
  ) {
    try {
      switch (data.status) {
        case 'init':
          state.waitingServerResponse = false
          onGoingConv.msgChunks[data.request_id] = [data.msg]
          break
        case 'loading':
          if (data.msg.id) {
            if (!onGoingConv.msgChunks[data.msg.id]) {
              onGoingConv.msgChunks[data.msg.id] = []
            }
            onGoingConv.msgChunks[data.msg.id].push(data.msg)
          }
          break
        case 'error':
          console.error('流式处理出错:', data.message)
          handleError(new Error(data.message), 'stream')
          break
        case 'finished':
          await getAgentHistory()
          break
        default:
          console.warn('未知的响应状态:', data.status)
      }
    } catch (error: any) {
      handleError(error, 'stream')
    }
  }

  static async handleStreamResponse(
    response: Response,
    processChunk: (data: any) => Promise<void>,
    scrollToBottom: () => Promise<void>,
    handleError: (error: Error, operation: string) => void
  ) {
    try {
      const reader = response.body!.getReader()
      let buffer = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line.trim())
              await processChunk(data)
            } catch (e: any) {
              console.debug('解析JSON出错:', e.message)
            }
          }
        }
        await scrollToBottom()
      }

      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer.trim())
          await processChunk(data)
        } catch (e) {
          console.warn('最终缓冲区内容无法解析:', buffer)
        }
      }
    } catch (error: any) {
      handleError(error, 'stream')
    }
  }
}

export default MessageProcessor
