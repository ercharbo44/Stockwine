//-----------------------------------------------------------------------
// Visuels dérivés de la couleur du vin : dégradés et vignettes bouteille.
//-----------------------------------------------------------------------

import { Wine as WineIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WineColor } from "@/store/types";

interface ColorMeta {
    gradient: string;
    glass: string;
}

export const WINE_COLOR_META: Record<WineColor, ColorMeta> = {
    red: { gradient: "linear-gradient(150deg, #7b1e3b 0%, #3a0f1c 100%)", glass: "#7b1e3b" },
    white: { gradient: "linear-gradient(150deg, #ecd9a2 0%, #cbb069 100%)", glass: "#d9c17a" },
    rose: { gradient: "linear-gradient(150deg, #f0aab1 0%, #d3737f 100%)", glass: "#e79aa2" },
    sparkling: { gradient: "linear-gradient(150deg, #f2e6b4 0%, #cbb673 100%)", glass: "#e4d38a" },
    sweet: { gradient: "linear-gradient(150deg, #d59b3a 0%, #8a5c12 100%)", glass: "#c48a2a" },
};

/** Vignette carrée représentant une bouteille sur un fond dégradé teinté. */
export function WineThumb({
    color,
    imageUrl,
    alt,
    className,
}: {
    color: WineColor;
    imageUrl?: string | null;
    alt?: string;
    className?: string;
}) {
    const usable = imageUrl && !imageUrl.includes("example.com");
    const meta = WINE_COLOR_META[color];

    if (usable) {
        return (
            <div className={cn("overflow-hidden rounded-xl bg-muted", className)}>
                <img
                    src={imageUrl!}
                    alt={alt ?? ""}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-xl text-white/90 shadow-inner",
                className,
            )}
            style={{ background: meta.gradient }}
            aria-hidden
        >
            <WineIcon className="icon-size-500 drop-shadow" />
        </div>
    );
}
