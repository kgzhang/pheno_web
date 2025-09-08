import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Send, ArrowUp, Pause, Plus } from 'lucide-react'

interface MessageInputComponentProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
  sendButtonDisabled?: boolean
  sendIcon?: 'SendOutlined' | 'ArrowUpOutlined'
  customClasses?: Record<string, boolean>
  optionsLeft?: React.ReactNode
}

const MessageInputComponent: React.FC<MessageInputComponentProps> = (props) => {
  const {
    value,
    onChange,
    onSend,
    onKeyDown,
    placeholder = '输入问题...',
    isLoading = false,
    disabled = false,
    sendButtonDisabled = false,
    sendIcon = 'ArrowUpOutlined',
    optionsLeft
  } = props

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isSingleLine, setIsSingleLine] = useState(true)

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleSendOrStop = () => {
    onSend()
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  useEffect(() => {
    const textarea = inputRef.current
    if (textarea) {
      const hasNewlines = value.includes('\n')
      setIsSingleLine(!hasNewlines)
      if (!hasNewlines) {
        textarea.style.height = 'auto'
      } else {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }
  }, [value])

  const Icon = useMemo(() => {
    if (isLoading) return Pause
    if (sendIcon === 'SendOutlined') return Send
    return ArrowUp
  }, [isLoading, sendIcon])

  return (
    <TooltipProvider>
      <div
        className={`grid w-full max-w-4xl mx-auto border border-border rounded-xl shadow-sm transition-all gap-2 p-3 ${
          isSingleLine
            ? 'grid-cols-[auto_1fr_auto] items-center py-2'
            : 'grid-cols-1 grid-rows-[1fr_auto]'
        } bg-background hover:border-primary/50 focus-within:border-primary`}
        onClick={focusInput}
      >
        {optionsLeft && (
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                {optionsLeft}
              </PopoverContent>
            </Popover>
          </div>
        )}
        <textarea
          ref={inputRef}
          className="w-full px-0 bg-transparent border-none text-foreground text-sm outline-none resize-none placeholder:text-muted-foreground disabled:opacity-50 min-h-6 max-h-32"
          value={value}
          onKeyDown={onKeyDown}
          onChange={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            minHeight: isSingleLine ? '24px' : '44px',
            height: isSingleLine ? '24px' : 'auto'
          }}
        />
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSendOrStop}
                disabled={sendButtonDisabled}
                size="icon"
                className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md transition-all"
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isLoading ? '停止回答' : ''}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default MessageInputComponent
