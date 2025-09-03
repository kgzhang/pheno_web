import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, message } from 'antd'
import { SettingOutlined, LinkOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import { Bot } from 'lucide-react'
import AgentChatComponent from '@/components/AgentChatComponent'
import AgentConfigSidebar from '@/components/AgentConfigSidebar'
import { useUserStore } from '@/stores/userStore'
import { useAgentStore } from '@/stores/agentStore'
import { useInfoStore } from '@/stores/infoStore'
import './AgentView.less'

const AgentView: React.FC = () => {
  const navigate = useNavigate()
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
      message.success('已将当前智能体设为默认')
    } catch (error: any) {
      message.error(error.message || '设置默认智能体时发生错误')
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
            <Button className="header-button" onClick={() => setAgentModalOpen(true)}>
              <Bot size={18} strokeWidth={1.75} />
              选择：{selectedAgent()?.name || '选择智能体'}
            </Button>
          </div>
        </div>
        <div className="header-right">
          <div className="header-item">
            <Button
              className="header-button"
              onClick={() => setIsConfigSidebarOpen(!isConfigSidebarOpen)}
              icon={<SettingOutlined />}
            >
              {' '}
              配置{' '}
            </Button>
          </div>
          {selectedAgentId && (
            <div className="header-item">
              <Button className="header-button" onClick={goToAgentPage} icon={<LinkOutlined />}>
                独立页面
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="agent-view-body">
        <Modal
          open={agentModalOpen}
          title="选择智能体"
          width={800}
          footer={null}
          onCancel={() => setAgentModalOpen(false)}
          className="agent-modal"
        >
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
                        <StarFilled className="default-icon" />
                      ) : (
                        <StarOutlined
                          onClick={(e) => {
                            e.stopPropagation()
                            setAsDefaultAgent(id)
                          }}
                          className="default-icon"
                        />
                      )}
                    </div>
                  </div>
                  <div className="agent-card-description">{agent.description}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
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
