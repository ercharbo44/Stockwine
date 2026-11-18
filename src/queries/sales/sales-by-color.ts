import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./sales-by-color.dax?raw";
import spec from "./sales-by-color.json";

const connection = "vinsurvin";

const columnMetadata: ColumnMetadataMap = {
    "Vin[Couleur]": { name: "VinCouleur", displayName: "Couleur" },
    "[CA net]": { name: "CA net", displayName: "CA net", format: "€#,0" },
    "[Bouteilles]": { name: "Bouteilles", displayName: "Bouteilles", format: "#,0" },
};

export function salesByColor() {
    return { connection, query, columnMetadata, vegaLiteSpec: spec as VisualizationSpec };
}
