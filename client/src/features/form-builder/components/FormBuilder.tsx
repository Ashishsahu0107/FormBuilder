import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useFormBuilder } from "../hooks/useFormBuilder";
import { BuilderHeader } from "./BuilderHeader";
import { FieldLibrary } from "./FieldLibrary";
import { FormCanvas } from "./FormCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { LogicDialog } from "./LogicDialog";
import type { FormSchema, Form } from "../types/schema";
import { useState } from "react";

interface FormBuilderProps {
  onWorkflowAction?: (
    action: "submit" | "approve" | "publish" | "activate",
  ) => void;
  isWorkflowLoading?: boolean;
  form: Form;
  initialSchema: FormSchema;
  onSave: (schema: FormSchema) => Promise<void>;
}

export function FormBuilder({
  form,
  initialSchema,
  onSave,
  onWorkflowAction,
  isWorkflowLoading,
}: FormBuilderProps) {
  const builder = useFormBuilder(initialSchema);
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (e: any) => {
    setActiveDragId(e.active.id);
    setActiveDragType(e.active.data.current?.type);
  };

  const handleDragEnd = (e: any) => {
    const { active, over } = e;
    setActiveDragId(null);
    setActiveDragType(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    if (activeData.type === "LIBRARY_FIELD") {
      const sectionId =
        overData.type === "SECTION" ? overData.sectionId : overData.sectionId;
      if (sectionId) {
        builder.addField(sectionId, activeData.fieldType);
      }
    } else if (
      activeData.type === "CANVAS_FIELD" &&
      overData.type === "CANVAS_FIELD"
    ) {
      const fromSection = activeData.sectionId;
      const toSection = overData.sectionId;
      if (fromSection === toSection) {
        const section = builder.schema.sections.find(
          (s) => s.id === fromSection,
        );
        if (section) {
          const oldIndex = section.fields.findIndex(
            (f) => f.id === activeData.fieldId,
          );
          const newIndex = section.fields.findIndex(
            (f) => f.id === overData.fieldId,
          );
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            builder.moveField(fromSection, toSection, oldIndex, newIndex);
          }
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden text-gray-900">
        <LogicDialog
          isOpen={isLogicOpen}
          onClose={() => setIsLogicOpen(false)}
          schema={builder.schema}
          onUpdateLogic={(logic) => builder.updateSchemaSettings({ logic })}
        />
        <BuilderHeader
          schema={builder.schema}
          formId={form.id}
          title={form.title}
          status={form.status}
          isSaving={builder.isSaving}
          isDirty={builder.isDirty}
          canUndo={builder.canUndo}
          canRedo={builder.canRedo}
          onUndo={builder.undo}
          onRedo={builder.redo}
          onPreview={() => window.open(`/forms/${form.id}/preview`, "_blank")}
          onWorkflowAction={onWorkflowAction}
          onOpenLogic={() => setIsLogicOpen(true)}
          isWorkflowLoading={isWorkflowLoading}
          onSave={async () => {
            builder.setSaving(true);
            await onSave(builder.schema);
            builder.setSaving(false);
            builder.markClean();
          }}
        />
        <div className="flex flex-1 overflow-hidden">
          <FieldLibrary className="w-64 flex-shrink-0 z-10" />
          <FormCanvas
            className="flex-1 z-0"
            schema={builder.schema}
            selectedFieldId={builder.selectedFieldId}
            onSelectField={builder.selectField}
            onDeleteField={builder.removeField}
            onDuplicateField={builder.duplicateField}
          />
          <PropertiesPanel
            className="w-80 flex-shrink-0 z-10"
            field={builder.selectedField}
            onUpdate={(id, updates) => {
              if (builder.selectedFieldSectionId) {
                builder.updateField(
                  builder.selectedFieldSectionId,
                  id,
                  updates,
                );
              }
            }}
          />
        </div>

        <DragOverlay>
          {activeDragId && activeDragType === "LIBRARY_FIELD" ? (
            <div className="p-3 bg-white border-2 border-blue-500 rounded shadow-lg flex items-center gap-2 text-sm text-blue-700 font-medium opacity-90">
              {activeDragId.replace("library-", "")}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
