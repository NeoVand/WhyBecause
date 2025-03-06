import { useEffect, useState } from 'react'
import { 
  docFlowKit, 
  useProject, 
  DiagramDoc, 
  FlowDoc,
  AgentDoc,
  DocRef, 
  DiagramManager,
  FlowManager,
  AgentManager,
  FlowRunnerUI,
  DEFAULT_LLM_SETTINGS
} from './doc-flow-kit'
import { LLMSettings } from './doc-flow-kit/LLMService'
import { useUser } from './doc-flow-kit/UserContext'
import LoginScreen from './components/LoginScreen'
import AppLayout from './components/AppLayout'
import ProjectDashboard from './components/ProjectDashboard'
import { Box, CircularProgress, Typography, Alert, Stack } from '@mui/material'

function App() {
  // User context for authentication
  const { currentUser, isLoading: userLoading } = useUser();
  
  // Project context for project management
  const { project, loadProject, saveProject, createNewProject } = useProject();
  
  // State for documents and UI
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeDiagramDoc, setActiveDiagramDoc] = useState<DiagramDoc | null>(null);
  const [activeFlowDoc, setActiveFlowDoc] = useState<FlowDoc | null>(null);
  const [activeAgentDoc, setActiveAgentDoc] = useState<AgentDoc | null>(null);
  const [showFlowRunner, setShowFlowRunner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Update LLM settings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function updateLLMSettings(partialSettings: Partial<LLMSettings>) {
    if (!project) return;
    
    try {
      // Get the current settings or use defaults
      const currentSettings = project.content.llmSettings || DEFAULT_LLM_SETTINGS;
      
      // Create updated settings by merging current and new
      const newSettings: LLMSettings = {
        ...currentSettings,
        ...partialSettings
      };
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          llmSettings: newSettings
        }
      };
      
      await saveProject(updatedProject);
      setStatus('LLM settings updated');
    } catch (error) {
      console.error('Error updating LLM settings:', error);
      setError(`Error updating LLM settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Create a new diagram
  async function createNewDiagram() {
    if (!project) {
      setError('No project loaded. Cannot create diagram.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the DiagramDoc
      const newDiagram: DiagramDoc = {
        docId: crypto.randomUUID(),
        docType: 'Diagram',
        title: 'Untitled Diagram',
        content: {
          nodes: [],
          edges: [],
        },
      };
      await docFlowKit.createDocument(newDiagram);

      // Add reference to project
      const newRef: DocRef = {
        docId: newDiagram.docId,
        docType: 'Diagram',
        title: newDiagram.title,
      };
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: [...project.content.documents, newRef],
        },
      };
      await saveProject(updatedProject);

      setStatus('New diagram created');
      
      // Open the new diagram
      loadDiagram(newDiagram.docId);
    } catch (error) {
      console.error('Error creating diagram:', error);
      setError(`Error creating diagram: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Create a new flow
  async function createNewFlow() {
    if (!project) {
      setError('No project loaded. Cannot create flow.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the FlowDoc
      const newFlow: FlowDoc = {
        docId: crypto.randomUUID(),
        docType: 'Flow',
        title: 'Untitled Flow',
        content: {
          nodes: [],
          edges: [],
        },
      };
      await docFlowKit.createDocument(newFlow);

      // Add reference to project
      const newRef: DocRef = {
        docId: newFlow.docId,
        docType: 'Flow',
        title: newFlow.title,
      };
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: [...project.content.documents, newRef],
        },
      };
      await saveProject(updatedProject);

      setStatus('New flow created');
      
      // Open the new flow
      loadFlow(newFlow.docId);
    } catch (error) {
      console.error('Error creating flow:', error);
      setError(`Error creating flow: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Create a new agent
  async function createNewAgent() {
    if (!project) {
      setError('No project loaded. Cannot create agent.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the AgentDoc
      const newAgent: AgentDoc = {
        docId: crypto.randomUUID(),
        docType: 'Agent',
        title: 'Untitled Agent',
        content: {
          promptTemplate: `# Agent Prompt Template

You are a helpful assistant that provides analysis for Why-Because Analysis (WBA).

Please help the user with the following task:
{input}

Provide a thoughtful response that helps with their analysis.`
        },
      };
      await docFlowKit.createDocument(newAgent);

      // Add reference to project
      const newRef: DocRef = {
        docId: newAgent.docId,
        docType: 'Agent',
        title: newAgent.title,
      };
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: [...project.content.documents, newRef],
        },
      };
      await saveProject(updatedProject);

      setStatus('New agent created');
      
      // Open the new agent
      loadAgent(newAgent.docId);
    } catch (error) {
      console.error('Error creating agent:', error);
      setError(`Error creating agent: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Load a diagram by ID
  async function loadDiagram(docId: string) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Close any active documents
      setActiveFlowDoc(null);
      setActiveAgentDoc(null);
      setShowFlowRunner(false);
      
      const diagram = await docFlowKit.getDocument(docId) as DiagramDoc | null;
      
      if (!diagram) {
        setError(`Error: Diagram with ID ${docId} not found`);
        return;
      }
      
      if (diagram.docType !== 'Diagram') {
        setError(`Error: Document with ID ${docId} is not a Diagram`);
        return;
      }
      
      setActiveDiagramDoc(diagram);
      setStatus(`Diagram "${diagram.title}" loaded`);
    } catch (error) {
      console.error('Error loading diagram:', error);
      setError(`Error loading diagram: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Load a flow by ID
  async function loadFlow(docId: string) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Close any active documents
      setActiveDiagramDoc(null);
      setActiveAgentDoc(null);
      setShowFlowRunner(false);
      
      const flow = await docFlowKit.getDocument(docId) as FlowDoc | null;
      
      if (!flow) {
        setError(`Error: Flow with ID ${docId} not found`);
        return;
      }
      
      if (flow.docType !== 'Flow') {
        setError(`Error: Document with ID ${docId} is not a Flow`);
        return;
      }
      
      setActiveFlowDoc(flow);
      setStatus(`Flow "${flow.title}" loaded`);
    } catch (error) {
      console.error('Error loading flow:', error);
      setError(`Error loading flow: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Load an agent by ID
  async function loadAgent(docId: string) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Close any active documents
      setActiveDiagramDoc(null);
      setActiveFlowDoc(null);
      setShowFlowRunner(false);
      
      const agent = await docFlowKit.getDocument(docId) as AgentDoc | null;
      
      if (!agent) {
        setError(`Error: Agent with ID ${docId} not found`);
        return;
      }
      
      if (agent.docType !== 'Agent') {
        setError(`Error: Document with ID ${docId} is not an Agent`);
        return;
      }
      
      setActiveAgentDoc(agent);
      setStatus(`Agent "${agent.title}" loaded`);
    } catch (error) {
      console.error('Error loading agent:', error);
      setError(`Error loading agent: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle document updates
  function handleDiagramUpdate(updatedDoc: DiagramDoc) {
    setActiveDiagramDoc(updatedDoc);
    
    // Also update the reference in the project if the title changed
    if (project && updatedDoc.title !== activeDiagramDoc?.title) {
      const updatedDocuments = project.content.documents.map(doc => 
        doc.docId === updatedDoc.docId 
          ? { ...doc, title: updatedDoc.title }
          : doc
      );
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: updatedDocuments
        }
      };
      
      // Save the updated project
      saveProject(updatedProject).catch(error => {
        console.error('Error updating project with new diagram title:', error);
      });
    }
  }

  function handleFlowUpdate(updatedDoc: FlowDoc) {
    setActiveFlowDoc(updatedDoc);
    
    // Also update the reference in the project if the title changed
    if (project && updatedDoc.title !== activeFlowDoc?.title) {
      const updatedDocuments = project.content.documents.map(doc => 
        doc.docId === updatedDoc.docId 
          ? { ...doc, title: updatedDoc.title }
          : doc
      );
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: updatedDocuments
        }
      };
      
      // Save the updated project
      saveProject(updatedProject).catch(error => {
        console.error('Error updating project with new flow title:', error);
      });
    }
  }

  function handleAgentUpdate(updatedDoc: AgentDoc) {
    setActiveAgentDoc(updatedDoc);
    
    // Also update the reference in the project if the title changed
    if (project && updatedDoc.title !== activeAgentDoc?.title) {
      const updatedDocuments = project.content.documents.map(doc => 
        doc.docId === updatedDoc.docId 
          ? { ...doc, title: updatedDoc.title }
          : doc
      );
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: updatedDocuments
        }
      };
      
      // Save the updated project
      saveProject(updatedProject).catch(error => {
        console.error('Error updating project with new agent title:', error);
      });
    }
  }

  // Close active documents
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function closeActiveDiagram() {
    setActiveDiagramDoc(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function closeActiveFlow() {
    setActiveFlowDoc(null);
    setShowFlowRunner(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function closeActiveAgent() {
    setActiveAgentDoc(null);
  }

  // Initialize the app
  useEffect(() => {
    async function initDB() {
      try {
        // Initialize DB if not already
        await docFlowKit.initialize();
        setStatus('Database initialized');
      } catch (err) {
        console.error('Error initializing:', err);
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    initDB();
  }, []);

  // Initialize or create a project when user is loaded
  useEffect(() => {
    if (!currentUser || userLoading) return;
    
    async function initOrCreateProject() {
      try {
        setIsLoading(true);
        
        // If user has projects, load the first one
        if (currentUser && currentUser.projects.length > 0) {
          await loadProject(currentUser.projects[0]);
          return;
        }
        
        // Otherwise create a new project for the user
        if (currentUser) {
          const projectName = `${currentUser.displayName || currentUser.email}'s Project`;
          const projectId = await createNewProject(projectName);
          
          // Update user's projects list in the database
          // Add the project to the user's projects
          const updatedUser = {
            ...currentUser,
            projects: [...currentUser.projects, projectId]
          };
          
          // Update the user document in the database
          const userDoc = {
            docId: currentUser.userId,
            docType: 'User',
            title: `User: ${currentUser.email}`,
            content: updatedUser
          };
          
          await docFlowKit.updateDocument(userDoc);
          console.log(`Created new project ${projectId} for user ${currentUser.userId}`);
        }
      } catch (err) {
        console.error('Error initializing project:', err);
        setError(`Error initializing project: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only run if the user has no projects or if there's no project loaded
    if (!project && (!currentUser.projects || currentUser.projects.length === 0)) {
      initOrCreateProject();
    }
  }, [currentUser, userLoading, loadProject, createNewProject, project]);

  // If user is loading, show loading spinner
  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no user is logged in, show login screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Get the title for the active document
  const getActiveTitle = () => {
    if (activeDiagramDoc) return `Diagram: ${activeDiagramDoc.title}`;
    if (activeFlowDoc) {
      return showFlowRunner ? `Running Flow: ${activeFlowDoc.title}` : `Flow: ${activeFlowDoc.title}`;
    }
    if (activeAgentDoc) return `Agent: ${activeAgentDoc.title}`;
    return 'Project Dashboard';
  };

  // Render content based on active state
  const renderContent = () => {
    // Show loading state
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // Show error message if any
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      );
    }
    
    // Show status message if any
    const statusMessage = status ? (
      <Alert severity="info" sx={{ mb: 3 }} onClose={() => setStatus('')}>
        {status}
      </Alert>
    ) : null;
    
    // Show diagram editor
    if (activeDiagramDoc) {
      return (
        <>
          {statusMessage}
          <DiagramManager
            diagramDoc={activeDiagramDoc}
            onUpdate={handleDiagramUpdate}
          />
        </>
      );
    }
    
    // Show flow editor or runner
    if (activeFlowDoc && project) {
      if (showFlowRunner) {
        return (
          <>
            {statusMessage}
            <FlowRunnerUI 
              flowDoc={activeFlowDoc}
              project={project} 
              onClose={() => setShowFlowRunner(false)}
            />
          </>
        );
      }
      
      return (
        <>
          {statusMessage}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5">Editing Flow: {activeFlowDoc.title}</Typography>
          </Stack>
          <FlowManager
            flowDoc={activeFlowDoc}
            onUpdate={handleFlowUpdate}
            project={project}
          />
        </>
      );
    }
    
    // Show agent editor
    if (activeAgentDoc) {
      return (
        <>
          {statusMessage}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5">Editing Agent: {activeAgentDoc.title}</Typography>
          </Stack>
          <AgentManager
            agentDoc={activeAgentDoc}
            onUpdate={handleAgentUpdate}
          />
        </>
      );
    }
    
    // Show project dashboard
    return (
      <>
        {statusMessage}
        <ProjectDashboard 
          onOpenDiagram={loadDiagram}
          onOpenFlow={loadFlow}
          onOpenAgent={loadAgent}
          onCreateDiagram={createNewDiagram}
          onCreateFlow={createNewFlow}
          onCreateAgent={createNewAgent}
        />
      </>
    );
  };

  return (
    <AppLayout title={getActiveTitle()}>
      {renderContent()}
    </AppLayout>
  );
}

export default App
