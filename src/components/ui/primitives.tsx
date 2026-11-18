//-----------------------------------------------------------------------
// Primitives UI réutilisables (boutons, cartes, champs, badges, états).
// Toutes les couleurs/tailles passent par les tokens de global.css.
//-----------------------------------------------------------------------

import {
    forwardRef,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type InputHTMLAttributes,
    type ReactNode,
    type SelectHTMLAttributes,
    type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ----------------------------- Button ------------------------------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
    outline: "border border-border bg-transparent text-foreground hover:bg-accent",
    ghost: "bg-transparent text-foreground hover:bg-accent",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const buttonSizes: Record<ButtonSize, string> = {
    sm: "h-8 px-300 text-200 gap-100 rounded-lg",
    md: "h-10 px-400 text-300 gap-200 rounded-xl",
    icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            type={type}
            className={cn(
                "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                buttonVariants[variant],
                buttonSizes[size],
                className,
            )}
            {...props}
        />
    );
});

/* ------------------------------ Card -------------------------------- */

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col gap-100 p-500", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "font-heading text-500 font-semibold leading-500 tracking-tight",
                className,
            )}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-500 pt-0", className)} {...props} />;
}

/* ------------------------------ Badge ------------------------------- */

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "gold";

const badgeTones: Record<BadgeTone, string> = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-gold/20 text-gold-foreground dark:text-gold",
    danger: "bg-destructive/12 text-destructive",
    gold: "bg-gold/20 text-gold-foreground dark:text-gold",
};

export function Badge({
    tone = "neutral",
    className,
    ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-100 rounded-full px-200 py-100-nudge text-100 font-medium leading-none",
                badgeTones[tone],
                className,
            )}
            {...props}
        />
    );
}

/* ------------------------- Inputs & fields -------------------------- */

const fieldBase =
    "w-full rounded-xl border border-input bg-background text-300 text-foreground placeholder:text-muted-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className, ...props }, ref) {
        return <input ref={ref} className={cn(fieldBase, "h-10 px-300", className)} {...props} />;
    },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    function Textarea({ className, ...props }, ref) {
        return <textarea ref={ref} className={cn(fieldBase, "min-h-[80px] px-300 py-200", className)} {...props} />;
    },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    function Select({ className, ...props }, ref) {
        return (
            <select ref={ref} className={cn(fieldBase, "h-10 px-300 pr-500", className)} {...props} />
        );
    },
);

export function Field({
    label,
    htmlFor,
    hint,
    children,
    className,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-100", className)}>
            <label htmlFor={htmlFor} className="text-200 font-medium text-foreground">
                {label}
            </label>
            {children}
            {hint ? <p className="text-100 text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

/* ------------------------ States & helpers -------------------------- */

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-xl bg-muted", className)} {...props} />;
}

export function Spinner({ className }: { className?: string }) {
    return (
        <div
            role="status"
            aria-label="Chargement"
            className={cn(
                "inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary",
                className,
            )}
        />
    );
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-300 rounded-2xl border border-dashed border-border bg-card/50 p-800 text-center",
                className,
            )}
        >
            {icon ? <div className="text-muted-foreground">{icon}</div> : null}
            <div className="flex flex-col gap-100">
                <p className="font-heading text-400 font-semibold text-foreground">{title}</p>
                {description ? (
                    <p className="mx-auto max-w-[420px] text-200 text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {action}
        </div>
    );
}

export function ErrorBanner({ message, className }: { message: string; className?: string }) {
    return (
        <div
            role="alert"
            className={cn(
                "rounded-xl border border-destructive/30 bg-destructive/10 px-400 py-300 text-200 text-destructive",
                className,
            )}
        >
            {message}
        </div>
    );
}
