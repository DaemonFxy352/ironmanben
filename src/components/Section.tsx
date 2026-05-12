import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-sm font-semibold uppercase text-surge">{eyebrow}</p>
          ) : null}
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
          {description ? (
            <p className="mt-3 text-base leading-7 text-ink/70">{description}</p>
          ) : null}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
