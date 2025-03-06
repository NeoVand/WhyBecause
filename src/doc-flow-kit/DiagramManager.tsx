import React, { useState } from 'react'
import { DiagramDoc, GraphNode, GraphEdge } from './types'
import { docFlowKit } from './DocFlowKit'

interface DiagramManagerProps {
  diagramDoc: DiagramDoc
  onUpdate?: (updatedDoc: DiagramDoc) => void
}

/**
 * Renders a simple list of GraphNodes and GraphEdges, allowing add/remove/edit operations.
 */
export function DiagramManager({ diagramDoc, onUpdate }: DiagramManagerProps) {
  const [title, setTitle] = useState(diagramDoc.title)
  const [nodes, setNodes] = useState<GraphNode[]>(diagramDoc.content.nodes)
  const [edges, setEdges] = useState<GraphEdge[]>(diagramDoc.content.edges)

  // For adding a new edge
  const [sourceId, setSourceId] = useState<string>('')
  const [targetId, setTargetId] = useState<string>('')

  // A helper to commit changes to IDB
  async function saveDiagram() {
    try {
      const updated: DiagramDoc = {
        ...diagramDoc,
        title,
        content: {
          ...diagramDoc.content,
          nodes,
          edges,
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
    // Also remove edges referencing that node
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
    )
  }

  // -- Edge editing --

  function addEdge() {
    if (!sourceId || !targetId) {
      alert('Please select both a source and a target node.')
      return
    }
    if (sourceId === targetId) {
      alert('Source and target cannot be the same node.')
      return
    }
    const newEdge: GraphEdge = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
      type: 'genericEdge',
    }
    setEdges((prev) => [...prev, newEdge])
    // reset selection
    setSourceId('')
    setTargetId('')
  }

  function removeEdge(edgeId: string) {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId))
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
      <h3>Diagram Editor</h3>

      {/* Diagram Title and Save Button */}
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

      {/* Node Management */}
      <h4>Nodes</h4>
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

      <hr />

      {/* Edge Management */}
      <h4>Edges</h4>

      {/* Add Edge Form */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          style={{ padding: '0.3rem' }}
        >
          <option value="">Select Source</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
        <span>→</span>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          style={{ padding: '0.3rem' }}
        >
          <option value="">Select Target</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
        <button
          onClick={addEdge}
          style={{ padding: '0.3rem 0.6rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Edge
        </button>
      </div>

      {edges.length === 0 ? (
        <p>No edges in this diagram. Select a source/target to add one.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {edges.map((edge) => (
            <li key={edge.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ marginRight: '0.5rem' }}>
                {nodes.find((n) => n.id === edge.source)?.label ?? edge.source} →{' '}
                {nodes.find((n) => n.id === edge.target)?.label ?? edge.target}
              </span>
              <button
                onClick={() => removeEdge(edge.id)}
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