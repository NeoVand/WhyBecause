import { FlowDoc, FlowStateNode, FlowTransitionEdge, AgentDoc } from './types'
import { docFlowKit } from './DocFlowKit'

/**
 * Class for executing a flow, running agents, and managing state transitions
 */
export class FlowRunner {
  private flow: FlowDoc
  private currentStateId: string | null = null
  
  constructor(flowDoc: FlowDoc) {
    this.flow = flowDoc
  }
  
  /**
   * Set the starting state for the flow
   */
  public setStartState(stateId: string) {
    const state = this.flow.content.nodes.find(n => n.id === stateId)
    if (!state) {
      throw new Error(`State with id=${stateId} not found in the flow.`)
    }
    this.currentStateId = stateId
  }
  
  /**
   * Get the current state object
   */
  public getCurrentState(): FlowStateNode | null {
    if (!this.currentStateId) return null
    return this.flow.content.nodes.find(n => n.id === this.currentStateId) || null
  }
  
  /**
   * Get the current state ID
   */
  public getCurrentStateId(): string | null {
    return this.currentStateId
  }
  
  /**
   * Execute the current state, running its agent if one is assigned
   */
  public async runCurrentState(): Promise<string> {
    if (!this.currentStateId) {
      throw new Error('No current state set. Call setStartState() first.')
    }
    
    const state = this.getCurrentState()
    if (!state) {
      throw new Error(`State with id=${this.currentStateId} not found in the flow.`)
    }
    
    // If no agent is assigned, just return a simple message
    if (!state.agentId) {
      return `State "${state.label}" (${state.type}) has no agent assigned, so nothing to run.`
    }
    
    try {
      // Load the agent document
      const agentDoc = await docFlowKit.getDocument(state.agentId) as AgentDoc | null
      
      if (!agentDoc) {
        return `Error: Agent with id=${state.agentId} not found.`
      }
      
      if (agentDoc.docType !== 'Agent') {
        return `Error: Document with id=${state.agentId} is not an Agent.`
      }
      
      // For now, just simulate running the agent
      const prompt = agentDoc.content.promptTemplate
      
      // In a future step, we'll actually call an LLM service
      return `[Simulated Agent Run]
State: ${state.label} (${state.type})
Agent: ${agentDoc.title}
---
${prompt}
---
[Simulated LLM Response]: The agent has processed the prompt and returned a result.`
    } catch (error) {
      return `Error running agent: ${error instanceof Error ? error.message : String(error)}`
    }
  }
  
  /**
   * Get all available transitions from the current state
   */
  public getAvailableTransitions(): FlowTransitionEdge[] {
    if (!this.currentStateId) return []
    return this.flow.content.edges.filter(e => e.source === this.currentStateId)
  }
  
  /**
   * Transition to a new state using the specified edge
   */
  public transitionTo(edgeId: string): string {
    if (!this.currentStateId) {
      throw new Error('No current state set. Call setStartState() first.')
    }
    
    const edge = this.flow.content.edges.find(e => e.id === edgeId)
    if (!edge) {
      throw new Error(`Transition with id=${edgeId} not found in the flow.`)
    }
    
    // Verify that this is a valid transition from the current state
    if (edge.source !== this.currentStateId) {
      throw new Error(`Transition ${edgeId} is not available from the current state.`)
    }
    
    // Update the current state to the target of the transition
    this.currentStateId = edge.target
    
    // Return the name of the new state for convenience
    const newState = this.getCurrentState()
    return newState ? newState.label : 'Unknown State'
  }
  
  /**
   * Reset the flow runner to its initial state (no current state)
   */
  public reset() {
    this.currentStateId = null
  }
} 