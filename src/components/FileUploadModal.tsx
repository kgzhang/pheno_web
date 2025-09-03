import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Select, Switch, Upload, message } from 'antd'
import { FileOutlined, LinkOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useDatabaseStore } from '@/stores/databaseStore'
import { useUserStore } from '@/stores/userStore'
import { ocrApi } from '@/apis/system_api'
import './FileUploadModal.less'

const { TextArea } = Input

interface FileUploadModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ visible, onVisibleChange }) => {
  const { databaseId, addFiles, database } = useDatabaseStore()
  const { getAuthHeaders } = useUserStore()
  const [uploadMode, setUploadMode] = useState('file')
  const [fileList, setFileList] = useState<any[]>([])
  const [urlList, setUrlList] = useState('')
  const [chunkParams, setChunkParams] = useState({
    chunk_size: 1000,
    chunk_overlap: 200,
    enable_ocr: 'disable',
    use_qa_split: false,
    qa_separator: '\n\n\n'
  })
  const [ocrHealthStatus, setOcrHealthStatus] = useState<any>({})
  const [ocrHealthChecking, setOcrHealthChecking] = useState(false)

  const isGraphBased = database.kb_type === 'lightrag'

  const handleCancel = () => {
    onVisibleChange(false)
  }

  const chunkData = async () => {
    let success = false
    if (uploadMode === 'file') {
      const files = fileList
        .filter((f) => f.status === 'done')
        .map((f) => f.response?.file_path)
        .filter(Boolean)
      if (files.length === 0) {
        message.error('请先上传文件')
        return
      }
      success = await addFiles({ items: files, contentType: 'file', params: chunkParams })
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
      const healthData = await ocrApi.getHealth()
      setOcrHealthStatus(healthData.services)
    } catch (error) {
      message.error('OCR服务健康检查失败')
    } finally {
      setOcrHealthChecking(false)
    }
  }

  return (
    <Modal
      open={visible}
      title="添加文件"
      width="800px"
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={chunkData} loading={false}>
          添加到知识库
        </Button>
      ]}
    >
      <div className="add-files-content">
        <div className="upload-header">
          <div className="source-selector">
            <div
              className={`upload-mode-selector ${uploadMode === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMode('file')}
            >
              <FileOutlined /> 上传文件
            </div>
            <div
              className={`upload-mode-selector ${uploadMode === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMode('url')}
            >
              <LinkOutlined /> 输入网址
            </div>
          </div>
          {!isGraphBased && (
            <Button type="dashed" onClick={() => {}}>
              <SettingOutlined /> 分块参数
            </Button>
          )}
        </div>
        <div className="ocr-config">
          <Select
            value={chunkParams.enable_ocr}
            onChange={(value) => setChunkParams({ ...chunkParams, enable_ocr: value })}
            style={{ width: 220, marginRight: 12 }}
            options={[{ value: 'disable', label: '不启用' }]}
          />
          <Button
            size="small"
            type="dashed"
            onClick={checkOcrHealth}
            loading={ocrHealthChecking}
            icon={<CheckCircleOutlined />}
          >
            检查OCR服务
          </Button>
        </div>
        {uploadMode === 'file' ? (
          <Upload.Dragger
            fileList={fileList}
            multiple
            action={`/api/knowledge/files/upload?db_id=${databaseId}`}
            headers={getAuthHeaders()}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <p className="ant-upload-text">点击或者把文件拖拽到这里上传</p>
          </Upload.Dragger>
        ) : (
          <TextArea
            value={urlList}
            onChange={(e) => setUrlList(e.target.value)}
            placeholder="请输入网页链接，每行一个"
            rows={6}
          />
        )}
      </div>
    </Modal>
  )
}

export default FileUploadModal
