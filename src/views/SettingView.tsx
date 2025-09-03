import React, { useState, useEffect } from 'react'
import { Button, Select, message, notification } from 'antd'
import {
  ReloadOutlined,
  SettingOutlined,
  CodeOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import HeaderComponent from '@/components/HeaderComponent'
import ModelProvidersComponent from '@/components/ModelProvidersComponent'
import UserManagementComponent from '@/components/UserManagementComponent'
import ModelSelectorComponent from '@/components/ModelSelectorComponent'
import { useConfigStore } from '@/stores/configStore'
import { useUserStore } from '@/stores/userStore'
import { configApi } from '@/apis/system_api'
import './SettingView.less'

const SettingView: React.FC = () => {
  const { config, setConfigValue, setConfigValues } = useConfigStore()
  const { isSuperAdmin, isAdmin } = useUserStore()
  const [isNeedRestart, setIsNeedRestart] = useState(false)
  const [section, setSection] = useState('base')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChange = (key: string, value: any) => {
    if (['enable_reranker', 'embed_model', 'reranker', 'model_local_paths'].includes(key)) {
      setIsNeedRestart(true)
      notification.info({
        message: '需要重新加载模型',
        description: '请点击右下角按钮重新加载模型',
        placement: 'topLeft',
        duration: 0,
        btn: (
          <Button type="primary" onClick={sendRestart}>
            立即重新加载
          </Button>
        )
      })
    }
    setConfigValue(key, value)
  }

  const sendRestart = async () => {
    message.loading({ content: '重新加载模型中', key: 'restart', duration: 0 })
    try {
      await configApi.restartSystem()
      message.success({ content: '重新加载完成!', key: 'restart', duration: 2 })
      setTimeout(() => window.location.reload(), 200)
    } catch (error: any) {
      message.error({ content: `重启失败: ${error.message}`, key: 'restart', duration: 2 })
    }
  }

  return (
    <div className="setting-container layout-container">
      <HeaderComponent title="设置">
        <template slot="actions">
          <Button
            type={isNeedRestart ? 'primary' : 'default'}
            onClick={sendRestart}
            icon={<ReloadOutlined />}
          >
            {isNeedRestart ? '需要刷新' : '重新加载'}
          </Button>
        </template>
      </HeaderComponent>
      <div className="setting-container-body">
        {windowWidth > 520 && (
          <div className="sider">
            {isSuperAdmin && (
              <Button
                type="text"
                className={section === 'base' ? 'activesec' : ''}
                onClick={() => setSection('base')}
                icon={<SettingOutlined />}
              >
                {' '}
                基本设置{' '}
              </Button>
            )}
            {isSuperAdmin && (
              <Button
                type="text"
                className={section === 'model' ? 'activesec' : ''}
                onClick={() => setSection('model')}
                icon={<CodeOutlined />}
              >
                {' '}
                模型配置{' '}
              </Button>
            )}
            {isAdmin && (
              <Button
                type="text"
                className={section === 'user' ? 'activesec' : ''}
                onClick={() => setSection('user')}
                icon={<UserOutlined />}
              >
                {' '}
                用户管理{' '}
              </Button>
            )}
          </div>
        )}
        <div className="setting">
          {(windowWidth <= 520 || section === 'base') && isSuperAdmin && (
            <>
              <h3>检索配置</h3>
              <div className="section">
                <div className="card card-select">
                  <span className="label">对话模型</span>
                  <ModelSelectorComponent
                    onSelectModel={({ provider, name }) =>
                      setConfigValues({ model_provider: provider, model_name: name })
                    }
                    model_name={config?.model_name}
                    model_provider={config?.model_provider}
                  />
                </div>
                <div className="card card-select">
                  <span className="label">{config?._config_items?.embed_model.des}</span>
                  <Select
                    style={{ width: 300 }}
                    value={config?.embed_model}
                    onChange={(value) => handleChange('embed_model', value)}
                  >
                    {config?._config_items?.embed_model.choices.map((name: string) => (
                      <Select.Option key={name} value={name}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="card card-select">
                  <span className="label">{config?._config_items?.reranker.des}</span>
                  <Select
                    style={{ width: 300 }}
                    value={config?.reranker}
                    onChange={(value) => handleChange('reranker', value)}
                  >
                    {config?._config_items?.reranker.choices.map((name: string) => (
                      <Select.Option key={name} value={name}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </>
          )}
          {(windowWidth <= 520 || section === 'model') && isSuperAdmin && (
            <>
              <h3>模型配置</h3>
              <p>
                请在 <code>src/.env</code> 文件中配置对应的 APIKEY，并重新启动服务
              </p>
              <ModelProvidersComponent />
            </>
          )}
          {(windowWidth <= 520 || section === 'user') && isAdmin && <UserManagementComponent />}
        </div>
      </div>
    </div>
  )
}

export default SettingView
