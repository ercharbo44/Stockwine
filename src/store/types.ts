//-----------------------------------------------------------------------
// Types du domaine « cave de supermarché ».
//-----------------------------------------------------------------------

export type WineColor = "red" | "white" | "rose" | "sparkling" | "sweet";

export interface Wine {
    id: string;
    name: string;
    appellation: string;
    region: string;
    vintage: number | null;
    producer: string;
    color: WineColor;
    description: string | null;
    barcode: string | null;
    /** Prix de vente en euros. */
    price: number;
    imageUrl: string | null;
    active: boolean;
}

export interface StockItem {
    wineId: string;
    /** Quantité de bouteilles en stock. */
    quantity: number;
    /** Seuil minimal déclenchant une alerte de réassort. */
    minThreshold: number;
    /** Date ISO de dernière mise à jour. */
    updatedAt: string;
}

export interface Promotion {
    id: string;
    wineId: string;
    label: string;
    /** Remise exprimée en fraction 0–1 (ex. 0.15 = 15 %). */
    discount: number;
    /** Date ISO de début. */
    startDate: string;
    /** Date ISO de fin. */
    endDate: string;
    active: boolean;
}

export type AlertKind = "rupture" | "sous_seuil";

export interface StockAlert {
    wineId: string;
    kind: AlertKind;
    quantity: number;
    minThreshold: number;
    message: string;
}

/** Origine des données opérationnelles chargées dans le store. */
export type DataSource = "fabric" | "demo" | "local";

export const WINE_COLOR_LABELS: Record<WineColor, string> = {
    red: "Rouge",
    white: "Blanc",
    rose: "Rosé",
    sparkling: "Effervescent",
    sweet: "Liquoreux",
};

export const WINE_COLORS: WineColor[] = ["red", "white", "rose", "sparkling", "sweet"];
