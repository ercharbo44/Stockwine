//-----------------------------------------------------------------------
// Page Sommelier : assistant conversationnel intégré, branché sur le même
// semantic model Fabric « Vinsurvin » que le data agent Sommelier. Les
// questions en langage naturel sont traduites en requêtes DAX (ventes) ou
// résolues sur le stock local, et la réponse s'affiche dans le fil.
//-----------------------------------------------------------------------

import { useRef, useState, type ReactNode } from "react";
import { Sparkles, Send, Wine, Database, MessageSquare } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Badge, Button, Card, Input, Spinner } from "@/components/ui/primitives";
import { useCellar } from "@/store/cellar-store";
import { queryRecords, type DaxRecord } from "@/lib/fabric-data";
import { topWines, salesByRegion, salesByColor, salesKpi } from "@/queries";
import { formatEuro0, formatEuro, formatInt } from "@/lib/format";
import { WINE_COLOR_LABELS, type WineColor } from "@/store/types";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: ReactNode;
}

const SUGGESTIONS = [
    "Quels vins sont en rupture de stock ?",
    "Quel est le chiffre d'affaires ?",
    "Quels sont les vins les plus vendus ?",
    "Quel est le CA par région ?",
    "Répartition des ventes par couleur ?",
    "Quelles promotions sont actives ?",
];

function num(v: unknown): number {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
}

