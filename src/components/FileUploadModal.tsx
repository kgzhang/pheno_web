import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { File, Link, Settings, CheckCircle2 } from 'lucide-react'
import { useDatabaseStore } from '@/stores/databaseStore'
import { ocrApi } from '@/apis/system_api'
import { message } from '@/utils/toast'
import './FileUploadModal.less'

interface FileUploadModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ visible, onVisibleChange }) => {
  const { addFiles, database } = useDatabaseStore()
  const [uploadMode, setUploadMode] = useState('file')
  const [fileList, setFileList] = useState<File[]>([])
  const [urlList, setUrlList] = useState('')
  const [chunkParams, setChunkParams] = useState({
    chunk_size: 1000,
    chunk_overlap: 200,
    enable_ocr: 'disable',
    use_qa_split: false,
    qa_separator: '\n\n\n'
  })
  const [ocrHealthChecking, setOcrHealthChecking] = useState(false)

  const isGraphBased = database.kb_type === 'lightrag'

  const handleCancel = () => {
    onVisibleChange(false)
  }

  const chunkData = async () => {
    let success = false
    if (uploadMode === 'file') {
      if (fileList.length === 0) {
        message.error('请先上传文件')
        return
      }
      // 这里需要实现文件上传逻辑
      success = await addFiles({ items: [], contentType: 'file', params: chunkParams })
    } else {
      const urls = urlList
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.startsWith('http'))
      if (urls.length === 0) {
        message.error('请输入有效的网页链接')
        return
      }
      success = await addFiles({ items: urls, contentType: 'url', params: chunkParams })
    }
    if (success) {
      onVisibleChange(false)
      setFileList([])
      setUrlList('')
    }
  }

  const checkOcrHealth = async () => {
    setOcrHealthChecking(true)
    try {
      await ocrApi.getHealth()
      message.success('OCR服务正常')
    } catch (error) {
      message.error('OCR服务健康检查失败')
    } finally {
      setOcrHealthChecking(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setFileList(Array.from(files))
    }
  }

  return (
    <Dialog open={visible} onOpenChange={onVisibleChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加文件</DialogTitle>
          <DialogDescription>上传文件或输入网址添加到知识库</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              className="flex items-center gap-2"
            >
              <File className="h-4 w-4" />
              上传文件
            </Button>
            <Button
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMode('url')}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              输入网址
            </Button>
          </div>

          {!isGraphBased && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                分块参数
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Select
              value={chunkParams.enable_ocr}
              onValueChange={(value) => setChunkParams({ ...chunkParams, enable_ocr: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="OCR设置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disable">不启用</SelectItem>
                <SelectItem value="auto">自动启用</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={checkOcrHealth}
              disabled={ocrHealthChecking}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {ocrHealthChecking ? '检查中...' : '检查OCR服务'}
            </Button>
          </div>

          {uploadMode === 'file' ? (
            <div className="space-y-2">
              <Label htmlFor="file-upload">选择文件</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {fileList.length > 0 && (
                <div className="text-sm text-muted-foreground">已选择 {fileList.length} 个文件</div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url-input">网页链接</Label>
              <textarea
                id="url-input"
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
                placeholder="请输入网页链接，每行一个"
                className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={6}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={chunkData}>添加到知识库</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FileUploadModal
