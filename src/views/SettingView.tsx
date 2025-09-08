import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from '@/utils/toast'
import { RefreshCw, Settings, Code, User } from 'lucide-react'
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
      toast.info('需要重新加载模型，请点击右下角按钮重新加载模型')
    }
    setConfigValue(key, value)
  }

  const sendRestart = async () => {
    toast.loading('重新加载模型中')
    try {
      await configApi.restartSystem()
      toast.success('重新加载完成!')
      setTimeout(() => window.location.reload(), 200)
    } catch (error: any) {
      toast.error(`重启失败: ${error.message}`)
    }
  }

  return (
    <div className="setting-container layout-container">
      <HeaderComponent title="设置">
        <Button variant={isNeedRestart ? 'default' : 'outline'} onClick={sendRestart}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isNeedRestart ? '需要刷新' : '重新加载'}
        </Button>
      </HeaderComponent>
      <div className="setting-container-body">
        {windowWidth > 520 && (
          <div className="sider">
            {isSuperAdmin() && (
              <Button
                variant="ghost"
                className={section === 'base' ? 'activesec' : ''}
                onClick={() => setSection('base')}
              >
                <Settings className="h-4 w-4 mr-2" />
                基本设置
              </Button>
            )}
            {isSuperAdmin() && (
              <Button
                variant="ghost"
                className={section === 'model' ? 'activesec' : ''}
                onClick={() => setSection('model')}
              >
                <Code className="h-4 w-4 mr-2" />
                模型配置
              </Button>
            )}
            {isAdmin() && (
              <Button
                variant="ghost"
                className={section === 'user' ? 'activesec' : ''}
                onClick={() => setSection('user')}
              >
                <User className="h-4 w-4 mr-2" />
                用户管理
              </Button>
            )}
          </div>
        )}
        <div className="setting">
          {(windowWidth <= 520 || section === 'base') && isSuperAdmin() && (
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
                    value={config?.embed_model}
                    onValueChange={(value) => handleChange('embed_model', value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="选择嵌入模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?._config_items?.embed_model.choices.map((name: string) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="card card-select">
                  <span className="label">{config?._config_items?.reranker.des}</span>
                  <Select
                    value={config?.reranker}
                    onValueChange={(value) => handleChange('reranker', value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="选择重排序模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?._config_items?.reranker.choices.map((name: string) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          {(windowWidth <= 520 || section === 'model') && isSuperAdmin() && (
            <>
              <h3>模型配置</h3>
              <p>
                请在 <code>src/.env</code> 文件中配置对应的 APIKEY，并重新启动服务
              </p>
              <ModelProvidersComponent />
            </>
          )}
          {(windowWidth <= 520 || section === 'user') && isAdmin() && <UserManagementComponent />}
        </div>
      </div>
    </div>
  )
}

export default SettingView
