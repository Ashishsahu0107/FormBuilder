import { useRef, useState, useCallback, useEffect } from "react";
import type { CanvasElement } from "../types/element";
import type { A4EditorReturn } from "../hooks/useA4Editor";

type ResizeDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

interface CanvasElementProps {
  element: CanvasElement;
  isSelected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  editor: A4EditorReturn;
  isPreview?: boolean;
}

const HANDLE_SIZE = 8;

const RESIZE_HANDLES: { dir: ResizeDirection; style: React.CSSProperties }[] = [
  {
    dir: "n",
    style: {
      top: -HANDLE_SIZE / 2,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "n-resize",
    },
  },
  {
    dir: "ne",
    style: {
      top: -HANDLE_SIZE / 2,
      right: -HANDLE_SIZE / 2,
      cursor: "ne-resize",
    },
  },
  {
    dir: "e",
    style: {
      top: "50%",
      right: -HANDLE_SIZE / 2,
      transform: "translateY(-50%)",
      cursor: "e-resize",
    },
  },
  {
    dir: "se",
    style: {
      bottom: -HANDLE_SIZE / 2,
      right: -HANDLE_SIZE / 2,
      cursor: "se-resize",
    },
  },
  {
    dir: "s",
    style: {
      bottom: -HANDLE_SIZE / 2,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "s-resize",
    },
  },
  {
    dir: "sw",
    style: {
      bottom: -HANDLE_SIZE / 2,
      left: -HANDLE_SIZE / 2,
      cursor: "sw-resize",
    },
  },
  {
    dir: "w",
    style: {
      top: "50%",
      left: -HANDLE_SIZE / 2,
      transform: "translateY(-50%)",
      cursor: "w-resize",
    },
  },
  {
    dir: "nw",
    style: {
      top: -HANDLE_SIZE / 2,
      left: -HANDLE_SIZE / 2,
      cursor: "nw-resize",
    },
  },
];

