import React, { useState } from 'react'
import { Button, Switch, Select, Input, Form, message, Modal, Tag } from 'antd'
import { SettingOutlined, CloseOutlined } from '@ant-design/icons'
import ModelSelectorComponent from './ModelSelectorComponent'
import { useAgentStore } from '@/stores/agentStore'
import './AgentConfigSidebar.less'

interface AgentConfigSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const AgentConfigSidebar: React.FC<AgentConfigSidebarProps> = ({ isOpen, onClose }) => {
  const {
    selectedAgent,
    agentConfig,
    configurableItems,
    updateAgentConfig,
    saveAgentConfig,
    resetAgentConfig,
    availableTools
  } = useAgentStore()
  const [toolsModalOpen, setToolsModalOpen] = useState(false)
  const [selectedTools, setSelectedTools] = useState(agentConfig?.tools || [])

  const handleSave = async () => {
    try {
      await saveAgentConfig()
      message.success('配置已保存')
    } catch (error: any) {
      message.error(error.message || '保存失败')
    }
  }

  return (
    <div className={`agent-config-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <SettingOutlined />
          <span>{selectedAgent?.name} 配置</span>
        </div>
        <Button type="text" size="small" onClick={onClose} icon={<CloseOutlined />} />
      </div>
      <div className="sidebar-content">
        {selectedAgent && (
          <Form layout="vertical">
            {Object.entries(configurableItems).map(([key, value]: [string, any]) => (
              <Form.Item key={key} label={value.name || key}>
                {value.template_metadata?.kind === 'llm' ? (
                  <ModelSelectorComponent
                    onSelectModel={({ provider, name }) =>
                      updateAgentConfig({ [key]: `${provider}/${name}` })
                    }
                    model_name={agentConfig[key]?.split('/')[1]}
                    model_provider={agentConfig[key]?.split('/')[0]}
                  />
                ) : value.template_metadata?.kind === 'tools' ? (
                  <>
                    <Button onClick={() => setToolsModalOpen(true)}>选择工具</Button>
                    <div className="selected-tools-preview">
                      {agentConfig[key]?.map((toolId: string) => (
                        <Tag key={toolId}>
                          {availableTools.find((t: any) => t.id === toolId)?.name}
                        </Tag>
                      ))}
                    </div>
                  </>
                ) : typeof agentConfig[key] === 'boolean' ? (
                  <Switch
                    checked={agentConfig[key]}
                    onChange={(checked) => updateAgentConfig({ [key]: checked })}
                  />
                ) : value.options ? (
                  <Select
                    value={agentConfig[key]}
                    onChange={(val) => updateAgentConfig({ [key]: val })}
                  >
                    {value.options.map((opt: string) => (
                      <Select.Option key={opt} value={opt}>
                        {opt}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={agentConfig[key]}
                    onChange={(e) => updateAgentConfig({ [key]: e.target.value })}
                  />
                )}
              </Form.Item>
            ))}
          </Form>
        )}
      </div>
      <div className="sidebar-footer">
        <Button onClick={handleSave} type="primary">
          保存配置
        </Button>
        <Button onClick={resetAgentConfig}>重置</Button>
      </div>
      <Modal
        open={toolsModalOpen}
        title="选择工具"
        onCancel={() => setToolsModalOpen(false)}
        onOk={() => {
          updateAgentConfig({ tools: selectedTools })
          setToolsModalOpen(false)
        }}
      >
        <Select
          mode="multiple"
          value={selectedTools}
          onChange={setSelectedTools}
          style={{ width: '100%' }}
          options={availableTools.map((tool: any) => ({ label: tool.name, value: tool.id }))}
        />
      </Modal>
    </div>
  )
}

export default AgentConfigSidebar
