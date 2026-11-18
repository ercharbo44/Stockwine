//-----------------------------------------------------------------------
// Page Analyse des ventes : indicateurs et graphiques alimentés en direct
// par le semantic model Fabric « Vinsurvin Analytics » (requêtes DAX).
//-----------------------------------------------------------------------

import { ChartColumnIncreasing, Euro, Wine, ReceiptText, Percent, BadgeEuro } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge, ErrorBanner } from "@/components/ui/primitives";
import { ChartPanel } from "@/components/ui/chart-panel";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { tableToRecords } from "@/lib/fabric-data";
import { formatEuro0, formatEuro, formatInt } from "@/lib/format";
import { salesKpi, monthlyRevenue, topWines, salesByRegion, salesByColor } from "@/queries";

function num(v: unknown): number | null {
    if (v == null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
}

function SalesKpis() {
    const { connection, query } = salesKpi();
    const { data, isLoading, error } = useSemanticModelQuery({ connection, query });

    if (error || data?.status === "error") {
        return (
            <ErrorBanner
                message={
                    error?.message ??
                    (data?.status === "error" ? data.error.message : "Indicateurs indisponibles.")
                }
            />
        );
    }

    const rec = data?.status === "success" ? tableToRecords(data.table)[0] : undefined;

    return (
        <div className="grid grid-cols-2 gap-400 lg:grid-cols-3">
            <KpiCard label="CA net" value={formatEuro0(num(rec?.["CA net"]) ?? 0)} loading={isLoading} icon={<Euro className="icon-size-200" />} accent />
            <KpiCard label="CA brut" value={formatEuro0(num(rec?.["CA brut"]) ?? 0)} loading={isLoading} icon={<BadgeEuro className="icon-size-200" />} />
            <KpiCard label="Remises accordées" value={formatEuro0(num(rec?.["Remises"]) ?? 0)} loading={isLoading} icon={<Percent className="icon-size-200" />} />
            <KpiCard label="Bouteilles vendues" value={formatInt(num(rec?.["Bouteilles"]) ?? 0)} loading={isLoading} icon={<Wine className="icon-size-200" />} />
            <KpiCard label="Transactions" value={formatInt(num(rec?.["Transactions"]) ?? 0)} loading={isLoading} icon={<ReceiptText className="icon-size-200" />} />
            <KpiCard label="Prix moyen vendu" value={formatEuro(num(rec?.["PMV"]) ?? 0)} loading={isLoading} icon={<Euro className="icon-size-200" />} />
        </div>
    );
}

export function SalesPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Analyse des ventes"
                subtitle="Chiffre d'affaires, volumes et tendances de la cave."
                icon={<ChartColumnIncreasing className="icon-size-300" />}
                actions={<Badge tone="primary">Semantic model : Vinsurvin Analytics</Badge>}
            />

            <div className="mb-600">
                <SalesKpis />
            </div>

            <div className="mb-500">
                <ChartPanel
                    title="Évolution du chiffre d'affaires net"
                    description="Par mois, sur l'historique des ventes."
                    chart={monthlyRevenue()}
                    height={280}
                />
            </div>

            <div className="mb-500 grid grid-cols-1 gap-500 lg:grid-cols-2">
                <ChartPanel
                    title="Top 10 des vins"
                    description="Meilleures ventes par chiffre d'affaires net."
                    chart={topWines()}
                    height={320}
                />
                <ChartPanel
                    title="Ventes par région"
                    description="Répartition du CA net par région viticole."
                    chart={salesByRegion()}
                    height={320}
                />
            </div>

            <div className="grid grid-cols-1 gap-500 lg:grid-cols-2">
                <ChartPanel
                    title="Répartition par couleur"
                    description="Part de chaque couleur dans le CA net."
                    chart={salesByColor()}
                    height={300}
                />
            </div>
        </PageContainer>
    );
}
