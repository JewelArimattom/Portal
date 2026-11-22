import type { Metadata } from 'next';
import { Host_Grotesk, Roboto_Serif } from 'next/font/google';
import './globals.css';

const bodyFont = Host_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const displayFont = Roboto_Serif({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'UniMatch — University Programme Eligibility Platform (Germany & Austria)',
  description: 'Compare your academic record with published Bachelor’s and Master’s programme requirements in Germany and Austria. UniMatch assessments are advisory; universities make final admission decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