function ElementContentRenderer({
  element,
  isEditing,
  editRef,
  handleEditBlur,
  editor
}: {
  element: CanvasElement,
  isEditing: boolean,
  editRef: React.RefObject<HTMLDivElement | null>,
  handleEditBlur: () => void,
  editor: any
}) {
  const s = element.style;
  const textStyle: React.CSSProperties = {
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    fontFamily: s.fontFamily,
    color: s.color,
    textAlign: s.textAlign,
    fontStyle: s.italic ? "italic" : "normal",
    textDecoration: s.underline ? "underline" : "none",
    letterSpacing: s.letterSpacing,
    lineHeight: s.lineHeight,
    width: "100%",
    height: "100%",
    padding: `${s.paddingY || 0}px ${s.paddingX || 0}px`,
    boxSizing: "border-box",
  };

  if (
    element.type === "heading" ||
    element.type === "subheading" ||
    element.type === "paragraph"
  ) {
    if (isEditing) {
      return (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          style={{ ...textStyle, outline: "none", whiteSpace: "pre-wrap" }}
          onBlur={handleEditBlur}
        />
      );
    }
    return (
      <div style={{ ...textStyle, pointerEvents: "none" }}>
        {element.content}
      </div>
    );
  }

  if (element.type === "field_divider") {
    return (
      <div
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: s.borderColor || "#d1d5db",
        }}
      />
    );
  }

  if (element.type === "field_checkbox") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          ...textStyle,
          height: "100%",
        }}
      >
        <input
          type="checkbox"
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            cursor: "pointer",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <span style={{ fontSize: s.fontSize, color: s.color }}>
          {element.content}
        </span>
      </div>
    );
  }

  if (element.type === "field_signature") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            fontSize: s.fontSize - 2,
            color: "#9ca3af",
            marginBottom: 4,
          }}
        >
          {element.label || element.content}
        </div>
        <div
          style={{
            borderBottom: `1.5px solid ${s.borderColor || "#374151"}`,
            width: "100%",
            height: "60%",
          }}
        />
      </div>
    );
  }

  if (element.type === "field_image_placeholder") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          border: `2px dashed ${s.borderColor || "#d1d5db"}`,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: s.bgColor !== "transparent" ? s.bgColor : "#f9fafb",
          color: "#9ca3af",
          fontSize: 12,
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 24 }}>Ã°Å¸â€“Â¼</span>
        <span>{element.content}</span>
      </div>
    );
  }

  if (element.type === "field_dropdown") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 4,
        }}
      >
        <label
          style={{
            fontSize: s.fontSize - 2,
            color: "#374151",
            fontWeight: "bold",
          }}
        >
          {element.label || element.content}
        </label>
        <select
          style={{
            width: "100%",
            border: `${s.borderWidth}px solid ${s.borderColor}`,
            borderRadius: 4,
            padding: "6px 10px",
            backgroundColor: "#ffffff",
            fontSize: s.fontSize - 1,
            color: "#374151",
            outline: "none",
            fontFamily: s.fontFamily,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <option>Select...</option>
        </select>
      </div>
    );
  }

  // All other input fields
  const isTextArea =
    element.type === "field_textarea" || element.type === "field_address";
  
  const commonInputStyle: React.CSSProperties = {
    width: "100%",
    flex: isTextArea ? 1 : "none",
    height: isTextArea ? undefined : 36,
    border: `${s.borderWidth}px solid ${s.borderColor}`,
    borderRadius: 4,
    padding: "6px 10px",
    backgroundColor: "#ffffff",
    fontSize: s.fontSize - 1,
    color: "#374151",
    outline: "none",
    fontFamily: s.fontFamily,
    resize: "none"
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 4,
      }}
    >
      {isEditing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: s.fontSize - 2,
            color: "#374151",
            fontWeight: "bold",
            outline: "2px solid #3b82f6",
            outlineOffset: 2,
            borderRadius: 3,
            padding: "1px 4px",
            minHeight: 20,
            whiteSpace: "pre-wrap",
            background: "#eff6ff",
          }}
          onBlur={handleEditBlur}
        />
      ) : (
        <label
          style={{
            fontSize: s.fontSize - 2,
            color: "#374151",
            fontWeight: "bold",
            cursor: "inherit",
          }}
          title="Double-click to edit label"
        >
          {element.label || element.content}
        </label>
      )}
      {isTextArea ? (
        <textarea
          style={{ ...commonInputStyle, color: "#9ca3af" }}
          value={element.placeholder || ""}
          onChange={(e) => editor.updateElement(element.id, { placeholder: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Enter text..."
        />
      ) : (
        <input
          type={element.type === "field_number" ? "number" : "text"}
          style={{ ...commonInputStyle, color: "#9ca3af" }}
          value={element.placeholder || ""}
          onChange={(e) => editor.updateElement(element.id, { placeholder: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Enter text..."
        />
      )}
    </div>
  );
}

export function CanvasElementComponent({
  element,
  isSelected,
  scale,
  onSelect,
  editor,
  isPreview = false,
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
    dir: "se" as ResizeDirection,
  });
  const editRef = useRef<HTMLDivElement>(null);

  const isText =
    element.type === "heading" ||
    element.type === "subheading" ||
    element.type === "paragraph";

  // Field elements support label editing on double click
  const isField = element.type.startsWith('field_') && element.type !== 'field_divider'

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isText && !isField) return;
      e.stopPropagation();
      setIsEditing(true);
      setTimeout(() => {
        if (editRef.current) {
          editRef.current.textContent = isText ? element.content : (element.label || element.content);
          editRef.current.focus();
          const range = document.createRange();
          range.selectNodeContents(editRef.current);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 0);
    },
    [isText, isField, element.content, element.label],
  );

  const handleEditBlur = useCallback(() => {
    setIsEditing(false);
    const text = editRef.current?.textContent || "";
    if (isField) {
      if (text !== element.label) {
        editor.updateElement(element.id, { label: text, content: text });
      }
    } else {
      if (text !== element.content) {
        editor.updateElement(element.id, { content: text });
      }
    }
  }, [element, editor, isField]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isPreview) return;  // block in preview
      if (isEditing) return;
      e.stopPropagation();
      onSelect(element.id);
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elX: element.x,
        elY: element.y,
      };
    },
    [isPreview, isEditing, element, onSelect],
  );


  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, dir: ResizeDirection) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(element.id);
      setIsResizing(true);
      resizeStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elX: element.x,
        elY: element.y,
        elW: element.width,
        elH: element.height,
        dir,
      };
    },
    [element, onSelect],
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / scale;
        const dy = (e.clientY - dragStartRef.current.mouseY) / scale;
        editor.moveElement(
          element.id,
          dragStartRef.current.elX + dx,
          dragStartRef.current.elY + dy,
        );
      }
      if (isResizing) {
        const { mouseX, mouseY, elX, elY, elW, elH, dir } =
          resizeStartRef.current;
        const dx = (e.clientX - mouseX) / scale;
        const dy = (e.clientY - mouseY) / scale;
        let nx = elX,
          ny = elY,
          nw = elW,
          nh = elH;

        if (dir.includes("e")) nw = elW + dx;
        if (dir.includes("s")) nh = elH + dy;
        if (dir.includes("w")) {
          nx = elX + dx;
          nw = elW - dx;
        }
        if (dir.includes("n")) {
          ny = elY + dy;
          nh = elH - dy;
        }

        editor.resizeElement(element.id, nx, ny, nw, nh);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / scale;
        const dy = (e.clientY - dragStartRef.current.mouseY) / scale;
        editor.commitMove(
          element.id,
          dragStartRef.current.elX + dx,
          dragStartRef.current.elY + dy,
        );
        setIsDragging(false);
      }
      if (isResizing) {
        const { mouseX, mouseY, elX, elY, elW, elH, dir } =
          resizeStartRef.current;
        const dx = (e.clientX - mouseX) / scale;
        const dy = (e.clientY - mouseY) / scale;
        let nx = elX,
          ny = elY,
          nw = elW,
          nh = elH;
        if (dir.includes("e")) nw = elW + dx;
        if (dir.includes("s")) nh = elH + dy;
        if (dir.includes("w")) {
          nx = elX + dx;
          nw = elW - dx;
        }
        if (dir.includes("n")) {
          ny = elY + dy;
          nh = elH - dy;
        }
        editor.commitResize(element.id, nx, ny, nw, nh);
        setIsResizing(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, element.id, scale, editor]);

  const s = element.style;
  return (
    <div
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        opacity: s.opacity,
        backgroundColor: s.bgColor !== "transparent" ? s.bgColor : undefined,
        cursor: isPreview
          ? "default"
          : isDragging ? "grabbing" : isEditing ? "text" : "grab",
        userSelect: "none",
        boxSizing: "border-box",
        outline: !isPreview && isDragging && element._overlapping
          ? "2px solid #ef4444"
          : !isPreview && isSelected
          ? "2px solid #3b82f6"
          : "none",
        outlineOffset: "1px",
        transition: isDragging ? "none" : "outline 0.1s",
        pointerEvents: isPreview ? "none" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onDragOver={(e) => {
        // Allow drop from element library - must preventDefault for drop to fire
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        // Let it bubble up to the canvas
      }}
      onDrop={() => {
        // Let the event bubble up to canvas's onDrop handler
        // (do NOT stopPropagation here)
      }}
    >
      <ElementContentRenderer element={element} isEditing={isEditing} editRef={editRef} handleEditBlur={handleEditBlur} editor={editor} />

      {isEditing && isText && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: -1 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleEditBlur();
          }}
        />
      )}

      {isEditing && (
        <div style={{ display: "none" }} onBlur={handleEditBlur} />
      )}

      {isSelected && !isEditing && (
        <>
          {/* Selection border label */}
          <div
            style={{
              position: "absolute",
              top: -22,
              left: 0,
              background: "#3b82f6",
              color: "white",
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 3,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {element.type.replace("field_", "")}
          </div>
          {/* Resize handles */}
          {RESIZE_HANDLES.map(({ dir, style }) => (
            <div
              key={dir}
              style={{
                position: "absolute",
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                backgroundColor: "white",
                border: "2px solid #3b82f6",
                borderRadius: 2,
                ...style,
                zIndex: 10,
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, dir)}
            />
          ))}
        </>
      )}
    </div>
  );
}
