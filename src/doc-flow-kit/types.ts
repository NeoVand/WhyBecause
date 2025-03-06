/**
 * Base interface for any document stored in our local database.
 * We'll expand this in future steps.
 */
export interface BaseDocument {
  docId: string
  docType: string
  title: string
  content: any
  metadata?: Record<string, any>
  references?: DocRef[]
}

export interface DocRef {
  docId: string
  docType: string
  title?: string
}

/**
 * Why-Because Analysis node types
 */
export type WBANodeType =
  | 'Incident'
  | 'Damage'
  | 'Event'
  | 'UnEvent'
  | 'State'
  | 'Assumption'
  | 'Process'
  | 'ActionItem'
  | 'ProximateCause'
  | 'GenericNode'

/**
 * Simple interface for node-based data (like diagrams).
 * We'll expand or reorganize later.
 */
export interface GraphNode {
  id: string
  type: string  // Can be cast to WBANodeType when needed
  label: string
  properties: Record<string, any>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: string
  properties?: Record<string, any>
}

/**
 * Content structure for node-based diagrams
 */
export interface NodeBasedContent {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * A specialized doc for node-based diagrams
 */
export interface DiagramDoc extends BaseDocument {
  docType: 'Diagram'
  content: NodeBasedContent
}

/**
 * Example specialized doc for a Project.
 * This is intentionally minimal for now.
 */
export interface ProjectDoc extends BaseDocument {
  docType: 'Project'
  content: {
    name: string
    documents: DocRef[]
    // We'll add more fields as we proceed
  }
} 