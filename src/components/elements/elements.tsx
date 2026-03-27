import type { ReactNode } from 'react'
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
  Text,
  VStack,
  Portal,
} from '@chakra-ui/react'

type ConfirmDeleteDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
}

export const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, title, description }: ConfirmDeleteDialogProps) => (
  <DialogRoot
    open={isOpen}
    modal
    role="alertdialog"
    onOpenChange={(e) => {
      if (!e.open) {
        onClose()
      }
    }}
  >
    <Portal>
      <DialogBackdrop onClick={onClose} />
      <DialogPositioner>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack align="start" gap={2}>
              <Text>{description}</Text>
              <Text fontSize="sm" color="gray.600">
                This action cannot be undone.
              </Text>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </Portal>
  </DialogRoot>
)

export const completionStatusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const
