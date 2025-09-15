import React, { useMemo, useRef, useEffect } from 'react'
import { Network } from 'lucide-react'
import GraphContainer from '../GraphContainer'
interface KnowledgeGraphResultProps {
  data: {
    triples?: [string, string, string][]
  }
}

const KnowledgeGraphResult: React.FC<KnowledgeGraphResultProps> = ({ data }) => {
  const graphContainerRef = useRef<any>(null)

  const graphData = useMemo(() => {
    const nodes = new Map<string, { id: string; name: string }>()
    const edges: { source_id: string; target_id: string; type: string; id: string }[] = []
    let edgeId = 0

    if (data?.triples) {
      data.triples.forEach(([source, relation, target]) => {
        if (source && !nodes.has(source)) nodes.set(source, { id: source, name: source })
        if (target && !nodes.has(target)) nodes.set(target, { id: target, name: target })
        if (source && target && relation) {
          edges.push({
            source_id: source,
            target_id: target,
            type: relation,
            id: `edge_${edgeId++}`
          })
        }
      })
    }
    return { nodes: Array.from(nodes.values()), edges }
  }, [data])

  useEffect(() => {
    graphContainerRef.current?.refreshGraph()
  }, [graphData])

  return (
    <div className="knowledge-graph-result">
      <div className="kg-header">
        <h4>
          <Network className="h-4 w-4 mr-2 inline" /> 知识图谱查询结果
        </h4>
        <div className="result-summary">
          找到 {graphData.nodes.length} 个节点, {graphData.edges.length} 个关系
        </div>
      </div>
      <div className="graph-visualization">
        <GraphContainer initialData={graphData} ref={graphContainerRef} />
      </div>
    </div>
  )
}

export default KnowledgeGraphResult
