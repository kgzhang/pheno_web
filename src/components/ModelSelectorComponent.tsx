import React, { useState, useEffect } from 'react'
import { Select, Modal } from 'antd'
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
      <Modal
        title="选择模型"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="model-selection-grid">
          {Object.entries(providers).map(([provider, data]: [string, any]) => (
            <div key={provider} className="provider-section">
              <h4>{provider}</h4>
              <div className="model-list">
                {data.enabled_models.map((model: string) => (
                  <div
                    key={model}
                    className="model-item"
                    onClick={() => handleSelect(provider, model)}
                  >
                    {model}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default ModelSelectorComponent
