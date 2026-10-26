"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { buildInformePdf, informeFilename, type InformePruebaData } from "@/lib/prueba-gratuita/informe-pdf";
import { Button } from "@/components/ui/button";

export function DescargarInformeButton({ data }: { data: InformePruebaData }) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  async function handleClick() {
    setIsDownloading(true);
    try {
      const doc = await buildInformePdf(data);
      doc.save(informeFilename(data));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={handleClick} disabled={isDownloading}>
      {isDownloading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
      {isDownloading ? "Generando PDF…" : "Descargar PDF"}
    </Button>
  );
}
