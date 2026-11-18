//-----------------------------------------------------------------------
// Page Stock : suivi des quantités, seuils de réassort et ajustements.
//-----------------------------------------------------------------------

import { useState } from "react";
import { Boxes, Minus, Plus, Euro, PackageX, TriangleAlert } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge, Button, Card, EmptyState, Input } from "@/components/ui/primitives";
import { WineThumb } from "@/components/ui/wine-visual";
import { useCellar } from "@/store/cellar-store";
import { formatEuro0, formatInt, formatDateShort } from "@/lib/format";

type StockFilter = "all" | "rupture" | "low";

export function StockPage() {
    const { wines, stock, setStock, adjustStock } = useCellar();
    const [filter, setFilter] = useState<StockFilter>("all");

    const bottles = Object.values(stock).reduce((s, i) => s + i.quantity, 0);
    const stockValue = wines.reduce((s, w) => s + w.price * (stock[w.id]?.quantity ?? 0), 0);
    const ruptures = wines.filter((w) => w.active && (stock[w.id]?.quantity ?? 0) <= 0).length;
    const low = wines.filter((w) => {
        const s = stock[w.id];
        return w.active && s && s.quantity > 0 && s.minThreshold > 0 && s.quantity < s.minThreshold;
    }).length;

    const rows = [...wines]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((w) => {
            const qty = stock[w.id]?.quantity ?? 0;
            const threshold = stock[w.id]?.minThreshold ?? 0;
            if (filter === "rupture") return qty <= 0;
            if (filter === "low") return qty > 0 && threshold > 0 && qty < threshold;
            return true;
        });

    const tabs: { key: StockFilter; label: string; count: number }[] = [
        { key: "all", label: "Tous", count: wines.length },
        { key: "rupture", label: "Ruptures", count: ruptures },
        { key: "low", label: "Stock bas", count: low },
    ];

    return (
        <PageContainer>
            <PageHeader
                title="Gestion du stock"
                subtitle="Ajustez les quantités et les seuils de réassort de chaque référence."
                icon={<Boxes className="icon-size-300" />}
            />

            <div className="mb-600 grid grid-cols-2 gap-400 lg:grid-cols-4">
                <KpiCard label="Bouteilles en stock" value={formatInt(bottles)} icon={<Boxes className="icon-size-200" />} accent />
                <KpiCard label="Valeur du stock" value={formatEuro0(stockValue)} icon={<Euro className="icon-size-200" />} />
                <KpiCard label="Ruptures" value={formatInt(ruptures)} icon={<PackageX className="icon-size-200" />} />
                <KpiCard label="Sous le seuil" value={formatInt(low)} icon={<TriangleAlert className="icon-size-200" />} />
            </div>

            <div className="mb-400 flex items-center gap-200">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setFilter(t.key)}
                        className={
                            "inline-flex items-center gap-200 rounded-full px-300 py-200 text-200 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                            (filter === t.key
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-accent")
                        }
                    >
                        {t.label}
                        <span className="rounded-full bg-black/10 px-100 text-100 dark:bg-white/15">{t.count}</span>
                    </button>
                ))}
            </div>

            {rows.length === 0 ? (
                <EmptyState
                    icon={<Boxes className="icon-size-600" />}
                    title="Aucune référence dans cette vue"
                    description="Modifiez le filtre pour afficher d'autres références."
                />
            ) : (
                <Card className="overflow-hidden p-0">
                    {/* En-tête tableau (bureau) */}
                    <div className="hidden grid-cols-[1fr_180px_120px_150px] items-center gap-300 border-b border-border px-500 py-300 text-100 font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                        <span>Vin</span>
                        <span className="text-center">Quantité</span>
                        <span className="text-center">Seuil</span>
                        <span className="text-right">Statut</span>
                    </div>
                    <ul className="divide-y divide-border">
                        {rows.map((w) => {
                            const s = stock[w.id];
                            const qty = s?.quantity ?? 0;
                            const threshold = s?.minThreshold ?? 0;
                            const rupture = qty <= 0;
                            const sousSeuil = !rupture && threshold > 0 && qty < threshold;
                            return (
                                <li
                                    key={w.id}
                                    className="grid grid-cols-1 gap-300 px-500 py-400 md:grid-cols-[1fr_180px_120px_150px] md:items-center"
                                >
                                    {/* Vin */}
                                    <div className="flex items-center gap-300">
                                        <WineThumb color={w.color} imageUrl={w.imageUrl} className="h-12 w-10 shrink-0" />
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-medium text-foreground">{w.name}</span>
                                            <span className="truncate text-100 text-muted-foreground">
                                                {[w.region, w.vintage].filter(Boolean).join(" · ")} · maj {formatDateShort(s?.updatedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quantité */}
                                    <div className="flex items-center justify-start gap-200 md:justify-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            aria-label="Retirer une bouteille"
                                            onClick={() => adjustStock(w.id, -1)}
                                            disabled={qty <= 0}
                                        >
                                            <Minus className="icon-size-200" />
                                        </Button>
                                        <span className="w-10 text-center font-numeric text-400 font-semibold text-foreground">
                                            {qty}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            aria-label="Ajouter une bouteille"
                                            onClick={() => adjustStock(w.id, 1)}
                                        >
                                            <Plus className="icon-size-200" />
                                        </Button>
                                    </div>

                                    {/* Seuil */}
                                    <div className="flex items-center gap-200 md:justify-center">
                                        <span className="text-100 text-muted-foreground md:hidden">Seuil</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            defaultValue={threshold}
                                            aria-label={`Seuil pour ${w.name}`}
                                            onBlur={(e) => {
                                                const v = Math.max(0, Number(e.target.value) || 0);
                                                if (v !== threshold) setStock(w.id, qty, v);
                                            }}
                                            className="h-9 w-20 text-center"
                                        />
                                    </div>

                                    {/* Statut */}
                                    <div className="flex md:justify-end">
                                        {rupture ? (
                                            <Badge tone="danger">Rupture</Badge>
                                        ) : sousSeuil ? (
                                            <Badge tone="warning">Stock bas</Badge>
                                        ) : (
                                            <Badge tone="success">Disponible</Badge>
                                        )}
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
