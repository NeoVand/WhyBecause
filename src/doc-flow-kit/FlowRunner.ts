import { FlowDoc, FlowStateNode, FlowTransitionEdge, AgentDoc, ProjectDoc } from './types'
import { docFlowKit } from './DocFlowKit'
import { getLLMService, LLMSettings, DEFAULT_LLM_SETTINGS } from './LLMService'

/**
 * Class for executing a flow, running agents, and managing state transitions
 */
export class FlowRunner {
  private flow: FlowDoc
  private currentStateId: string | null = null
  private project: ProjectDoc
  
  constructor(flowDoc: FlowDoc, project: ProjectDoc) {
    this.flow = flowDoc
    this.project = project
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
      
      // Get the prompt template from the agent
      const promptTemplate = agentDoc.content.promptTemplate;
      
      // Process the prompt template (replace variables, etc.)
      const processedPrompt = this.processPromptTemplate(promptTemplate, {
        stateName: state.label,
        stateType: state.type,
        flowName: this.flow.title
      });
      
      // Get LLM settings from the project, or use defaults
      const llmSettings = this.project.content.llmSettings || DEFAULT_LLM_SETTINGS;
      
      // Get the appropriate LLM service and call it
      const llmService = getLLMService(llmSettings);
      const response = await llmService.callLLM(processedPrompt, llmSettings);
      
      return `[Agent: ${agentDoc.title}]\n\nPrompt:\n${processedPrompt}\n\nResponse:\n${response}`;
    } catch (error) {
      return `Error running agent: ${error instanceof Error ? error.message : String(error)}`
    }
  }
  
  /**
   * Process a prompt template by replacing variables with their values
   */
  private processPromptTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    
    // Replace {varName} with the corresponding value
    Object.entries(variables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    // Replace {input} with a default value if not provided
    if (processed.includes('{input}')) {
      processed = processed.replace(/{input}/g, 'Please analyze this flow state and provide insights.');
    }
    
    return processed;
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