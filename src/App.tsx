import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { SettingsProvider } from './contexts/settings-context'
import { ProjectProvider } from './contexts/project-context'
import { ProjectList } from './components/project-list'
import { ProjectEditor } from './components/dashboard'
import { ErrorBoundary } from './components/error-boundary'
import system from './theme'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/:projectId" element={<ProjectEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export const App = () => {
  return (
    <ChakraProvider value={system}>
      <ErrorBoundary
        fallback={
          <Box p={8} textAlign="center" bg="red.50" borderRadius="md">
            <Box color="red.700" mb={4}>
              The application encountered an unexpected error. Please refresh the page to try again.
            </Box>
            <Box
              as="button"
              onClick={() => window.location.reload()}
              px={4}
              py={2}
              bg="red.500"
              color="white"
              borderRadius="md"
              _hover={{ bg: 'red.600' }}
            >
              Refresh Page
            </Box>
          </Box>
        }
      >
        <BrowserRouter>
          <SettingsProvider>
            <ProjectProvider>
              <AppRoutes />
            </ProjectProvider>
          </SettingsProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ChakraProvider>
  )
}
