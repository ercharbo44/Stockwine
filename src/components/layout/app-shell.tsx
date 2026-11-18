//-----------------------------------------------------------------------
// Ossature de l'application : menu latéral, barre supérieure mobile,
// bascule de thème et indicateur de source de données.
//-----------------------------------------------------------------------

import { useState, type ReactNode } from "react";
import { Menu, Moon, Sun, Wine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/hooks/theme.context";
import { useCellar } from "@/store/cellar-store";
import { NAV_ITEMS, type PageKey } from "./navigation";

const SOURCE_LABEL: Record<string, string> = {
    fabric: "Données Fabric",
    local: "Modifications locales",
    demo: "Jeu de démonstration",
};

export function AppShell({
    current,
    onNavigate,
    children,
}: {
    current: PageKey;
    onNavigate: (key: PageKey) => void;
    children: ReactNode;
}) {
    const { isDark, toggleTheme } = useThemeContext();
    const { alerts, source } = useCellar();
    const [mobileOpen, setMobileOpen] = useState(false);

    const go = (key: PageKey) => {
        onNavigate(key);
        setMobileOpen(false);
    };

    const groups: { id: "principal" | "analyse"; label: string }[] = [
        { id: "principal", label: "Gestion" },
        { id: "analyse", label: "Analyse & IA" },
    ];

    const sidebar = (
        <div className="flex h-full w-[264px] flex-col bg-card">
            {/* Marque */}
            <div className="flex items-center gap-300 px-500 py-500">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Wine className="icon-size-300" />
                </span>
                <div className="flex flex-col leading-tight">
                    <span className="font-heading text-500 font-semibold text-foreground">StockWine</span>
                    <span className="text-100 text-muted-foreground">Cave de supermarché</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-300 pb-400">
                {groups.map((group) => (
                    <div key={group.id} className="mb-400">
                        <p className="px-300 pb-200 pt-300 text-100 font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.label}
                        </p>
                        <ul className="flex flex-col gap-100-nudge">
                            {NAV_ITEMS.filter((n) => n.group === group.id).map((item) => {
                                const active = item.key === current;
                                const Icon = item.icon;
                                const alertCount = item.key === "alerts" ? alerts.length : 0;
                                return (
                                    <li key={item.key}>
                                        <button
                                            type="button"
                                            onClick={() => go(item.key)}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                "group flex w-full items-center gap-300 rounded-xl px-300 py-200 text-left transition-colors",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                active
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-foreground hover:bg-accent",
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "icon-size-300 shrink-0",
                                                    active ? "" : "text-muted-foreground group-hover:text-foreground",
                                                )}
                                            />
                                            <span className="flex-1 text-300 font-medium">{item.label}</span>
                                            {alertCount > 0 ? (
                                                <span
                                                    className={cn(
                                                        "flex h-5 min-w-5 items-center justify-center rounded-full px-100 text-100 font-semibold",
                                                        active
                                                            ? "bg-primary-foreground text-primary"
                                                            : "bg-destructive text-destructive-foreground",
                                                    )}
                                                >
                                                    {alertCount}
                                                </span>
                                            ) : null}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Pied : source + thème */}
            <div className="flex items-center justify-between gap-200 border-t border-border px-400 py-300">
                <span className="flex items-center gap-200 text-100 text-muted-foreground">
                    <span
                        className={cn(
                            "h-2 w-2 rounded-full",
                            source === "fabric" ? "bg-success" : source === "local" ? "bg-gold" : "bg-muted-foreground",
                        )}
                    />
                    {SOURCE_LABEL[source] ?? source}
                </span>
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {isDark ? <Sun className="icon-size-200" /> : <Moon className="icon-size-200" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-full min-h-screen w-full bg-background">
            {/* Sidebar bureau */}
            <aside className="hidden shrink-0 border-r border-border md:block">{sidebar}</aside>

            {/* Drawer mobile */}
            {mobileOpen ? (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-foreground/40"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden
                    />
                    <div className="absolute inset-y-0 left-0 border-r border-border shadow-xl">{sidebar}</div>
                </div>
            ) : null}

            {/* Colonne principale */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Barre supérieure mobile */}
                <header className="flex items-center gap-300 border-b border-border bg-card px-400 py-300 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Ouvrir le menu"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {mobileOpen ? <X className="icon-size-300" /> : <Menu className="icon-size-300" />}
                    </button>
                    <span className="flex items-center gap-200 font-heading text-400 font-semibold">
                        <Wine className="icon-size-200 text-primary" /> StockWine
                    </span>
                </header>

                <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
