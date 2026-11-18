//-----------------------------------------------------------------------
// Store « cave » : source unique de vérité pour le catalogue, le stock et
// les promotions. Les données sont initialisées depuis le semantic model
// Fabric (lecture seule) puis rendues pleinement modifiables via une couche
// locale persistée dans le localStorage (création / édition / suppression).
//-----------------------------------------------------------------------

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { isRunningInFabric } from "@microsoft/fabric-app-data-embed-client";

import { queryRecords, type DaxRecord } from "@/lib/fabric-data";
import { seedQueries } from "@/queries/seed";
import { DEMO_PROMOTIONS, DEMO_STOCK, DEMO_WINES } from "./demo-data";
import type {
    DataSource,
    Promotion,
    StockAlert,
    StockItem,
    Wine,
    WineColor,
} from "./types";

const STORAGE_KEY = "stockwine.cellar.v2";
const VALID_COLORS: WineColor[] = ["red", "white", "rose", "sparkling", "sweet"];

interface CellarState {
    wines: Wine[];
    stock: Record<string, StockItem>;
    promotions: Promotion[];
    source: DataSource;
}

type Status = "loading" | "ready" | "error";

export interface CellarContextValue {
    status: Status;
    source: DataSource;
    error: string | null;
    wines: Wine[];
    stock: Record<string, StockItem>;
    promotions: Promotion[];
    alerts: StockAlert[];
    wineById: (id: string) => Wine | undefined;
    stockOf: (wineId: string) => StockItem | undefined;
    activePromotionOf: (wineId: string) => Promotion | undefined;
    // Catalogue
    addWine: (wine: Omit<Wine, "id">, quantity: number, minThreshold: number) => void;
    updateWine: (id: string, patch: Partial<Omit<Wine, "id">>) => void;
    deleteWine: (id: string) => void;
    // Stock
    setStock: (wineId: string, quantity: number, minThreshold: number) => void;
    adjustStock: (wineId: string, delta: number) => void;
    // Promotions
    addPromotion: (promo: Omit<Promotion, "id">) => void;
    updatePromotion: (id: string, patch: Partial<Omit<Promotion, "id">>) => void;
    deletePromotion: (id: string) => void;
    // Divers
    resyncFromFabric: () => Promise<void>;
}

const CellarContext = createContext<CellarContextValue | null>(null);

/* --------------------------------------------------------------------- */
/* Helpers de lecture des enregistrements DAX                            */
/* --------------------------------------------------------------------- */

function findKey(rec: DaxRecord, needle: string): string | undefined {
    const n = needle.toLowerCase();
    return Object.keys(rec).find((k) => k.toLowerCase().includes(n));
}
function getStr(rec: DaxRecord, needle: string): string | null {
    const k = findKey(rec, needle);
    const v = k ? rec[k] : null;
    return v == null ? null : String(v);
}
function getNum(rec: DaxRecord, needle: string): number | null {
    const k = findKey(rec, needle);
    const v = k ? rec[k] : null;
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
}
function getBool(rec: DaxRecord, needle: string): boolean {
    const k = findKey(rec, needle);
    const v = k ? rec[k] : null;
    return v === true || v === 1 || v === "true" || v === "True";
}

function normalizeColor(raw: string | null): WineColor {
    const c = (raw ?? "").toLowerCase();
    return (VALID_COLORS as string[]).includes(c) ? (c as WineColor) : "red";
}

/** Ramène une remise à une fraction 0–1 (gère les valeurs exprimées en %). */
function normalizeDiscount(raw: number | null): number {
    const v = raw ?? 0;
    return v > 1 ? v / 100 : v;
}

function mapWine(rec: DaxRecord): Wine | null {
    const id = getStr(rec, "identifiant vin");
    const name = getStr(rec, "nom du vin");
    if (!id || !name) return null;
    return {
        id,
        name,
        appellation: getStr(rec, "appellation") ?? "",
        region: getStr(rec, "gion") ?? "",
        vintage: getNum(rec, "sime"),
        producer: getStr(rec, "producteur") ?? "",
        color: normalizeColor(getStr(rec, "couleur")),
        description: getStr(rec, "description"),
        barcode: getStr(rec, "barres"),
        price: getNum(rec, "prix") ?? 0,
        imageUrl: getStr(rec, "image"),
        active: getBool(rec, "actif"),
    };
}

