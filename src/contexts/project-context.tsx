import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Project, ProjectData } from '../types'
import * as storage from '../lib/local-storage'

type ProjectContextType = {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  loadProjects: () => void
  loadProject: (id: string) => void
  createProject: (name: string) => Project
  saveProject: (data: ProjectData) => void
  updateProjectName: (name: string) => void
  deleteProject: (id: string) => void
  clearCurrentProject: () => void
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects())
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)

  const loadProjects = useCallback(() => {
    setProjects(storage.getProjects())
  }, [])

  const loadProject = useCallback((id: string) => {
    setLoading(true)
    const project = storage.getProject(id)
    setCurrentProject(project)
    setLoading(false)
  }, [])

  const createProject = useCallback(
    (name: string): Project => {
      const now = new Date().toISOString()
      const project: Project = {
        id: crypto.randomUUID(),
        name,
        createdAt: now,
        updatedAt: now,
        data: {
          routeLine: [],
          annotations: [],
          metadata: {
            routeLength: 0,
            difficulty: 0,
            completionStatus: 'not_started',
          },
        },
      }
      storage.saveProject(project)
      setProjects(storage.getProjects())
      return project
    },
    []
  )

  const saveProjectData = useCallback(
    (data: ProjectData) => {
      if (!currentProject) {
        return
      }
      const updated = { ...currentProject, data, updatedAt: new Date().toISOString() }
      storage.saveProject(updated)
      setCurrentProject(updated)
      setProjects(storage.getProjects())
    },
    [currentProject]
  )

  const updateProjectName = useCallback(
    (name: string) => {
      if (!currentProject) {
        return
      }
      const updated = { ...currentProject, name, updatedAt: new Date().toISOString() }
      storage.saveProject(updated)
      setCurrentProject(updated)
      setProjects(storage.getProjects())
    },
    [currentProject]
  )

  const deleteProjectById = useCallback((id: string) => {
    storage.deleteProject(id)
    setProjects(storage.getProjects())
    setCurrentProject((prev) => (prev?.id === id ? null : prev))
  }, [])

  const clearCurrentProject = useCallback(() => {
    setCurrentProject(null)
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        loadProjects,
        loadProject,
        createProject,
        saveProject: saveProjectData,
        updateProjectName,
        deleteProject: deleteProjectById,
        clearCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
