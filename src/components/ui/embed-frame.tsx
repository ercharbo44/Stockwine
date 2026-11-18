//-----------------------------------------------------------------------
// Cadre d'intégration (iframe) avec état de chargement et repli explicite.
//-----------------------------------------------------------------------

import { useState, type ReactNode } from "react";
import { Spinner } from "./primitives";
import { cn } from "@/lib/utils";

export function EmbedFrame({
    src,
    title,
    className,
    fallback,
}: {
    src: string;
    title: string;
    className?: string;
    fallback?: ReactNode;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-border bg-card",
                className,
            )}
        >
            {!loaded ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-300 bg-card">
                    <Spinner className="h-7 w-7" />
                    <p className="text-200 text-muted-foreground">Chargement de « {title} »…</p>
                    {fallback ? (
                        <div className="max-w-[520px] px-500 text-center">{fallback}</div>
                    ) : null}
                </div>
            ) : null}
            <iframe
                src={src}
                title={title}
                onLoad={() => setLoaded(true)}
                className="h-full w-full border-0"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
            />
        </div>
    );
}
