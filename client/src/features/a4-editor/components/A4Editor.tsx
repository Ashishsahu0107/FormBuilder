import { useRef, useState, useEffect, useCallback } from "react";
import { useA4Editor } from "../hooks/useA4Editor";
import { A4Canvas } from "./A4Canvas";
import { ElementLibrary } from "./ElementLibrary";
import { A4PropertiesPanel } from "./A4PropertiesPanel";
import { TemplateGallery } from "./TemplateGallery";
import {
  A4_WIDTH,
  A4_HEIGHT,
  A3_WIDTH,
  A3_HEIGHT,
  PaperSize,
} from "../types/element";
import type { FormTemplate } from "../constants/templates";
import {
  Undo2,
  Redo2,
  Eye,
  Save,
  Download,
  Layout,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  Keyboard,
  Send,
  CheckCircle,
  Upload,
  Power,
} from "lucide-react";

interface A4EditorProps {
  templateName?: string;
  initialElements?: any[];
  onSave?: (elements: any[], name: string) => Promise<void>;
  onBack?: () => void;
  paperSize?: PaperSize;
  onWorkflowAction?: (
    action: "submit" | "approve" | "publish" | "activate",
  ) => Promise<void>;
  isWorkflowLoading?: boolean;
  formStatus?: string;
}

