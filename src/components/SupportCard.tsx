import type { ReactNode } from "react";

type Tone = "river" | "surge" | "split" | "mile";

const toneClasses: Record<Tone, string> = {
  river: "border-river/25 bg-river/10 text-river",
  surge: "border-surge/25 bg-surge/10 text-surge",
  split: "border-split/25 bg-split/10 text-split",
  mile: "border-mile/25 bg-mile/10 text-mile",
};

type SupportCardProps = {
  title: string;
  label?: string;
  meta?: string;
  tone?: Tone;
  children: ReactNode;
};

export function SupportCard({
  title,
  label,
  meta,
  tone = "river",
  children,
}: SupportCardProps) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          {label ? (
            <p
              className={`mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${toneClasses[tone]}`}
            >
              {label}
            </p>
          ) : null}
          <h3 className="text-lg font-bold text-ink">{title}</h3>
        </div>
        {meta ? (
          <p className="shrink-0 rounded-md bg-paper px-3 py-1 text-sm font-semibold text-ink/70">
            {meta}
          </p>
        ) : null}
      </div>
      <div className="mt-4 text-sm leading-6 text-ink/70">{children}</div>
    </article>
  );
}
