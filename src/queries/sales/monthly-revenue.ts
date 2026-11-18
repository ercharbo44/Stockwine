import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./monthly-revenue.dax?raw";
import spec from "./monthly-revenue.json";

const connection = "vinsurvin";

const columnMetadata: ColumnMetadataMap = {
    "[Mois]": { name: "Mois", displayName: "Mois" },
    "[CA net]": { name: "CA net", displayName: "CA net", format: "€#,0" },
    "[Bouteilles]": { name: "Bouteilles", displayName: "Bouteilles", format: "#,0" },
};

export function monthlyRevenue() {
    return { connection, query, columnMetadata, vegaLiteSpec: spec as VisualizationSpec };
}
