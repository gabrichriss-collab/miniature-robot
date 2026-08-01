export default function PageHeader({
  kicker,
  title,
  lede
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mx-auto max-w-[var(--page-max)] px-6 pb-16 pt-40 md:px-10 md:pb-24 md:pt-56">
      <p className="eyebrow rise rise-1 mb-8">{kicker}</p>
      <h1 className="headline rise rise-2 text-[clamp(3rem,9vw,8rem)]">
        {title}
      </h1>
      {lede ? (
        <p className="rise rise-3 mt-10 max-w-2xl text-lg text-ink/80">
          {lede}
        </p>
      ) : null}
    </header>
  );
}
