import React, { useEffect, useRef } from 'react'
import { Graph } from '@antv/g6'
import './GraphContainer.less'

interface GraphContainerProps {
  graphData: {
    nodes: any[]
    edges: any[]
  }
}

const GraphContainer: React.FC<GraphContainerProps> = ({ graphData }) => {
  const container = useRef<HTMLDivElement>(null)
  let graphInstance: Graph | null = null

  useEffect(() => {
    if (container.current) {
      if (graphInstance) {
        graphInstance.destroy()
      }
      graphInstance = new Graph({
        container: container.current,
        width: container.current.offsetWidth,
        height: container.current.offsetHeight,
        autoFit: true,
        layout: { type: 'd3-force', preventOverlap: true },
        node: {
          style: {
            labelText: (d: any) => d.data.label
          }
        },
        edge: {
          style: {
            labelText: (d: any) => d.data.label,
            endArrow: true
          }
        },
        behaviors: ['drag-element', 'zoom-canvas', 'drag-canvas']
      })
      graphInstance.read(graphData)
    }
    return () => {
      if (graphInstance) {
        graphInstance.destroy()
      }
    }
  }, [graphData])

  return <div className="graph-container" ref={container}></div>
}

export default GraphContainer
