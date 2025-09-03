import React, { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Tooltip, Modal } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import { Bot, Waypoints, LibraryBig, Settings } from 'lucide-react'
import { useLongPress } from 'react-use'

import { useConfigStore } from '@/stores/configStore'
import { useDatabaseStore } from '@/stores/databaseStore'
import { useInfoStore } from '@/stores/infoStore'
import UserInfoComponent from '@/components/UserInfoComponent'
import DebugComponent from '@/components/DebugComponent'
import './AppLayout.less'

const mainList = [
  { name: '智能体', path: '/agent', icon: Bot },
  { name: '图谱', path: '/graph', icon: Waypoints },
  { name: '知识库', path: '/database', icon: LibraryBig }
]

const AppLayout: React.FC = () => {
  const { refreshConfig } = useConfigStore()
  const { getDatabaseInfo } = useDatabaseStore()
  const { organization, loadInfoConfig } = useInfoStore()
  const location = useLocation()

  const [githubStars, setGithubStars] = useState(0)
  const [showDebugModal, setShowDebugModal] = useState(false)
  const debugTriggerRef = useRef(null)

  useLongPress(
    () => {
      setShowDebugModal(true)
    },
    {
      ref: debugTriggerRef,
      delay: 1000
    }
  )

  useEffect(() => {
    loadInfoConfig()
    refreshConfig()
    getDatabaseInfo()

    fetch('https://api.github.com/repos/xerrors/Yuxi-Know')
      .then((res) => res.json())
      .then((data) => setGithubStars(data.stargazers_count))
  }, [loadInfoConfig, refreshConfig, getDatabaseInfo])

  return (
    <div className="app-layout">
      <div className="header">
        <div className="logo circle">
          <NavLink to="/">
            <img src={organization().avatar} alt="logo" />
          </NavLink>
        </div>
        <div className="nav">
          {mainList.map((item) => (
            <NavLink key={item.path} to={item.path} className="nav-item">
              {({ isActive }) => (
                <>
                  <item.icon className="icon" size={22} />
                  <span className="text">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div ref={debugTriggerRef} className="fill debug-trigger"></div>
        <div className="github nav-item">
          <Tooltip placement="right" title="欢迎 Star">
            <a
              href="https://github.com/xerrors/Yuxi-Know"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <GithubOutlined className="icon" style={{ color: '#222' }} />
              {githubStars > 0 && (
                <span className="github-stars">
                  <span className="star-count">{(githubStars / 1000).toFixed(1)}k</span>
                </span>
              )}
            </a>
          </Tooltip>
        </div>
        <div className="nav-item user-info">
          <Tooltip placement="right" title="用户信息">
            <UserInfoComponent />
          </Tooltip>
        </div>
        <NavLink to="/setting" className="nav-item setting">
          <Tooltip placement="right" title="设置">
            <Settings />
          </Tooltip>
        </NavLink>
      </div>
      <div className="header-mobile">
        <NavLink to="/chat" className="nav-item">
          对话
        </NavLink>
        <NavLink to="/database" className="nav-item">
          知识
        </NavLink>
        <NavLink to="/setting" className="nav-item">
          设置
        </NavLink>
      </div>
      <div id="app-router-view">
        <Outlet />
      </div>
      <Modal
        open={showDebugModal}
        title="调试面板"
        width="90%"
        footer={null}
        onCancel={() => setShowDebugModal(false)}
        destroyOnClose
        className="debug-modal"
      >
        <DebugComponent />
      </Modal>
    </div>
  )
}

export default AppLayout
