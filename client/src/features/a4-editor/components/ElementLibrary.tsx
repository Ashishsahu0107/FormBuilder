import { FIELD_LIBRARY, FIELD_GROUPS } from "../constants/field-types";
import type { A4EditorReturn } from "../hooks/useA4Editor";

interface ElementLibraryProps {
  editor: A4EditorReturn;
}

export function ElementLibrary({ editor }: ElementLibraryProps) {
  const handleDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData("elementType", itemType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="flex flex-col h-full bg-white border-r border-gray-200"
      style={{ width: 220, minWidth: 220 }}
    >
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">Elements</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Drag onto canvas or click to add
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {FIELD_GROUPS.map((group) => {
          const items = FIELD_LIBRARY.filter((f) => f.group === group);
          return (
            <div key={group}>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {group}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => (
                  <button
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onClick={() => editor.addElement(item)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group text-center cursor-grab active:cursor-grabbing select-none"
                    title={`Drag or click to add ${item.label}`}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-xs text-gray-600 leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
