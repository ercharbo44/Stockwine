//-----------------------------------------------------------------------
// Page d'accueil : hero, indicateurs clés et accès rapide aux modules.
//-----------------------------------------------------------------------

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Wine,
    Boxes,
    Tag,
    Bell,
    ChartColumnIncreasing,
    ArrowRight,
    Euro,
    Sparkles,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button, Card } from "@/components/ui/primitives";
import { useCellar } from "@/store/cellar-store";
import { formatEuro0, formatInt } from "@/lib/format";
import type { PageKey } from "@/components/layout/navigation";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=1600&q=80";

export function HomePage({ onNavigate }: { onNavigate: (key: PageKey) => void }) {
    const { wines, stock, promotions, alerts } = useCellar();
    const [heroOk, setHeroOk] = useState(true);

    const activeWines = wines.filter((w) => w.active).length;
    const bottles = Object.values(stock).reduce((sum, s) => sum + s.quantity, 0);
    const stockValue = wines.reduce((sum, w) => sum + w.price * (stock[w.id]?.quantity ?? 0), 0);
    const activePromos = promotions.filter((p) => p.active).length;

    const quickLinks: {
        key: PageKey;
        title: string;
        text: string;
        icon: typeof Wine;
    }[] = [
        { key: "catalog", title: "Catalogue", text: "Référencer un vin et sa quantité", icon: Wine },
        { key: "stock", title: "Stock", text: "Ajuster quantités et seuils", icon: Boxes },
        { key: "promotions", title: "Promotions", text: "Créer et piloter les offres", icon: Tag },
        { key: "sales", title: "Analyse des ventes", text: "Semantic model Fabric en direct", icon: ChartColumnIncreasing },
        { key: "report", title: "Rapport Power BI", text: "suivistock intégré", icon: Sparkles },
        { key: "sommelier", title: "Sommelier", text: "Assistant IA sur vos données", icon: Sparkles },
    ];

    return (
        <PageContainer>
            {/* Hero */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative mb-700 overflow-hidden rounded-4xl border border-border"
                style={{ minHeight: 340 }}
            >
                {heroOk ? (
                    <img
                        src={HERO_IMAGE}
                        alt="Bouteille de vin"
                        onError={() => setHeroOk(false)}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : null}
                <div
                    className="absolute inset-0"
                    style={{
                        background: heroOk
                            ? "linear-gradient(100deg, rgba(42,20,24,0.92) 0%, rgba(123,30,59,0.72) 45%, rgba(123,30,59,0.15) 100%)"
                            : "linear-gradient(120deg, #2a1418 0%, #7b1e3b 100%)",
                    }}
                    aria-hidden
                />
                <div className="relative flex min-h-[340px] flex-col justify-center gap-400 p-600 md:max-w-[620px] md:p-800">
                    <span className="inline-flex w-fit items-center gap-200 rounded-full bg-white/15 px-300 py-100 text-100 font-medium text-white backdrop-blur">
                        <Wine className="icon-size-100" /> Cave connectée à Microsoft Fabric
                    </span>
                    <h1 className="font-heading text-hero-900 font-semibold leading-hero-900 text-white">
                        Pilotez votre cave, de la bouteille au chiffre d'affaires
                    </h1>
                    <p className="max-w-[520px] text-400 leading-400 text-white/85">
                        Catalogue, stock, promotions et analyses des ventes réunis dans une seule
                        application, alimentée en direct par vos données Fabric.
                    </p>
                    <div className="flex flex-wrap gap-300">
                        <Button
                            onClick={() => onNavigate("catalog")}
                            className="bg-white text-primary hover:bg-white/90"
                        >
                            Explorer le catalogue <ArrowRight className="icon-size-200" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onNavigate("sales")}
                            className="border-white/40 bg-transparent text-white hover:bg-white/10"
                        >
                            Analyser les ventes
                        </Button>
                    </div>
                </div>
            </motion.section>

            {/* KPIs */}
            <div className="mb-700 grid grid-cols-2 gap-400 lg:grid-cols-4">
                <KpiCard
                    label="Vins actifs"
                    value={formatInt(activeWines)}
                    sublabel={`${formatInt(wines.length)} références au total`}
                    icon={<Wine className="icon-size-200" />}
                    accent
                />
                <KpiCard
                    label="Bouteilles en stock"
                    value={formatInt(bottles)}
                    icon={<Boxes className="icon-size-200" />}
                />
                <KpiCard
                    label="Valeur du stock"
                    value={formatEuro0(stockValue)}
                    icon={<Euro className="icon-size-200" />}
                />
                <KpiCard
                    label="Promotions actives"
                    value={formatInt(activePromos)}
                    sublabel={alerts.length > 0 ? `${alerts.length} alerte(s) en cours` : "Aucune alerte"}
                    icon={<Tag className="icon-size-200" />}
                />
            </div>

            {/* Accès rapide */}
            <h2 className="mb-400 font-heading text-500 font-semibold text-foreground">Accès rapide</h2>
            <div className="grid grid-cols-1 gap-400 sm:grid-cols-2 lg:grid-cols-3">
                {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Card
                            key={link.key}
                            className="group cursor-pointer p-500 transition-shadow hover:shadow-md"
                            onClick={() => onNavigate(link.key)}
                        >
                            <div className="flex items-start gap-300">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="icon-size-300" />
                                </span>
                                <div className="flex flex-1 flex-col gap-100">
                                    <span className="font-heading text-400 font-semibold text-foreground">
                                        {link.title}
                                    </span>
                                    <span className="text-200 text-muted-foreground">{link.text}</span>
                                </div>
                                <ArrowRight className="icon-size-200 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>
                        </Card>
                    );
                })}
            </div>

            {alerts.length > 0 ? (
                <Card className="mt-700 border-destructive/25 bg-destructive/5 p-500">
                    <div className="flex items-start gap-300">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                            <Bell className="icon-size-300" />
                        </span>
                        <div className="flex flex-1 flex-col gap-100">
                            <span className="font-heading text-400 font-semibold text-foreground">
                                {alerts.length} alerte(s) de stock à traiter
                            </span>
                            <span className="text-200 text-muted-foreground">
                                {alerts.slice(0, 3).map((a) => a.message).join(" · ")}
                                {alerts.length > 3 ? "…" : ""}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onNavigate("alerts")}>
                            Voir les alertes
                        </Button>
                    </div>
                </Card>
            ) : null}
        </PageContainer>
    );
}
