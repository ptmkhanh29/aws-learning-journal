import Link from "next/link";

export default function RootPage() {
  return (
    <main>
      <meta httpEquiv="refresh" content="0;url=/en/" />
      <p>Continue to <Link href="/en/">English</Link>.</p>
    </main>
  );
}
