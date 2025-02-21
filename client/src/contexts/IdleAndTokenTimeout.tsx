import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useIdleTimer } from '../hooks/useIdleTimer'
import { IDLE_TIMEOUT } from '../constants'
import { useLocation } from 'react-router-dom' // Import useLocation to get current route
import AlertModal from '../components/AlertModal/AlertModal'
import { translate } from '../utils/translationUtil'
import { useLanguage } from './LanguageContext'

interface IdleContextType {
  isIdleModalOpen: boolean
  setIsIdleModalOpen: (open: boolean) => void
  handleNonActiveConfirm: () => void
}

const IdleContext = createContext<IdleContextType | undefined>(undefined)

export const IdleProvider = ({ children }: { children: ReactNode }) => {
  const [isNonActiveOpen, setIsNonActiveOpen] = useState(false)
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false)
  const location = useLocation() // Get the current route
  const onIdle = () => {}
  const { language, setLanguage } = useLanguage()

  // Check if the current route is the login screen
  const isLoginPage = location.pathname === '/login'

  // Only activate the idle timer if not on the login page
  const { isIdle, handleNonActiveConfirm } = useIdleTimer(onIdle, IDLE_TIMEOUT)

    useEffect(() => {

    if (!isLoginPage) {
      // If not on the login page, handle idle state and modal
      if (isIdle) {
        setIsIdleModalOpen(true)
        setIsNonActiveOpen(true)
      } else {
        setIsIdleModalOpen(false)
        setIsNonActiveOpen(false)
      }
    }
  }, [isIdle, isLoginPage])

  return (
    <IdleContext.Provider value={{ isIdleModalOpen, setIsIdleModalOpen, handleNonActiveConfirm }}>
      {children}
      {isNonActiveOpen && !isLoginPage && (
        <AlertModal
          isOpen={isNonActiveOpen}
          onConfirm={handleNonActiveConfirm}
          onCancel={() => setIsNonActiveOpen(false)}
          message={translate('nonActiveMessage', language)}
        />
      )}
    </IdleContext.Provider>
  )
}

export const useIdle = () => {
  const context = useContext(IdleContext)
  if (!context) {
    throw new Error('useIdle must be used within an IdleProvider')
  }
  return context
}
