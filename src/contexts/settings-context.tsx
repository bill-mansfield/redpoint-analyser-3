import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Settings, ClimberGradeProfile } from '../types'
import type { GradingSystemId } from '../types/grades'
import * as storage from '../lib/local-storage'

type SettingsContextType = {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  updateGradeProfile: (profile: ClimberGradeProfile) => void
  updatePreferredGradingSystem: (system: GradingSystemId) => void
  updatePreferredBoulderGradingSystem: (system: GradingSystemId) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings())

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      storage.saveSettings(next)
      return next
    })
  }, [])

  const updateGradeProfile = useCallback((profile: ClimberGradeProfile) => {
    setSettings((prev) => {
      const next = { ...prev, gradeProfile: profile }
      storage.saveSettings(next)
      return next
    })
  }, [])

  const updatePreferredGradingSystem = useCallback((system: GradingSystemId) => {
    updateSettings({ preferredGradingSystem: system })
  }, [updateSettings])

  const updatePreferredBoulderGradingSystem = useCallback((system: GradingSystemId) => {
    updateSettings({ preferredBoulderGradingSystem: system })
  }, [updateSettings])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateGradeProfile,
        updatePreferredGradingSystem,
        updatePreferredBoulderGradingSystem,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
