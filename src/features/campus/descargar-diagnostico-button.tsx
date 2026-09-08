"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { buildDiagnosticoPdf, diagnosticoReportFilename, type DiagnosticoReportData } from "@/lib/diagnostico/report-pdf";
import { Button } from "@/components/ui/button";

export function DescargarDiagnosticoButton({ data }: { data: DiagnosticoReportData }) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  async function handleClick() {
    setIsDownloading(true);
    try {
      const doc = await buildDiagnosticoPdf(data);
      doc.save(diagnosticoReportFilename(data));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleClick} disabled={isDownloading}>
      {isDownloading ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
      PDF
    </Button>
  );
}
