import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
interface GraphViewProps {
  data?: any
  onGraphUpdate?: (config: any) => void
  className?: string
}

const GraphView: React.FC<GraphViewProps> = ({ data, onGraphUpdate, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [graphConfig, setGraphConfig] = useState({
    layout: 'force',
    nodeSize: 20,
    edgeWidth: 2,
    showLabels: true,
    animation: true
  })

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 模拟绘制图形数据
    if (data?.nodes && data?.edges) {
      // 绘制节点
      data.nodes.forEach((node: any) => {
        ctx.beginPath()
        ctx.arc(node.x || 100, node.y || 100, graphConfig.nodeSize, 0, 2 * Math.PI)
        ctx.fillStyle = node.color || '#3b82f6'
        ctx.fill()

        if (graphConfig.showLabels) {
          ctx.fillStyle = '#000'
          ctx.font = '12px Arial'
          ctx.fillText(
            node.label || node.id,
            (node.x || 100) + graphConfig.nodeSize + 5,
            node.y || 100
          )
        }
      })

      // 绘制边
      data.edges.forEach((edge: any) => {
        const source = data.nodes.find((n: any) => n.id === edge.source)
        const target = data.nodes.find((n: any) => n.id === edge.target)

        if (source && target) {
          ctx.beginPath()
          ctx.moveTo(source.x || 100, source.y || 100)
          ctx.lineTo(target.x || 100, target.y || 100)
          ctx.strokeStyle = edge.color || '#94a3b8'
          ctx.lineWidth = graphConfig.edgeWidth
          ctx.stroke()
        }
      })
    } else {
      // 绘制默认图形
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(150, 150, 50, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = '#000'
      ctx.font = '16px Arial'
      ctx.fillText('Graph Visualization', 50, 250)
    }
  }

  useEffect(() => {
    drawGraph()
  }, [data, graphConfig])

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...graphConfig, [key]: value }
    setGraphConfig(newConfig)
    onGraphUpdate?.(newConfig)
  }

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'graph.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className={`graph-view ${className}`}>
      <div className="graph-controls">
        <Card>
          <CardHeader>
            <CardTitle>图形配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>布局算法</Label>
              <Select
                value={graphConfig.layout}
                onValueChange={(value) => handleConfigChange('layout', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择布局" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="force">力导向</SelectItem>
                  <SelectItem value="hierarchical">层次布局</SelectItem>
                  <SelectItem value="circular">环形布局</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>节点大小: {graphConfig.nodeSize}px</Label>
              <Slider
                value={[graphConfig.nodeSize]}
                onValueChange={(value: number[]) => handleConfigChange('nodeSize', value[0])}
                min={5}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>边宽度: {graphConfig.edgeWidth}px</Label>
              <Slider
                value={[graphConfig.edgeWidth]}
                onValueChange={(value: number[]) => handleConfigChange('edgeWidth', value[0])}
                min={1}
                max={10}
                step={0.5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-labels"
                checked={graphConfig.showLabels}
                onCheckedChange={(checked) => handleConfigChange('showLabels', checked)}
              />
              <Label htmlFor="show-labels">显示标签</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="animation"
                checked={graphConfig.animation}
                onCheckedChange={(checked) => handleConfigChange('animation', checked)}
              />
              <Label htmlFor="animation">启用动画</Label>
            </div>

            <Separator />

            <Button onClick={handleExport} variant="outline" className="w-full">
              导出图片
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="graph-canvas-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="graph-canvas border rounded-md"
        />

        {!data && (
          <div className="graph-placeholder">
            <p>暂无图形数据</p>
            <p className="text-sm text-muted-foreground">请提供图形数据或连接到数据源</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GraphView
