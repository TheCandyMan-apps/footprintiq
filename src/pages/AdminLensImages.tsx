import { LensImageGenerator } from "@/components/admin/LensImageGenerator";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

export default function AdminLensImages() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminBreadcrumb currentPage="LENS Images" />
      <LensImageGenerator />
    </div>
  );
}