export function SommelierPage() {
    const { wines, alerts, promotions, wineById } = useCellar();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "intro",
            role: "assistant",
            content:
                "Bonjour, je suis le Sommelier de votre cave. Posez-moi une question sur les ventes, le stock ou les promotions — par exemple « quels vins sont en rupture ? » ou « quel est le chiffre d'affaires par région ? ».",
        },
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const push = (m: Message) => setMessages((prev) => [...prev, m]);

    const scrollToEnd = () => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        });
    };

    async function answer(question: string): Promise<ReactNode> {
        const q = question.toLowerCase();

        // --- Stock (données locales) ---
        if (/(rupture|épuis|plus de stock|out of stock)/.test(q)) {
            const out = alerts.filter((a) => a.kind === "rupture");
            if (out.length === 0) return "Bonne nouvelle : aucun vin actif n'est en rupture de stock.";
            return (
                <span>
                    {out.length} vin(s) en rupture de stock :
                    <ul className="mt-100 list-disc pl-500">
                        {out.map((a) => (
                            <li key={a.wineId}>{wineById(a.wineId)?.name ?? a.wineId}</li>
                        ))}
                    </ul>
                </span>
            );
        }
        if (/(seuil|stock bas|réassort|reassort|bient[oô]t)/.test(q)) {
            const low = alerts.filter((a) => a.kind === "sous_seuil");
            if (low.length === 0) return "Aucune référence sous son seuil de réassort pour le moment.";
            return (
                <span>
                    {low.length} référence(s) sous le seuil :
                    <ul className="mt-100 list-disc pl-500">
                        {low.map((a) => (
                            <li key={a.wineId}>
                                {wineById(a.wineId)?.name ?? a.wineId} — {a.quantity}/{a.minThreshold}
                            </li>
                        ))}
                    </ul>
                </span>
            );
        }
        if (/(promotion|promo|remise|solde)/.test(q)) {
            const active = promotions.filter((p) => p.active);
            if (active.length === 0) return "Aucune promotion active actuellement.";
            return (
                <span>
                    {active.length} promotion(s) active(s) :
                    <ul className="mt-100 list-disc pl-500">
                        {active.map((p) => (
                            <li key={p.id}>
                                {p.label} — {wineById(p.wineId)?.name ?? "?"} (-{Math.round(p.discount * 100)} %)
                            </li>
                        ))}
                    </ul>
                </span>
            );
        }
        if (/(combien.*vin|nombre de vin|catalogue|références|referenc)/.test(q)) {
            const actifs = wines.filter((w) => w.active).length;
            return `Le catalogue compte ${formatInt(wines.length)} référence(s), dont ${formatInt(actifs)} active(s).`;
        }

        // --- Ventes (semantic model Fabric via DAX) ---
        if (/(vendu|meilleures ventes|top|populaire|best)/.test(q)) {
            const { connection, query } = topWines();
            const rows = await queryRecords(connection, query);
            const top = rows.slice(0, 5);
            return (
                <span>
                    Top {top.length} des vins par chiffre d'affaires net :
                    <ol className="mt-100 list-decimal pl-500">
                        {top.map((r: DaxRecord, i) => (
                            <li key={i}>
                                {String(r["Nom du vin"])} — {formatEuro0(num(r["CA net"]))} ({formatInt(num(r["Bouteilles"]))} bouteilles)
                            </li>
                        ))}
                    </ol>
                </span>
            );
        }
        if (/(région|region|territoire)/.test(q)) {
            const { connection, query } = salesByRegion();
            const rows = await queryRecords(connection, query);
            const top = rows.slice(0, 6);
            return (
                <span>
                    Chiffre d'affaires net par région (top {top.length}) :
                    <ul className="mt-100 list-disc pl-500">
                        {top.map((r: DaxRecord, i) => (
                            <li key={i}>
                                {String(r["Région"])} — {formatEuro0(num(r["CA net"]))}
                            </li>
                        ))}
                    </ul>
                </span>
            );
        }
        if (/(couleur|rouge|blanc|rosé|rose|effervescent|liquoreux|type de vin)/.test(q)) {
            const { connection, query } = salesByColor();
            const rows = await queryRecords(connection, query);
            return (
                <span>
                    Répartition du CA net par couleur :
                    <ul className="mt-100 list-disc pl-500">
                        {rows.map((r: DaxRecord, i) => {
                            const c = String(r["Couleur"]) as WineColor;
                            return (
                                <li key={i}>
                                    {WINE_COLOR_LABELS[c] ?? c} — {formatEuro0(num(r["CA net"]))}
                                </li>
                            );
                        })}
                    </ul>
                </span>
            );
        }
        if (/(chiffre d'affaires|chiffre d affaires|\bca\b|ventes|revenu|prix moyen|transactions)/.test(q)) {
            const { connection, query } = salesKpi();
            const rec = (await queryRecords(connection, query))[0] ?? {};
            return (
                <span>
                    Le chiffre d'affaires net s'élève à {formatEuro0(num(rec["CA net"]))} (brut{" "}
                    {formatEuro0(num(rec["CA brut"]))}), pour {formatInt(num(rec["Bouteilles"]))} bouteilles
                    vendues sur {formatInt(num(rec["Transactions"]))} transactions. Prix moyen vendu :{" "}
                    {formatEuro(num(rec["PMV"]))}.
                </span>
            );
        }

        return (
            <span>
                Je peux répondre sur les ventes (chiffre d'affaires, top vins, régions, couleurs), le
                stock (ruptures, seuils) et les promotions. Essayez par exemple : « quels vins sont en
                rupture ? » ou « quel est le CA par région ? ».
            </span>
        );
    }

    const submit = async () => {
        const question = input.trim();
        if (!question || busy) return;
        setInput("");
        push({ id: `u-${Date.now()}`, role: "user", content: question });
        setBusy(true);
        scrollToEnd();
        try {
            const content = await answer(question);
            push({ id: `a-${Date.now()}`, role: "assistant", content });
        } catch {
            push({
                id: `e-${Date.now()}`,
                role: "assistant",
                content:
                    "Je n'ai pas pu interroger le modèle Fabric. Ouvrez l'application depuis le portail Fabric pour accéder aux données de ventes en direct.",
            });
        } finally {
            setBusy(false);
            scrollToEnd();
        }
    };

    return (
        <PageContainer className="flex h-full flex-col">
            <PageHeader
                title="Sommelier"
                subtitle="Assistant conversationnel branché sur le semantic model Fabric « Vinsurvin »."
                icon={<Sparkles className="icon-size-300" />}
                actions={<Badge tone="gold">Assistant IA · Fabric</Badge>}
            />

            <div className="mb-500 grid grid-cols-1 gap-400 lg:grid-cols-3">
                <Card className="flex items-start gap-300 p-400">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MessageSquare className="icon-size-200" />
                    </span>
                    <div className="flex flex-col gap-100">
                        <span className="text-300 font-semibold text-foreground">Langage naturel</span>
                        <span className="text-100 text-muted-foreground">
                            Posez vos questions sans écrire de requête.
                        </span>
                    </div>
                </Card>
                <Card className="flex items-start gap-300 p-400">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Database className="icon-size-200" />
                    </span>
                    <div className="flex flex-col gap-100">
                        <span className="text-300 font-semibold text-foreground">Ventes en direct</span>
                        <span className="text-100 text-muted-foreground">
                            Réponses fondées sur les données Fabric.
                        </span>
                    </div>
                </Card>
                <Card className="flex items-start gap-300 p-400">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Wine className="icon-size-200" />
                    </span>
                    <div className="flex flex-col gap-100">
                        <span className="text-300 font-semibold text-foreground">Stock & promotions</span>
                        <span className="text-100 text-muted-foreground">
                            Ruptures, seuils et offres en cours.
                        </span>
                    </div>
                </Card>
            </div>

            <Card className="flex min-h-[52vh] flex-1 flex-col overflow-hidden p-0">
                <div ref={scrollRef} className="flex-1 space-y-400 overflow-y-auto p-500">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                        >
                            <div
                                className={
                                    "max-w-[80%] rounded-2xl px-400 py-300 text-200 leading-300 " +
                                    (m.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground")
                                }
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {busy ? (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-200 rounded-2xl bg-muted px-400 py-300 text-200 text-muted-foreground">
                                <Spinner className="h-4 w-4" /> Le Sommelier consulte les données…
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-200 border-t border-border px-500 pt-300">
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setInput(s)}
                            className="rounded-full bg-secondary px-300 py-100 text-100 text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Saisie */}
                <form
                    className="flex items-center gap-200 border-t border-border p-400"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void submit();
                    }}
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question au Sommelier…"
                        aria-label="Votre question"
                        disabled={busy}
                    />
                    <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Envoyer">
                        <Send className="icon-size-200" />
                    </Button>
                </form>
            </Card>
        </PageContainer>
    );
}
