import { describe, expect, it } from "vitest";
import type { QueryTable } from "@microsoft/fabric-app-data";
import { toDataTable } from "@/lib/to-data-table";
import { prepareSalesRegionMap, salesByRegion } from "./sales-by-region";

// Colonnes et premières lignes observées avec la requête réelle.
const queryResult: QueryTable = {
    columns: [
        { name: "Vin[Région]", dataType: "unknown" },
        { name: "[CA net]", dataType: "unknown" },
        { name: "[Bouteilles]", dataType: "unknown" },
    ],
    rows: [
        ["Alsace", 60660.015999999996, 814],
        ["Languedoc", 60532.00400000001, 810],
        ["Loire", 60147.946500000005, 810],
        ["Provence", 59310.785, 810],
        ["Sud-Ouest", 59066.465, 810],
        ["Vallee du Rhone", 58987.9945, 806],
        ["Bourgogne", 58263.1075, 810],
        ["Beaujolais", 57531.38450000001, 806],
        ["Champagne", 57449.461, 814],
        ["Bordeaux", 57304.72, 806],
    ],
};

function prepare(rows = queryResult.rows) {
    return prepareSalesRegionMap(toDataTable(
        { ...queryResult, rows },
        salesByRegion().columnMetadata,
    ));
}

describe("salesByRegion map", () => {
    it("locates all observed origins without altering their labels or measures", () => {
        const result = prepare();
        expect(result.unmappedRegions).toEqual([]);
        expect(result.mapTable.rows.map((row) => row.slice(0, 3))).toEqual(queryResult.rows);
        expect(queryResult.rows.every((row) => row.length === 3)).toBe(true);
    });

    it("matches accents, spacing and hyphens without merging distinct source rows", () => {
        const result = prepare([
            [" Vallée   du Rhône ", 58987.9945, 806],
            ["Vallee-du-Rhone", 58987.9945, 806],
            ["SUD OUEST", 59066.465, 810],
        ]);
        expect(result.unmappedRegions).toEqual([]);
        expect(result.mapTable.rows[0].slice(3)).toEqual(result.mapTable.rows[1].slice(3));
        expect(result.mapTable.rows).toHaveLength(3);
    });

    it("retains unknown, blank and administrative origins outside the map", () => {
        const rows = [
            ["Nouvelle-Aquitaine", 57304.72, 806],
            ["Origine inconnue", 60147.946500000005, 810],
            [null, 59066.465, 810],
            ["  ", 59310.785, 810],
        ];
        const result = prepare(rows);
        expect(result.mapTable.rows).toEqual([]);
        expect(result.unmappedRegions).toEqual([
            "Nouvelle-Aquitaine", "Origine inconnue", "Non renseignée", "Non renseignée",
        ]);
        expect(result.rows.map((row) => row.values.slice(0, 3))).toEqual(rows);
    });

    it("preserves zero, missing and negative revenue for truthful tooltips and detail", () => {
        const rows = [["Alsace", 0, 814], ["Loire", null, 810], ["Bordeaux", -57304.72, 806]];
        expect(prepare(rows).mapTable.rows.map((row) => row.slice(0, 3))).toEqual(rows);
    });

    it("supports empty results and reports a missing region column explicitly", () => {
        expect(prepare([]).rows).toEqual([]);
        expect(() => prepareSalesRegionMap({ columns: [], rows: [] }))
            .toThrow("Colonne Région absente");
    });
});
