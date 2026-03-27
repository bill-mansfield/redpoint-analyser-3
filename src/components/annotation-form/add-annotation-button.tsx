import { useEffect, useRef } from 'react'
import { Portal, Box, Button } from '@chakra-ui/react'

type AddAnnotationButtonProps = {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  onAddAnnotation: () => void
}

export const AddAnnotationButton = ({ isOpen, position, onClose, onAddAnnotation }: AddAnnotationButtonProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('keydown', handleEscapeKey, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('keydown', handleEscapeKey, true)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <Portal>
      <Box
        ref={menuRef}
        data-testid="context-menu"
        position="fixed"
        left={`${position.x}px`}
        top={`${position.y}px`}
        zIndex="popover"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        shadow="lg"
        minW="140px"
        py={1}
        tabIndex={-1}
      >
        <Button
          variant="ghost"
          size="sm"
          w="full"
          justifyContent="flex-start"
          px={3}
          py={2}
          fontSize="sm"
          fontWeight="normal"
          color="gray.700"
          onClick={() => {
            onAddAnnotation()
            onClose()
          }}
          _hover={{ bg: 'gray.100', color: 'gray.900' }}
          _active={{ bg: 'gray.200' }}
          borderRadius="sm"
        >
          Add Annotation
        </Button>
      </Box>
    </Portal>
  )
}
