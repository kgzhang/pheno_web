import React from 'react'
import WebSearchResult from './WebSearchResult'
import KnowledgeBaseResult from './KnowledgeBaseResult'
import KnowledgeGraphResult from './KnowledgeGraphResult'
import CalculatorResult from './CalculatorResult'
import { useAgentStore } from '@/stores/agentStore'

interface ToolResultRendererProps {
  toolName: string
  resultContent: any
}

const ToolResultRenderer: React.FC<ToolResultRendererProps> = ({ toolName, resultContent }) => {
  const { availableTools } = useAgentStore()
  const tool = availableTools[toolName as keyof typeof availableTools]

  const parsedData = typeof resultContent === 'string' ? JSON.parse(resultContent) : resultContent

  const isWebSearchResult = toolName.toLowerCase().includes('search') && parsedData?.results
  const isKnowledgeBaseResult =
    tool?.metadata?.tag?.includes('knowledgebase') && tool?.metadata?.kb_type !== 'lightrag'
  const isKnowledgeGraphResult = toolName.toLowerCase().includes('graph') && parsedData?.triples
  const isCalculatorResult =
    toolName.toLowerCase().includes('calculator') && typeof parsedData === 'number'

  if (isWebSearchResult) return <WebSearchResult data={parsedData} />
  if (isKnowledgeBaseResult) return <KnowledgeBaseResult data={parsedData} />
  if (isKnowledgeGraphResult) return <KnowledgeGraphResult data={parsedData} />
  if (isCalculatorResult) return <CalculatorResult data={parsedData} />

  return (
    <div className="default-result">
      <pre>{JSON.stringify(parsedData, null, 2)}</pre>
    </div>
  )
}

export default ToolResultRenderer
