import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formsService } from "@/features/form-builder/services/forms.service";
import { FormRenderer } from "@/features/form-builder/components/FormRenderer";
import type { FormSchema } from "@/features/form-builder/types/schema";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  useEffect(() => {
    async function loadForm() {
      if (!id) return;
      try {
        const res = await formsService.getById(id);
        if (res.data.data.currentVersion) {
          setSchema(res.data.data.currentVersion.schema);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading preview...
      </div>
    );
  if (!schema)
    return (
      <div className="flex h-screen items-center justify-center">
        No schema found
      </div>
    );

  const deviceWidth =
    device === "mobile"
      ? "max-w-[375px]"
      : device === "tablet"
        ? "max-w-[768px]"
        : "max-w-4xl";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-center gap-2">
        <button
          onClick={() => setDevice("desktop")}
          className={`p-2 rounded ${device === "desktop" ? "bg-gray-100" : ""}`}
        >
          <Monitor className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => setDevice("tablet")}
          className={`p-2 rounded ${device === "tablet" ? "bg-gray-100" : ""}`}
        >
          <Tablet className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => setDevice("mobile")}
          className={`p-2 rounded ${device === "mobile" ? "bg-gray-100" : ""}`}
        >
          <Smartphone className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div
          className={`w-full ${deviceWidth} bg-white shadow-xl rounded-xl min-h-[600px] p-8 transition-all duration-300`}
        >
          <FormRenderer schema={schema} mode="preview" />
        </div>
      </main>
    </div>
  );
}
