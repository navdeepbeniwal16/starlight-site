import { siteConfig } from "@/lib/site";
import type { Footer as FooterContent } from "@/sanity/lib/types";
import { Logo } from "./logo";

export function Footer({
  content,
  supportEmail,
}: {
  content: FooterContent | null;
  supportEmail?: string | null;
}) {
  const tagline = content?.tagline ?? siteConfig.footer.tagline;
  const support = supportEmail ?? siteConfig.footer.supportEmail;

  const links = [
    { label: "Support", href: `mailto:${support}`, external: true },
    { label: "Privacy", href: "/privacy", external: false },
    { label: "Terms", href: "/terms", external: false },
    { label: "How this site was built", href: siteConfig.footer.builtUrl, external: true },
  ];

  return (
    <footer className="bg-beige px-8 py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-muted">{tagline}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map(({ label, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-muted underline-offset-4 hover:text-ink hover:underline"
                  {...(external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
