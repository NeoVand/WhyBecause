import React, { useState, useEffect } from 'react'
import { FlowDoc, FlowStateNode, FlowTransitionEdge } from './types'
import { FlowRunner } from './FlowRunner'

interface FlowRunnerUIProps {
  flowDoc: FlowDoc
  onClose?: () => void
}

/**
 * Component for visualizing and controlling the execution of a flow
 */
export function FlowRunnerUI({ flowDoc, onClose }: FlowRunnerUIProps) {
  const [runner] = useState(() => new FlowRunner(flowDoc))
  const [currentStateId, setCurrentStateId] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([`Flow "${flowDoc.title}" loaded and ready to run.`])
  const [isRunning, setIsRunning] = useState(false)
  
  // Get the current state and available transitions
  const currentState = currentStateId 
    ? flowDoc.content.nodes.find(n => n.id === currentStateId) 
    : null
  const availableTransitions = runner.getAvailableTransitions()
  
  /**
   * Set the start state for the flow
   */
  function handleSetStartState(stateId: string) {
    try {
      runner.setStartState(stateId)
      setCurrentStateId(stateId)
      
      const state = flowDoc.content.nodes.find(n => n.id === stateId)
      if (state) {
        addLog(`Starting flow at state: "${state.label}" (${state.type})`)
      }
    } catch (error) {
      addLog(`Error setting start state: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Run the agent for the current state
   */
  async function handleRunState() {
    if (!currentStateId) {
      addLog('No current state selected.')
      return
    }
    
    try {
      setIsRunning(true)
      addLog('Running agent...')
      
      const result = await runner.runCurrentState()
      addLog(result)
    } catch (error) {
      addLog(`Error running state: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }
  
  /**
   * Transition to a new state using the specified edge
   */
  function handleTransition(edgeId: string) {
    try {
      const transition = flowDoc.content.edges.find(e => e.id === edgeId)
      const targetState = transition 
        ? flowDoc.content.nodes.find(n => n.id === transition.target) 
        : null
      
      if (transition && targetState) {
        const transitionLabel = transition.properties?.label || 'Unnamed Transition'
        addLog(`Following transition: "${transitionLabel}" to state "${targetState.label}"`)
      }
      
      const newStateLabel = runner.transitionTo(edgeId)
      setCurrentStateId(runner.getCurrentStateId())
      
      addLog(`Now at state: "${newStateLabel}"`)
    } catch (error) {
      addLog(`Error transitioning: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Reset the flow to its initial state
   */
  function handleReset() {
    runner.reset()
    setCurrentStateId(null)
    addLog('Flow reset. Select a start state to begin again.')
  }
  
  /**
   * Add a log entry
   */
  function addLog(message: string) {
    setLogs(prev => [...prev, message])
  }
  
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '4px', 
      padding: '1rem', 
      margin: '1rem 0',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Flow Runner: {flowDoc.title}</h3>
        <div>
          <button 
            onClick={handleReset}
            style={{ 
              marginRight: '0.5rem',
              padding: '0.3rem 0.6rem', 
              backgroundColor: '#607D8B', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              style={{ 
                padding: '0.3rem 0.6rem', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close Runner
            </button>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Flow state and controls */}
        <div style={{ flex: '1', minWidth: '0' }}>
          {!currentStateId ? (
            <>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                <h4>Select a Start State</h4>
                <p>Choose a state to begin the flow execution:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {flowDoc.content.nodes.map(state => (
                    <button 
                      key={state.id} 
                      onClick={() => handleSetStartState(state.id)}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: state.type === 'Start' ? '#4CAF50' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {state.label} ({state.type})
                      {state.agentId && ' 🤖'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                <h4>Current State: {currentState?.label}</h4>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span>Type: <strong>{currentState?.type}</strong></span>
                  {currentState?.agentId && (
                    <span style={{ 
                      backgroundColor: '#FF5722', 
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      Has Agent 🤖
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={handleRunState}
                  disabled={isRunning || !currentState?.agentId}
                  style={{ 
                    padding: '0.5rem 1rem',
                    backgroundColor: currentState?.agentId ? '#4CAF50' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentState?.agentId ? 'pointer' : 'not-allowed',
                    marginTop: '0.5rem'
                  }}
                >
                  {isRunning ? 'Running...' : currentState?.agentId ? 'Run Agent' : 'No Agent Available'}
                </button>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <h4>Available Transitions</h4>
                {availableTransitions.length === 0 ? (
                  <p>No transitions available from this state. This is a terminal state.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {availableTransitions.map(transition => {
                      const targetState = flowDoc.content.nodes.find(n => n.id === transition.target)
                      return (
                        <button 
                          key={transition.id} 
                          onClick={() => handleTransition(transition.id)}
                          style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {transition.properties?.label || 'Go'} → {targetState?.label} 
                          {targetState?.agentId ? ' 🤖' : ''}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Logs panel */}
        <div style={{ 
          flex: '1', 
          minWidth: '0',
          padding: '1rem', 
          backgroundColor: 'white', 
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <h4>Execution Log</h4>
          <div style={{ 
            height: '300px', 
            overflowY: 'auto', 
            padding: '0.5rem',
            border: '1px solid #eee',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            whiteSpace: 'pre-wrap'
          }}>
            {logs.map((log, index) => (
              <div 
                key={index}
                style={{ 
                  borderBottom: '1px solid #f0f0f0',
                  padding: '0.3rem 0',
                  marginBottom: '0.3rem'
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 