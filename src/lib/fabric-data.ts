//-----------------------------------------------------------------------
// Helpers d'exécution DAX contre le semantic model Fabric et conversion
// des résultats en enregistrements exploitables côté application.
//-----------------------------------------------------------------------

import type { QueryTable } from "@microsoft/fabric-app-data";
import { getFabricClient } from "@/lib/fabric-client";

export type DaxRecord = Record<string, unknown>;

/**
 * Exécute une requête DAX et renvoie la table brute (colonnes + lignes).
 * Ne lève jamais côté SDK — on convertit les erreurs en exception ici pour
 * simplifier la consommation dans les hooks/stores.
 */
export async function runDax(connection: string, query: string): Promise<QueryTable> {
    const result = await getFabricClient().semanticModel(connection).query(query);
    if (result.status === "error") {
        throw new Error(result.error.message);
    }
    return result.table;
}

/** Nom de colonne brut → nom court sans préfixe de table ni crochets. */
export function shortColumnName(name: string): string {
    const bracket = name.lastIndexOf("[");
    if (bracket >= 0) return name.slice(bracket + 1).replace(/]$/, "");
    return name;
}

/** Convertit une table DAX en tableau d'objets clés par nom de colonne court. */
export function tableToRecords(table: QueryTable): DaxRecord[] {
    const keys = table.columns.map((c) => shortColumnName(c.name));
    return table.rows.map((row) => {
        const rec: DaxRecord = {};
        keys.forEach((k, i) => {
            rec[k] = row[i];
        });
        return rec;
    });
}

/** Exécute une requête DAX et renvoie directement des enregistrements. */
export async function queryRecords(connection: string, query: string): Promise<DaxRecord[]> {
    return tableToRecords(await runDax(connection, query));
}
