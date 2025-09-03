import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Tooltip } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  WechatOutlined,
  QrcodeOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useUserStore } from '@/stores/userStore'
import { useInfoStore } from '@/stores/infoStore'
import { useAgentStore } from '@/stores/agentStore'
import { healthApi } from '@/apis/system_api'
import './LoginView.less'

const LoginView: React.FC = () => {
  const navigate = useNavigate()
  const { login, initialize, checkFirstRun, isLoggedIn, isAdmin } = useUserStore()
  const { organization, branding, footer, loadInfoConfig } = useInfoStore()
  const { initialize: initializeAgentStore, defaultAgent, agents } = useAgentStore()

  const [isFirstRun, setIsFirstRun] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [serverStatus, setServerStatus] = useState('loading')
  const [serverError, setServerError] = useState('')
  const [healthChecking, setHealthChecking] = useState(false)

  const loginBgImage = organization()?.login_bg || '/login-bg.jpg'

  const checkServerHealth = async () => {
    try {
      setHealthChecking(true)
      const response = await healthApi.checkHealth()
      if (response.status === 'ok') {
        setServerStatus('ok')
      } else {
        setServerStatus('error')
        setServerError(response.message || '服务端状态异常')
      }
    } catch (error: any) {
      setServerStatus('error')
      setServerError(error.message || '无法连接到服务端，请检查网络连接')
    } finally {
      setHealthChecking(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/')
      return
    }
    checkServerHealth()
    checkFirstRun().then(setIsFirstRun)
    loadInfoConfig()
  }, [isLoggedIn, navigate, checkFirstRun, loadInfoConfig])

  const handleLogin = async (values: any) => {
    try {
      setLoading(true)
      setErrorMessage('')
      await login(values)
      message.success('登录成功')
      const redirectPath = sessionStorage.getItem('redirect') || '/'
      sessionStorage.removeItem('redirect')

      if (redirectPath === '/') {
        if (isAdmin()) {
          navigate('/agent')
          return
        }
        await initializeAgentStore()
        const agent = defaultAgent()
        if (agent) {
          navigate(`/agent/${agent.id}`)
        } else {
          const agentIds = Object.keys(agents)
          if (agentIds.length > 0) {
            navigate(`/agent/${agentIds[0]}`)
          } else {
            navigate('/')
          }
        }
      } else {
        navigate(redirectPath)
      }
    } catch (error: any) {
      setErrorMessage(error.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleInitialize = async (values: any) => {
    try {
      setLoading(true)
      setErrorMessage('')
      if (values.password !== values.confirmPassword) {
        setErrorMessage('两次输入的密码不一致')
        return
      }
      await initialize(values)
      message.success('管理员账户创建成功')
      navigate('/')
    } catch (error: any) {
      setErrorMessage(error.message || '初始化失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const showDevMessage = () => {
    message.info('该功能正在开发中，敬请期待！')
  }

  return (
    <div className={`login-view ${serverStatus === 'error' ? 'has-alert' : ''}`}>
      {serverStatus === 'error' && (
        <div className="server-status-alert">
          <div className="alert-content">
            <ExclamationCircleOutlined className="alert-icon" />
            <div className="alert-text">
              <div className="alert-title">服务端连接失败</div>
              <div className="alert-message">{serverError}</div>
            </div>
            <Button type="link" size="small" onClick={checkServerHealth} loading={healthChecking}>
              重试
            </Button>
          </div>
        </div>
      )}
      <div className="login-layout">
        <div className="login-image-section">
          <img src={loginBgImage} alt="登录背景" className="login-bg-image" />
          <div className="image-overlay">
            <div className="brand-info">
              <h1 className="brand-title">{branding()?.name || 'Yuxi-Know'}</h1>
              <p className="brand-subtitle">
                {branding()?.subtitle || '大模型驱动的知识库管理工具'}
              </p>
              <p className="brand-description">
                {branding()?.description || '结合知识库与知识图谱，提供更准确、更全面的回答'}
              </p>
            </div>
            <div className="brand-copyright">
              <p>
                {footer()?.copyright || 'Yuxi-Know'}. {branding()?.copyright || '版权所有'}
              </p>
            </div>
          </div>
        </div>
        <div className="login-form-section">
          <div className="login-container">
            <div className="login-logo">
              <h1>欢迎登录 {branding().name}</h1>
            </div>
            {isFirstRun ? (
              <div className="login-form">
                <h2>系统初始化</h2>
                <p className="init-desc">系统首次运行，请创建超级管理员账户：</p>
                <Form onFinish={handleInitialize} layout="vertical">
                  <Form.Item
                    label="用户名"
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item
                    label="确认密码"
                    name="confirmPassword"
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'))
                        }
                      })
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                      创建管理员账户
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div className="login-form">
                <Form onFinish={handleLogin} layout="vertical">
                  <Form.Item
                    label="用户名"
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>
                  <Form.Item>
                    <div className="login-options">
                      <Checkbox onChange={showDevMessage}>记住我</Checkbox>
                      <a className="forgot-password" onClick={showDevMessage}>
                        忘记密码?
                      </a>
                    </div>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                      登录
                    </Button>
                  </Form.Item>
                  <div className="third-party-login">
                    <div className="divider">
                      <span>其他登录方式</span>
                    </div>
                    <div className="login-icons">
                      <Tooltip title="微信登录">
                        <Button
                          shape="circle"
                          className="login-icon"
                          onClick={showDevMessage}
                          icon={<WechatOutlined />}
                        />
                      </Tooltip>
                      <Tooltip title="企业微信登录">
                        <Button
                          shape="circle"
                          className="login-icon"
                          onClick={showDevMessage}
                          icon={<QrcodeOutlined />}
                        />
                      </Tooltip>
                      <Tooltip title="飞书登录">
                        <Button
                          shape="circle"
                          className="login-icon"
                          onClick={showDevMessage}
                          icon={<ThunderboltOutlined />}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </Form>
              </div>
            )}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="login-footer">
              <a href="https://github.com/xerrors" target="_blank" rel="noopener noreferrer">
                联系我们
              </a>
              <a
                href="https://github.com/xerrors/Yuxi-Know"
                target="_blank"
                rel="noopener noreferrer"
              >
                使用帮助
              </a>
              <a
                href="https://github.com/xerrors/Yuxi-Know/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                隐私政策
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginView
