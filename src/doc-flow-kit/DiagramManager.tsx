import React, { useState } from 'react'
import { DiagramDoc, GraphNode } from './types'
import { docFlowKit } from './DocFlowKit'

interface DiagramManagerProps {
  diagramDoc: DiagramDoc
  onUpdate?: (updatedDoc: DiagramDoc) => void
}

/**
 * Renders a simple list of GraphNodes, allowing add/remove/edit.
 * We'll skip edges for simplicity right now.
 */
export function DiagramManager({ diagramDoc, onUpdate }: DiagramManagerProps) {
  const [title, setTitle] = useState(diagramDoc.title)
  const [nodes, setNodes] = useState<GraphNode[]>(diagramDoc.content.nodes)

  // A helper to commit changes to IDB
  async function saveDiagram() {
    try {
      const updated: DiagramDoc = {
        ...diagramDoc,
        title,
        content: {
          ...diagramDoc.content,
          nodes,
        },
      }
      await docFlowKit.updateDocument(updated)
      onUpdate?.(updated)
      alert('Diagram saved successfully')
    } catch (error) {
      console.error('Error saving diagram:', error)
      alert(`Error saving diagram: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function addNode() {
    const newNode: GraphNode = {
      id: crypto.randomUUID(),
      type: 'GenericNode',
      label: 'New Node',
      properties: {},
    }
    setNodes((prev) => [...prev, newNode])
  }

  function updateNodeLabel(nodeId: string, newLabel: string) {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, label: newLabel } : n))
    )
  }

  function removeNode(nodeId: string) {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId))
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
      <h3>Diagram Editor</h3>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          Document Title:{' '}
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '0.3rem', marginLeft: '0.5rem' }}
          />
        </label>
        <button 
          onClick={saveDiagram}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Save Diagram
        </button>
      </div>

      <hr />

      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={addNode}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Node
        </button>
      </div>

      {nodes.length === 0 ? (
        <p>No nodes in this diagram. Click "Add Node" to create one.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {nodes.map((node) => (
            <li key={node.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <input
                style={{ marginRight: '0.5rem', padding: '0.3rem', flexGrow: 1 }}
                value={node.label}
                onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                placeholder="Node label"
              />
              <button 
                onClick={() => removeNode(node.id)}
                style={{ padding: '0.3rem 0.6rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 