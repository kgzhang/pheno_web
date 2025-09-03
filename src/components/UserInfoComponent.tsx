import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Dropdown, Button, Modal } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useUserStore } from '@/stores/userStore'
import './UserInfoComponent.less'

interface UserInfoComponentProps {
  showButton?: boolean
}

const UserInfoComponent: React.FC<UserInfoComponentProps> = ({ showButton = false }) => {
  const navigate = useNavigate()
  const { username, logout, isLoggedIn } = useUserStore()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menu = (
    <div className="user-menu">
      <div className="user-info">
        <Avatar size={40} icon={<UserOutlined />} />
        <div className="user-details">
          <div className="username">{username}</div>
        </div>
      </div>
      <div className="menu-item" onClick={() => navigate('/setting')}>
        <SettingOutlined /> 设置
      </div>
      <div className="menu-item" onClick={handleLogout}>
        <LogoutOutlined /> 退出登录
      </div>
    </div>
  )

  if (!isLoggedIn()) {
    return showButton ? (
      <Button type="primary" onClick={() => navigate('/login')}>
        登录
      </Button>
    ) : null
  }

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <div className="user-avatar-container">
        <Avatar size={32} icon={<UserOutlined />} />
      </div>
    </Dropdown>
  )
}

export default UserInfoComponent
