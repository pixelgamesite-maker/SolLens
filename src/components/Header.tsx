import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { label: "Registry", href: "#registry", note: "Every token we cover" },
  { label: "How basis works", href: "#basis", note: "Why the two prices differ" },
  { label: "Data sources", href: "#sources", note: "Where each field comes from" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and lock scroll while the panel is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline-soft bg-abyss/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-sm text-muted transition-colors hover:text-bright"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Slide-in panel */}
      <div
        className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-abyss/70 backdrop-blur-sm transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          className={`absolute right-0 top-0 flex h-full w-[min(340px,88vw)] flex-col border-l border-hairline bg-ink transition-transform duration-250 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-hairline-soft px-5">
            <span className="text-sm text-muted">Menu</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-sm text-muted transition-colors hover:text-bright"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <ul className="flex-1 px-5 py-4">
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-hairline-soft last:border-0">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 transition-colors hover:text-discount"
                >
                  <span className="block text-[15px] font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[13px] text-faint">{item.note}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="border-t border-hairline-soft px-5 py-5 text-[13px] leading-relaxed text-faint">
            SolLens reads public data and issuer documents. It is not investment
            advice, and it does not execute trades.
          </div>
        </nav>
      </div>
    </>
  );
}
