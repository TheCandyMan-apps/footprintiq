import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function FactSheet() {
  const contentRef = useRef<HTMLDivElement>(null);

  const keyFindings = [
    "73% of individuals who reuse a single username across three or more platforms appear in data broker records under that identifier.",
    "41% of automated username matches represent false positives or unverified correlations.",
    "89% of data broker entries reference outdated information, including prior addresses, former employers, and old phone numbers.",
    "The median number of public profiles linked to a single reused username is 4.2 platforms.",
    "58% of username-linked accounts contain profile data that is five years old or older.",
    "Accounts created as early as 2008 remain searchable today. Usernames persist in public indices indefinitely unless explicitly deleted."
  ];

  const methodology = [
    "All data derived from publicly accessible sources only",
    "No scraping behind login walls or authentication bypass",
    "No monitoring of individuals without knowledge",
    "No purchase of data from commercial data brokers",
    "Methodology is disclosed in full and findings are reproducible"
  ];

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Research Fact Sheet", margin, yPos);
      yPos += 10;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text("Username Reuse & Digital Exposure (2026)", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text("FootprintIQ Research", margin, yPos);
      pdf.setTextColor(0);
      yPos += 12;

      // Divider
      pdf.setDrawColor(200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Key Findings
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Key Findings", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      keyFindings.forEach((finding) => {
        const lines = pdf.splitTextToSize(`• ${finding}`, contentWidth - 5);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin + 2, yPos);
          yPos += 5;
        });
        yPos += 2;
      });

      yPos += 5;

      // Methodology
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Methodology", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      methodology.forEach((item) => {
        const lines = pdf.splitTextToSize(`• ${item}`, contentWidth - 5);
        lines.forEach((line: string) => {
          pdf.text(line, margin + 2, yPos);
          yPos += 5;
        });
        yPos += 1;
      });

      yPos += 8;

      // Ethical Disclaimer
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Ethical OSINT Statement", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const disclaimer = "This research adheres to ethical OSINT principles. All observations are derived from publicly accessible sources. No private, restricted, or authenticated data sources were accessed. Research aims to inform and protect, not to enable targeting.";
      const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth);
      disclaimerLines.forEach((line: string) => {
        pdf.text(line, margin, yPos);
        yPos += 5;
      });

      yPos += 10;

      // Divider
      pdf.setDrawColor(200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Citation
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Citation", margin, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Source: FootprintIQ Research (2026)", margin, yPos);
      yPos += 6;
      pdf.setTextColor(50, 100, 150);
      pdf.text("https://footprintiq.app/research/username-reuse-report-2026", margin, yPos);
      pdf.setTextColor(0);

      // Footer
      yPos = 280;
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text("This fact sheet may be cited freely with attribution.", margin, yPos);
      yPos += 5;
      pdf.text("© 2026 FootprintIQ. Published for educational and public interest purposes.", margin, yPos);

      pdf.save("FootprintIQ-Research-Fact-Sheet-2026.pdf");
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <>
      <Helmet>
        <title>Research Fact Sheet: Username Reuse & Digital Exposure | FootprintIQ</title>
        <meta 
          name="description" 
          content="Downloadable one-page fact sheet summarizing FootprintIQ's research on username reuse patterns and digital exposure. For journalists, educators, and researchers."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://footprintiq.app/research/fact-sheet" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Back Link */}
          <Link
            to="/press"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Press & Media
          </Link>

          {/* Download Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Research Fact Sheet</h1>
                <p className="text-sm text-muted-foreground">
                  One-page summary for journalists and educators
                </p>
              </div>
            </div>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          {/* Fact Sheet Content */}
          <Card className="border-border/50" disableHover>
            <CardContent className="pt-8 pb-8" ref={contentRef}>
              {/* Title Block */}
              <div className="mb-8">
                <p className="text-sm font-medium text-primary mb-2">
                  FOOTPRINTIQ RESEARCH
                </p>
                <h2 className="text-3xl font-bold mb-2">
                  Username Reuse & Digital Exposure
                </h2>
                <p className="text-muted-foreground">
                  2026 Research Summary
                </p>
              </div>

              <Separator className="my-8" />

              {/* Key Findings */}
              <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Key Findings</h3>
                <ul className="space-y-3">
                  {keyFindings.map((finding, index) => (
                    <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Methodology */}
              <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Methodology</h3>
                <ul className="space-y-2">
                  {methodology.map((item, index) => (
                    <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Ethical Statement */}
              <section className="mb-8 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h3 className="text-sm font-semibold mb-2">Ethical OSINT Statement</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This research adheres to ethical OSINT principles. All observations are 
                  derived from publicly accessible sources. No private, restricted, or 
                  authenticated data sources were accessed. Research aims to inform and 
                  protect, not to enable targeting.
                </p>
              </section>

              <Separator className="my-8" />

              {/* Citation */}
              <section>
                <h3 className="text-sm font-semibold mb-3">Citation</h3>
                <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Source: FootprintIQ Research (2026)
                  </p>
                  <p className="text-sm text-primary">
                    https://footprintiq.app/research/username-reuse-report-2026
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This fact sheet may be cited freely with attribution.
                </p>
              </section>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            © 2026 FootprintIQ. Published for educational and public interest purposes.
          </p>
        </main>

        <Footer />
      </div>
    </>
  );
}
