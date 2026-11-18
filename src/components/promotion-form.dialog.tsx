//-----------------------------------------------------------------------
// Formulaire de création / édition d'une promotion.
//-----------------------------------------------------------------------

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import type { Promotion, Wine } from "@/store/types";
import { toDateInputValue } from "@/lib/format";

export interface PromotionFormValues {
    wineId: string;
    label: string;
    /** Remise en fraction 0–1. */
    discount: number;
    startDate: string;
    endDate: string;
    active: boolean;
}

function defaults(wines: Wine[]): PromotionFormValues {
    const today = new Date();
    const in30 = new Date(Date.now() + 30 * 864e5);
    return {
        wineId: wines[0]?.id ?? "",
        label: "",
        discount: 0.1,
        startDate: toDateInputValue(today),
        endDate: toDateInputValue(in30),
        active: true,
    };
}

export function PromotionFormDialog({
    open,
    onClose,
    mode,
    promotion,
    wines,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    promotion?: Promotion;
    wines: Wine[];
    onSubmit: (values: PromotionFormValues) => void;
}) {
    // Le composant est remonté (via `key`) à chaque ouverture : l'état initial
    // est donc dérivé directement des props, sans effet.
    const [values, setValues] = useState<PromotionFormValues>(() =>
        mode === "edit" && promotion
            ? {
                  wineId: promotion.wineId,
                  label: promotion.label,
                  discount: promotion.discount,
                  startDate: toDateInputValue(promotion.startDate),
                  endDate: toDateInputValue(promotion.endDate),
                  active: promotion.active,
              }
            : defaults(wines),
    );
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof PromotionFormValues>(key: K, value: PromotionFormValues[K]) =>
        setValues((v) => ({ ...v, [key]: value }));

    const submit = () => {
        if (!values.wineId) {
            setError("Sélectionnez un vin.");
            return;
        }
        if (!values.label.trim()) {
            setError("Le libellé de la promotion est obligatoire.");
            return;
        }
        if (values.discount <= 0 || values.discount >= 1) {
            setError("La remise doit être comprise entre 1 % et 99 %.");
            return;
        }
        if (values.endDate < values.startDate) {
            setError("La date de fin doit suivre la date de début.");
            return;
        }
        onSubmit({ ...values, label: values.label.trim() });
    };

    const discountPercent = Math.round(values.discount * 100);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={mode === "add" ? "Nouvelle promotion" : "Modifier la promotion"}
            description="Appliquez une remise à un vin sur une période donnée."
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={submit}>{mode === "add" ? "Créer la promotion" : "Enregistrer"}</Button>
                </>
            }
        >
            <div className="flex flex-col gap-400">
                {error ? (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-300 py-200 text-200 text-destructive">
                        {error}
                    </p>
                ) : null}

                <Field label="Vin concerné" htmlFor="pf-wine">
                    <Select id="pf-wine" value={values.wineId} onChange={(e) => set("wineId", e.target.value)}>
                        {wines.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Libellé" htmlFor="pf-label">
                    <Input
                        id="pf-label"
                        value={values.label}
                        onChange={(e) => set("label", e.target.value)}
                        placeholder="Ex. Foire aux vins"
                    />
                </Field>

                <Field label={`Remise : ${discountPercent} %`} htmlFor="pf-discount">
                    <input
                        id="pf-discount"
                        type="range"
                        min={1}
                        max={80}
                        value={discountPercent}
                        onChange={(e) => set("discount", Number(e.target.value) / 100)}
                        className="w-full accent-[var(--color-primary)]"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-300">
                    <Field label="Date de début" htmlFor="pf-start">
                        <Input
                            id="pf-start"
                            type="date"
                            value={values.startDate}
                            onChange={(e) => set("startDate", e.target.value)}
                        />
                    </Field>
                    <Field label="Date de fin" htmlFor="pf-end">
                        <Input
                            id="pf-end"
                            type="date"
                            value={values.endDate}
                            onChange={(e) => set("endDate", e.target.value)}
                        />
                    </Field>
                </div>

                <label className="flex items-center gap-200 text-200 text-foreground">
                    <input
                        type="checkbox"
                        checked={values.active}
                        onChange={(e) => set("active", e.target.checked)}
                        className="h-4 w-4 rounded border-input accent-[var(--color-primary)]"
                    />
                    Promotion active
                </label>
            </div>
        </Dialog>
    );
}
