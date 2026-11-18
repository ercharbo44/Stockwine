//-----------------------------------------------------------------------
// Conteneur de page et en-tête standardisés.
//-----------------------------------------------------------------------

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("mx-auto w-full max-w-[1200px] px-500 py-600 md:px-700", className)}>
            {children}
        </div>
    );
}

export function PageHeader({
    title,
    subtitle,
    icon,
    actions,
}: {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-600 flex flex-col gap-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-300">
                {icon ? (
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {icon}
                    </span>
                ) : null}
                <div className="flex flex-col gap-100">
                    <h1 className="font-heading text-hero-700 font-semibold leading-hero-700 tracking-tight text-foreground">
                        {title}
                    </h1>
                    {subtitle ? <p className="text-300 text-muted-foreground">{subtitle}</p> : null}
                </div>
            </div>
            {actions ? <div className="flex items-center gap-200">{actions}</div> : null}
        </div>
    );
}
