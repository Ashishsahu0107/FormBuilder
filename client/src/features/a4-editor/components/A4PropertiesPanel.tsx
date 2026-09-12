import type { CanvasElement, ElementStyle } from "../types/element";
import type { A4EditorReturn } from "../hooks/useA4Editor";
import { Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react";

interface A4PropertiesPanelProps {
  editor: A4EditorReturn;
}

const FONT_FAMILIES = [
  "Inter, sans-serif",
  "Georgia, serif",
  "Courier New, monospace",
  "Arial, sans-serif",
  "Times New Roman, serif",
];
const FONT_SIZES = [
  8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64,
];

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 w-20 shrink-0">{label}</label>
      <div className="flex items-center gap-1.5 border border-gray-200 rounded px-2 py-1">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
          style={{ minWidth: 20 }}
        />
        <span className="text-xs text-gray-600 font-mono">
          {value || "#000000"}
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2 pt-3 border-t border-gray-100">
      {children}
    </div>
  );
}

export function A4PropertiesPanel({ editor }: A4PropertiesPanelProps) {
  const {
    selectedElement,
    updateElement,
    updateElementStyle,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
  } = editor;

  if (!selectedElement) {
    return (
      <div
        className="flex flex-col h-full bg-white border-l border-gray-200"
        style={{ width: 240, minWidth: 240 }}
      >
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center px-4 text-sm text-gray-400">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  const el = selectedElement;
  const s = el.style;
  const update = (updates: Partial<CanvasElement>) =>
    updateElement(el.id, updates);
  const styleUpdate = (updates: Partial<ElementStyle>) =>
    updateElementStyle(el.id, updates);

  const isTextField = ["heading", "subheading", "paragraph"].includes(el.type);
  const isInputField =
    !isTextField &&
    el.type !== "field_divider" &&
    el.type !== "field_image_placeholder" &&
    el.type !== "field_checkbox";

  return (
    <div
      className="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden"
      style={{ width: 240, minWidth: 240 }}
    >
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Properties</h3>
        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded uppercase">
          {el.type.replace("field_", "")}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Text content for pure text elements */}
        {isTextField && (
          <>
            <SectionTitle>Content</SectionTitle>
            <textarea
              className="w-full border border-gray-200 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={el.content}
              onChange={(e) => update({ content: e.target.value })}
            />
          </>
        )}

        {/* Label for input fields */}
        {isInputField && (
          <>
            <SectionTitle>Field Label</SectionTitle>
            <input
              className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={el.label || el.content}
              onChange={(e) =>
                update({ label: e.target.value, content: e.target.value })
              }
            />
            <SectionTitle>Placeholder Text</SectionTitle>
            <input
              className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={el.placeholder || ""}
              onChange={(e) =>
                update({ placeholder: e.target.value })
              }
              placeholder="e.g. Enter your name..."
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none mt-3">
              <input
                type="checkbox"
                checked={el.required || false}
                onChange={(e) => update({ required: e.target.checked })}
                className="rounded"
              />
              Required field
            </label>
          </>
        )}

        {/* Options for dropdown */}
        {el.type === "field_dropdown" && (
          <>
            <SectionTitle>Options (one per line)</SectionTitle>
            <textarea
              className="w-full border border-gray-200 rounded p-2 text-sm resize-none font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={5}
              value={(el.options || []).join("\n")}
              onChange={(e) =>
                update({ options: e.target.value.split("\n").filter(Boolean) })
              }
            />
          </>
        )}

        {/* Typography */}
        <SectionTitle>Typography</SectionTitle>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-20 shrink-0">Font</label>
            <select
              className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
              value={s.fontFamily}
              onChange={(e) => styleUpdate({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f.split(",")[0]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-20 shrink-0">Size</label>
            <select
              className="w-20 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
              value={s.fontSize}
              onChange={(e) =>
                styleUpdate({ fontSize: Number(e.target.value) })
              }
            >
              {FONT_SIZES.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}px
                </option>
              ))}
            </select>
            <div className="flex gap-1 ml-auto">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => styleUpdate({ textAlign: align })}
                  className={`px-2 py-1 text-xs rounded border ${s.textAlign === align ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600"}`}
                >
                  {align === "left" ? "≡" : align === "center" ? "≡" : "≡"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                styleUpdate({
                  fontWeight: s.fontWeight === "bold" ? "normal" : "bold",
                })
              }
              className={`flex-1 py-1 text-sm font-bold rounded border ${s.fontWeight === "bold" ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600"}`}
            >
              B
            </button>
            <button
              onClick={() => styleUpdate({ italic: !s.italic })}
              className={`flex-1 py-1 text-sm italic rounded border ${s.italic ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600"}`}
            >
              I
            </button>
            <button
              onClick={() => styleUpdate({ underline: !s.underline })}
              className={`flex-1 py-1 text-sm underline rounded border ${s.underline ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600"}`}
            >
              U
            </button>
          </div>
        </div>

        {/* Colors */}
        <SectionTitle>Colors</SectionTitle>
        <div className="space-y-2">
          <ColorPicker
            label="Text Color"
            value={s.color}
            onChange={(v) => styleUpdate({ color: v })}
          />
          <ColorPicker
            label="Background"
            value={s.bgColor}
            onChange={(v) => styleUpdate({ bgColor: v })}
          />
          <ColorPicker
            label="Border"
            value={s.borderColor}
            onChange={(v) => styleUpdate({ borderColor: v })}
          />
        </div>

        {/* Position & Size */}
        <SectionTitle>Position & Size</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "X", key: "x" as const },
            { label: "Y", key: "y" as const },
            { label: "W", key: "width" as const },
            { label: "H", key: "height" as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center gap-1">
              <label className="text-xs text-gray-500 w-5">{label}</label>
              <input
                type="number"
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                value={Math.round(el[key])}
                onChange={(e) => update({ [key]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-2 mt-1">
          <label className="text-xs text-gray-500 w-14">Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={s.opacity}
            onChange={(e) => styleUpdate({ opacity: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8">
            {Math.round(s.opacity * 100)}%
          </span>
        </div>

        {/* Actions */}
        <SectionTitle>Layer Actions</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => bringToFront(el.id)}
            className="flex items-center gap-1 justify-center py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50"
          >
            <ArrowUp className="w-3 h-3" /> Bring Front
          </button>
          <button
            onClick={() => sendToBack(el.id)}
            className="flex items-center gap-1 justify-center py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50"
          >
            <ArrowDown className="w-3 h-3" /> Send Back
          </button>
          <button
            onClick={() => duplicateElement(el.id)}
            className="flex items-center gap-1 justify-center py-1.5 text-xs border border-gray-200 rounded hover:bg-blue-50 text-blue-600"
          >
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button
            onClick={() => deleteElement(el.id)}
            className="flex items-center gap-1 justify-center py-1.5 text-xs border border-red-200 rounded hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
