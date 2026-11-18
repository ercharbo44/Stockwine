//-----------------------------------------------------------------------
// Formatage localisé (fr-FR) pour montants, nombres, dates et pourcentages.
//-----------------------------------------------------------------------

const eur = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
});

const eur0 = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
});

const int = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Montant en euros avec centimes (ex. « 72,78 € »). */
export function formatEuro(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "—";
    return eur.format(value);
}

/** Montant en euros arrondi (ex. « 589 254 € »). */
export function formatEuro0(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "—";
    return eur0.format(value);
}

/** Entier avec séparateur de milliers (ex. « 8 096 »). */
export function formatInt(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "—";
    return int.format(value);
}

/** Pourcentage à partir d'une fraction 0–1 (ex. 0.15 → « 15 % »). */
export function formatPercent(fraction: number | null | undefined, digits = 0): string {
    if (fraction == null || Number.isNaN(fraction)) return "—";
    return `${(fraction * 100).toLocaleString("fr-FR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })} %`;
}

/** Date courte (ex. « 12 mars 2026 »). Accepte Date ou chaîne ISO. */
export function formatDate(value: Date | string | null | undefined): string {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Date au format court numérique (ex. « 12/03/2026 »). */
export function formatDateShort(value: Date | string | null | undefined): string {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR");
}

/** Valeur ISO (yyyy-mm-dd) pour un <input type="date">. */
export function toDateInputValue(value: Date | string | null | undefined): string {
    if (!value) return "";
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
}
