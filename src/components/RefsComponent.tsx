import React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Copy, RotateCcw } from 'lucide-react'
import { modelIcons } from '@/utils/modelIcon'
import './RefsComponent.less'

interface RefsComponentProps {
  message: any
  showRefs?: ('model' | 'copy' | 'retry')[]
  isLatestMessage?: boolean
  onRetry?: () => void
}

const RefsComponent: React.FC<RefsComponentProps> = ({
  message,
  showRefs = [],
  isLatestMessage = false,
  onRetry
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>复制</TooltipContent>
        </Tooltip>
      )}
      {showRefs.includes('retry') && isLatestMessage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>重试</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

export default RefsComponent
