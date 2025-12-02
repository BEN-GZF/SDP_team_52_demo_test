// app/layout.tsx
import './globals.css';
import BackgroundWrapper from '@/components/Backgroundwrapper';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'SDPTEAM52 - Demo',
  description: 'Multi-route demo with shared background and scroll-to-next.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden">
        <BackgroundWrapper />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
