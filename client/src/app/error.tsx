"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell section">
      <div className="eyebrow mono">Something went wrong</div>
      <h1 className="section-heading">This part didn’t load.</h1>
      <p className="section-copy">Try again. If the problem continues, please contact the club.</p>
      <button className="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
