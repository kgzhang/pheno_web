import React from 'react'
import './LoadingComponent.less'

interface LoadingComponentProps {
  visible?: boolean
  text?: string
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  visible = false,
  text = '加载中...'
}) => {
  if (!visible) {
    return null
  }

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-text">{text}</div>
      </div>
    </div>
  )
}

export default LoadingComponent
