//-----------------------------------------------------------------------
// Page Catalogue : recherche, filtres, cartes vin et opérations CRUD.
//-----------------------------------------------------------------------

import { useMemo, useState } from "react";
import { Wine, Plus, Search, Pencil, Trash2, RefreshCw } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Badge, Button, Card, EmptyState, Input, Select } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { WineThumb } from "@/components/ui/wine-visual";
import { WineFormDialog, type WineFormValues } from "@/components/wine-form.dialog";
import { useCellar } from "@/store/cellar-store";
import { WINE_COLORS, WINE_COLOR_LABELS, type Wine as WineType } from "@/store/types";
import { formatEuro } from "@/lib/format";

export function CatalogPage() {
    const {
        wines,
        stock,
        activePromotionOf,
        addWine,
        updateWine,
        deleteWine,
        resyncFromFabric,
        source,
    } = useCellar();

    const [search, setSearch] = useState("");
    const [colorFilter, setColorFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<WineType | null>(null);
    const [toDelete, setToDelete] = useState<WineType | null>(null);

    const regions = useMemo(
        () => Array.from(new Set(wines.map((w) => w.region).filter(Boolean))).sort(),
        [wines],
    );
    const [regionFilter, setRegionFilter] = useState<string>("all");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return wines.filter((w) => {
            if (colorFilter !== "all" && w.color !== colorFilter) return false;
            if (regionFilter !== "all" && w.region !== regionFilter) return false;
            if (statusFilter === "active" && !w.active) return false;
            if (statusFilter === "inactive" && w.active) return false;
            if (!q) return true;
            return (
                w.name.toLowerCase().includes(q) ||
                w.producer.toLowerCase().includes(q) ||
                w.appellation.toLowerCase().includes(q) ||
                w.region.toLowerCase().includes(q)
            );
        });
    }, [wines, search, colorFilter, regionFilter, statusFilter]);

    const openAdd = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (w: WineType) => {
        setEditing(w);
        setFormOpen(true);
    };

    const handleSubmit = (values: WineFormValues) => {
        const wineData = {
            name: values.name,
            producer: values.producer,
            appellation: values.appellation,
            region: values.region,
            color: values.color,
            vintage: values.vintage,
            price: values.price,
            barcode: values.barcode,
            description: values.description,
            imageUrl: editing?.imageUrl ?? null,
            active: values.active,
        };
        if (editing) {
            updateWine(editing.id, wineData);
        } else {
            addWine(wineData, values.quantity, values.minThreshold);
        }
        setFormOpen(false);
        setEditing(null);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Catalogue des vins"
                subtitle={`${filtered.length} vin(s) affiché(s) sur ${wines.length}`}
                icon={<Wine className="icon-size-300" />}
                actions={
                    <>
                        {source !== "demo" ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resyncFromFabric}
                                title="Recharger depuis Fabric"
                            >
                                <RefreshCw className="icon-size-200" /> Resynchroniser
                            </Button>
                        ) : null}
                        <Button onClick={openAdd}>
                            <Plus className="icon-size-200" /> Ajouter un vin
                        </Button>
                    </>
                }
            />

            {/* Barre de filtres */}
            <div className="mb-500 flex flex-col gap-300 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-300 top-1/2 icon-size-200 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un vin, un producteur, une région…"
                        className="pl-800"
                        aria-label="Rechercher"
                    />
                </div>
                <div className="flex gap-300">
                    <Select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        aria-label="Filtrer par couleur"
                        className="w-auto"
                    >
                        <option value="all">Toutes couleurs</option>
                        {WINE_COLORS.map((c) => (
                            <option key={c} value={c}>
                                {WINE_COLOR_LABELS[c]}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        aria-label="Filtrer par région"
                        className="w-auto"
                    >
                        <option value="all">Toutes régions</option>
                        {regions.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filtrer par statut"
                        className="w-auto"
                    >
                        <option value="all">Tous statuts</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                    </Select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={<Wine className="icon-size-600" />}
                    title="Aucun vin trouvé"
                    description="Ajustez vos filtres ou ajoutez un nouveau vin au catalogue."
                    action={
                        <Button onClick={openAdd}>
                            <Plus className="icon-size-200" /> Ajouter un vin
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-400 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((w) => {
                        const s = stock[w.id];
                        const qty = s?.quantity ?? 0;
                        const promo = activePromotionOf(w.id);
                        const rupture = qty <= 0;
                        const sousSeuil = !rupture && s && s.minThreshold > 0 && qty < s.minThreshold;
                        return (
                            <Card key={w.id} className="flex flex-col overflow-hidden">
                                <div className="flex gap-300 p-400">
                                    <WineThumb
                                        color={w.color}
                                        imageUrl={w.imageUrl}
                                        alt={w.name}
                                        className="h-20 w-16 shrink-0"
                                    />
                                    <div className="flex min-w-0 flex-1 flex-col gap-100">
                                        <div className="flex items-start justify-between gap-200">
                                            <span className="truncate font-heading text-400 font-semibold text-foreground">
                                                {w.name}
                                            </span>
                                            {!w.active ? <Badge tone="neutral">Inactif</Badge> : null}
                                        </div>
                                        <span className="truncate text-200 text-muted-foreground">
                                            {w.producer || "—"}
                                        </span>
                                        <span className="truncate text-100 text-muted-foreground">
                                            {[w.appellation, w.region, w.vintage].filter(Boolean).join(" · ")}
                                        </span>
                                        <div className="mt-100 flex items-center gap-200">
                                            <Badge tone="primary">{WINE_COLOR_LABELS[w.color]}</Badge>
                                            {promo ? (
                                                <Badge tone="gold">-{Math.round(promo.discount * 100)} %</Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t border-border px-400 py-300">
                                    <div className="flex flex-col">
                                        {promo ? (
                                            <span className="flex items-baseline gap-200">
                                                <span className="font-numeric text-400 font-semibold text-foreground">
                                                    {formatEuro(w.price * (1 - promo.discount))}
                                                </span>
                                                <span className="text-100 text-muted-foreground line-through">
                                                    {formatEuro(w.price)}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="font-numeric text-400 font-semibold text-foreground">
                                                {formatEuro(w.price)}
                                            </span>
                                        )}
                                        <span className="text-100 text-muted-foreground">
                                            {rupture ? (
                                                <span className="text-destructive">Rupture</span>
                                            ) : sousSeuil ? (
                                                <span className="text-gold-foreground dark:text-gold">
                                                    Stock bas : {qty}
                                                </span>
                                            ) : (
                                                <>En stock : {qty}</>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Modifier ${w.name}`}
                                            onClick={() => openEdit(w)}
                                        >
                                            <Pencil className="icon-size-200" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Supprimer ${w.name}`}
                                            onClick={() => setToDelete(w)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="icon-size-200" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {formOpen ? (
                <WineFormDialog
                    key={editing?.id ?? "add"}
                    open
                    onClose={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                    mode={editing ? "edit" : "add"}
                    wine={editing ?? undefined}
                    quantity={editing ? stock[editing.id]?.quantity : undefined}
                    minThreshold={editing ? stock[editing.id]?.minThreshold : undefined}
                    onSubmit={handleSubmit}
                />
            ) : null}

            <Dialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                title="Supprimer ce vin ?"
                description={toDelete ? `« ${toDelete.name} » sera retiré du catalogue.` : undefined}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setToDelete(null)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (toDelete) deleteWine(toDelete.id);
                                setToDelete(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </>
                }
            >
                <p className="text-200 text-muted-foreground">
                    Cette action supprime également le stock et les promotions associés. Elle est
                    irréversible.
                </p>
            </Dialog>
        </PageContainer>
    );
}
