import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { agentApi } from '@/apis/agent_api'
import { modelIcons } from '@/utils/modelIcon'
import './ModelSelectorComponent.less'

interface ModelSelectorComponentProps {
  model_name?: string
  model_provider?: string
  onSelectModel: (model: { provider: string; name: string }) => void
}

const ModelSelectorComponent: React.FC<ModelSelectorComponentProps> = ({
  model_name,
  model_provider,
  onSelectModel
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [providers, setProviders] = useState<any>({})

  useEffect(() => {
    agentApi.getProviderModels('').then((data) => setProviders(data.providers))
  }, [])

  const handleSelect = (provider: string, name: string) => {
    onSelectModel({ provider, name })
    setIsModalVisible(false)
  }

  return (
    <>
      <div className="model-selector-display" onClick={() => setIsModalVisible(true)}>
        <img
          src={modelIcons[model_provider || 'default'] || modelIcons.default}
          alt={model_provider}
          className="provider-icon"
        />
        <span>{model_name || '请选择模型'}</span>
      </div>
      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>选择模型</DialogTitle>
          </DialogHeader>
          <div className="model-selection-grid">
            {Object.entries(providers).map(([provider, data]: [string, any]) => (
              <div key={provider} className="provider-section">
                <h4 className="text-lg font-semibold mb-3">{provider}</h4>
                <div className="model-list grid grid-cols-2 gap-2">
                  {data.enabled_models?.map((model: string) => (
                    <div
                      key={model}
                      className="model-item p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelect(provider, model)}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ModelSelectorComponent
