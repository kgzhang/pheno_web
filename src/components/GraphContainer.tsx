import { forwardRef, useImperativeHandle, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from '@/utils/toast'
import GraphView from './GraphView'

export interface GraphContainerRef {
  exportGraph: () => void
  getGraphData: () => any
  resetGraph: () => void
}

interface GraphContainerProps {
  initialData?: any
  onGraphChange?: (data: any) => void
  className?: string
}

const GraphContainer = forwardRef<GraphContainerRef, GraphContainerProps>(
  ({ initialData, onGraphChange, className = '' }, ref) => {
    const [graphData, setGraphData] = useState(
      initialData || {
        nodes: [
          { id: '1', label: 'Node 1', x: 100, y: 100, color: '#3b82f6' },
          { id: '2', label: 'Node 2', x: 200, y: 200, color: '#ef4444' },
          { id: '3', label: 'Node 3', x: 300, y: 100, color: '#10b981' }
        ],
        edges: [
          { source: '1', target: '2', color: '#94a3b8' },
          { source: '2', target: '3', color: '#94a3b8' },
          { source: '3', target: '1', color: '#94a3b8' }
        ]
      }
    )

    const [zoomLevel, setZoomLevel] = useState(1)
    const [showGrid, setShowGrid] = useState(true)

    useImperativeHandle(ref, () => ({
      exportGraph: () => {
        // 这里可以添加导出图形的逻辑
        toast.success('图形导出功能准备就绪')
      },
      getGraphData: () => graphData,
      resetGraph: () => {
        setGraphData(
          initialData || {
            nodes: [
              { id: '1', label: 'Node 1', x: 100, y: 100, color: '#3b82f6' },
              { id: '2', label: 'Node 2', x: 200, y: 200, color: '#ef4444' },
              { id: '3', label: 'Node 3', x: 300, y: 100, color: '#10b981' }
            ],
            edges: [
              { source: '1', target: '2', color: '#94a3b8' },
              { source: '2', target: '3', color: '#94a3b8' },
              { source: '3', target: '1', color: '#94a3b8' }
            ]
          }
        )
        setZoomLevel(1)
        toast.success('图形已重置')
      }
    }))

    const handleGraphUpdate = (config: any) => {
      onGraphChange?.(config)
    }

    const handleAddNode = () => {
      const newNodeId = String(graphData.nodes.length + 1)
      const newNodes = [
        ...graphData.nodes,
        {
          id: newNodeId,
          label: `Node ${newNodeId}`,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }
      ]

      // 随机连接到现有节点
      const existingNodeIds = graphData.nodes.map((n: any) => n.id)
      const randomTarget = existingNodeIds[Math.floor(Math.random() * existingNodeIds.length)]

      const newEdges = [
        ...graphData.edges,
        { source: newNodeId, target: randomTarget, color: '#94a3b8' }
      ]

      const newData = { nodes: newNodes, edges: newEdges }
      setGraphData(newData)
      onGraphChange?.(newData)
    }

    const handleZoomChange = (value: number[]) => {
      setZoomLevel(value[0])
    }

    return (
      <div className={`graph-container ${className}`}>
        <div className="graph-toolbar mb-4 flex items-center space-x-4">
          <Button onClick={handleAddNode} variant="outline">
            添加节点
          </Button>

          <div className="flex items-center space-x-2">
            <Label htmlFor="zoom" className="w-20">
              缩放: {zoomLevel}x
            </Label>
            <Slider
              id="zoom"
              value={[zoomLevel]}
              onValueChange={(value: number[]) => handleZoomChange(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-32"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-grid"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="show-grid">显示网格</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>图形可视化</CardTitle>
              </CardHeader>
              <CardContent>
                <GraphView data={graphData} onGraphUpdate={handleGraphUpdate} className="h-96" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>图形信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>节点数量</Label>
                  <Input value={graphData.nodes.length} readOnly className="mt-1" />
                </div>

                <div>
                  <Label>边数量</Label>
                  <Input value={graphData.edges.length} readOnly className="mt-1" />
                </div>

                <div>
                  <Label>缩放级别</Label>
                  <Input value={`${zoomLevel}x`} readOnly className="mt-1" />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const dataStr = JSON.stringify(graphData, null, 2)
                    navigator.clipboard.writeText(dataStr)
                    toast.success('图形数据已复制到剪贴板')
                  }}
                >
                  复制数据
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
)

GraphContainer.displayName = 'GraphContainer'

export default GraphContainer
