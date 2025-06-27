export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only fixed top-2 left-2 z-[100] rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
    >
      Skip to content
    </a>
  );
}
