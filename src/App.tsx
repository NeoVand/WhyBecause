import { useEffect, useState, ChangeEvent } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { docFlowKit, useProject } from './doc-flow-kit'

function App() {
  const { project, loadProject, saveProject, createNewProject } = useProject()
  const [status, setStatus] = useState<string>('Initializing...')
  const [projectNameInput, setProjectNameInput] = useState<string>('')
  
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
    </>
  )
}

export default App
