import React, { useState } from 'react'
import { Collapse } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import RefsComponent from './RefsComponent'
import { Loader, CircleCheckBig } from 'lucide-react'
import { ToolResultRenderer } from './ToolCallingResult'
import { useAgentStore } from '@/stores/agentStore'
import { MdPreview } from 'md-editor-rt'
import 'md-editor-rt/lib/preview.css'
import './AgentMessageComponent.less'

const { Panel } = Collapse

interface AgentMessageComponentProps {
  message: any
  isProcessing?: boolean
  debugMode?: boolean
  showRefs?: ('model' | 'copy' | 'retry')[]
  onRetry?: () => void
}

const AgentMessageComponent: React.FC<AgentMessageComponentProps> = ({
  message,
  isProcessing,
  debugMode,
  showRefs,
  onRetry
}) => {
  const [expandedToolCalls, setExpandedToolCalls] = useState(new Set<string>())
  const { availableTools } = useAgentStore()

  const getToolNameByToolCall = (toolCall: any) => {
    const toolId = toolCall.name || toolCall.function.name
    const tool = availableTools.find((t: any) => t.id === toolId)
    return tool ? tool.name : toolId
  }

  const toggleToolCall = (toolCallId: string) => {
    const newExpanded = new Set(expandedToolCalls)
    if (newExpanded.has(toolCallId)) {
      newExpanded.delete(toolCallId)
    } else {
      newExpanded.add(toolCallId)
    }
    setExpandedToolCalls(newExpanded)
  }

  return (
    <div className={`message-box ${message.type}`}>
      {message.type === 'human' ? (
        <p className="message-text">{message.content}</p>
      ) : (
        <div className="assistant-message">
          {message.additional_kwargs?.reasoning_content && (
            <Collapse ghost>
              <Panel header="推理过程" key="1">
                <p>{message.additional_kwargs.reasoning_content}</p>
              </Panel>
            </Collapse>
          )}
          <MdPreview modelValue={message.content} />
          {message.tool_calls?.map((toolCall: any) => (
            <div key={toolCall.id} className="tool-call-container">
              <div className="tool-header" onClick={() => toggleToolCall(toolCall.id)}>
                {toolCall.tool_call_result ? <CircleCheckBig /> : <Loader />}
                <span>{getToolNameByToolCall(toolCall)}</span>
              </div>
              {expandedToolCalls.has(toolCall.id) && (
                <div className="tool-content">
                  <pre>{JSON.stringify(toolCall.args || toolCall.function.arguments, null, 2)}</pre>
                  {toolCall.tool_call_result && (
                    <ToolResultRenderer
                      toolName={toolCall.name || toolCall.function.name}
                      resultContent={toolCall.tool_call_result.content}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
          {showRefs && <RefsComponent message={message} showRefs={showRefs} onRetry={onRetry} />}
        </div>
      )}
      {debugMode && <pre className="status-info">{JSON.stringify(message, null, 2)}</pre>}
    </div>
  )
}

export default AgentMessageComponent