export function A4Editor({
  templateName = "Untitled Form",
  initialElements = [],
  onSave,
  onBack,
  paperSize = "A4",
  onWorkflowAction,
  isWorkflowLoading,
  formStatus,
}: A4EditorProps) {
  const [name, setName] = useState(templateName);
  const [showTemplates, setShowTemplates] = useState(
    initialElements.length === 0,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [scale, setScale] = useState(0.75);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const editor = useA4Editor(initialElements);

  const [manualPageCount, setManualPageCount] = useState(1);
  const pageHeightPx = paperSize === "A3" ? A3_HEIGHT : A4_HEIGHT;
  const maxY =
    editor.elements.length > 0
      ? Math.max(...editor.elements.map((el) => el.y + el.height))
      : 0;
  const autoPages = Math.max(1, Math.ceil(maxY / pageHeightPx));
  const totalPages = Math.max(manualPageCount, autoPages);

  const handleDeletePage = (pageIndex: number) => {
    editor.deletePageContent(pageIndex, paperSize);
    setManualPageCount((prev) => Math.max(1, prev - 1));
  };

  // Dirty state tracking
  const [lastSavedElements, setLastSavedElements] = useState(initialElements);
  const [lastSavedName, setLastSavedName] = useState(templateName);

  // Need to update lastSavedElements if initialElements changes after fetch
  useEffect(() => {
    setTimeout(() => setLastSavedElements(initialElements), 0);
  }, [initialElements]);

  useEffect(() => {
    setTimeout(() => setLastSavedName(templateName), 0);
  }, [templateName]);

  const stripTransient = (els: any[]) =>
    els.map(({ _overlapping, ...rest }: any) => rest);

  const isDirty =
    name !== lastSavedName ||
    JSON.stringify(stripTransient(editor.elements)) !==
      JSON.stringify(stripTransient(lastSavedElements));

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(editor.elements, name);
      setLastSavedElements(editor.elements);
      setLastSavedName(name);
    } finally {
      setIsSaving(false);
    }
  }, [editor.elements, name, onSave]);

  const handleSelectTemplate = (template: FormTemplate) => {
    setName(template.name);
    editor.loadTemplate(template.elements);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        editor.redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (editor.selectedId) {
          e.preventDefault();
          editor.deleteElement(editor.selectedId);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (editor.selectedId) editor.duplicateElement(editor.selectedId);
      }
      if (e.key === "Escape") editor.setSelectedId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleSave]);

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Hide UI elements
    const hideElements = canvasRef.current.querySelectorAll(".hide-on-export");
    hideElements.forEach((el) => ((el as HTMLElement).style.display = "none"));

    // Temporarily set scale to 1 for export
    const parent = canvasRef.current.parentElement;
    if (parent) {
      parent.style.transform = "none";
    }

    const canvasHeightPx = totalPages * pageHeightPx;

    const canvas = await html2canvas(canvasRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: paperSize === "A3" ? A3_WIDTH : A4_WIDTH,
      height: canvasHeightPx,
    });

    if (parent) parent.style.transform = `scale(${scale})`;

    // Restore UI elements
    hideElements.forEach((el) => ((el as HTMLElement).style.display = ""));

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: paperSize.toLowerCase(),
    });

    const pdfWidth = paperSize === "A3" ? 297 : 210;
    const pdfHeight = paperSize === "A3" ? 420 : 297;

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        0,
        -(i * pdfHeight),
        pdfWidth,
        pdfHeight * totalPages,
      );
    }

    pdf.save(`${name.replace(/\s+/g, "_") || "form"}.pdf`);
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;

    // Hide UI elements temporarily
    const hideElements = canvasRef.current.querySelectorAll(".hide-on-export");
    hideElements.forEach((el) => ((el as HTMLElement).style.display = "none"));

    const content = canvasRef.current.innerHTML;

    // Restore UI elements
    hideElements.forEach((el) => ((el as HTMLElement).style.display = ""));

    const printWindow = window.open("", "", "width=900,height=1200");
    if (!printWindow) return;

    const canvasHeightPx = totalPages * pageHeightPx;

    printWindow.document.write(`
      <html><head><title>${name}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: ${paperSize === "A3" ? A3_WIDTH : A4_WIDTH}px; margin: 0 auto; }
        @media print { 
          body { width: ${paperSize === "A3" ? "297mm" : "210mm"}; } 
          @page { size: ${paperSize}; margin: 0; } 
        }
      </style>
      </head><body>
      <div style="width:${paperSize === "A3" ? A3_WIDTH : A4_WIDTH}px;height:${canvasHeightPx}px;position:relative;background:white;">${content}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-gray-100"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* === TOOLBAR === */}
      <div
        className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-10"
        style={{ minHeight: 56 }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mr-2 px-2 py-1 rounded hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
        )}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 min-w-48"
            placeholder="Form name..."
          />
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200 text-xs text-gray-600 font-medium">
            {totalPages} Page{totalPages > 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button
          onClick={editor.undo}
          disabled={!editor.canUndo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={editor.redo}
          disabled={!editor.canRedo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Zoom */}
        <button
          onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-500 w-12 text-center font-mono">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(1.2, s + 0.1))}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Templates */}
        <button
          onClick={() => setShowTemplates(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        >
          <Layout className="w-4 h-4" /> Templates
        </button>

        {/* Preview */}
        <button
          onClick={() => setIsPreview((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${isPreview ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:bg-gray-50"}`}
        >
          <Eye className="w-4 h-4" /> Preview
        </button>

        {onSave && (
          <button
            onClick={handleSave}
            disabled={
              !isDirty ||
              isSaving ||
              (formStatus !== undefined && formStatus !== "DRAFT")
            }
            title={
              formStatus && formStatus !== "DRAFT"
                ? `Cannot save ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â form is ${formStatus}`
                : isDirty
                  ? "You have unsaved changes"
                  : "No changes to save"
            }
            className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg transition-all ${
              formStatus && formStatus !== "DRAFT"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : !isDirty || isSaving
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 ring-2 ring-emerald-300"
            }`}
          >
            {/* Unsaved changes dot */}
            {isDirty &&
              !isSaving &&
              !(formStatus && formStatus !== "DRAFT") && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse" />
              )}
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : isDirty ? "Save *" : "Saved"}
          </button>
        )}

        {/* Workflow Actions */}
        {onWorkflowAction && formStatus === "DRAFT" && (
          <button
            onClick={() => onWorkflowAction("submit")}
            disabled={isWorkflowLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Submit
          </button>
        )}
        {onWorkflowAction && formStatus === "IN_REVIEW" && (
          <button
            onClick={() => onWorkflowAction("approve")}
            disabled={isWorkflowLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
        )}
        {onWorkflowAction && formStatus === "APPROVED" && (
          <button
            onClick={() => onWorkflowAction("publish")}
            disabled={isWorkflowLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> Publish
          </button>
        )}
        {onWorkflowAction && formStatus === "PUBLISHED" && (
          <button
            onClick={() => onWorkflowAction("activate")}
            disabled={isWorkflowLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <Power className="w-4 h-4" /> Activate
          </button>
        )}

        {/* Export PDF */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" /> Export
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-50 min-w-36 hidden group-hover:block">
            <button
              onClick={handleExportPDF}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾
              Export PDF
            </button>
            <button
              onClick={handlePrint}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨
              Print
            </button>
          </div>
        </div>

        {/* Shortcuts */}
        <button
          onClick={() => setShowShortcuts((p) => !p)}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* === EDITOR BODY === */}
      <div className="flex flex-1 overflow-hidden">
        {!isPreview && <ElementLibrary editor={editor} />}

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div
            className="flex-1 overflow-auto bg-gray-200 flex justify-center py-10"
            style={{
              backgroundImage: "radial-gradient(#c7c7c7 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            onMouseDown={(e) => {
              // Only deselect when clicking directly on background (not on canvas)
              if (e.target === e.currentTarget) editor.setSelectedId(null);
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                pointerEvents: "auto",
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex flex-col items-center pb-24"
            >
              <A4Canvas
                editor={editor}
                scale={scale}
                canvasRef={canvasRef}
                paperSize={paperSize}
                totalPages={totalPages}
                onDeletePage={handleDeletePage}
                isPreview={isPreview}
              />
            </div>
          </div>

          {/* Add Page Button (Floating) - hidden in preview mode */}
          {!isPreview && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
              <button
                onClick={() => {
                  setManualPageCount(totalPages + 1);
                  setTimeout(() => {
                    const scrollContainer = document.querySelector(
                      ".overflow-auto.bg-gray-200",
                    );
                    if (scrollContainer)
                      scrollContainer.scrollTop = scrollContainer.scrollHeight;
                  }, 100);
                }}
                className="pointer-events-auto w-150 flex items-center gap-2 px-6 py-1 bg-gray-900 text-white text-sm font-medium rounded-full shadow-md hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 border border-gray-700 justify-center"
              >
                <span className="text-lg leading-none">+</span> Add New Page
              </button>
            </div>
          )}
        </div>

        {!isPreview && <A4PropertiesPanel editor={editor} />}
      </div>

      {/* === TEMPLATE GALLERY === */}
      <TemplateGallery
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleSelectTemplate}
      />

      {/* === SHORTCUTS PANEL === */}
      {showShortcuts && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-50 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Keyboard Shortcuts</span>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢
            </button>
          </div>
          {[
            ["Ctrl+Z", "Undo"],
            ["Ctrl+Y", "Redo"],
            ["Ctrl+S", "Save"],
            ["Ctrl+D", "Duplicate"],
            ["Delete", "Delete element"],
            ["Escape", "Deselect"],
            ["Dbl-click", "Edit text"],
          ].map(([key, desc]) => (
            <div
              key={key}
              className="flex items-center justify-between py-1 text-sm"
            >
              <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                {key}
              </kbd>
              <span className="text-gray-600 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
