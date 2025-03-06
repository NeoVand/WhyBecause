import React, { useState } from 'react'
import { AgentDoc } from './types'
import { docFlowKit } from './DocFlowKit'

interface AgentManagerProps {
  agentDoc: AgentDoc
  onUpdate?: (updatedDoc: AgentDoc) => void
}

/**
 * A simple editor for an AgentDoc. For now, it just edits a single prompt template.
 */
export function AgentManager({ agentDoc, onUpdate }: AgentManagerProps) {
  const [title, setTitle] = useState(agentDoc.title)
  const [promptTemplate, setPromptTemplate] = useState(agentDoc.content.promptTemplate)

  /**
   * Save agent changes to IndexedDB
   */
  async function saveAgent() {
    try {
      const updated: AgentDoc = {
        ...agentDoc,
        title,
        content: {
          ...agentDoc.content,
          promptTemplate,
        },
      }
      await docFlowKit.updateDocument(updated)
      onUpdate?.(updated)
      alert('Agent saved successfully!')
    } catch (err) {
      console.error('Error saving agent:', err)
      alert(`Error saving agent: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
      <h3>Agent Editor</h3>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          Agent Title:{' '}
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '0.3rem', marginLeft: '0.5rem' }}
          />
        </label>
        <button 
          onClick={saveAgent}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Save Agent
        </button>
      </div>

      <hr />

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Prompt Template:
        </label>
        <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
          Write the prompt template for your LLM agent. You can use variables like {'{input}'} that will be replaced at runtime.
        </p>
        <textarea
          rows={15}
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.8rem', 
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            lineHeight: '1.5'
          }}
          placeholder="Write your prompt template here..."
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button 
          onClick={saveAgent}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Save Agent
        </button>
      </div>
    </div>
  )
} 