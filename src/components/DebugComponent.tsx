import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { message } from '@/utils/toast'
import {
  RefreshCw,
  Trash2,
  Settings,
  User,
  Database,
  Bot,
  Maximize2,
  Minimize2,
  RotateCw
} from 'lucide-react'
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
    let interval: number
    if (autoRefresh) {
      interval = window.setInterval(fetchLogs, 5000)
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
    <TooltipProvider>
      <div className={`log-viewer ${isFullscreen ? 'fullscreen' : ''}`} ref={logViewer}>
        <div className="control-panel">
          <Button onClick={fetchLogs} loading={fetching} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setRawLogs([])} variant="outline" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => console.log(config)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            系统配置
          </Button>
          <Button onClick={() => console.log(userStore)} variant="outline">
            <User className="h-4 w-4 mr-2" />
            用户信息
          </Button>
          <Button onClick={() => console.log(databaseStore)} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            知识库信息
          </Button>
          <Button onClick={() => console.log(agentStore)} variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            智能体配置
          </Button>
          <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="outline">
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-2" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-2" />
            )}
            {isFullscreen ? '退出全屏' : '全屏'}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RotateCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                自动刷新
              </Button>
            </TooltipTrigger>
            <TooltipContent>{autoRefresh ? '点击停止自动刷新' : '点击开启自动刷新'}</TooltipContent>
          </Tooltip>
        </div>
        <div className="filter-group">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索日志..."
            className="w-48"
          />
          <div className="flex items-center gap-2">
            {logLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level.value}`}
                  checked={selectedLevels.includes(level.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedLevels([...selectedLevels, level.value])
                    } else {
                      setSelectedLevels(selectedLevels.filter((l) => l !== level.value))
                    }
                  }}
                />
                <label
                  htmlFor={`level-${level.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {level.label}
                </label>
              </div>
            ))}
          </div>
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
    </TooltipProvider>
  )
}

export default DebugComponent
