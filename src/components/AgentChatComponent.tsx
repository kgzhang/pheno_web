import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PanelLeftOpen, MessageSquarePlus } from 'lucide-react'
import ChatSidebarComponent from './ChatSidebarComponent'
import AgentMessageComponent from './AgentMessageComponent'
import MessageInputComponent from './MessageInputComponent'
import { useAgentStore } from '@/stores/agentStore'
import { threadApi, agentApi } from '@/apis'

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
    <div className="flex w-full h-full relative">
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
      <div className="relative flex-1 flex flex-col overflow-x-hidden bg-white box-border overflow-y-scroll">
        <div className="user-select-none sticky top-0 z-10 bg-white h-[var(--header-height)] flex justify-between items-center px-2 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center">
            {threads.find((t) => t.id === currentThreadId)?.title}
          </div>
          <div className="flex items-center">{children}</div>
        </div>
        <div className="w-full max-w-4xl mx-auto flex-grow p-4 flex flex-col">
          {messages[currentThreadId || '']?.map((msg: any, index: number) => (
            <AgentMessageComponent key={index} message={msg} />
          ))}
        </div>
        <div className="sticky bottom-0 w-full mx-auto pt-1 px-4 bg-white">
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
