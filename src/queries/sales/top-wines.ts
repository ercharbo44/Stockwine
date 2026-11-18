import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./top-wines.dax?raw";
import spec from "./top-wines.json";

const connection = "vinsurvin";

const columnMetadata: ColumnMetadataMap = {
    "Vin[Nom du vin]": { name: "VinNom du vin", displayName: "Vin" },
    "[CA net]": { name: "CA net", displayName: "CA net", format: "€#,0" },
    "[Bouteilles]": { name: "Bouteilles", displayName: "Bouteilles", format: "#,0" },
};

export function topWines() {
    return { connection, query, columnMetadata, vegaLiteSpec: spec as VisualizationSpec };
}
