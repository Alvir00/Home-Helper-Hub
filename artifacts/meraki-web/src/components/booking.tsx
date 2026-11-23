import { Link } from "wouter";
import type { ReactNode } from "react";
import { Star, ShieldCheck, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared booking.com-style primitives used across the marketplace. */

export const serviceImageMap: Record<string, string> = {
  "Home Cleaning": "/service-cleaning.png",
  "Kitchen Cleaning": "/service-kitchen.png",
  "Laundry & Ironing": "/service-laundry.png",
  "Combined Home & Laundry": "/service-combined.png",
  "Bedroom Deep Clean": "/service-bedroom.png",
};

export function ratingLabel(score?: number | null): string {
  const s = score ?? 0;
  if (s >= 4.8) return "Exceptional";
  if (s >= 4.5) return "Excellent";
  if (s >= 4.0) return "Very good";
  if (s >= 3.5) return "Good";
  if (s > 0) return "Rated";
  return "New";
}

/** Deep-blue numeric score square, white text — the booking.com signature. */
export function RatingBadge({
  score,
  className,
}: {
  score?: number | null;
  className?: string;
}) {
  return (
    <span className={cn("rating-badge h-8 w-8 text-sm", className)}>
      {score ? score.toFixed(1) : "–"}
    </span>
  );
}

/** Label + review count on the left, blue score badge on the right. */
export function RatingRow({
  score,
  reviews,
  className,
}: {
  score?: number | null;
  reviews?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="text-right leading-tight">
        <div className="text-sm font-semibold text-foreground">{ratingLabel(score)}</div>
        <div className="text-xs text-muted-foreground">
          {reviews ?? 0} review{(reviews ?? 0) === 1 ? "" : "s"}
        </div>
      </div>
      <RatingBadge score={score} />
    </div>
  );
}

export function Stars({ score, className }: { score?: number | null; className?: string }) {
  const rounded = Math.round(score ?? 0);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < rounded ? "text-star fill-star" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}

/** Price-forward display: bold amount + small unit. */
export function Price({
  amount,
  unit = "/hr",
  className,
}: {
  amount: number;
  unit?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className="text-xs font-medium text-muted-foreground">ETB</span>
      <span className="text-xl font-bold tracking-tight text-foreground">{amount}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </span>
  );
}

export function DealBadge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("deal-badge px-2 py-0.5 text-xs", className)}>{children}</span>;
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-success", className)}>
      <ShieldCheck className="h-3.5 w-3.5" />
      Background-checked
    </span>
  );
}

export function TopRatedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-primary", className)}>
      <BadgeCheck className="h-3.5 w-3.5" />
      Top rated
    </span>
  );
}

/** Small category / destination photo tile (booking.com "browse by" row). */
export function PhotoTile({
  image,
  title,
  subtitle,
  href,
}: {
  image: string;
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block min-w-[150px] flex-1">
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="h-28 overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </Link>
  );
}
