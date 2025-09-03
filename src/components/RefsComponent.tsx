import React from 'react'
import { Button, Tooltip } from 'antd'
import { CopyOutlined, RedoOutlined } from '@ant-design/icons'
import { modelIcons } from '@/utils/modelIcon'
import './RefsComponent.less'

interface RefsComponentProps {
  message: any
  showRefs?: ('model' | 'copy' | 'retry')[]
  isLatestMessage?: boolean
  onRetry?: () => void
  onOpenRefs?: (refs: any) => void
}

const RefsComponent: React.FC<RefsComponentProps> = ({
  message,
  showRefs = [],
  isLatestMessage = false,
  onRetry,
  onOpenRefs
}) => {
  const modelName = message.additional_kwargs?.model_name || 'default'
  const provider = modelName.split('/')[0]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  return (
    <div className="refs-component">
      {showRefs.includes('model') && (
        <div className="ref-item">
          <img
            src={modelIcons[provider] || modelIcons.default}
            alt={provider}
            className="provider-icon"
          />
          <span>{modelName}</span>
        </div>
      )}
      {showRefs.includes('copy') && (
        <Tooltip title="复制">
          <Button type="text" icon={<CopyOutlined />} onClick={copyToClipboard} />
        </Tooltip>
      )}
      {showRefs.includes('retry') && isLatestMessage && (
        <Tooltip title="重试">
          <Button type="text" icon={<RedoOutlined />} onClick={onRetry} />
        </Tooltip>
      )}
    </div>
  )
}

export default RefsComponent
