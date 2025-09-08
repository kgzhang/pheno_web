declare module 'sigma' {
  export interface SigmaEvent {
    node?: string
    edge?: string
  }

  export interface SigmaOptions {
    nodeProgramClasses?: Record<string, any>
    edgeProgramClasses?: Record<string, any>
    renderEdgeLabels?: boolean
  }

  export default class Sigma {
    constructor(container: HTMLElement, graph: any, options?: SigmaOptions)
    setGraph(graph: any): void
    getGraph(): any
    refresh(): void
    kill(): void
    on(event: 'clickNode', callback: (event: { node: string }) => void): void
    on(event: 'enterNode', callback: (event: { node: string }) => void): void
    on(event: 'leaveNode', callback: () => void): void
    on(event: 'clickEdge', callback: (event: { edge: string }) => void): void
    on(event: 'clickStage', callback: () => void): void
  }
}
