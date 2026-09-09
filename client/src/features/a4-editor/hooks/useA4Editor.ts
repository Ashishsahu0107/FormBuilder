import { useState, useCallback, useRef } from 'react'
import { nanoid } from 'nanoid'
import type { CanvasElement, ElementType, ElementStyle } from '../types/element'
import { DEFAULT_STYLE, A4_WIDTH, A4_HEIGHT, A4_PADDING } from '../types/element'
import type { FieldLibraryItem } from '../constants/field-types'

const MAX_HISTORY = 50

export function useA4Editor(initialElements: CanvasElement[] = []) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<CanvasElement[][]>([initialElements])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedoRef = useRef(false)

  const pushHistory = useCallback((newElements: CanvasElement[]) => {
    if (isUndoRedoRef.current) return
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1)
      const next = [...sliced, newElements].slice(-MAX_HISTORY)
      return next
    })
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [historyIndex])

  const updateElements = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements)
    pushHistory(newElements)
  }, [pushHistory])

  const undo = useCallback(() => {
    setHistory(prev => {
      const idx = Math.max(historyIndex - 1, 0)
      isUndoRedoRef.current = true
      setHistoryIndex(idx)
      setElements(prev[idx] || [])
      setTimeout(() => { isUndoRedoRef.current = false }, 0)
      return prev
    })
  }, [historyIndex])

  const redo = useCallback(() => {
    setHistory(prev => {
      const idx = Math.min(historyIndex + 1, prev.length - 1)
      isUndoRedoRef.current = true
      setHistoryIndex(idx)
      setElements(prev[idx] || [])
      setTimeout(() => { isUndoRedoRef.current = false }, 0)
      return prev
    })
  }, [historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const addElement = useCallback((item: FieldLibraryItem) => {
    const centerX = (A4_WIDTH - item.defaultWidth) / 2
    const newElement: CanvasElement = {
      id: nanoid(8),
      type: item.type,
      x: Math.max(A4_PADDING, centerX),
      y: A4_PADDING + elements.length * 20 + 20,
      width: item.defaultWidth,
      height: item.defaultHeight,
      content: item.defaultContent,
      label: item.defaultContent,
      style: {
        ...DEFAULT_STYLE,
        ...(item.type === 'heading' ? { fontSize: 28, fontWeight: 'bold' as const, textAlign: 'center' as const } : {}),
        ...(item.type === 'subheading' ? { fontSize: 16, fontWeight: 'bold' as const } : {}),
        ...(item.type === 'paragraph' ? { fontSize: 12, color: '#4b5563' } : {}),
      },
    }
    const updated = [...elements, newElement]
    updateElements(updated)
    setSelectedId(newElement.id)
    return newElement
  }, [elements, updateElements])

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const updated = elements.map(el => el.id === id ? { ...el, ...updates } : el)
    updateElements(updated)
  }, [elements, updateElements])

  const updateElementStyle = useCallback((id: string, styleUpdates: Partial<ElementStyle>) => {
    const updated = elements.map(el =>
      el.id === id ? { ...el, style: { ...el.style, ...styleUpdates } } : el
    )
    updateElements(updated)
  }, [elements, updateElements])

  const moveElement = useCallback((id: string, x: number, y: number) => {
    // Clamp to A4 bounds
    const el = elements.find(e => e.id === id)
    if (!el) return
    const clampedX = Math.max(0, Math.min(x, A4_WIDTH - el.width))
    const clampedY = Math.max(0, Math.min(y, A4_HEIGHT - el.height))
    setElements(prev => prev.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY } : e))
  }, [elements])

  const commitMove = useCallback((id: string, x: number, y: number) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const clampedX = Math.max(0, Math.min(x, A4_WIDTH - el.width))
    const clampedY = Math.max(0, Math.min(y, A4_HEIGHT - el.height))
    const updated = elements.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY } : e)
    updateElements(updated)
  }, [elements, updateElements])

  const resizeElement = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    const clampedX = Math.max(0, x)
    const clampedY = Math.max(0, y)
    const clampedW = Math.max(60, Math.min(width, A4_WIDTH - clampedX))
    const clampedH = Math.max(24, Math.min(height, A4_HEIGHT - clampedY))
    setElements(prev => prev.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY, width: clampedW, height: clampedH } : e))
  }, [])

  const commitResize = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    const clampedX = Math.max(0, x)
    const clampedY = Math.max(0, y)
    const clampedW = Math.max(60, Math.min(width, A4_WIDTH - clampedX))
    const clampedH = Math.max(24, Math.min(height, A4_HEIGHT - clampedY))
    const updated = elements.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY, width: clampedW, height: clampedH } : e)
    updateElements(updated)
  }, [elements, updateElements])

  const deleteElement = useCallback((id: string) => {
    const updated = elements.filter(e => e.id !== id)
    updateElements(updated)
    if (selectedId === id) setSelectedId(null)
  }, [elements, selectedId, updateElements])

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const copy: CanvasElement = {
      ...el,
      id: nanoid(8),
      x: Math.min(el.x + 20, A4_WIDTH - el.width),
      y: Math.min(el.y + 20, A4_HEIGHT - el.height),
    }
    const updated = [...elements, copy]
    updateElements(updated)
    setSelectedId(copy.id)
  }, [elements, updateElements])

  const bringToFront = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const updated = [...elements.filter(e => e.id !== id), el]
    updateElements(updated)
  }, [elements, updateElements])

  const sendToBack = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const updated = [el, ...elements.filter(e => e.id !== id)]
    updateElements(updated)
  }, [elements, updateElements])

  const loadTemplate = useCallback((templateElements: CanvasElement[]) => {
    const withIds = templateElements.map(el => ({ ...el, id: nanoid(8) }))
    setElements(withIds)
    setHistory([withIds])
    setHistoryIndex(0)
    setSelectedId(null)
  }, [])

  const selectedElement = elements.find(e => e.id === selectedId) ?? null

  return {
    elements,
    selectedId,
    selectedElement,
    setSelectedId,
    addElement,
    updateElement,
    updateElementStyle,
    moveElement,
    commitMove,
    resizeElement,
    commitResize,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    loadTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}

export type A4EditorReturn = ReturnType<typeof useA4Editor>