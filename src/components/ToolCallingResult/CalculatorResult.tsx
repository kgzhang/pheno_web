import React from 'react'
import { Hash } from 'lucide-react'
interface CalculatorResultProps {
  data: number
}

const CalculatorResult: React.FC<CalculatorResultProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    if (typeof num !== 'number') return String(num)
    if (!isFinite(num)) {
      if (num === Infinity) return '∞'
      if (num === -Infinity) return '-∞'
      if (isNaN(num)) return 'NaN'
    }
    return new Intl.NumberFormat('zh-CN', {
      maximumFractionDigits: 10,
      useGrouping: true
    }).format(num)
  }

  return (
    <div className="calculator-result">
      <div className="calc-header">
        <h4>
          <Hash className="h-4 w-4 mr-2 inline" /> 计算结果
        </h4>
      </div>
      <div className="calc-display">
        <div className="result-container">
          <div className="result-value">{formatNumber(data)}</div>
        </div>
      </div>
    </div>
  )
}

export default CalculatorResult
