import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/utils/toast'
import GraphContainer from './GraphContainer'
import type { GraphContainerRef } from './GraphContainer'

interface KnowledgeGraphSectionProps {
  initialData?: any
  onGraphDataChange?: (data: any) => void
  className?: string
}

const KnowledgeGraphSection: React.FC<KnowledgeGraphSectionProps> = ({
  initialData,
  onGraphDataChange,
  className = ''
}) => {
  const [graphType, setGraphType] = useState('knowledge')
  const [showLabels, setShowLabels] = useState(true)
  const [autoLayout, setAutoLayout] = useState(true)
  const graphRef = React.useRef<GraphContainerRef>(null)

  const handleGraphChange = useCallback(
    (data: any) => {
      onGraphDataChange?.(data)
    },
    [onGraphDataChange]
  )

  const handleExportGraph = () => {
    if (graphRef.current) {
      graphRef.current.exportGraph()
    } else {
      toast.error('图形引用未初始化')
    }
  }

  const handleResetGraph = () => {
    if (graphRef.current) {
      graphRef.current.resetGraph()
    }
  }

  const handleAddSampleData = () => {
    const sampleData = {
      nodes: [
        { id: '1', label: '人工智能', x: 150, y: 100, color: '#3b82f6', size: 25 },
        { id: '2', label: '机器学习', x: 250, y: 200, color: '#ef4444', size: 20 },
        { id: '3', label: '深度学习', x: 350, y: 100, color: '#10b981', size: 20 },
        { id: '4', label: '神经网络', x: 200, y: 300, color: '#f59e0b', size: 18 },
        { id: '5', label: '自然语言处理', x: 400, y: 250, color: '#8b5cf6', size: 22 }
      ],
      edges: [
        { source: '1', target: '2', label: '包含', color: '#94a3b8', width: 2 },
        { source: '1', target: '3', label: '包含', color: '#94a3b8', width: 2 },
        { source: '2', target: '4', label: '使用', color: '#60a5fa', width: 1.5 },
        { source: '3', target: '4', label: '基于', color: '#34d399', width: 1.5 },
        { source: '3', target: '5', label: '应用', color: '#fbbf24', width: 1.5 },
        { source: '1', target: '5', label: '包含', color: '#94a3b8', width: 2 }
      ]
    }

    onGraphDataChange?.(sampleData)
    toast.success('示例知识图谱数据已加载')
  }

  return (
    <div className={`knowledge-graph-section ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">知识图谱</h2>

        <div className="flex space-x-2">
          <Button onClick={handleAddSampleData} variant="outline">
            加载示例
          </Button>
          <Button onClick={handleResetGraph} variant="outline">
            重置
          </Button>
          <Button onClick={handleExportGraph}>导出图形</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>配置选项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>图谱类型</Label>
                <Select value={graphType} onValueChange={setGraphType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knowledge">知识图谱</SelectItem>
                    <SelectItem value="relation">关系图谱</SelectItem>
                    <SelectItem value="hierarchy">层次结构</SelectItem>
                    <SelectItem value="network">网络拓扑</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                <Label htmlFor="show-labels">显示标签</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-layout" checked={autoLayout} onCheckedChange={setAutoLayout} />
                <Label htmlFor="auto-layout">自动布局</Label>
              </div>

              <div className="space-y-2">
                <Label>搜索节点</Label>
                <Input
                  placeholder="输入节点名称..."
                  onChange={(e) => {
                    // 这里可以添加搜索功能
                    console.log('Search:', e.target.value)
                  }}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast.info('高级过滤功能开发中')
                }}
              >
                高级过滤
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>统计信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">节点数量:</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">边数量:</span>
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">连通分量:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">平均度数:</span>
                <span className="font-medium">2.4</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <GraphContainer
            ref={graphRef}
            initialData={initialData}
            onGraphChange={handleGraphChange}
          />
        </div>
      </div>
    </div>
  )
}

export default KnowledgeGraphSection
