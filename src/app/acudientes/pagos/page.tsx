import { Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ListRow, listRowToneFromStatus } from "@/components/shared/list-row";
import { invoices, planSummary } from "@/lib/data/acudientes";

export default function AcudientesPagosPage() {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-5">
        <div>
          <div className="text-base font-bold text-heading">Plan: {planSummary.name}</div>
          <div className="text-xs text-muted-foreground">
            {planSummary.amount} · {planSummary.nextPayment}
          </div>
        </div>
        <Button>Ver métodos de pago</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {invoices.map((inv) => (
            <ListRow
              key={inv.desc}
              icon={Receipt}
              tone={listRowToneFromStatus(inv.tone)}
              title={inv.desc}
              subtitle={inv.date}
              trailing={
                <>
                  <span className="text-sm font-bold text-heading">{inv.amount}</span>
                  <StatusBadge tone={inv.tone}>{inv.status}</StatusBadge>
                </>
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