function mapStock(rec: DaxRecord): StockItem | null {
    const wineId = getStr(rec, "identifiant vin");
    if (!wineId) return null;
    return {
        wineId,
        quantity: getNum(rec, "quantit") ?? 0,
        minThreshold: getNum(rec, "seuil") ?? 0,
        updatedAt: getStr(rec, "jour") ?? new Date().toISOString(),
    };
}

function mapPromotion(rec: DaxRecord): Promotion | null {
    const id = getStr(rec, "identifiant promotion");
    const wineId = getStr(rec, "identifiant vin");
    if (!id || !wineId) return null;
    const label = getStr(rec, "promotion") ?? "Promotion";
    return {
        id,
        wineId,
        label: label === id ? "Promotion" : label,
        discount: normalizeDiscount(getNum(rec, "remise")),
        startDate: getStr(rec, "but") ?? new Date().toISOString(),
        endDate: getStr(rec, "fin") ?? new Date().toISOString(),
        active: getBool(rec, "active"),
    };
}

/* --------------------------------------------------------------------- */
/* Persistance                                                           */
/* --------------------------------------------------------------------- */

function loadFromStorage(): CellarState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CellarState;
        if (!parsed.wines || !parsed.stock || !parsed.promotions) return null;
        return { ...parsed, source: "local" };
    } catch {
        return null;
    }
}

function saveToStorage(state: CellarState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* quota / mode privé — ignoré */
    }
}

function demoState(): CellarState {
    const stock: Record<string, StockItem> = {};
    DEMO_STOCK.forEach((s) => (stock[s.wineId] = s));
    return { wines: DEMO_WINES, stock, promotions: DEMO_PROMOTIONS, source: "demo" };
}

async function fabricState(): Promise<CellarState> {
    const [vinRecs, stockRecs, promoRecs] = await Promise.all([
        queryRecords(seedQueries.connection, seedQueries.vins),
        queryRecords(seedQueries.connection, seedQueries.stocks),
        queryRecords(seedQueries.connection, seedQueries.promotions),
    ]);
    const wines = vinRecs.map(mapWine).filter((w): w is Wine => w !== null);
    const stock: Record<string, StockItem> = {};
    stockRecs.forEach((r) => {
        const s = mapStock(r);
        if (s) stock[s.wineId] = s;
    });
    const promotions = promoRecs
        .map(mapPromotion)
        .filter((p): p is Promotion => p !== null);
    return { wines, stock, promotions, source: "fabric" };
}

