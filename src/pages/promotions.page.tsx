//-----------------------------------------------------------------------
// Page Promotions : liste, création, édition, activation et suppression.
//-----------------------------------------------------------------------

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Badge, Button, Card, EmptyState } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { WineThumb } from "@/components/ui/wine-visual";
import {
    PromotionFormDialog,
    type PromotionFormValues,
} from "@/components/promotion-form.dialog";
import { useCellar } from "@/store/cellar-store";
import type { Promotion } from "@/store/types";
import { formatEuro, formatDate } from "@/lib/format";

export function PromotionsPage() {
    const { promotions, wines, wineById, addPromotion, updatePromotion, deletePromotion } =
        useCellar();

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Promotion | null>(null);
    const [toDelete, setToDelete] = useState<Promotion | null>(null);

    const openAdd = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (p: Promotion) => {
        setEditing(p);
        setFormOpen(true);
    };

    const handleSubmit = (values: PromotionFormValues) => {
        if (editing) {
            updatePromotion(editing.id, values);
        } else {
            addPromotion(values);
        }
        setFormOpen(false);
        setEditing(null);
    };

    const sorted = [...promotions].sort(
        (a, b) => Number(b.active) - Number(a.active) || a.label.localeCompare(b.label),
    );

    return (
        <PageContainer>
            <PageHeader
                title="Promotions"
                subtitle={`${promotions.filter((p) => p.active).length} active(s) sur ${promotions.length}`}
                icon={<Tag className="icon-size-300" />}
                actions={
                    <Button onClick={openAdd} disabled={wines.length === 0}>
                        <Plus className="icon-size-200" /> Nouvelle promotion
                    </Button>
                }
            />

            {sorted.length === 0 ? (
                <EmptyState
                    icon={<Tag className="icon-size-600" />}
                    title="Aucune promotion"
                    description="Créez une offre commerciale pour dynamiser vos ventes."
                    action={
                        <Button onClick={openAdd} disabled={wines.length === 0}>
                            <Plus className="icon-size-200" /> Nouvelle promotion
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-400 md:grid-cols-2">
                    {sorted.map((p) => {
                        const wine = wineById(p.wineId);
                        return (
                            <Card key={p.id} className="flex flex-col gap-300 p-500">
                                <div className="flex items-start justify-between gap-300">
                                    <div className="flex min-w-0 items-center gap-300">
                                        {wine ? (
                                            <WineThumb
                                                color={wine.color}
                                                imageUrl={wine.imageUrl}
                                                className="h-14 w-11 shrink-0"
                                            />
                                        ) : null}
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-heading text-400 font-semibold text-foreground">
                                                {p.label}
                                            </span>
                                            <span className="truncate text-200 text-muted-foreground">
                                                {wine?.name ?? "Vin supprimé"}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge tone={p.active ? "success" : "neutral"}>
                                        {p.active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col gap-100">
                                        <div className="flex items-baseline gap-200">
                                            <span className="font-numeric text-hero-700 font-semibold leading-none text-primary">
                                                -{Math.round(p.discount * 100)} %
                                            </span>
                                            {wine ? (
                                                <span className="flex items-baseline gap-100 text-200 text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        {formatEuro(wine.price * (1 - p.discount))}
                                                    </span>
                                                    <span className="line-through">{formatEuro(wine.price)}</span>
                                                </span>
                                            ) : null}
                                        </div>
                                        <span className="text-100 text-muted-foreground">
                                            Du {formatDate(p.startDate)} au {formatDate(p.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Modifier ${p.label}`}
                                            onClick={() => openEdit(p)}
                                        >
                                            <Pencil className="icon-size-200" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Supprimer ${p.label}`}
                                            onClick={() => setToDelete(p)}
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
                <PromotionFormDialog
                    key={editing?.id ?? "add"}
                    open
                    onClose={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                    mode={editing ? "edit" : "add"}
                    promotion={editing ?? undefined}
                    wines={wines}
                    onSubmit={handleSubmit}
                />
            ) : null}

            <Dialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                title="Supprimer cette promotion ?"
                description={toDelete ? `« ${toDelete.label} » sera définitivement supprimée.` : undefined}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setToDelete(null)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (toDelete) deletePromotion(toDelete.id);
                                setToDelete(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </>
                }
            >
                <p className="text-200 text-muted-foreground">Cette action est irréversible.</p>
            </Dialog>
        </PageContainer>
    );
}
