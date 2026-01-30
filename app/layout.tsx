import type { Metadata } from 'next';
import './globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: 'Lead Finder Map',
  description: 'Discover nearby business leads with an interactive map and search tools.'
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
