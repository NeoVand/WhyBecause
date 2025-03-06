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
 * Simple interface for node-based data (like diagrams).
 * We'll expand or reorganize later.
 */
export interface GraphNode {
  id: string
  type: string
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