import React, { useState, useMemo } from 'react'
import { Modal, Progress } from 'antd'
import {
  FileTextOutlined,
  FileOutlined,
  DownOutlined,
  EyeOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import './KnowledgeBaseResult.less'

interface KnowledgeBaseResultProps {
  data: any[]
}

const KnowledgeBaseResult: React.FC<KnowledgeBaseResultProps> = ({ data }) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set<string>())
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedChunk, setSelectedChunk] = useState<any>(null)

  const fileGroups = useMemo(() => {
    const groups = new Map<string, { filename: string; chunks: any[] }>()
    data.forEach((item) => {
      const filename = item.metadata.source
      if (!groups.has(filename)) {
        groups.set(filename, { filename, chunks: [] })
      }
      groups.get(filename)!.chunks.push(item)
    })
    return Array.from(groups.values()).sort((a, b) => a.filename.localeCompare(b.filename))
  }, [data])

  const toggleFile = (filename: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
    } else {
      newExpanded.add(filename)
    }
    setExpandedFiles(newExpanded)
  }

  const showChunkDetail = (chunk: any, index: number) => {
    setSelectedChunk({ data: chunk, index })
    setModalVisible(true)
  }

  return (
    <div className="knowledge-base-result">
      <div className="kb-header">
        <h4>
          <FileTextOutlined /> 知识库检索结果
        </h4>
        <div className="result-summary">
          找到 {data.length} 个相关文档片段，来自 {fileGroups.length} 个文件
        </div>
      </div>
      <div className="kb-results">
        {fileGroups.map((group) => (
          <div key={group.filename} className="file-group">
            <div
              className={`file-header ${expandedFiles.has(group.filename) ? 'expanded' : ''}`}
              onClick={() => toggleFile(group.filename)}
            >
              <div className="file-info">
                <FileOutlined />
                <span className="file-name">{group.filename}</span>
                <span className="chunk-count">{group.chunks.length} chunks</span>
              </div>
              <div className="expand-icon">
                <DownOutlined className={expandedFiles.has(group.filename) ? 'rotated' : ''} />
              </div>
            </div>
            {expandedFiles.has(group.filename) && (
              <div className="chunks-container">
                {group.chunks.map((chunk, index) => (
                  <div
                    key={chunk.id}
                    className={`chunk-item ${chunk.score > 0.5 ? 'high-relevance' : ''}`}
                    onClick={() => showChunkDetail(chunk, index + 1)}
                  >
                    <div className="chunk-summary">
                      <span className="chunk-index">#{index + 1}</span>
                      <div className="chunk-scores">
                        <span className="score-item">相似度 {(chunk.score * 100).toFixed(0)}%</span>
                        {chunk.rerank_score && (
                          <span className="score-item">
                            重排序 {(chunk.rerank_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <span className="chunk-preview">{chunk.content.substring(0, 100)}...</span>
                      <EyeOutlined className="view-icon" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal
        open={modalVisible}
        title={`文档片段 #${selectedChunk?.index} - ${selectedChunk?.data?.metadata?.source}`}
        width={800}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        {selectedChunk && (
          <div className="chunk-detail">
            <div className="detail-header">
              <div className="detail-scores">
                <div className="score-card">
                  <div className="score-label">相似度分数</div>
                  <div className="score-value-large">
                    {(selectedChunk.data.score * 100).toFixed(1)}%
                  </div>
                  <Progress percent={selectedChunk.data.score * 100} showInfo={false} />
                </div>
                {selectedChunk.data.rerank_score && (
                  <div className="score-card">
                    <div className="score-label">重排序分数</div>
                    <div className="score-value-large">
                      {(selectedChunk.data.rerank_score * 100).toFixed(1)}%
                    </div>
                    <Progress percent={selectedChunk.data.rerank_score * 100} showInfo={false} />
                  </div>
                )}
              </div>
            </div>
            <div className="detail-content">
              <h5>文档内容</h5>
              <div className="content-text">{selectedChunk.data.content}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default KnowledgeBaseResult
