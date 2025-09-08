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
import './AgentView.less'

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
    <div className="agent-view">
      <div className="agent-view-header">
        <div className="header-left">
          <div className="header-item">
            <span className="brandname">{branding()?.title}</span>
          </div>
          <div className="header-item">
            <Button
              variant="outline"
              className="header-button"
              onClick={() => setAgentModalOpen(true)}
            >
              <Bot size={18} strokeWidth={1.75} />
              选择：{selectedAgent()?.name || '选择智能体'}
            </Button>
          </div>
        </div>
        <div className="header-right">
          <div className="header-item">
            <Button
              variant="outline"
              className="header-button"
              onClick={() => setIsConfigSidebarOpen(!isConfigSidebarOpen)}
            >
              <Settings className="h-4 w-4 mr-2" />
              配置
            </Button>
          </div>
          {selectedAgentId && (
            <div className="header-item">
              <Button variant="outline" className="header-button" onClick={goToAgentPage}>
                <Link className="h-4 w-4 mr-2" />
                独立页面
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="agent-view-body">
        <Dialog open={agentModalOpen} onOpenChange={setAgentModalOpen}>
          <DialogContent className="agent-modal max-w-4xl">
            <h3 className="text-lg font-semibold mb-4">选择智能体</h3>
            <div className="agent-modal-content">
              <div className="agents-grid">
                {Object.entries(agents).map(([id, agent]) => (
                  <div
                    key={id}
                    className={`agent-card ${id === selectedAgentId ? 'selected' : ''}`}
                    onClick={() => selectAgentFromModal(id)}
                  >
                    <div className="agent-card-header">
                      <div className="agent-card-title">
                        <span className="agent-card-name">{agent.name}</span>
                        {id === defaultAgentId ? (
                          <Star className="default-icon text-yellow-500 fill-current" />
                        ) : (
                          <StarOff
                            onClick={(e) => {
                              e.stopPropagation()
                              setAsDefaultAgent(id)
                            }}
                            className="default-icon text-gray-400 hover:text-yellow-500 cursor-pointer"
                          />
                        )}
                      </div>
                    </div>
                    <div className="agent-card-description">{agent.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="content">
          <AgentChatComponent
            singleMode={false}
            onOpenConfig={() => setIsConfigSidebarOpen(true)}
            onOpenAgentModal={() => setAgentModalOpen(true)}
          />
        </div>
        <AgentConfigSidebar
          isOpen={isConfigSidebarOpen}
          onClose={() => setIsConfigSidebarOpen(false)}
        />
      </div>
    </div>
  )
}

export default AgentView
