import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Upload } from 'lucide-react'
import HeaderComponent from '@/components/HeaderComponent'
import { neo4jApi } from '@/apis/graph_api'

const GraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: []
  })
  const [showModal, setShowModal] = useState(false)

  const loadGraphInfo = async () => {
    try {
      await neo4jApi.getInfo()
    } catch (error: any) {
      console.error(error.message || '加载图数据库信息失败')
    }
  }

  const loadSampleNodes = async () => {
    try {
      const data = await neo4jApi.getSampleNodes()
      setGraphData({ nodes: data.result.nodes, edges: data.result.edges })
    } catch (error: any) {
      console.error(error.message || '加载节点失败')
    }
  }

  useEffect(() => {
    loadGraphInfo()
    loadSampleNodes()
  }, [])

  useEffect(() => {
    // 图形渲染逻辑已移除，需要重新实现或使用其他图形库
    console.log('Graph data updated:', graphData)
  }, [graphData])

  const addDocumentByFile = async () => {
    // Implement file upload logic
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <HeaderComponent title="图数据库">
        <div slot="actions">
          <Button onClick={() => setShowModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            上传文件
          </Button>
        </div>
      </HeaderComponent>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-xl mb-2">图形可视化功能需要重新实现</p>
            <p className="text-gray-600">请使用其他图形库如Sigma.js或D3.js</p>
          </div>
        </div>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传文件</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-sm font-medium mb-2">点击或者把文件拖拽到这里上传</p>
            <p className="text-xs text-gray-500">目前仅支持上传 jsonl 文件。</p>
            <input
              type="file"
              className="mt-4"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files
                if (files && files.length > 0) {
                  // 文件上传逻辑
                  console.log('Files selected:', Array.from(files))
                }
              }}
              accept=".jsonl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={addDocumentByFile}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GraphView
