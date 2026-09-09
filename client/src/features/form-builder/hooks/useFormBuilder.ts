import { useReducer, useCallback } from 'react'
import type { FormSchema, FormSection, FormField } from '../types/schema'
import { createDefaultField, createDefaultSection, generateId } from '../utils/schema'

interface BuilderState {
  schema: FormSchema
  selectedFieldId: string | null
  selectedSectionId: string | null
  history: FormSchema[]
  historyIndex: number
  isDirty: boolean
  isSaving: boolean
}

type Action =
  | { type: 'SET_SCHEMA'; schema: FormSchema }
  | { type: 'ADD_FIELD'; sectionId: string; fieldType: string; index?: number }
  | { type: 'REMOVE_FIELD'; sectionId: string; fieldId: string }
  | { type: 'UPDATE_FIELD'; sectionId: string; fieldId: string; updates: Partial<FormField> }
  | { type: 'MOVE_FIELD'; fromSection: string; toSection: string; fromIndex: number; toIndex: number }
  | { type: 'DUPLICATE_FIELD'; sectionId: string; fieldId: string }
  | { type: 'SELECT_FIELD'; fieldId: string | null }
  | { type: 'SELECT_SECTION'; sectionId: string | null }
  | { type: 'ADD_SECTION' }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<FormSection> }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SCHEMA_SETTINGS'; updates: Partial<FormSchema> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'MARK_CLEAN' }

const MAX_HISTORY = 50

function pushHistory(state: BuilderState): BuilderState {
  const history = state.history.slice(0, state.historyIndex + 1)
  history.push(state.schema)
  if (history.length > MAX_HISTORY) history.shift()
  return { ...state, history, historyIndex: history.length - 1 }
}

function builderReducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'SET_SCHEMA':
      return {
        ...state,
        schema: action.schema,
        isDirty: false,
        history: [action.schema],
        historyIndex: 0,
      }

    case 'ADD_FIELD': {
      const newField = createDefaultField(action.fieldType)
      const sections = state.schema.sections.map(s =>
        s.id === action.sectionId
          ? {
              ...s,
              fields:
                action.index !== undefined
                  ? [...s.fields.slice(0, action.index), newField, ...s.fields.slice(action.index)]
                  : [...s.fields, newField],
            }
          : s
      )
      const newSchema = { ...state.schema, sections }
      return pushHistory({ ...state, schema: newSchema, selectedFieldId: newField.id, isDirty: true })
    }

    case 'REMOVE_FIELD': {
      const sections = state.schema.sections.map(s =>
        s.id === action.sectionId
          ? { ...s, fields: s.fields.filter(f => f.id !== action.fieldId) }
          : s
      )
      return pushHistory({
        ...state,
        schema: { ...state.schema, sections },
        selectedFieldId: null,
        isDirty: true,
      })
    }

    case 'UPDATE_FIELD': {
      const sections = state.schema.sections.map(s =>
        s.id === action.sectionId
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.id === action.fieldId ? { ...f, ...action.updates } : f
              ),
            }
          : s
      )
      return pushHistory({ ...state, schema: { ...state.schema, sections }, isDirty: true })
    }

    case 'MOVE_FIELD': {
      const sections = state.schema.sections.map(s => ({ ...s, fields: [...s.fields] }))
      const fromSec = sections.find(s => s.id === action.fromSection)
      const toSec = sections.find(s => s.id === action.toSection)
      if (!fromSec || !toSec) return state
      const [movedField] = fromSec.fields.splice(action.fromIndex, 1)
      toSec.fields.splice(action.toIndex, 0, movedField)
      return pushHistory({ ...state, schema: { ...state.schema, sections }, isDirty: true })
    }

    case 'DUPLICATE_FIELD': {
      const sections = state.schema.sections.map(s => {
        if (s.id !== action.sectionId) return s
        const idx = s.fields.findIndex(f => f.id === action.fieldId)
        if (idx === -1) return s
        const orig = s.fields[idx]
        const newId = generateId('field')
        const copy: FormField = { ...orig, id: newId, name: newId }
        const fields = [...s.fields.slice(0, idx + 1), copy, ...s.fields.slice(idx + 1)]
        return { ...s, fields }
      })
      return pushHistory({ ...state, schema: { ...state.schema, sections }, isDirty: true })
    }

    case 'ADD_SECTION': {
      const newSection = createDefaultSection()
      const sections = [...state.schema.sections, newSection]
      return pushHistory({
        ...state,
        schema: { ...state.schema, sections },
        selectedSectionId: newSection.id,
        isDirty: true,
      })
    }

    case 'UPDATE_SECTION': {
      const sections = state.schema.sections.map(s =>
        s.id === action.sectionId ? { ...s, ...action.updates } : s
      )
      return pushHistory({ ...state, schema: { ...state.schema, sections }, isDirty: true })
    }

    case 'REMOVE_SECTION': {
      const sections = state.schema.sections.filter(s => s.id !== action.sectionId)
      return pushHistory({ ...state, schema: { ...state.schema, sections }, isDirty: true })
    }

    case 'UPDATE_SCHEMA_SETTINGS': {
      const newSchema = { ...state.schema, ...action.updates }
      return pushHistory({ ...state, schema: newSchema, isDirty: true })
    }

    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.fieldId, selectedSectionId: null }

    case 'SELECT_SECTION':
      return { ...state, selectedSectionId: action.sectionId, selectedFieldId: null }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state
      const historyIndex = state.historyIndex - 1
      return { ...state, schema: state.history[historyIndex], historyIndex, isDirty: true }
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state
      const historyIndex = state.historyIndex + 1
      return { ...state, schema: state.history[historyIndex], historyIndex, isDirty: true }
    }

    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }

    case 'MARK_CLEAN':
      return { ...state, isDirty: false }

    default:
      return state
  }
}

