//-----------------------------------------------------------------------
// Page Alertes : ruptures et références sous le seuil, avec réassort rapide.
//-----------------------------------------------------------------------

import { Bell, PackageX, TriangleAlert, Check, PackagePlus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge, Button, Card, EmptyState } from "@/components/ui/primitives";
import { WineThumb } from "@/components/ui/wine-visual";
import { useCellar } from "@/store/cellar-store";
import { formatInt } from "@/lib/format";

export function AlertsPage() {
    const { alerts, wineById, stockOf, setStock } = useCellar();

    const ruptures = alerts.filter((a) => a.kind === "rupture");
    const low = alerts.filter((a) => a.kind === "sous_seuil");

    const restock = (wineId: string) => {
        const s = stockOf(wineId);
        const target = Math.max((s?.minThreshold ?? 0) * 2, (s?.quantity ?? 0) + 12, 12);
        setStock(wineId, target, s?.minThreshold ?? 0);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Alertes de stock"
                subtitle="Ruptures et références passées sous leur seuil de réassort."
                icon={<Bell className="icon-size-300" />}
            />

            <div className="mb-600 grid grid-cols-2 gap-400 lg:grid-cols-3">
                <KpiCard label="Ruptures" value={formatInt(ruptures.length)} icon={<PackageX className="icon-size-200" />} accent />
                <KpiCard label="Sous le seuil" value={formatInt(low.length)} icon={<TriangleAlert className="icon-size-200" />} />
                <KpiCard label="Total alertes" value={formatInt(alerts.length)} icon={<Bell className="icon-size-200" />} />
            </div>

            {alerts.length === 0 ? (
                <EmptyState
                    icon={<Check className="icon-size-600" />}
                    title="Aucune alerte"
                    description="Toutes les références actives disposent d'un stock suffisant."
                />
            ) : (
                <Card className="overflow-hidden p-0">
                    <ul className="divide-y divide-border">
                        {alerts.map((a) => {
                            const wine = wineById(a.wineId);
                            if (!wine) return null;
                            return (
                                <li
                                    key={a.wineId}
                                    className="flex flex-col gap-300 px-500 py-400 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-300">
                                        <WineThumb color={wine.color} imageUrl={wine.imageUrl} className="h-12 w-10 shrink-0" />
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-medium text-foreground">{wine.name}</span>
                                            <span className="truncate text-100 text-muted-foreground">{a.message}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-300 self-end sm:self-auto">
                                        {a.kind === "rupture" ? (
                                            <Badge tone="danger">Rupture</Badge>
                                        ) : (
                                            <Badge tone="warning">
                                                {a.quantity}/{a.minThreshold}
                                            </Badge>
                                        )}
                                        <Button variant="outline" size="sm" onClick={() => restock(a.wineId)}>
                                            <PackagePlus className="icon-size-200" /> Réapprovisionner
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            )}
        </PageContainer>
    );
}
