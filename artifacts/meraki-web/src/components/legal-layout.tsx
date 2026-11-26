import type { ReactNode } from "react";

/**
 * Shared reading layout for the legal and support pages. Legal copy is long and
 * plain, so it uses a narrow measure, generous line height and numbered
 * headings rather than the marketing sections used elsewhere.
 */
export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: {updated}</p>
      <p className="mb-8 text-lg leading-relaxed text-foreground/90">{intro}</p>
      <div className="space-y-8 text-[15px] leading-relaxed text-foreground/85 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_li]:py-0 [&_p]:text-foreground/85 [&_ul]:space-y-1.5">

        {children}
      </div>
      <div className="mt-12 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Questions about this page? Email{" "}
        <a href="mailto:help@meraki.et" className="font-medium text-primary underline">
          help@meraki.et
        </a>{" "}
        and we will reply within two working days.
      </div>
    </div>
  );
}
