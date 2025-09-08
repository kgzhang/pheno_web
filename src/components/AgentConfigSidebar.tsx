import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Settings, X } from 'lucide-react'
import ModelSelectorComponent from './ModelSelectorComponent'
import { useAgentStore } from '@/stores/agentStore'
import { message } from '@/utils/toast'
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
          <Settings className="h-4 w-4" />
          <span>{selectedAgent?.name} 配置</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="sidebar-content">
        {selectedAgent() ? (
          <div className="space-y-4">
            {Object.entries(configurableItems).map(([key, value]: [string, any]) => (
              <div key={key} className="space-y-2">
                <Label>{value.name || key}</Label>
                {value.template_metadata?.kind === 'llm' ? (
                  <ModelSelectorComponent
                    onSelectModel={({ provider, name }) =>
                      updateAgentConfig({ [key]: `${provider}/${name}` })
                    }
                    model_name={agentConfig[key]?.split('/')[1]}
                    model_provider={agentConfig[key]?.split('/')[0]}
                  />
                ) : value.template_metadata && value.template_metadata.kind === 'tools' ? (
                  <>
                    <Button onClick={() => setToolsModalOpen(true)}>选择工具</Button>
                    <div className="selected-tools-preview flex flex-wrap gap-1">
                      {agentConfig[key]?.map((toolId: string) => (
                        <Badge key={toolId} variant="secondary">
                          {availableTools.find((t: any) => t.id === toolId)?.name}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : typeof agentConfig[key] === 'boolean' ? (
                  <Switch
                    checked={agentConfig[key]}
                    onCheckedChange={(checked: boolean) => updateAgentConfig({ [key]: checked })}
                  />
                ) : value.options ? (
                  <Select
                    value={agentConfig[key]}
                    onValueChange={(val) => updateAgentConfig({ [key]: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {value.options.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={agentConfig[key]}
                    onChange={(e) => updateAgentConfig({ [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="sidebar-footer">
        <Button onClick={handleSave}>保存配置</Button>
        <Button variant="outline" onClick={resetAgentConfig}>
          重置
        </Button>
      </div>
      <Dialog open={toolsModalOpen} onOpenChange={setToolsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择工具</DialogTitle>
          </DialogHeader>
          <Select
            value={selectedTools}
            onValueChange={(value) => setSelectedTools(Array.isArray(value) ? value : [value])}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择工具" />
            </SelectTrigger>
            <SelectContent>
              {availableTools.map((tool: any) => (
                <SelectItem key={tool.id} value={tool.id}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setToolsModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                updateAgentConfig({ tools: selectedTools })
                setToolsModalOpen(false)
              }}
            >
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AgentConfigSidebar
