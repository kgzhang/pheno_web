import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Select, Checkbox, Tooltip, message } from 'antd'
import {
  ReloadOutlined,
  ClearOutlined,
  SettingOutlined,
  UserOutlined,
  DatabaseOutlined,
  RobotOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useConfigStore } from '@/stores/configStore'
import { useUserStore } from '@/stores/userStore'
import { useDatabaseStore } from '@/stores/databaseStore'
import { useAgentStore } from '@/stores/agentStore'
import { configApi } from '@/apis/system_api'
import './DebugComponent.less'

const logLevels = [
  { value: 'INFO', label: 'INFO' },
  { value: 'ERROR', label: 'ERROR' },
  { value: 'DEBUG', label: 'DEBUG' },
  { value: 'WARNING', label: 'WARNING' }
]

const DebugComponent: React.FC = () => {
  const { config } = useConfigStore()
  const userStore = useUserStore()
  const databaseStore = useDatabaseStore()
  const agentStore = useAgentStore()

  const [fetching, setFetching] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedLevels, setSelectedLevels] = useState(logLevels.map((l) => l.value))
  const [rawLogs, setRawLogs] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const logViewer = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    setFetching(true)
    try {
      const logData = await configApi.getLogs()
      setRawLogs(logData.log.split('\n').filter((line: string) => line.trim()))
    } catch (error: any) {
      message.error(error.message || '获取日志失败')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const processedLogs = rawLogs
    .map((line) => {
      const match = line.match(
        /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:,\d{3})?)\s*-\s*(\w+)\s*-\s*([^-]+?)\s*-\s*(.+)$/
      )
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          module: match[3].trim(),
          message: match[4].trim(),
          raw: line
        }
      }
      return null
    })
    .filter((log): log is any => log !== null)
    .filter((log) => selectedLevels.includes(log.level))
    .filter((log) => log.raw.toLowerCase().includes(searchText.toLowerCase()))

  return (
    <div className={`log-viewer ${isFullscreen ? 'fullscreen' : ''}`} ref={logViewer}>
      <div className="control-panel">
        <Button onClick={fetchLogs} loading={fetching} icon={<ReloadOutlined />} />
        <Button onClick={() => setRawLogs([])} icon={<ClearOutlined />} />
        <Button onClick={() => console.log(config)} icon={<SettingOutlined />}>
          系统配置
        </Button>
        <Button onClick={() => console.log(userStore)} icon={<UserOutlined />}>
          用户信息
        </Button>
        <Button onClick={() => console.log(databaseStore)} icon={<DatabaseOutlined />}>
          知识库信息
        </Button>
        <Button onClick={() => console.log(agentStore)} icon={<RobotOutlined />}>
          智能体配置
        </Button>
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        >
          {isFullscreen ? '退出全屏' : '全屏'}
        </Button>
        <Tooltip title={autoRefresh ? '点击停止自动刷新' : '点击开启自动刷新'}>
          <Button
            type={autoRefresh ? 'primary' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            icon={<SyncOutlined spin={autoRefresh} />}
          >
            自动刷新
          </Button>
        </Tooltip>
      </div>
      <div className="filter-group">
        <Input.Search
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索日志..."
          style={{ width: 200 }}
        />
        <Checkbox.Group
          options={logLevels}
          value={selectedLevels}
          onChange={(checkedValues) => setSelectedLevels(checkedValues as string[])}
        />
      </div>
      <div className="log-container">
        {processedLogs.map((log, index) => (
          <div key={index} className={`log-line level-${log.level.toLowerCase()}`}>
            <span className="timestamp">
              {dayjs(log.timestamp.replace(',', '.')).format('HH:mm:ss.SSS')}
            </span>
            <span className="level">{log.level}</span>
            <span className="module">{log.module}</span>
            <span className="message">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DebugComponent
