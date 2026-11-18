import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./kpi.dax?raw";

const connection = "vinsurvin";

const columnMetadata: ColumnMetadataMap = {
    "[CA net]": { name: "CA net", displayName: "CA net", format: "€#,0" },
    "[CA brut]": { name: "CA brut", displayName: "CA brut", format: "€#,0" },
    "[Bouteilles]": { name: "Bouteilles", displayName: "Bouteilles vendues", format: "#,0" },
    "[Transactions]": { name: "Transactions", displayName: "Transactions", format: "#,0" },
    "[Remises]": { name: "Remises", displayName: "Remises accordées", format: "€#,0" },
    "[PMV]": { name: "PMV", displayName: "Prix moyen vendu", format: "€#,0.00" },
};

export function salesKpi() {
    return { connection, query, columnMetadata };
}
