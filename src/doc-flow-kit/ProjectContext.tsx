import React, { createContext, useState, useCallback, useContext } from 'react'
import { docFlowKit } from './DocFlowKit'
import { ProjectDoc } from './types'

/**
 * Interface defining what's stored in the ProjectContext
 */
interface ProjectContextValue {
  project: ProjectDoc | null
  loadProject: (projectId: string) => Promise<void>
  saveProject: (updatedProject: ProjectDoc) => Promise<void>
  createNewProject: (name: string) => Promise<string>
  closeProject: () => void
}

/**
 * React context for the currently active project
 */
export const ProjectContext = createContext<ProjectContextValue | null>(null)

/**
 * Provider component for ProjectContext
 */
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<ProjectDoc | null>(null)

  /**
   * Load a project from IndexedDB by ID
   */
  const loadProject = useCallback(async (projectId: string) => {
    const doc = await docFlowKit.getDocument(projectId)
    if (doc && doc.docType === 'Project') {
      // cast to ProjectDoc
      setProject(doc as ProjectDoc)
    } else {
      console.warn(`Document ${projectId} not found or not a Project`)
      setProject(null)
    }
  }, [])

  /**
   * Save updates to the current project
   */
  const saveProject = useCallback(async (updated: ProjectDoc) => {
    await docFlowKit.updateDocument(updated)
    setProject(updated)
  }, [])

  /**
   * Create a new project with a given name
   */
  const createNewProject = useCallback(async (name: string) => {
    const newProject: ProjectDoc = {
      docId: crypto.randomUUID(),
      docType: 'Project',
      title: name,
      content: {
        name,
        documents: [],
      }
    }
    
    await docFlowKit.createDocument(newProject)
    setProject(newProject)
    return newProject.docId
  }, [])

  /**
   * Close the current project
   */
  const closeProject = useCallback(() => {
    setProject(null)
  }, [])

  const value: ProjectContextValue = {
    project,
    loadProject,
    saveProject,
    createNewProject,
    closeProject,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

/**
 * Hook for consuming the ProjectContext
 */
export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) {
    throw new Error('useProject must be used within a <ProjectProvider>')
  }
  return ctx
} 