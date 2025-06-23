"use client"
import { createContext, useContext, useState } from 'react'

type FormEditState = {
  hasUncalculatedChanges: boolean
  hasCriticalChanges: boolean
  isTFieldEdited: boolean
}

type FormEditContextType = {
  formEditStates: FormEditState
  sethasUncalculatedChanges: (value: boolean) => void
  setCriticalChanges: (value: boolean) => void
  setTFieldEdited: (value: boolean) => void
  isAnyFormEdited: boolean
  hasCriticalChanges: boolean
  isTFieldEdited: boolean
  resetFormStates: () => void
}

const FormEditContext = createContext<FormEditContextType | undefined>(undefined)

export function FormContextProvider({ children }: { children: React.ReactNode }) {
  const [formEditStates, setFormEditStates] = useState<FormEditState>({hasUncalculatedChanges: false, hasCriticalChanges: false, isTFieldEdited: false})

  const sethasUncalculatedChanges = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      hasUncalculatedChanges: value
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

  const isAnyFormEdited = formEditStates.hasUncalculatedChanges
  const hasCriticalChanges = formEditStates.hasCriticalChanges
  const isTFieldEdited = formEditStates.isTFieldEdited

  const resetFormStates = () => {setFormEditStates({hasUncalculatedChanges: false, hasCriticalChanges: false, isTFieldEdited: false})}

  return (
    <FormEditContext.Provider 
      value={{ 
        formEditStates, 
        sethasUncalculatedChanges,
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