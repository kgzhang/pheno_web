import React from 'react'

interface LoadingComponentProps {
  visible?: boolean
  text?: string
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  visible = false,
  text = '加载中...'
}) => {
  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white/80 flex justify-center items-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="mt-4 text-base text-gray-900">{text}</div>
      </div>
    </div>
  )
}

export default LoadingComponent
