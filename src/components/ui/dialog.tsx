//-----------------------------------------------------------------------
// Fenêtre modale accessible (Escape, clic sur l'arrière-plan, focus initial).
//-----------------------------------------------------------------------

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./primitives";

export function Dialog({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        // Focus le premier champ interactif du panneau.
        const t = window.setTimeout(() => {
            const focusable = panelRef.current?.querySelector<HTMLElement>(
                "input, select, textarea, button",
            );
            focusable?.focus();
        }, 30);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            window.clearTimeout(t);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-400">
                    <motion.div
                        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        aria-hidden
                    />
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className={cn(
                            "relative z-10 flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl",
                            className,
                        )}
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        <div className="flex items-start justify-between gap-300 border-b border-border p-500">
                            <div className="flex flex-col gap-100">
                                <h2 className="font-heading text-500 font-semibold leading-500">{title}</h2>
                                {description ? (
                                    <p className="text-200 text-muted-foreground">{description}</p>
                                ) : null}
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
                                <X className="icon-size-200" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-500">{children}</div>
                        {footer ? (
                            <div className="flex items-center justify-end gap-200 border-t border-border p-500">
                                {footer}
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
