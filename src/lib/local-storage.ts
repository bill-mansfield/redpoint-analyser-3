import type { Project, Settings } from '../types'
import { DEFAULT_GRADING_SYSTEM, DEFAULT_BOULDER_GRADING_SYSTEM } from '../utils/grades'

const PROJECTS_KEY = 'redpoint-projects'
const SETTINGS_KEY = 'redpoint-settings'

const defaultSettings: Settings = {
  preferredGradingSystem: DEFAULT_GRADING_SYSTEM,
  preferredBoulderGradingSystem: DEFAULT_BOULDER_GRADING_SYSTEM,
  gradeProfile: {
    sport: {},
    boulder: {},
  },
}

export const getProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) {
      return []
    }
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

export const getProject = (id: string): Project | null => {
  const projects = getProjects()
  return projects.find((p) => p.id === id) ?? null
}

export const saveProject = (project: Project): void => {
  const projects = getProjects()
  const index = projects.findIndex((p) => p.id === project.id)
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() }
  } else {
    projects.push(project)
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter((p) => p.id !== id)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export const getSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) {
      return defaultSettings
    }
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return defaultSettings
  }
}

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
