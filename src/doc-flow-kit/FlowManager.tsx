import { useState } from 'react'
import { FlowDoc, FlowStateNode, FlowTransitionEdge } from './types'
import { docFlowKit } from './DocFlowKit'

interface FlowManagerProps {
  flowDoc: FlowDoc
  onUpdate?: (updatedDoc: FlowDoc) => void
}

/**
 * Enum of flow state types
 */
type FlowStateType = 'Start' | 'Normal' | 'Decision' | 'Final'

/**
 * Available flow state types
 */
const FLOW_STATE_TYPES: FlowStateType[] = ['Start', 'Normal', 'Decision', 'Final']

/**
 * Component for editing a flow state machine
 */
export function FlowManager({ flowDoc, onUpdate }: FlowManagerProps) {
  const [title, setTitle] = useState(flowDoc.title)
  const [states, setStates] = useState<FlowStateNode[]>(flowDoc.content.nodes)
  const [transitions, setTransitions] = useState<FlowTransitionEdge[]>(flowDoc.content.edges)
  const [defaultStateType, setDefaultStateType] = useState<string>('Normal')

  // For adding transitions
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [transitionLabel, setTransitionLabel] = useState('')

  /**
   * Save flow changes to IndexedDB
   */
  async function saveFlow() {
    try {
      const updated: FlowDoc = {
        ...flowDoc,
        title,
        content: {
          ...flowDoc.content,
          nodes: states,
          edges: transitions,
        },
      }
      await docFlowKit.updateDocument(updated)
      onUpdate?.(updated)
      alert('Flow saved successfully!')
    } catch (error) {
      console.error('Error saving flow:', error)
      alert(`Error saving flow: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Add a new state to the flow
   */
  function addState() {
    const newState: FlowStateNode = {
      id: crypto.randomUUID(),
      type: defaultStateType,
      label: 'New State',
      properties: {},
    }
    setStates((prev) => [...prev, newState])
  }

  /**
   * Update a state's label
   */
  function updateStateLabel(stateId: string, newLabel: string) {
    setStates((prev) =>
      prev.map((s) => (s.id === stateId ? { ...s, label: newLabel } : s))
    )
  }

  /**
   * Update a state's type
   */
  function updateStateType(stateId: string, newType: string) {
    setStates((prev) =>
      prev.map((s) => (s.id === stateId ? { ...s, type: newType } : s))
    )
  }

  /**
   * Remove a state from the flow
   */
  function removeState(stateId: string) {
    setStates((prev) => prev.filter((s) => s.id !== stateId))
    // Remove transitions referencing that state
    setTransitions((prev) =>
      prev.filter((t) => t.source !== stateId && t.target !== stateId)
    )
  }

  /**
   * Add a transition between states
   */
  function addTransition() {
    if (!sourceId || !targetId) {
      alert('Please select both a source and a target state.')
      return
    }
    if (sourceId === targetId) {
      alert('Source and target cannot be the same state.')
      return
    }
    const newTransition: FlowTransitionEdge = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
      type: 'FlowTransition',
      properties: {
        label: transitionLabel || 'Transition'
      }
    }
    setTransitions((prev) => [...prev, newTransition])
    // Reset form
    setSourceId('')
    setTargetId('')
    setTransitionLabel('')
  }

  /**
   * Remove a transition
   */
  function removeTransition(transitionId: string) {
    setTransitions((prev) => prev.filter((t) => t.id !== transitionId))
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
      <h3>Flow Editor</h3>

      {/* Flow Title and Save Button */}
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
          onClick={saveFlow}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Save Flow
        </button>
      </div>

      <hr />

      {/* States Management */}
      <h4>States</h4>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <label style={{ marginRight: '0.5rem' }}>
            Default State Type:
            <select
              value={defaultStateType}
              onChange={(e) => setDefaultStateType(e.target.value)}
              style={{ padding: '0.3rem', marginLeft: '0.5rem' }}
            >
              {FLOW_STATE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button 
          onClick={addState}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add State
        </button>
      </div>

      {states.length === 0 ? (
        <p>No states in this flow. Click "Add State" to create one.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {states.map((state) => (
            <li key={state.id} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* State Type Dropdown */}
                <select
                  value={state.type}
                  onChange={(e) => updateStateType(state.id, e.target.value)}
                  style={{ padding: '0.3rem', minWidth: '120px' }}
                >
                  {FLOW_STATE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* State Label Input */}
                <input
                  style={{ flexGrow: 1, padding: '0.3rem' }}
                  value={state.label}
                  onChange={(e) => updateStateLabel(state.id, e.target.value)}
                  placeholder="State name"
                />

                <button
                  onClick={() => removeState(state.id)}
                  style={{ padding: '0.3rem 0.6rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <hr />

      {/* Transitions Management */}
      <h4>Transitions</h4>

      {/* Add Transition Form */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          style={{ padding: '0.3rem' }}
        >
          <option value="">Select Source State</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.label} ({state.type})
            </option>
          ))}
        </select>
        <span>→</span>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          style={{ padding: '0.3rem' }}
        >
          <option value="">Select Target State</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.label} ({state.type})
            </option>
          ))}
        </select>
        <input
          value={transitionLabel}
          onChange={(e) => setTransitionLabel(e.target.value)}
          placeholder="Transition label (optional)"
          style={{ padding: '0.3rem' }}
        />
        <button
          onClick={addTransition}
          style={{ padding: '0.3rem 0.6rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Transition
        </button>
      </div>

      {transitions.length === 0 ? (
        <p>No transitions in this flow. Select source/target states to add one.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {transitions.map((transition) => (
            <li key={transition.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ marginRight: '0.5rem' }}>
                {states.find((s) => s.id === transition.source)?.label ?? transition.source} ({states.find((s) => s.id === transition.source)?.type}) →{' '}
                {states.find((s) => s.id === transition.target)?.label ?? transition.target} ({states.find((s) => s.id === transition.target)?.type})
                {transition.properties?.label ? `: ${transition.properties.label}` : ''}
              </span>
              <button
                onClick={() => removeTransition(transition.id)}
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