import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Tooltip, Button, Popover } from 'antd'
import {
  SendOutlined,
  ArrowUpOutlined,
  LoadingOutlined,
  PauseOutlined,
  PlusOutlined
} from '@ant-design/icons'
import './MessageInputComponent.less'

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
    customClasses = {},
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
    if (isLoading) return PauseOutlined
    if (sendIcon === 'SendOutlined') return SendOutlined
    return ArrowUpOutlined
  }, [isLoading, sendIcon])

  return (
    <div className={`input-box ${isSingleLine ? 'single-line' : ''}`} onClick={focusInput}>
      {optionsLeft && (
        <div className="expand-options">
          <Popover content={optionsLeft} placement="bottomLeft" trigger="click">
            <Button type="text" size="small" className="expand-btn" icon={<PlusOutlined />} />
          </Popover>
        </div>
      )}
      <textarea
        ref={inputRef}
        className="user-input"
        value={value}
        onKeyDown={onKeyDown}
        onChange={handleInput}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="send-button-container">
        <Tooltip title={isLoading ? '停止回答' : ''}>
          <Button
            onClick={handleSendOrStop}
            disabled={sendButtonDisabled}
            type="link"
            className="send-button"
            icon={<Icon />}
          />
        </Tooltip>
      </div>
    </div>
  )
}

export default MessageInputComponent
