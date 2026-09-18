import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found container">
      <p className="marker">Keel · 404</p>
      <h1>This page is not available.</h1>
      <p>Return to Keel to explore market samples and historical evidence.</p>
      <Link href="/" className="button">
        Return to Keel
      </Link>
    </main>
  );
}
