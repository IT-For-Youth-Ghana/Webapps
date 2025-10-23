/**
 * Modal composable for managing modal state and interactions
 * Provides consistent modal behavior across the application
 */
import { ref, nextTick, readonly } from 'vue'

export function useModal() {
  const isOpen = ref(false)
  const isClosing = ref(false)

  /**
   * Open modal with optional delay for animation
   */
  const open = async () => {
    isOpen.value = true
    await nextTick()
    document.body.style.overflow = 'hidden'
  }

  /**
   * Close modal with animation
   */
  const close = async () => {
    isClosing.value = true
    
    // Wait for animation to complete
    setTimeout(() => {
      isOpen.value = false
      isClosing.value = false
      document.body.style.overflow = ''
    }, 250) // Animation duration
  }

  /**
   * Toggle modal state
   */
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * Handle escape key press
   */
  const handleEscape = (event) => {
    if (event.key === 'Escape' && isOpen.value) {
      close()
    }
  }

  /**
   * Handle overlay click
   */
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      close()
    }
  }

  return {
    // State
    isOpen: readonly(isOpen),
    isClosing: readonly(isClosing),
    
    // Methods
    open,
    close,
    toggle,
    handleEscape,
    handleOverlayClick
  }
}