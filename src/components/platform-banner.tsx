export function PlatformBanner({ text }: { text: string }) {
  return (
    <aside
      aria-label="Platform availability"
      className="bg-paper px-8 py-4 text-center sm:py-5"
    >
      <p className="mx-auto max-w-5xl text-balance text-sm text-ink sm:text-base">
        {text}
      </p>
    </aside>
  );
}
