import type { CanvasElement, PaperSize } from '../types/element'
import { CanvasElementComponent } from './CanvasElement'
import { Trash2 } from 'lucide-react'
import { A4_WIDTH, A4_HEIGHT, A3_WIDTH, A3_HEIGHT } from '../types/element'
import type { A4EditorReturn } from '../hooks/useA4Editor'

interface A4CanvasProps {
  editor: A4EditorReturn
  scale: number
  canvasRef: React.RefObject<HTMLDivElement | null>
  paperSize?: PaperSize
  totalPages?: number
  onDeletePage?: (pageIndex: number) => void
}

export function A4Canvas({ editor, scale, canvasRef, paperSize = 'A4', totalPages = 1, onDeletePage }: A4CanvasProps) {
  const { elements, selectedId, setSelectedId } = editor
  
  const width = paperSize === 'A3' ? A3_WIDTH : A4_WIDTH
  const pageHeight = paperSize === 'A3' ? A3_HEIGHT : A4_HEIGHT

  const canvasHeight = totalPages * pageHeight

  return (
    <div
      style={{
        width,
        height: canvasHeight,
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 4px 32px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
        transformOrigin: 'top center',
      }}
      ref={canvasRef}
      onMouseDown={e => {
        if (e.target === canvasRef.current) setSelectedId(null)
      }}
    >
      {/* Margin guides for each page (subtle) */}
      {Array.from({ length: totalPages }).map((_, i) => (
        <div key={`guide-${i}`} className="hide-on-export" style={{
          position: 'absolute',
          top: i * pageHeight + 47,
          left: 47,
          right: 47,
          height: pageHeight - 94,
          border: '1px dashed #e5e7eb',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      {/* Delete Page Buttons (Top Right Corner of Each Page) */}
      {Array.from({ length: totalPages }).map((_, i) => {
        // Check if there are any elements on this page
        const hasElementsOnPage = elements.some(el => {
          const elCenter = el.y + el.height / 2;
          return elCenter >= i * pageHeight && elCenter < (i + 1) * pageHeight;
        });

        return (
          <div key={`delete-${i}`} className="hide-on-export" style={{
            position: 'absolute',
            top: i * pageHeight + 12, // 12px from top of page
            right: 12,                // 12px from right of page
            zIndex: 60,
            pointerEvents: 'none',
          }}>
            {onDeletePage && (
              <button
                onClick={() => onDeletePage(i)}
                disabled={hasElementsOnPage}
                title={hasElementsOnPage ? "Clear all elements from this page before deleting" : `Delete Page ${i + 1}`}
                className={`p-2 shadow-sm rounded-md pointer-events-auto transition-colors ${
                  hasElementsOnPage 
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200" 
                    : "bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}

      {/* Page break lines */}
      {Array.from({ length: totalPages - 1 }).map((_, i) => (
        <div key={`break-${i}`} className="hide-on-export" style={{
          position: 'absolute',
          top: (i + 1) * pageHeight,
          left: 0,
          right: 0,
          borderTop: '2px dashed #9ca3af',
          pointerEvents: 'none',
          zIndex: 50,
        }} />
      ))}

      {elements.map(el => (
        <CanvasElementComponent
          key={el.id}
          element={el}
          isSelected={selectedId === el.id}
          scale={scale}
          onSelect={setSelectedId}
          editor={editor}
        />
      ))}
    </div>
  )
}