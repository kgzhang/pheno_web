import React from 'react'
import { Modal, Spin } from 'antd'
import { useDatabaseStore } from '@/stores/databaseStore'
import { getStatusText, formatStandardTime } from '@/utils/file_utils'
import './FileDetailModal.less'

const FileDetailModal: React.FC = () => {
  const { state, selectedFile, setSelectedFile } = useDatabaseStore((state) => ({
    state: state.state,
    selectedFile: state.selectedFile,
    setSelectedFile: (file: any) => (state.selectedFile = file)
  }))

  const handleCancel = () => {
    setSelectedFile(null)
    useDatabaseStore.setState((prevState) => ({
      state: { ...prevState.state, fileDetailModalVisible: false }
    }))
  }

  return (
    <Modal
      open={state.fileDetailModalVisible}
      title={selectedFile?.filename || '文件详情'}
      width="1200px"
      footer={null}
      onCancel={handleCancel}
    >
      <div className="file-detail-content">
        {selectedFile && (
          <>
            <div className="file-info-grid">
              <div className="info-item">
                <label>文件ID:</label>
                <span>{selectedFile.file_id}</span>
              </div>
              <div className="info-item">
                <label>上传时间:</label>
                <span>{formatStandardTime(Math.round(selectedFile.created_at * 1000))}</span>
              </div>
              <div className="info-item">
                <label>处理状态:</label>
                <span className={`status-badge ${selectedFile.status}`}>
                  {getStatusText(selectedFile.status)} - {selectedFile.lines?.length || 0} 行
                </span>
              </div>
            </div>
            {selectedFile.lines && selectedFile.lines.length > 0 ? (
              <div className="file-content-section">
                <h4>文件内容预览</h4>
                <div className="content-lines">
                  {selectedFile.lines.map((line: any, index: number) => (
                    <div key={index} className="content-line">
                      <span className="line-number">{index + 1}</span>
                      <span className="line-text">{line.text || line}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : state.fileDetailLoading ? (
              <div className="loading-container">
                <Spin />
              </div>
            ) : (
              <div className="empty-content">
                <p>暂无文件内容</p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default FileDetailModal