function newId(prefix: string): string {
    const rand =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${rand}`;
}

/* --------------------------------------------------------------------- */
/* Provider                                                              */
/* --------------------------------------------------------------------- */

export function CellarProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CellarState | null>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [error, setError] = useState<string | null>(null);

    // Persiste à chaque évolution de l'état.
    useEffect(() => {
        if (state) saveToStorage(state);
    }, [state]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const cached = loadFromStorage();
            if (cached) {
                if (!cancelled) {
                    setState(cached);
                    setStatus("ready");
                }
                return;
            }
            try {
                const seeded = isRunningInFabric() ? await fabricState() : demoState();
                if (cancelled) return;
                setState(seeded);
                setStatus("ready");
            } catch (err) {
                if (cancelled) return;
                // Repli sur le jeu de démonstration en cas d'échec du seed Fabric.
                setState(demoState());
                setError(err instanceof Error ? err.message : String(err));
                setStatus("ready");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const resyncFromFabric = useCallback(async () => {
        setStatus("loading");
        setError(null);
        try {
            const seeded = isRunningInFabric() ? await fabricState() : demoState();
            setState(seeded);
            setStatus("ready");
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setStatus("ready");
        }
    }, []);

    const patch = useCallback((updater: (prev: CellarState) => CellarState) => {
        setState((prev) => {
            if (!prev) return prev;
            return updater(prev);
        });
    }, []);

    const value = useMemo<CellarContextValue>(() => {
        const wines = state?.wines ?? [];
        const stock = state?.stock ?? {};
        const promotions = state?.promotions ?? [];

        const wineById = (id: string) => wines.find((w) => w.id === id);
        const stockOf = (wineId: string) => stock[wineId];
        const activePromotionOf = (wineId: string) =>
            promotions.find((p) => p.wineId === wineId && p.active);

        const alerts: StockAlert[] = wines
            .filter((w) => w.active)
            .map((w) => {
                const s = stock[w.id];
                const qty = s?.quantity ?? 0;
                const threshold = s?.minThreshold ?? 0;
                if (qty <= 0) {
                    return {
                        wineId: w.id,
                        kind: "rupture" as const,
                        quantity: qty,
                        minThreshold: threshold,
                        message: `${w.name} est en rupture de stock.`,
                    };
                }
                if (threshold > 0 && qty < threshold) {
                    return {
                        wineId: w.id,
                        kind: "sous_seuil" as const,
                        quantity: qty,
                        minThreshold: threshold,
                        message: `${w.name} sous le seuil (${qty}/${threshold}).`,
                    };
                }
                return null;
            })
            .filter((a): a is StockAlert => a !== null)
            .sort((a, b) => (a.kind === b.kind ? a.quantity - b.quantity : a.kind === "rupture" ? -1 : 1));

        return {
            status,
            source: state?.source ?? "demo",
            error,
            wines,
            stock,
            promotions,
            alerts,
            wineById,
            stockOf,
            activePromotionOf,
            addWine: (wine, quantity, minThreshold) => {
                const id = newId("w");
                const nowIso = new Date().toISOString();
                patch((prev) => ({
                    ...prev,
                    wines: [{ ...wine, id }, ...prev.wines],
                    stock: {
                        ...prev.stock,
                        [id]: { wineId: id, quantity, minThreshold, updatedAt: nowIso },
                    },
                }));
            },
            updateWine: (id, wp) =>
                patch((prev) => ({
                    ...prev,
                    wines: prev.wines.map((w) => (w.id === id ? { ...w, ...wp } : w)),
                })),
            deleteWine: (id) =>
                patch((prev) => {
                    const nextStock = { ...prev.stock };
                    delete nextStock[id];
                    return {
                        ...prev,
                        wines: prev.wines.filter((w) => w.id !== id),
                        stock: nextStock,
                        promotions: prev.promotions.filter((p) => p.wineId !== id),
                    };
                }),
            setStock: (wineId, quantity, minThreshold) =>
                patch((prev) => ({
                    ...prev,
                    stock: {
                        ...prev.stock,
                        [wineId]: {
                            wineId,
                            quantity: Math.max(0, Math.round(quantity)),
                            minThreshold: Math.max(0, Math.round(minThreshold)),
                            updatedAt: new Date().toISOString(),
                        },
                    },
                })),
            adjustStock: (wineId, delta) =>
                patch((prev) => {
                    const cur = prev.stock[wineId];
                    const base = cur ?? {
                        wineId,
                        quantity: 0,
                        minThreshold: 0,
                        updatedAt: new Date().toISOString(),
                    };
                    return {
                        ...prev,
                        stock: {
                            ...prev.stock,
                            [wineId]: {
                                ...base,
                                quantity: Math.max(0, base.quantity + delta),
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    };
                }),
            addPromotion: (promo) =>
                patch((prev) => ({
                    ...prev,
                    promotions: [{ ...promo, id: newId("p") }, ...prev.promotions],
                })),
            updatePromotion: (id, pp) =>
                patch((prev) => ({
                    ...prev,
                    promotions: prev.promotions.map((p) => (p.id === id ? { ...p, ...pp } : p)),
                })),
            deletePromotion: (id) =>
                patch((prev) => ({
                    ...prev,
                    promotions: prev.promotions.filter((p) => p.id !== id),
                })),
            resyncFromFabric,
        };
    }, [state, status, error, patch, resyncFromFabric]);

    return <CellarContext.Provider value={value}>{children}</CellarContext.Provider>;
}

export function useCellar(): CellarContextValue {
    const ctx = useContext(CellarContext);
    if (!ctx) throw new Error("useCellar doit être utilisé dans un CellarProvider");
    return ctx;
}
