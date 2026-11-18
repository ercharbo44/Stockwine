//-----------------------------------------------------------------------
// Panneau graphique branché sur le semantic model Fabric : exécute la
// requête DAX, gère les états (chargement / vide / erreur) et rend le
// visuel Vega-Lite thémé.
//-----------------------------------------------------------------------

import { VegaVisual, useCssTheme, type VisualizationSpec } from "@microsoft/fabric-visuals";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable, type ColumnMetadataMap } from "@/lib/to-data-table";
import { Card, CardContent, CardHeader, CardTitle, ErrorBanner, Skeleton } from "./primitives";

export interface ChartSpec {
    connection: string;
    query: string;
    columnMetadata: ColumnMetadataMap;
    vegaLiteSpec: VisualizationSpec;
}

export function ChartPanel({
    title,
    description,
    chart,
    height = 300,
}: {
    title: string;
    description?: string;
    chart: ChartSpec;
    height?: number;
}) {
    const theme = useCssTheme();
    const { data, isLoading, error } = useSemanticModelQuery({
        connection: chart.connection,
        query: chart.query,
    });

    const success = data?.status === "success" ? data : undefined;
    const hasRows = (success?.table.rows.length ?? 0) > 0;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-400">{title}</CardTitle>
                {description ? (
                    <p className="text-200 text-muted-foreground">{description}</p>
                ) : null}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton style={{ height }} className="w-full" />
                ) : error || data?.status === "error" ? (
                    <ErrorBanner
                        message={
                            error?.message ??
                            (data?.status === "error" ? data.error.message : "Requête impossible.")
                        }
                    />
                ) : !hasRows ? (
                    <div
                        style={{ height }}
                        className="flex items-center justify-center text-200 text-muted-foreground"
                    >
                        Aucune donnée à afficher.
                    </div>
                ) : (
                    <div style={{ height }} className="w-full">
                        <VegaVisual
                            spec={chart.vegaLiteSpec}
                            data={toDataTable(success!.table, chart.columnMetadata)}
                            theme={theme}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
