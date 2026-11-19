import { useState } from "react";
import { VegaVisual, useCssTheme } from "@microsoft/fabric-visuals";
import { convertDataTableToRows } from "@microsoft/fabric-visuals-core";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable } from "@/lib/to-data-table";
import { formatEuro0, formatInt } from "@/lib/format";
import { salesByRegion, prepareSalesRegionMap } from "@/queries/sales/sales-by-region";
import { Card, CardContent, CardHeader, CardTitle, ErrorBanner, Skeleton } from "@/components/ui/primitives";

export function SalesRegionMap() {
    const chart = salesByRegion();
    const theme = useCssTheme();
    const [selection, setSelection] = useState(false);
    const { data, isLoading, error } = useSemanticModelQuery({
        connection: chart.connection,
        query: chart.query,
    });
    const table = data?.status === "success" ? toDataTable(data.table, chart.columnMetadata) : undefined;
    const prepared = table ? prepareSalesRegionMap(table) : undefined;
    const records = table ? convertDataTableToRows(table) : [];

    return (
        <Card className="min-w-0">
            <CardHeader>
                <CardTitle className="text-400">Ventes par région viticole</CardTitle>
                <p className="text-200 text-muted-foreground">
                    Origine des vins, et non localisation des acheteurs.
                </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-300">
                {isLoading ? <Skeleton className="sales-region-map-height w-full" /> : error || data?.status === "error" ? (
                    <ErrorBanner message={error?.message ?? (data?.status === "error" ? data.error.message : "Requête impossible.")} />
                ) : !prepared || !records.length ? (
                    <p className="text-200 text-muted-foreground">Aucune donnée à afficher.</p>
                ) : (
                    <>
                        <p className="text-200 text-muted-foreground">
                            France schématique · Repères indicatifs, sans limites de vignobles.
                            Surface des bulles proportionnelle au CA net en valeur absolue.
                            Un contour rouge signale un CA négatif ; un cercle vide un CA nul ou absent.
                        </p>
                        {prepared.mapTable.rows.length ? (
                            <div className="sales-region-map-height w-full" aria-label="Carte des ventes par origine viticole">
                                <VegaVisual
                                    spec={chart.vegaLiteSpec}
                                    data={prepared.mapTable}
                                    theme={theme}
                                    onInteraction={(events) => setSelection(events.some((event) => event.action === "select"))}
                                />
                            </div>
                        ) : (
                            <p role="status" className="text-200 text-muted-foreground">
                                Aucune origine ne peut être placée sur la carte.
                            </p>
                        )}
                        {prepared.unmappedRegions.length ? (
                            <p role="status" className="rounded-lg bg-secondary p-300 text-200 text-secondary-foreground">
                                Origines non localisées : {prepared.unmappedRegions.join(", ")}.
                                Leurs ventes sont conservées dans le détail ci-dessous.
                            </p>
                        ) : null}
                        <details open={selection || prepared.unmappedRegions.length > 0 ? true : undefined}>
                            <summary className="cursor-pointer rounded-lg text-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                Détail de toutes les origines · CA net et bouteilles
                            </summary>
                            <div className="mt-300 overflow-auto">
                                <table className="w-full text-200">
                                    <caption className="sr-only">Ventes par origine viticole, y compris les origines non localisées</caption>
                                    <thead>
                                        <tr className="border-b border-border text-left">
                                            <th scope="col" className="p-200">Origine</th>
                                            <th scope="col" className="p-200 text-right">CA net</th>
                                            <th scope="col" className="p-200 text-right">Bouteilles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((record, index) => (
                                            <tr key={`${prepared.rows[index].region}-${index}`} className="border-b border-border">
                                                <th scope="row" className="p-200 text-left font-medium">
                                                    {prepared.rows[index].region}
                                                    {!prepared.rows[index].located ? " (non localisée)" : ""}
                                                </th>
                                                <td className="p-200 text-right whitespace-nowrap">{formatEuro0(typeof record["CA net"] === "number" ? record["CA net"] : null)}</td>
                                                <td className="p-200 text-right">{formatInt(typeof record.Bouteilles === "number" ? record.Bouteilles : null)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
