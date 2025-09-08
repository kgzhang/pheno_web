import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/utils/toast'

interface ToolResult {
  id: string
  type: 'calculation' | 'search' | 'knowledge' | 'graph' | 'database'
  title: string
  content: any
  timestamp: Date
  status: 'success' | 'error' | 'warning' | 'info'
}

interface ToolResultRendererProps {
  results: ToolResult[]
  onResultClick?: (result: ToolResult) => void
  onClearResults?: () => void
  className?: string
}

const ToolResultRenderer: React.FC<ToolResultRendererProps> = ({
  results,
  onResultClick,
  onClearResults,
  className = ''
}) => {
  const getStatusColor = (status: ToolResult['status']): string => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: ToolResult['type']): string => {
    switch (type) {
      case 'calculation':
        return '🧮'
      case 'search':
        return '🔍'
      case 'knowledge':
        return '📚'
      case 'graph':
        return '📊'
      case 'database':
        return '💾'
      default:
        return '📄'
    }
  }

  const renderContent = (result: ToolResult): React.ReactNode => {
    switch (result.type) {
      case 'calculation':
        return (
          <div className="text-sm font-mono">
            {typeof result.content === 'object'
              ? JSON.stringify(result.content, null, 2)
              : String(result.content)}
          </div>
        )

      case 'search':
        return (
          <div className="space-y-2">
            {Array.isArray(result.content) ? (
              result.content.map((item: any, index: number) => (
                <div key={index} className="p-2 border rounded">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      查看详情
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div>{String(result.content)}</div>
            )}
          </div>
        )

      case 'knowledge':
        return <div className="prose prose-sm max-w-none">{result.content}</div>

      case 'graph':
        return (
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm text-muted-foreground">图形数据已生成，点击查看详情</div>
          </div>
        )

      case 'database':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {result.content.columns?.map((col: string, colIndex: number) => (
                    <th key={colIndex} className="text-left p-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(result.content.rows as any[])?.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className="border-b">
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="p-2">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return <div>{String(result.content)}</div>
    }
  }

  const handleResultClick = (result: ToolResult) => {
    onResultClick?.(result)
  }

  const handleCopyResult = (result: ToolResult) => {
    const text =
      typeof result.content === 'object'
        ? JSON.stringify(result.content, null, 2)
        : String(result.content)

    navigator.clipboard.writeText(text)
    toast.success('结果已复制到剪贴板')
  }

  if (results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📋</div>
            <p>暂无工具执行结果</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">工具执行结果</h3>
        {onClearResults && (
          <Button variant="outline" size="sm" onClick={onClearResults}>
            清空结果
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTypeIcon(result.type)}</span>
                  <CardTitle className="text-base">{result.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Separator className="mb-3" />
              {renderContent(result)}

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyResult(result)
                  }}
                >
                  复制
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleResultClick(result)
                  }}
                >
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ToolResultRenderer
