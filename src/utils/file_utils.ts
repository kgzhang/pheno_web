import { FileText, FileCode, FileImage, File, FileType, FileSpreadsheet } from 'lucide-react'
import type { FC } from 'react'

interface IconProps {
  className?: string
  style?: React.CSSProperties
}

export const getFileIcon = (filename: string): FC<IconProps> => {
  if (!filename) return File

  const extension = filename.toLowerCase().split('.').pop() || ''

  const iconMap: Record<string, FC<IconProps>> = {
    txt: FileText,
    text: FileText,
    log: FileText,
    md: FileCode,
    markdown: FileCode,
    pdf: File,
    doc: FileType,
    docx: FileType,
    xls: FileSpreadsheet,
    xlsx: FileSpreadsheet,
    csv: FileSpreadsheet,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    gif: FileImage,
    bmp: FileImage,
    svg: FileImage,
    webp: FileImage
  }

  return iconMap[extension] || File
}

export const getFileIconColor = (filename: string): string => {
  if (!filename) return '#8c8c8c'

  const extension = filename.toLowerCase().split('.').pop() || ''

  const colorMap: Record<string, string> = {
    txt: '#1890ff',
    text: '#1890ff',
    log: '#1890ff',
    md: '#0050b3',
    markdown: '#0050b3',
    pdf: '#ff4d4f',
    doc: '#2f54eb',
    docx: '#2f54eb',
    xls: '#52c41a',
    xlsx: '#52c41a',
    csv: '#52c41a',
    jpg: '#722ed1',
    jpeg: '#722ed1',
    png: '#722ed1',
    gif: '#722ed1',
    bmp: '#722ed1',
    svg: '#722ed1',
    webp: '#722ed1'
  }

  return colorMap[extension] || '#8c8c8c'
}

export const formatRelativeTime = (timestamp: number, offset = 0): string => {
  const timezoneOffset = offset * 60 * 60 * 1000
  const adjustedTimestamp = timestamp + timezoneOffset
  const now = Date.now()
  const secondsPast = (now - adjustedTimestamp) / 1000

  if (secondsPast < 60) {
    return `${Math.round(secondsPast)} 秒前`
  } else if (secondsPast < 3600) {
    return `${Math.round(secondsPast / 60)} 分钟前`
  } else if (secondsPast < 86400) {
    return `${Math.round(secondsPast / 3600)} 小时前`
  } else if (secondsPast < 86400 * 7) {
    return `${Math.round(secondsPast / 86400)} 天前`
  } else if (secondsPast < 86400 * 30) {
    return `${Math.round(secondsPast / (86400 * 7))} 周前`
  } else if (secondsPast < 86400 * 365) {
    return `${Math.round(secondsPast / (86400 * 30))} 月前`
  } else {
    const date = new Date(adjustedTimestamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year} 年 ${month} 月 ${day} 日`
  }
}

export const formatStandardTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
}

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    done: '处理完成',
    failed: '处理失败',
    processing: '处理中',
    waiting: '等待处理'
  }
  return statusMap[status] || status
}
