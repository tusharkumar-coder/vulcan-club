export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="shell page-hero-inner">
        <div className="eyebrow mono">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-desc">{description}</p>
      </div>
    </section>
  );
}
