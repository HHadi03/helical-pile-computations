"use client"
import { createContext, useContext, useState } from 'react'

type FormEditState = {
  hasUnsavedChanges: boolean
  hasCriticalChanges: boolean
  isTFieldEdited: boolean
}

type FormEditContextType = {
  formEditStates: FormEditState
  setHasUnsavedChanges: (value: boolean) => void
  setCriticalChanges: (value: boolean) => void
  setTFieldEdited: (value: boolean) => void
  isAnyFormEdited: boolean
  hasCriticalChanges: boolean
  isTFieldEdited: boolean
  resetFormStates: () => void
}

const FormEditContext = createContext<FormEditContextType | undefined>(undefined)

export function FormContextProvider({ children }: { children: React.ReactNode }) {
  const [formEditStates, setFormEditStates] = useState<FormEditState>({
    hasUnsavedChanges: false,
    hasCriticalChanges: false,
    isTFieldEdited: false
  })

  const setHasUnsavedChanges = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      hasUnsavedChanges: value
    }))
  }

  const setCriticalChanges = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      hasCriticalChanges: value
    }))
  }

  const setTFieldEdited = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      isTFieldEdited: value
    }))
  }

  const isAnyFormEdited = formEditStates.hasUnsavedChanges
  const hasCriticalChanges = formEditStates.hasCriticalChanges
  const isTFieldEdited = formEditStates.isTFieldEdited

  const resetFormStates = () => {
    setFormEditStates({hasUnsavedChanges: false, hasCriticalChanges: false, isTFieldEdited: false})
  }

  return (
    <FormEditContext.Provider 
      value={{ 
        formEditStates, 
        setHasUnsavedChanges,
        setCriticalChanges,
        setTFieldEdited,
        isAnyFormEdited,
        hasCriticalChanges,
        isTFieldEdited,
        resetFormStates 
      }}
    >
      {children}
    </FormEditContext.Provider>
  )
}

export function UseFormContext() {
  const context = useContext(FormEditContext)
  if (context === undefined) {
    throw new Error('UseFormContext must be used within a FormContextProvider')
  }
  return context
}