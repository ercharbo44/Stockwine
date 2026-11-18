//-----------------------------------------------------------------------
// Définition du menu de navigation de l'application.
//-----------------------------------------------------------------------

import {
    Home,
    Wine,
    Boxes,
    Tag,
    ChartColumnIncreasing,
    Bell,
    FileChartColumn,
    Sparkles,
    type LucideIcon,
} from "lucide-react";

export type PageKey =
    | "home"
    | "catalog"
    | "stock"
    | "promotions"
    | "sales"
    | "alerts"
    | "report"
    | "sommelier";

export interface NavItem {
    key: PageKey;
    label: string;
    description: string;
    icon: LucideIcon;
    group: "principal" | "analyse";
}

export const NAV_ITEMS: NavItem[] = [
    { key: "home", label: "Accueil", description: "Vue d'ensemble de la cave", icon: Home, group: "principal" },
    { key: "catalog", label: "Catalogue", description: "Référencer et gérer les vins", icon: Wine, group: "principal" },
    { key: "stock", label: "Stock", description: "Quantités et seuils de réassort", icon: Boxes, group: "principal" },
    { key: "promotions", label: "Promotions", description: "Offres commerciales", icon: Tag, group: "principal" },
    { key: "alerts", label: "Alertes", description: "Ruptures et seuils critiques", icon: Bell, group: "principal" },
    { key: "sales", label: "Analyse des ventes", description: "Semantic model Fabric", icon: ChartColumnIncreasing, group: "analyse" },
    { key: "report", label: "Rapport Power BI", description: "suivistock (intégré)", icon: FileChartColumn, group: "analyse" },
    { key: "sommelier", label: "Sommelier", description: "Data agent Fabric", icon: Sparkles, group: "analyse" },
];

export function navItem(key: PageKey): NavItem {
    return NAV_ITEMS.find((n) => n.key === key) ?? NAV_ITEMS[0];
}
