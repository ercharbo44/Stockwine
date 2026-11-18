import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./sales-by-region.dax?raw";
import spec from "./sales-by-region.json";

const connection = "vinsurvin";

const columnMetadata: ColumnMetadataMap = {
    "Vin[Région]": { name: "VinRégion", displayName: "Région" },
    "[CA net]": { name: "CA net", displayName: "CA net", format: "€#,0" },
    "[Bouteilles]": { name: "Bouteilles", displayName: "Bouteilles", format: "#,0" },
};

export function salesByRegion() {
    return { connection, query, columnMetadata, vegaLiteSpec: spec as VisualizationSpec };
}
