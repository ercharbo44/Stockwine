//-----------------------------------------------------------------------
// Formulaire d'ajout / d'édition d'un vin (avec quantité initiale).
//-----------------------------------------------------------------------

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { WINE_COLORS, WINE_COLOR_LABELS, type Wine, type WineColor } from "@/store/types";

export interface WineFormValues {
    name: string;
    producer: string;
    appellation: string;
    region: string;
    color: WineColor;
    vintage: number | null;
    price: number;
    barcode: string | null;
    description: string | null;
    active: boolean;
    quantity: number;
    minThreshold: number;
}

interface WineFormDialogProps {
    open: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    wine?: Wine;
    quantity?: number;
    minThreshold?: number;
    onSubmit: (values: WineFormValues) => void;
}

function emptyForm(): WineFormValues {
    return {
        name: "",
        producer: "",
        appellation: "",
        region: "",
        color: "red",
        vintage: null,
        price: 0,
        barcode: null,
        description: null,
        active: true,
        quantity: 0,
        minThreshold: 6,
    };
}

function initialValues(
    mode: "add" | "edit",
    wine?: Wine,
    quantity?: number,
    minThreshold?: number,
): WineFormValues {
    if (mode === "edit" && wine) {
        return {
            name: wine.name,
            producer: wine.producer,
            appellation: wine.appellation,
            region: wine.region,
            color: wine.color,
            vintage: wine.vintage,
            price: wine.price,
            barcode: wine.barcode,
            description: wine.description,
            active: wine.active,
            quantity: quantity ?? 0,
            minThreshold: minThreshold ?? 6,
        };
    }
    return emptyForm();
}

export function WineFormDialog({
    open,
    onClose,
    mode,
    wine,
    quantity,
    minThreshold,
    onSubmit,
}: WineFormDialogProps) {
    // Le composant est remonté (via `key`) à chaque ouverture : l'état initial
    // est donc dérivé directement des props, sans effet.
    const [values, setValues] = useState<WineFormValues>(() =>
        initialValues(mode, wine, quantity, minThreshold),
    );
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof WineFormValues>(key: K, value: WineFormValues[K]) =>
        setValues((v) => ({ ...v, [key]: value }));

    const submit = () => {
        if (!values.name.trim()) {
            setError("Le nom du vin est obligatoire.");
            return;
        }
        if (values.price < 0 || values.quantity < 0 || values.minThreshold < 0) {
            setError("Les valeurs numériques ne peuvent pas être négatives.");
            return;
        }
        onSubmit({
            ...values,
            name: values.name.trim(),
            producer: values.producer.trim(),
            appellation: values.appellation.trim(),
            region: values.region.trim(),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={mode === "add" ? "Ajouter un vin" : "Modifier le vin"}
            description={
                mode === "add"
                    ? "Référencez un nouveau vin et sa quantité initiale."
                    : "Mettez à jour la fiche et le stock du vin."
            }
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={submit}>{mode === "add" ? "Ajouter au catalogue" : "Enregistrer"}</Button>
                </>
            }
        >
            <div className="flex flex-col gap-400">
                {error ? (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-300 py-200 text-200 text-destructive">
                        {error}
                    </p>
                ) : null}

                <Field label="Nom du vin" htmlFor="wf-name">
                    <Input
                        id="wf-name"
                        value={values.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Ex. Château Margaux"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-300">
                    <Field label="Producteur" htmlFor="wf-producer">
                        <Input
                            id="wf-producer"
                            value={values.producer}
                            onChange={(e) => set("producer", e.target.value)}
                        />
                    </Field>
                    <Field label="Appellation" htmlFor="wf-appellation">
                        <Input
                            id="wf-appellation"
                            value={values.appellation}
                            onChange={(e) => set("appellation", e.target.value)}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-300">
                    <Field label="Région" htmlFor="wf-region">
                        <Input
                            id="wf-region"
                            value={values.region}
                            onChange={(e) => set("region", e.target.value)}
                        />
                    </Field>
                    <Field label="Couleur" htmlFor="wf-color">
                        <Select
                            id="wf-color"
                            value={values.color}
                            onChange={(e) => set("color", e.target.value as WineColor)}
                        >
                            {WINE_COLORS.map((c) => (
                                <option key={c} value={c}>
                                    {WINE_COLOR_LABELS[c]}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>

                <div className="grid grid-cols-3 gap-300">
                    <Field label="Millésime" htmlFor="wf-vintage">
                        <Input
                            id="wf-vintage"
                            type="number"
                            value={values.vintage ?? ""}
                            onChange={(e) =>
                                set("vintage", e.target.value ? Number(e.target.value) : null)
                            }
                            placeholder="Ex. 2020"
                        />
                    </Field>
                    <Field label="Prix (€)" htmlFor="wf-price">
                        <Input
                            id="wf-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={values.price}
                            onChange={(e) => set("price", Number(e.target.value))}
                        />
                    </Field>
                    <Field label="Code-barres" htmlFor="wf-barcode">
                        <Input
                            id="wf-barcode"
                            value={values.barcode ?? ""}
                            onChange={(e) => set("barcode", e.target.value || null)}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-300">
                    <Field label="Quantité en stock" htmlFor="wf-qty">
                        <Input
                            id="wf-qty"
                            type="number"
                            min="0"
                            value={values.quantity}
                            onChange={(e) => set("quantity", Number(e.target.value))}
                        />
                    </Field>
                    <Field label="Seuil d'alerte" htmlFor="wf-threshold" hint="Alerte sous ce niveau">
                        <Input
                            id="wf-threshold"
                            type="number"
                            min="0"
                            value={values.minThreshold}
                            onChange={(e) => set("minThreshold", Number(e.target.value))}
                        />
                    </Field>
                </div>

                <Field label="Description" htmlFor="wf-desc">
                    <Textarea
                        id="wf-desc"
                        value={values.description ?? ""}
                        onChange={(e) => set("description", e.target.value || null)}
                        placeholder="Notes de dégustation, accords…"
                    />
                </Field>

                <label className="flex items-center gap-200 text-200 text-foreground">
                    <input
                        type="checkbox"
                        checked={values.active}
                        onChange={(e) => set("active", e.target.checked)}
                        className="h-4 w-4 rounded border-input accent-[var(--color-primary)]"
                    />
                    Vin actif (visible en rayon)
                </label>
            </div>
        </Dialog>
    );
}
