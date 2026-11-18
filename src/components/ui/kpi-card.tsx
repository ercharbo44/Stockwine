//-----------------------------------------------------------------------
// Carte d'indicateur clé (KPI).
//-----------------------------------------------------------------------

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./primitives";

export function KpiCard({
    label,
    value,
    icon,
    sublabel,
    loading,
    accent,
    className,
}: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    sublabel?: ReactNode;
    loading?: boolean;
    accent?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-200 rounded-2xl border p-500 shadow-sm",
                accent
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-200">
                <span className="text-200 font-medium text-muted-foreground">{label}</span>
                {icon ? (
                    <span
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                        )}
                    >
                        {icon}
                    </span>
                ) : null}
            </div>
            {loading ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <span className="font-numeric text-hero-700 font-semibold leading-none text-foreground">
                    {value}
                </span>
            )}
            {sublabel ? <span className="text-100 text-muted-foreground">{sublabel}</span> : null}
        </div>
    );
}
