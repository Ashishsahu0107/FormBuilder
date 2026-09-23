import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formsService } from "@/features/form-builder/services/forms.service";
import { templatesService } from "@/features/templates/services/templates.service";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  Trash,
  Inbox,
  Share2,
  Layers,
  CheckCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { ShareDialog } from "@/features/form-builder/components/ShareDialog";
import { DeleteFormModal } from "@/features/form-builder/components/DeleteFormModal";
import { toast } from "react-hot-toast";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [paperSize, setPaperSize] = useState<"A4" | "A3">("A4");
  const [shareSlug, setShareSlug] = useState<string | null>(null);

  // Delete Modal state
  const [formToDelete, setFormToDelete] = useState<any>(null);

  // View Modal state
  const [formToView, setFormToView] = useState<any>(null);

  const { data: templatesData } = useQuery({
    queryKey: ["templates", user?.id],
    queryFn: () => templatesService.getAll(),
    enabled: statusFilter === "TEMPLATES",
  });

  const isAdminView =
    user?.role === "ADMIN" && ["PENDING", "APPROVED"].includes(statusFilter);

  const { data, refetch } = useQuery({
    queryKey: ["forms", statusFilter, user?.id],
    queryFn: () => {
      const params: any = {};
      if (isAdminView) {
        params.adminView = true;
        params.status =
          statusFilter === "PENDING" ? "UNDER_REVIEW" : "APPROVED";
      } else if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      return formsService.getAll(params);
    },
    enabled: statusFilter !== "TEMPLATES",
  });

  const handleUseTemplate = async (template: any) => {
    try {
      const res = await formsService.create({
        title: template.title + " (Copy)",
        schema: template.schema,
      });
      navigate(`/forms/${res.data.data.id}/builder`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!newTitle) return;
    try {
      const res = await formsService.create({
        title: newTitle,
        schema: { paperSize, elements: [] },
      });
      setIsCreateOpen(false);
      navigate(`/forms/${res.data.data.id}/builder`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (formId: string) => {
    await formsService.delete(formId);
    refetch();
  };

  const handleApprove = async (formId: string) => {
    try {
      await formsService.approve(formId);
      toast.success("Form approved successfully!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve form");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Form Builder Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/template-editor")}
              className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Layers className="h-4 w-4" /> Template Editor
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              {user?.role === "ADMIN" ? (
                <>
                  <TabsTrigger value="PENDING">Pending Approvals</TabsTrigger>
                  <TabsTrigger value="APPROVED">Approved Forms</TabsTrigger>
                  <TabsTrigger value="ALL">My Forms</TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="ALL">All Forms</TabsTrigger>
                  <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
                  <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
                  <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                </>
              )}
              <TabsTrigger value="TEMPLATES">Templates</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-white rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
              <div className="p-8">
                <DialogHeader className="mb-8 flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 shrink-0">
                    <FileText className="w-6 h-6 text-blue-600 fill-blue-600" />
                  </div>
                  <div className="space-y-1 text-left pt-1">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      Create New Form
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                      Set up your form details and get started.
                    </p>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">
                      Form Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Admission Form 2026"
                      className="h-12 border-2 border-blue-200 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-100 rounded-xl transition-all text-base text-gray-900"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800">
                      Paper Size
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* A4 Card */}
                      <label
                        className={`relative flex flex-row items-start gap-4 p-4 cursor-pointer rounded-xl border-2 transition-all ${
                          paperSize === "A4"
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paperSize"
                          value="A4"
                          checked={paperSize === "A4"}
                          onChange={() => setPaperSize("A4")}
                          className="sr-only"
                        />
                        <div
                          className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${
                            paperSize === "A4"
                              ? "border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {paperSize === "A4" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900">
                            A4
                          </h4>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <p>210 Ãƒâ€” 297 mm</p>
                            <p>Standard size, widely used</p>
                          </div>
                        </div>
                      </label>

                      {/* A3 Card */}
                      <label
                        className={`relative flex flex-row items-start gap-4 p-4 cursor-pointer rounded-xl border-2 transition-all ${
                          paperSize === "A3"
                            ? "border-gray-300 bg-gray-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paperSize"
                          value="A3"
                          checked={paperSize === "A3"}
                          onChange={() => setPaperSize("A3")}
                          className="sr-only"
                        />
                        <div
                          className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${
                            paperSize === "A3"
                              ? "border-gray-500"
                              : "border-gray-300"
                          }`}
                        >
                          {paperSize === "A3" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900">
                            A3
                          </h4>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <p>297 Ãƒâ€” 420 mm</p>
                            <p>Larger space for detailed forms</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      className="px-6 py-2.5 h-auto font-medium text-gray-600 rounded-lg hover:bg-gray-50 border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      className="px-6 py-2.5 h-auto bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg gap-2 shadow-sm shadow-blue-200 transition-all"
                    >
                      Create & Open Builder <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {statusFilter === "TEMPLATES" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(templatesData?.data.data || []).map((t: any) => (
              <div
                key={t.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-bold text-lg text-gray-900">{t.title}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  {t.description || "No description"}
                </p>
                <Button
                  onClick={() => handleUseTemplate(t)}
                  className="w-full"
                  variant="outline"
                >
                  Use Template
                </Button>
              </div>
            ))}
            {(templatesData?.data.data || []).length === 0 && (
              <div className="col-span-1 md:col-span-3">
                <EmptyState
                  title="No Templates Found"
                  description="There are no templates available in this category yet."
                  icon={Layers}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto overflow-y-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Name
                  </th>
                  {isAdminView && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creator
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(data?.data.data || []).map((form: any) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/forms/${form.id}/builder`)}
                    >
                      <div className="font-medium text-gray-900">
                        {form.title}
                      </div>
                      <div className="text-sm text-gray-500">/{form.slug}</div>
                    </td>
                    {isAdminView && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {form.user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {form.user?.email}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          form.status === "ACTIVE"
                            ? "default"
                            : form.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {form.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {isAdminView && statusFilter === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(form.id)}
                            className="mr-2 border-green-200 text-green-700 hover:bg-green-50 gap-2"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </Button>
                        )}
                        {form.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShareSlug(form.slug)}
                            title="Share Form"
                          >
                            <Share2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/forms/${form.id}/submissions`)
                          }
                          title="View Submissions"
                        >
                          <Inbox className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFormToView(form)}
                          title="Preview Form"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setFormToDelete(form)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.data.data || []).length === 0 && (
              <EmptyState
                title="No Forms Found"
                description={
                  statusFilter === "ALL"
                    ? "You haven't created any forms yet. Click 'Create Form' to get started."
                    : "No forms match the current filter."
                }
                actionLabel={statusFilter === "ALL" ? "Create Form" : undefined}
                onAction={() => setIsCreateOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {shareSlug && (
        <ShareDialog
          formSlug={shareSlug}
          isOpen={true}
          onClose={() => setShareSlug(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteFormModal
        form={formToDelete}
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* View Form Modal */}
      <Dialog
        open={!!formToView}
        onOpenChange={(open) => !open && setFormToView(null)}
      >
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Preview: {formToView?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 overflow-hidden relative">
            {formToView && (
              <iframe
                src={`/forms/${formToView.slug}`}
                className="w-full h-full border-0"
                title="Form Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
