import { Database, Zap, Bolt } from 'lucide-react'
import type { FC } from 'react'

interface IconProps {
  className?: string
}

export const getKbTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    lightrag: 'LightRAG',
    chroma: 'Chroma',
    milvus: 'Milvus'
  }
  return labels[type] || type
}

export const getKbTypeIcon = (type: string): FC<IconProps> => {
  const icons: Record<string, FC<IconProps>> = {
    lightrag: Database,
    chroma: Zap,
    milvus: Bolt
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