export function useFormBuilder(initialSchema?: FormSchema) {
  const defaultSchema: FormSchema = {
    id: '',
    version: 1,
    title: '',
    settings: { submitButtonText: 'Submit' },
    sections: [],
    logic: [],
  }

  const [state, dispatch] = useReducer(builderReducer, {
    schema: initialSchema ?? defaultSchema,
    selectedFieldId: null,
    selectedSectionId: null,
    history: initialSchema ? [initialSchema] : [],
    historyIndex: 0,
    isDirty: false,
    isSaving: false,
  })

  const setSchema = useCallback((schema: FormSchema) =>
    dispatch({ type: 'SET_SCHEMA', schema }), [])

  const addField = useCallback((sectionId: string, fieldType: string, index?: number) =>
    dispatch({ type: 'ADD_FIELD', sectionId, fieldType, index }), [])

  const removeField = useCallback((sectionId: string, fieldId: string) =>
    dispatch({ type: 'REMOVE_FIELD', sectionId, fieldId }), [])

  const updateField = useCallback((sectionId: string, fieldId: string, updates: Partial<FormField>) =>
    dispatch({ type: 'UPDATE_FIELD', sectionId, fieldId, updates }), [])

  const moveField = useCallback((fromSection: string, toSection: string, fromIndex: number, toIndex: number) =>
    dispatch({ type: 'MOVE_FIELD', fromSection, toSection, fromIndex, toIndex }), [])

  const duplicateField = useCallback((sectionId: string, fieldId: string) =>
    dispatch({ type: 'DUPLICATE_FIELD', sectionId, fieldId }), [])

  const selectField = useCallback((fieldId: string | null) =>
    dispatch({ type: 'SELECT_FIELD', fieldId }), [])

  const selectSection = useCallback((sectionId: string | null) =>
    dispatch({ type: 'SELECT_SECTION', sectionId }), [])

  const addSection = useCallback(() => dispatch({ type: 'ADD_SECTION' }), [])

  const updateSection = useCallback((sectionId: string, updates: Partial<FormSection>) =>
    dispatch({ type: 'UPDATE_SECTION', sectionId, updates }), [])

  const removeSection = useCallback((sectionId: string) =>
    dispatch({ type: 'REMOVE_SECTION', sectionId }), [])

  const updateSchemaSettings = useCallback((updates: Partial<FormSchema>) =>
    dispatch({ type: 'UPDATE_SCHEMA_SETTINGS', updates }), [])

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])

  const setSaving = useCallback((isSaving: boolean) =>
    dispatch({ type: 'SET_SAVING', isSaving }), [])

  const markClean = useCallback(() => dispatch({ type: 'MARK_CLEAN' }), [])

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.history.length - 1

  let selectedField: FormField | null = null
  let selectedFieldSectionId: string | null = null
  if (state.selectedFieldId) {
    for (const section of state.schema.sections) {
      const field = section.fields.find(f => f.id === state.selectedFieldId)
      if (field) {
        selectedField = field
        selectedFieldSectionId = section.id
        break
      }
    }
  }

  return {
    ...state,
    selectedField,
    selectedFieldSectionId,
    canUndo,
    canRedo,
    setSchema,
    addField,
    removeField,
    updateField,
    moveField,
    duplicateField,
    selectField,
    selectSection,
    addSection,
    updateSection,
    removeSection,
    updateSchemaSettings,
    undo,
    redo,
    setSaving,
    markClean,
  }
}