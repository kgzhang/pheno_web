import React from 'react'
import { GlobalOutlined } from '@ant-design/icons'
import './WebSearchResult.less'

interface WebSearchResultProps {
  data: {
    query: string
    response_time: number
    results: {
      url: string
      title: string
      score: number
      published_date?: string
      content: string
    }[]
  }
}

const WebSearchResult: React.FC<WebSearchResultProps> = ({ data }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="web-search-result">
      <div className="search-header">
        <h4>
          <GlobalOutlined /> 网页搜索结果
        </h4>
        <div className="search-meta">
          <span className="query-text">查询: {data.query}</span>
          <span className="response-time">响应时间: {data.response_time}s</span>
        </div>
      </div>
      <div className="search-results">
        {data.results.map((result, index) => (
          <div key={index} className="search-result-item">
            <div className="result-header">
              <h5 className="result-title">
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </a>
              </h5>
              <span className="result-score">相关度: {(result.score * 100).toFixed(1)}%</span>
            </div>
            <div className="result-meta">
              {result.published_date && (
                <span className="result-date">{formatDate(result.published_date)}</span>
              )}
            </div>
            <div className="result-content">{result.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WebSearchResult
