const navItems = [
  { label: "Overview", href: "/#overview" },
  { label: "Map", href: "/map" },
  { label: "Timeline", href: "/#timeline" },
  { label: "Cheer Zones", href: "/#cheer-zones" },
  { label: "Logistics", href: "/#logistics" },
  { label: "Updates", href: "/#updates" },
  { label: "Finish", href: "/#finish" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a className="focus-ring rounded-md text-sm font-black uppercase text-ink" href="/">
          Ben Race HQ
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-paper hover:text-ink"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <details className="group relative md:hidden">
          <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-bold text-ink marker:hidden">
            Menu
            <span className="text-river group-open:rotate-180">⌄</span>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-ink/10 bg-white p-2 shadow-soft">
            {navItems.map((item) => (
              <a
                key={item.href}
                className="focus-ring block rounded-md px-3 py-3 text-sm font-semibold text-ink/75 hover:bg-paper hover:text-ink"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>
        </details>
      </nav>
    </header>
  );
}
