import Link from "next/link";
export default function NotFound() {
  return (
    <div className="shell section">
      <div className="eyebrow mono">404 / Not found</div>
      <h1 className="section-heading">There’s no page at this address.</h1>
      <p className="section-copy">
        The link may have changed, or this content may no longer be published.
      </p>
      <Link href="/" className="button" style={{ marginTop: 24 }}>
        Back to Vulcan
      </Link>
    </div>
  );
}
