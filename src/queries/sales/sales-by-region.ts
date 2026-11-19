import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./sales-by-region.dax?raw";
import spec from "./sales-by-region.json";
import locations from "./sales-by-region-locations.json";

const connection = "vinsurvin";

const columnMetadata: ColumnMetadataMap = {
    "Vin[Région]": { name: "VinRégion", displayName: "Région" },
    "[CA net]": { name: "CA net", displayName: "CA net", format: "€#,0" },
    "[Bouteilles]": { name: "Bouteilles", displayName: "Bouteilles", format: "#,0" },
};

export function salesByRegion() {
    return { connection, query, columnMetadata, vegaLiteSpec: spec as VisualizationSpec };
}

function normalizeRegion(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[-–—'’]/g, " ").replace(/\s+/g, " ").trim();
}

// Repères indicatifs, pas des centroïdes ni des frontières d'appellations.
const locationsByName = new Map(
    locations.flatMap((location) =>
        location.aliases.map((alias) => [normalizeRegion(alias), location] as const),
    ),
);

export function prepareSalesRegionMap(table: DataTable) {
    const regionIndex = table.columns.findIndex((column) => column.name === "VinRégion");
    if (regionIndex < 0) throw new Error("Colonne Région absente des ventes par région.");

    const rows = table.rows.map((row) => {
        const label = row[regionIndex];
        const region = typeof label === "string" && label.trim() ? label : "Non renseignée";
        const location = typeof label === "string" ? locationsByName.get(normalizeRegion(label)) : undefined;
        return {
            region,
            located: location !== undefined,
            values: [...row, location?.longitude ?? null, location?.latitude ?? null],
        };
    });

    return {
        rows,
        unmappedRegions: rows.filter((row) => !row.located).map((row) => row.region),
        mapTable: {
            columns: [...table.columns, { name: "Longitude" }, { name: "Latitude" }],
            rows: rows.filter((row) => row.located).map((row) => row.values),
        } satisfies DataTable,
    };
}
