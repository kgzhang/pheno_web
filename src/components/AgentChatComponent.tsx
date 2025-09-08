import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PanelLeftOpen, MessageSquarePlus } from 'lucide-react'
import ChatSidebarComponent from './ChatSidebarComponent'
import AgentMessageComponent from './AgentMessageComponent'
import MessageInputComponent from './MessageInputComponent'
import { useAgentStore } from '@/stores/agentStore'
import { threadApi, agentApi } from '@/apis'
import './AgentChatComponent.less'

interface AgentChatComponentProps {
  agentId?: string
  singleMode: boolean
  children?: React.ReactNode
  onOpenConfig?: () => void
  onOpenAgentModal?: () => void
}

const AgentChatComponent: React.FC<AgentChatComponentProps> = ({
  agentId,
  singleMode,
  children,
  onOpenAgentModal
}) => {
  const { agents, selectedAgentId } = useAgentStore()
  const [threads, setThreads] = useState<any[]>([])
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any>({})
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const currentAgentId = singleMode ? agentId : selectedAgentId
  const currentAgent = agents[currentAgentId || '']

  useEffect(() => {
    if (currentAgentId) {
      threadApi.getThreads(currentAgentId).then((data) => {
        setThreads(data || [])
        if (data && data.length > 0) {
          setCurrentThreadId(data[0].id)
        }
      })
    }
  }, [currentAgentId])

  useEffect(() => {
    if (currentThreadId) {
      agentApi.getAgentHistory(currentAgentId!, currentThreadId).then((data) => {
        setMessages((prev: any) => ({ ...prev, [currentThreadId]: data.history || [] }))
      })
    }
  }, [currentThreadId])

  const handleSendMessage = async () => {
    if (!userInput.trim() || !currentAgentId) return
    setIsProcessing(true)
    let threadId = currentThreadId
    if (!threadId) {
      const newThread = await threadApi.createThread(currentAgentId, userInput.trim())
      setThreads([newThread, ...threads])
      threadId = newThread.id
      setCurrentThreadId(threadId)
    }

    await agentApi.sendAgentMessage(currentAgentId, {
      query: userInput,
      config: { thread_id: threadId }
    })
    // Handle streaming response
    setIsProcessing(false)
    setUserInput('')
  }

  return (
    <div className="chat-container">
      <ChatSidebarComponent
        currentChatId={currentThreadId}
        chatsList={threads}
        isSidebarOpen={isSidebarOpen}
        agents={agents}
        selectedAgentId={currentAgentId || ''}
        onCreateChat={() => {}}
        onSelectChat={setCurrentThreadId}
        onDeleteChat={() => {}}
        onRenameChat={() => {}}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAgentModal={onOpenAgentModal || (() => {})}
      />
      <div className="chat">
        <div className="chat-header">
          <div className="header__left">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              新对话
            </Button>
          </div>
          <div className="header__center">
            {threads.find((t) => t.id === currentThreadId)?.title}
          </div>
          <div className="header__right">{children}</div>
        </div>
        <div className="chat-box">
          {messages[currentThreadId || '']?.map((msg: any, index: number) => (
            <AgentMessageComponent key={index} message={msg} />
          ))}
        </div>
        <div className="bottom">
          <MessageInputComponent
            value={userInput}
            onChange={setUserInput}
            onSend={handleSendMessage}
            isLoading={isProcessing}
            disabled={!currentAgent}
            sendButtonDisabled={!userInput || !currentAgent || isProcessing}
          />
        </div>
      </div>
    </div>
  )
}

export default AgentChatComponent
