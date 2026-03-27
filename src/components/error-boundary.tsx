import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Box p={5} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" textAlign="center">
            <Heading as="h2" size="md" color="red.600" mb={3}>
              Something went wrong
            </Heading>
            <Text color="red.700" mb={4}>
              The component encountered an error and couldn&apos;t render properly.
            </Text>
            <Button onClick={() => this.setState({ hasError: false })} colorScheme="red" size="sm">
              Try Again
            </Button>
          </Box>
        )
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
