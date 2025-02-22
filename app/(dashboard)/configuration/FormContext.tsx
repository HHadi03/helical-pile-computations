"use client"
import { createContext, useContext, useState } from 'react';

type FormEditState = {
  insertSoil: boolean;
  configurePile: boolean;
  editSoil: boolean;
  hasUnsavedChanges: boolean;
  hasCriticalChanges: boolean;
  isTFieldEdited: boolean; 
};

type FormEditContextType = {
  formEditStates: FormEditState;
  setFormEdited: (formName: keyof Omit<FormEditState, 'hasUnsavedChanges' | 'hasCriticalChanges' | 'isTFieldEdited'>, isEdited: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setCriticalChanges: (value: boolean) => void;
  setTFieldEdited: (value: boolean) => void; 
  isAnyFormEdited: boolean;
  hasCriticalChanges: boolean;
  isTFieldEdited: boolean; 
  resetFormStates: () => void;
};

const FormEditContext = createContext<FormEditContextType | undefined>(undefined);

export function FormEditProvider({ children }: { children: React.ReactNode }) {
  const [formEditStates, setFormEditStates] = useState<FormEditState>({
    insertSoil: false,
    configurePile: false,
    editSoil: false,
    hasUnsavedChanges: false,
    hasCriticalChanges: false,
    isTFieldEdited: false
  });

  const setFormEdited = (formName: keyof Omit<FormEditState, 'hasUnsavedChanges' | 'hasCriticalChanges' | 'isTFieldEdited'>, isEdited: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      [formName]: isEdited,
    }));
  };

  const setHasUnsavedChanges = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      hasUnsavedChanges: value
    }));
  };

  const setCriticalChanges = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      hasCriticalChanges: value
    }));
  };

  const setTFieldEdited = (value: boolean) => {
    setFormEditStates(prev => ({
      ...prev,
      isTFieldEdited: value
    }));
  };

  const isAnyFormEdited = formEditStates.hasUnsavedChanges;
  const hasCriticalChanges = formEditStates.hasCriticalChanges;
  const isTFieldEdited = formEditStates.isTFieldEdited;

  const resetFormStates = () => {
    setFormEditStates({
      insertSoil: false,
      configurePile: false,
      editSoil: false,
      hasUnsavedChanges: false,
      hasCriticalChanges: false,
      isTFieldEdited: false
    });
  };

  return (
    <FormEditContext.Provider 
      value={{ 
        formEditStates, 
        setFormEdited,
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
  );
}

export function useFormEdit() {
  const context = useContext(FormEditContext);
  if (context === undefined) {
    throw new Error('useFormEdit must be used within a FormEditProvider');
  }
  return context;
}