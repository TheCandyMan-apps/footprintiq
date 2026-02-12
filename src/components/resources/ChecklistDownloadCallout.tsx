import { useState } from "react";
import { FileDown, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateChecklistPdf() {
  const doc = new jsPDF();
  const accent = [0, 180, 180];
  let y = 20;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("The 2026 Data Broker Removal Checklist", 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("A structured workflow by FootprintIQ — footprintiq.app", 14, y);
  y += 14;

  const sections = [
    {
      title: "1. Identify Where Your Data Appears",
      items: [
        "Search people-search sites (Spokeo, BeenVerified, Whitepages, Radaris, MyLife)",
        "Run Google searches: \"your name\" + city, phone, email",
        "Check address exposure on property & voter record aggregators",
        "Search phone number across reverse-lookup directories",
        "Review cached/archived pages (Google cache, Wayback Machine)",
        "Check public records for court filings, licences, registrations",
      ],
    },
    {
      title: "2. Remove Data at the Source",
      items: [
        "Locate the specific listing page",
        "Confirm the listing matches your identity",
        "Document the full URL and screenshot",
        "Submit the opt-out/removal request",
        "Save confirmation email or reference number",
        "Record submission date and expected timeline",
      ],
    },
    {
      title: "3. Submit Google Removal Requests",
      items: [
        "Use Google's sensitive personal information removal form",
        "Understand de-indexing vs deletion",
        "Prepare screenshot evidence",
        "Track each submission via Google's case reference",
      ],
    },
    {
      title: "4. UK & EU Rights (GDPR Article 17)",
      items: [
        "Right to Erasure — request deletion where no compelling reason exists",
        "Balancing test — controller weighs privacy vs legitimate interest",
        "ICO complaint escalation if no response within one month",
      ],
    },
    {
      title: "5. US Privacy Rights (CCPA / State Laws)",
      items: [
        "Identity verification may be required",
        "Scope limitations — CCPA thresholds apply",
        "State law variation — VA, CO, CT and others differ",
      ],
    },
    {
      title: "6. Prevent Reappearance",
      items: [
        "Re-check brokers every 60–90 days",
        "Set calendar reminders for review cycles",
        "Maintain a tracking spreadsheet or database",
      ],
    },
    {
      title: "8. Common Mistakes",
      items: [
        "Removing from Google only (source listing remains)",
        "Ignoring smaller/regional brokers",
        "Not tracking requests systematically",
        "Assuming removal is permanent",
      ],
    },
  ];

  doc.setTextColor(0, 0, 0);
  sections.forEach((section) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(section.title, 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    section.items.forEach((item) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(`☐  ${item}`, 18, y);
      y += 6;
    });
    y += 6;
  });

  // Tracking template table
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.text("7. Tracking Template", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Broker", "Listing URL", "Date Submitted", "Status", "Follow-Up Date"]],
    body: [
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [0, 180, 180], textColor: 255 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("FootprintIQ — Ethical OSINT Exposure Awareness — footprintiq.app", 14, 290);
    doc.text(`Page ${i} of ${pageCount}`, 180, 290);
  }

  doc.save("2026-Data-Broker-Removal-Checklist.pdf");
}

export function ChecklistDownloadCallout() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please confirm you agree to receive the checklist.");
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from("checklist_downloads" as any)
        .insert({ email: trimmed, checklist_slug: "2026-data-broker-removal", consent_given: true } as any);

      if (dbError) throw dbError;

      // Generate and download PDF client-side
      generateChecklistPdf();

      // Track analytics event
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "checklist_download", {
          event_category: "lead",
          event_label: "2026-data-broker-removal",
        });
      }

      setSubmitted(true);
      toast({
        title: "Checklist downloaded",
        description: "Your PDF is downloading now.",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="my-10 p-6 md:p-8 rounded-2xl border border-accent/30 bg-accent/5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Your checklist is downloading.</p>
            <p className="text-sm text-muted-foreground mt-1">
              If the download didn't start,{" "}
              <button
                type="button"
                onClick={generateChecklistPdf}
                className="text-accent hover:underline font-medium"
              >
                click here to retry
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 p-6 md:p-8 rounded-2xl border border-accent/30 bg-accent/5">
      <div className="flex items-start gap-4 mb-5">
        <FileDown className="w-7 h-7 text-accent shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Download the Printable 2026 Removal Checklist (PDF)
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Get a printable version of this checklist including tracking templates and submission workflow sheets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={255}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Download PDF
          </button>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-border accent-accent"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I agree to receive the checklist PDF. FootprintIQ will not share your email or send marketing
            without explicit consent.{" "}
            <a href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
