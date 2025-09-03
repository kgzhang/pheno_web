import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import './HeaderComponent.less'

interface HeaderComponentProps {
  title: string
  description?: string
  loading?: boolean
  children?: React.ReactNode
  actions?: React.ReactNode
  left?: React.ReactNode
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  title,
  description,
  loading,
  children,
  actions,
  left
}) => {
  return (
    <div className="header-container">
      <div className="header-content">
        {left && <div className="header-actions">{left}</div>}
        <div className="header-title">
          <div className="header-title-block">
            <h1>{title}</h1>
            {children}
          </div>
          {description && <p>{description}</p>}
        </div>
        {actions && (
          <div className="header-actions">
            {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default HeaderComponent
