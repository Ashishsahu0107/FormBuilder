import { useState, useCallback, useRef } from 'react'
import { nanoid } from 'nanoid'
import type { CanvasElement, ElementStyle } from '../types/element'
import { DEFAULT_STYLE, A4_WIDTH, A4_HEIGHT, A4_PADDING, A3_WIDTH, A3_HEIGHT } from '../types/element'
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
    
    // Find the lowest point of existing elements to avoid overlap
    let maxY = A4_PADDING;
    elements.forEach(el => {
      const bottom = el.y + el.height;
      if (bottom > maxY) maxY = bottom;
    });
    const safeY = maxY + 15; // Add a 15px gap below the lowest element

    const newElement: CanvasElement = {
      id: nanoid(8),
      type: item.type,
      x: Math.max(A4_PADDING, centerX),
      y: safeY,
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

  const moveElement = useCallback((id: string, x: number, y: number, paperSize: 'A4' | 'A3' = 'A4') => {
    const el = elements.find(e => e.id === id)
    if (!el) return

    const pageHeight = paperSize === 'A3' ? A3_HEIGHT : A4_HEIGHT;
    const pageWidth = paperSize === 'A3' ? A3_WIDTH : A4_WIDTH;

    // Clamp X to side margins (padding)
    const clampedX = Math.max(A4_PADDING, Math.min(x, pageWidth - A4_PADDING - el.width))
    
    // Determine which page the element is being dragged on based on its Y coordinate
    // We use the center of the element to determine the active page for smoother transitions
    const elementCenterY = y + (el.height / 2);
    const pageIndex = Math.max(0, Math.floor(elementCenterY / pageHeight));
    
    // Clamp Y to the top and bottom margins of the CURRENT page
    const pageTopMargin = pageIndex * pageHeight + A4_PADDING;
    const pageBottomMargin = (pageIndex + 1) * pageHeight - A4_PADDING - el.height;
    
    const clampedY = Math.max(pageTopMargin, Math.min(y, pageBottomMargin));

    setElements(prev => prev.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY } : e))
  }, [elements])

  const commitMove = useCallback((id: string, x: number, y: number, paperSize: 'A4' | 'A3' = 'A4') => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const pageHeight = paperSize === 'A3' ? A3_HEIGHT : A4_HEIGHT;
    const pageWidth = paperSize === 'A3' ? A3_WIDTH : A4_WIDTH;

    const clampedX = Math.max(A4_PADDING, Math.min(x, pageWidth - A4_PADDING - el.width))
    const elementCenterY = y + (el.height / 2);
    const pageIndex = Math.max(0, Math.floor(elementCenterY / pageHeight));
    const pageTopMargin = pageIndex * pageHeight + A4_PADDING;
    const pageBottomMargin = (pageIndex + 1) * pageHeight - A4_PADDING - el.height;
    const clampedY = Math.max(pageTopMargin, Math.min(y, pageBottomMargin));

    const updated = elements.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY } : e)
    updateElements(updated)
  }, [elements, updateElements])

  const resizeElement = useCallback((id: string, x: number, y: number, width: number, height: number, paperSize: 'A4' | 'A3' = 'A4') => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const pageHeight = paperSize === 'A3' ? A3_HEIGHT : A4_HEIGHT;
    const pageWidth = paperSize === 'A3' ? A3_WIDTH : A4_WIDTH;

    const clampedX = Math.max(A4_PADDING, x)
    const elementCenterY = y + (height / 2);
    const pageIndex = Math.max(0, Math.floor(elementCenterY / pageHeight));
    const pageTopMargin = pageIndex * pageHeight + A4_PADDING;
    const pageBottomMargin = (pageIndex + 1) * pageHeight - A4_PADDING - height;
    
    // Ensure height doesn't exceed printable area
    const maxPrintableHeight = pageHeight - (A4_PADDING * 2);
    const clampedH = Math.max(24, Math.min(height, maxPrintableHeight))
    const clampedW = Math.max(60, Math.min(width, pageWidth - A4_PADDING - clampedX))
    const clampedY = Math.max(pageTopMargin, Math.min(y, pageBottomMargin))

    setElements(prev => prev.map(e => e.id === id ? { ...e, x: clampedX, y: clampedY, width: clampedW, height: clampedH } : e))
  }, [elements])

  const commitResize = useCallback((id: string, x: number, y: number, width: number, height: number, paperSize: 'A4' | 'A3' = 'A4') => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const pageHeight = paperSize === 'A3' ? A3_HEIGHT : A4_HEIGHT;
    const pageWidth = paperSize === 'A3' ? A3_WIDTH : A4_WIDTH;

    const clampedX = Math.max(A4_PADDING, x)
    const elementCenterY = y + (height / 2);
    const pageIndex = Math.max(0, Math.floor(elementCenterY / pageHeight));
    const pageTopMargin = pageIndex * pageHeight + A4_PADDING;
    const pageBottomMargin = (pageIndex + 1) * pageHeight - A4_PADDING - height;
    
    const maxPrintableHeight = pageHeight - (A4_PADDING * 2);
    const clampedH = Math.max(24, Math.min(height, maxPrintableHeight))
    const clampedW = Math.max(60, Math.min(width, pageWidth - A4_PADDING - clampedX))
    const clampedY = Math.max(pageTopMargin, Math.min(y, pageBottomMargin))

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

  const deletePageContent = useCallback((pageIndex: number, paperSize: 'A4' | 'A3' = 'A4') => {
    const pageHeight = paperSize === 'A3' ? A3_HEIGHT : A4_HEIGHT;
    const pageTop = pageIndex * pageHeight;
    const pageBottom = (pageIndex + 1) * pageHeight;
    
    // Elements to keep: those NOT on the deleted page
    const remainingElements = elements.filter(el => {
      const elCenter = el.y + el.height / 2;
      return elCenter < pageTop || elCenter > pageBottom;
    });

    // Shift elements below the deleted page UP by pageHeight
    const shiftedElements = remainingElements.map(el => {
      const elCenter = el.y + el.height / 2;
      if (elCenter > pageBottom) {
        return { ...el, y: el.y - pageHeight };
      }
      return el;
    });

    updateElements(shiftedElements);
  }, [elements, updateElements]);

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
    deletePageContent,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}

export type A4EditorReturn = ReturnType<typeof useA4Editor>