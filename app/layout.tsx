import './globals.css';
import { JetBrains_Mono } from 'next/font/google';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'notfrommunich bookclub',
  description: 'A small book club — read together, meet up, talk about it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>{children}</body>
    </html>
  );
}
