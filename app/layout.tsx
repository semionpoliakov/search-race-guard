import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Search · Race Guard Demo',
  description: 'Responsive search UI with race-condition protection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
