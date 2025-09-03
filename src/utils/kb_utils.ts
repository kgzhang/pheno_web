import { Database, Zap } from 'lucide-react'
import { ThunderboltOutlined } from '@ant-design/icons'
import { FC } from 'react'

export const getKbTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    lightrag: 'LightRAG',
    chroma: 'Chroma',
    milvus: 'Milvus'
  }
  return labels[type] || type
}

export const getKbTypeIcon = (type: string): FC => {
  const icons: Record<string, FC> = {
    lightrag: Database,
    chroma: Zap,
    milvus: ThunderboltOutlined
  }
  return icons[type] || Database
}

export const getKbTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    lightrag: 'purple',
    chroma: 'orange',
    milvus: 'red'
  }
  return colors[type] || 'blue'
}
