import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReportComposer } from "@/components/reports/ReportComposer";

const NewReport = () => {
  return (
    <>
      <SEO
        title="Create Report — FootprintIQ"
        description="Build custom reports with your OSINT findings"
        canonical="https://footprintiq.app/reports/new"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Custom Report</h1>
            <p className="text-muted-foreground">
              Select date range, filters, and widgets to build your report
            </p>
          </div>
          <ReportComposer />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default NewReport;
