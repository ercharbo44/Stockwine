//-----------------------------------------------------------------------
// Jeu de données de démonstration utilisé en repli lorsque l'application
// n'est pas exécutée dans Fabric (développement local, tests).
//-----------------------------------------------------------------------

import type { Promotion, StockItem, Wine } from "./types";

const now = new Date().toISOString();

export const DEMO_WINES: Wine[] = [
    { id: "w-01", name: "Château Margaux", appellation: "Margaux", region: "Bordeaux", vintage: 2016, producer: "Château Margaux", color: "red", description: "Grand cru classé, bouquet floral et tanins soyeux.", barcode: "3760000000101", price: 42.9, imageUrl: null, active: true },
    { id: "w-02", name: "Pouilly-Fuissé Vieilles Vignes", appellation: "Pouilly-Fuissé", region: "Bourgogne", vintage: 2021, producer: "Domaine Ferret", color: "white", description: "Blanc minéral, notes d'agrumes et de noisette.", barcode: "3760000000102", price: 24.5, active: true, imageUrl: null },
    { id: "w-03", name: "Côtes de Provence Rosé", appellation: "Côtes de Provence", region: "Provence", vintage: 2022, producer: "Château Minuty", color: "rose", description: "Rosé pâle et frais, fruits rouges délicats.", barcode: "3760000000103", price: 15.9, active: true, imageUrl: null },
    { id: "w-04", name: "Champagne Brut Réserve", appellation: "Champagne", region: "Champagne", vintage: null, producer: "Pol Roger", color: "sparkling", description: "Bulles fines, équilibre entre fraîcheur et vinosité.", barcode: "3760000000104", price: 38.0, active: true, imageUrl: null },
    { id: "w-05", name: "Sauternes Premier Cru", appellation: "Sauternes", region: "Bordeaux", vintage: 2018, producer: "Château Guiraud", color: "sweet", description: "Liquoreux d'exception, abricot confit et miel.", barcode: "3760000000105", price: 34.5, active: true, imageUrl: null },
    { id: "w-06", name: "Chablis Premier Cru", appellation: "Chablis", region: "Bourgogne", vintage: 2021, producer: "Domaine Laroche", color: "white", description: "Tension iodée, finale saline.", barcode: "3760000000106", price: 27.9, active: true, imageUrl: null },
    { id: "w-07", name: "Châteauneuf-du-Pape", appellation: "Châteauneuf-du-Pape", region: "Vallée du Rhône", vintage: 2019, producer: "Domaine du Vieux Télégraphe", color: "red", description: "Puissant et épicé, garrigue et fruits noirs.", barcode: "3760000000107", price: 32.0, active: true, imageUrl: null },
    { id: "w-08", name: "Sancerre Blanc", appellation: "Sancerre", region: "Loire", vintage: 2022, producer: "Henri Bourgeois", color: "white", description: "Sauvignon vif, buis et fruit blanc.", barcode: "3760000000108", price: 19.5, active: true, imageUrl: null },
    { id: "w-09", name: "Crémant d'Alsace", appellation: "Crémant d'Alsace", region: "Alsace", vintage: null, producer: "Maison Dopff", color: "sparkling", description: "Effervescent gourmand, pomme et brioche.", barcode: "3760000000109", price: 13.9, active: true, imageUrl: null },
    { id: "w-10", name: "Gigondas", appellation: "Gigondas", region: "Vallée du Rhône", vintage: 2020, producer: "Domaine Santa Duc", color: "red", description: "Rond et généreux, cerise et réglisse.", barcode: "3760000000110", price: 22.0, active: true, imageUrl: null },
    { id: "w-11", name: "Tavel Rosé", appellation: "Tavel", region: "Vallée du Rhône", vintage: 2022, producer: "Château d'Aquéria", color: "rose", description: "Rosé de gastronomie, structure et fruit.", barcode: "3760000000111", price: 14.5, active: true, imageUrl: null },
    { id: "w-12", name: "Muscat de Beaumes-de-Venise", appellation: "Beaumes-de-Venise", region: "Vallée du Rhône", vintage: 2021, producer: "Domaine des Bernardins", color: "sweet", description: "Vin doux naturel, fleur d'oranger et raisin frais.", barcode: "3760000000112", price: 16.0, active: false, imageUrl: null },
];

export const DEMO_STOCK: StockItem[] = [
    { wineId: "w-01", quantity: 8, minThreshold: 6, updatedAt: now },
    { wineId: "w-02", quantity: 24, minThreshold: 12, updatedAt: now },
    { wineId: "w-03", quantity: 0, minThreshold: 10, updatedAt: now },
    { wineId: "w-04", quantity: 5, minThreshold: 8, updatedAt: now },
    { wineId: "w-05", quantity: 14, minThreshold: 6, updatedAt: now },
    { wineId: "w-06", quantity: 3, minThreshold: 10, updatedAt: now },
    { wineId: "w-07", quantity: 18, minThreshold: 8, updatedAt: now },
    { wineId: "w-08", quantity: 30, minThreshold: 12, updatedAt: now },
    { wineId: "w-09", quantity: 0, minThreshold: 12, updatedAt: now },
    { wineId: "w-10", quantity: 22, minThreshold: 10, updatedAt: now },
    { wineId: "w-11", quantity: 9, minThreshold: 10, updatedAt: now },
    { wineId: "w-12", quantity: 40, minThreshold: 6, updatedAt: now },
];

const in30Days = new Date(Date.now() + 30 * 864e5).toISOString();
const minus5Days = new Date(Date.now() - 5 * 864e5).toISOString();

export const DEMO_PROMOTIONS: Promotion[] = [
    { id: "p-01", wineId: "w-03", label: "Foire aux vins d'été", discount: 0.2, startDate: minus5Days, endDate: in30Days, active: true },
    { id: "p-02", wineId: "w-04", label: "Fêtes de fin d'année", discount: 0.15, startDate: minus5Days, endDate: in30Days, active: true },
    { id: "p-03", wineId: "w-10", label: "Déstockage millésime", discount: 0.1, startDate: minus5Days, endDate: in30Days, active: false },
];
