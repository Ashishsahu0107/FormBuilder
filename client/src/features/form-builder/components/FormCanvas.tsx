import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import type { FormSchema } from "../types/schema";
import { FieldRenderer } from "./fields/FieldRenderer";
import { Copy, Trash2, GripVertical } from "lucide-react";

interface FormCanvasProps {
  className?: string;
  schema: FormSchema;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onDuplicateField: (sectionId: string, fieldId: string) => void;
}

export function FormCanvas({
  className,
  schema,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField,
}: FormCanvasProps) {
  return (
    <div
      className={`bg-gray-100 overflow-y-auto p-8 ${className}`}
      onClick={() => onSelectField(null)}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {schema.sections.map((section) => (
          <CanvasSection
            key={section.id}
            section={section}
            selectedFieldId={selectedFieldId}
            onSelectField={onSelectField}
            onDeleteField={onDeleteField}
            onDuplicateField={onDuplicateField}
          />
        ))}
        {schema.sections.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
            No sections yet.
          </div>
        )}
      </div>
    </div>
  );
}

function CanvasSection({
  section,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField,
}: any) {
  const { setNodeRef } = useDroppable({
    id: `section-${section.id}`,
    data: { type: "SECTION", sectionId: section.id },
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px]"
    >
      {section.title && (
        <h2 className="text-lg font-medium mb-4">{section.title}</h2>
      )}

      <SortableContext
        items={section.fields.map((f: any) => `field-${f.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {section.fields.map((field: any) => (
            <CanvasField
              key={field.id}
              field={field}
              sectionId={section.id}
              isSelected={field.id === selectedFieldId}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => onDeleteField(section.id, field.id)}
              onDuplicate={() => onDuplicateField(section.id, field.id)}
            />
          ))}
          {section.fields.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded p-8 text-center text-sm text-gray-400 bg-gray-50">
              Drag and drop fields here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function CanvasField({
  field,
  sectionId,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `field-${field.id}`,
    data: { type: "CANVAS_FIELD", fieldId: field.id, sectionId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group p-4 rounded-md border-2 bg-white ${isSelected ? "border-blue-500" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isSelected && (
        <div className="absolute -top-3 right-2 flex items-center bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-50"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 text-gray-400 cursor-grab hover:text-gray-600 hover:bg-gray-50"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {!isSelected && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab hover:text-gray-500"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <div className={!isSelected ? "pl-4" : ""}>
        <FieldRenderer field={field} mode="canvas" />
      </div>
    </div>
  );
}
