import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from '@/utils/toast'
import { Settings, Link, Star, StarOff, Bot } from 'lucide-react'
import AgentChatComponent from '@/components/AgentChatComponent'
import AgentConfigSidebar from '@/components/AgentConfigSidebar'
import { useUserStore } from '@/stores/userStore'
import { useAgentStore } from '@/stores/agentStore'
import { useInfoStore } from '@/stores/infoStore'

const AgentView: React.FC = () => {
  const { isAdmin } = useUserStore()
  const { agents, selectedAgentId, defaultAgentId, selectedAgent, setDefaultAgent, selectAgent } =
    useAgentStore()
  const { branding } = useInfoStore()

  const [agentModalOpen, setAgentModalOpen] = useState(false)
  const [isConfigSidebarOpen, setIsConfigSidebarOpen] = useState(false)

  const setAsDefaultAgent = async (agentId: string) => {
    if (!agentId || !isAdmin()) return
    try {
      await setDefaultAgent(agentId)
      toast.success('已将当前智能体设为默认')
    } catch (error: any) {
      toast.error(error.message || '设置默认智能体时发生错误')
    }
  }

  const selectAgentFromModal = (agentId: string) => {
    selectAgent(agentId)
    setAgentModalOpen(false)
  }

  const goToAgentPage = () => {
    if (selectedAgentId) {
      window.open(`/agent/${selectedAgentId}`, '_blank')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-gray-900">
            {branding()?.title}
          </div>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setAgentModalOpen(true)}
          >
            <Bot size={18} strokeWidth={1.75} />
            <span>选择：{selectedAgent()?.name || '选择智能体'}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setIsConfigSidebarOpen(!isConfigSidebarOpen)}
          >
            <Settings className="h-4 w-4" />
            <span>配置</span>
          </Button>
          {selectedAgentId && (
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={goToAgentPage}
            >
              <Link className="h-4 w-4" />
              <span>独立页面</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Component */}
        <div className="flex-1 flex flex-col">
          <AgentChatComponent
            singleMode={false}
            onOpenConfig={() => setIsConfigSidebarOpen(true)}
            onOpenAgentModal={() => setAgentModalOpen(true)}
          />
        </div>
        
        {/* Config Sidebar */}
        <AgentConfigSidebar
          isOpen={isConfigSidebarOpen}
          onClose={() => setIsConfigSidebarOpen(false)}
        />
      </div>
      
      {/* Agent Selection Modal */}
      <Dialog open={agentModalOpen} onOpenChange={setAgentModalOpen}>
        <DialogContent className="max-w-4xl">
          <h3 className="text-lg font-semibold mb-4">选择智能体</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {Object.entries(agents).map(([id, agent]) => (
              <div
                key={id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  id === selectedAgentId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => selectAgentFromModal(id)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  {id === defaultAgentId ? (
                    <Star className="text-yellow-500 fill-current" />
                  ) : (
                    <StarOff
                      onClick={(e) => {
                        e.stopPropagation()
                        setAsDefaultAgent(id)
                      }}
                      className="text-gray-400 hover:text-yellow-500 cursor-pointer"
                    />
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">{agent.description}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AgentView
