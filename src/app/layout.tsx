import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Farm Bot | Autonomous IoT Agri-Tech Platform',
  description:
    'Enterprise precision agriculture monitoring, telemetry synchronization with ThingSpeak, and autonomous rover actuator controls.',
  keywords: ['Smart Farm', 'IoT', 'ThingSpeak', 'Precision Agriculture', 'Farm Bot', 'ESP32'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased bg-grid-pattern selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
