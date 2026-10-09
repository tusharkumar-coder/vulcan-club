export default function Loading() {
  return (
    <div className="shell section" aria-label="Loading">
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton-grid">
        {[1, 2, 3].map((item) => (
          <div className="skeleton skeleton-card" key={item} />
        ))}
      </div>
    </div>
  );
}
