import { useEffect, useState, ChangeEvent } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { docFlowKit, useProject, DiagramDoc, DocRef, DiagramManager } from './doc-flow-kit'

function App() {
  const { project, loadProject, saveProject, createNewProject } = useProject()
  const [status, setStatus] = useState<string>('Initializing...')
  const [projectNameInput, setProjectNameInput] = useState<string>('')
  const [activeDiagramDoc, setActiveDiagramDoc] = useState<DiagramDoc | null>(null)
  
  // Handle project name input change
  const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProjectNameInput(e.target.value)
  }
  
  // Handle updating the project name
  const handleUpdateProjectName = async () => {
    if (!project || !projectNameInput) return
    
    // Create a copy of the project with updated name
    const updatedProject = {
      ...project,
      title: projectNameInput,
      content: {
        ...project.content,
        name: projectNameInput
      }
    }
    
    try {
      await saveProject(updatedProject)
      setStatus('Project updated successfully')
    } catch (error) {
      console.error('Error updating project:', error)
      setStatus(`Error updating project: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Handle creating a new project
  const handleCreateProject = async () => {
    if (!projectNameInput) {
      setStatus('Please enter a project name')
      return
    }
    
    try {
      const newProjectId = await createNewProject(projectNameInput)
      setStatus(`New project created with ID: ${newProjectId}`)
      setProjectNameInput('')
    } catch (error) {
      console.error('Error creating project:', error)
      setStatus(`Error creating project: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Create a new diagram and add it to the current project
  async function createNewDiagram() {
    if (!project) {
      setStatus('No project loaded. Cannot create diagram.')
      return
    }
    
    try {
      // 1) Create the DiagramDoc
      const newDiagram: DiagramDoc = {
        docId: crypto.randomUUID(),
        docType: 'Diagram',
        title: 'Untitled Diagram',
        content: {
          nodes: [],
          edges: [],
        },
      }
      await docFlowKit.createDocument(newDiagram)

      // 2) Add reference to project
      const newRef: DocRef = {
        docId: newDiagram.docId,
        docType: 'Diagram',
        title: newDiagram.title,
      }
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: [...project.content.documents, newRef],
        },
      }
      await saveProject(updatedProject)

      setStatus('New Diagram Created & Linked!')
    } catch (error) {
      console.error('Error creating diagram:', error)
      setStatus(`Error creating diagram: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Load a diagram by ID
  async function loadDiagram(docId: string) {
    try {
      const diagram = await docFlowKit.getDocument(docId) as DiagramDoc | null
      
      if (!diagram) {
        setStatus(`Error: Diagram with ID ${docId} not found`)
        return
      }
      
      if (diagram.docType !== 'Diagram') {
        setStatus(`Error: Document with ID ${docId} is not a Diagram`)
        return
      }
      
      setActiveDiagramDoc(diagram)
      setStatus(`Diagram "${diagram.title}" loaded`)
    } catch (error) {
      console.error('Error loading diagram:', error)
      setStatus(`Error loading diagram: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Handle diagram updates
  function handleDiagramUpdate(updatedDoc: DiagramDoc) {
    setActiveDiagramDoc(updatedDoc)
    
    // Also update the reference in the project if the title changed
    if (project && updatedDoc.title !== activeDiagramDoc?.title) {
      const updatedDocuments = project.content.documents.map(doc => 
        doc.docId === updatedDoc.docId 
          ? { ...doc, title: updatedDoc.title }
          : doc
      )
      
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          documents: updatedDocuments
        }
      }
      
      // Save the updated project
      saveProject(updatedProject).catch(error => {
        console.error('Error updating project with new diagram title:', error)
      })
    }
  }

  // Close the active diagram
  function closeActiveDiagram() {
    setActiveDiagramDoc(null)
  }

  useEffect(() => {
    async function initDBAndProject() {
      try {
        // Initialize DB if not already
        await docFlowKit.initialize()
        setStatus('Database initialized')

        // CREATE a dummy project if it doesn't exist
        const testProjectId = 'test-project'
        const existing = await docFlowKit.getDocument(testProjectId)

        if (!existing) {
          await docFlowKit.createDocument({
            docId: testProjectId,
            docType: 'Project',
            title: 'Sample Project',
            content: {
              name: 'My Test Project',
              documents: [],
            },
          })
          setStatus('Test project created')
        } else {
          setStatus('Test project already exists')
        }
        
        // Now load it into the ProjectContext
        await loadProject(testProjectId)
        setStatus('Project loaded successfully')
      } catch (err) {
        console.error('Error initializing:', err)
        setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    
    initDBAndProject()
  }, [loadProject])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WhyBecause Analysis App</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Project Status</h2>
        <p>{status}</p>
        
        {project ? (
          <div>
            <h3>Current Project: {project.content.name}</h3>
            <p>Project ID: {project.docId}</p>
            
            <div style={{ margin: '1rem 0' }}>
              <input
                type="text"
                value={projectNameInput}
                onChange={handleProjectNameChange}
                placeholder="New project name"
                style={{ padding: '0.5rem', marginRight: '0.5rem' }}
              />
              <button 
                onClick={handleUpdateProjectName}
                style={{ padding: '0.5rem 1rem' }}
              >
                Update Project Name
              </button>
            </div>

            <div style={{ margin: '2rem 0' }}>
              <h3>Project Diagrams</h3>
              <button 
                onClick={createNewDiagram}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              >
                + New Diagram
              </button>
              
              {project.content.documents.filter(d => d.docType === 'Diagram').length === 0 ? (
                <p>No diagrams in this project yet. Click "+ New Diagram" to create one.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {project.content.documents
                    .filter(d => d.docType === 'Diagram')
                    .map(docRef => (
                      <li 
                        key={docRef.docId}
                        style={{ 
                          padding: '0.5rem', 
                          border: '1px solid #ddd',
                          marginBottom: '0.5rem',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{docRef.title || 'Untitled Diagram'}</span>
                        <button 
                          onClick={() => loadDiagram(docRef.docId)}
                          style={{ 
                            padding: '0.3rem 0.8rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                          }}
                        >
                          Open
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p>No project loaded.</p>
            <div style={{ margin: '1rem 0' }}>
              <input
                type="text"
                value={projectNameInput}
                onChange={handleProjectNameChange}
                placeholder="New project name"
                style={{ padding: '0.5rem', marginRight: '0.5rem' }}
              />
              <button 
                onClick={handleCreateProject}
                style={{ padding: '0.5rem 1rem' }}
              >
                Create New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {activeDiagramDoc && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Editing Diagram: {activeDiagramDoc.title}</h3>
            <button 
              onClick={closeActiveDiagram}
              style={{ 
                padding: '0.3rem 0.8rem',
                backgroundColor: '#607D8B', 
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Close Diagram
            </button>
          </div>
          <DiagramManager
            diagramDoc={activeDiagramDoc}
            onUpdate={handleDiagramUpdate}
          />
        </div>
      )}
    </>
  )
}

export default App
