import './globals.css';
import localFont from 'next/font/local';
import { Nunito } from 'next/font/google';

const display = localFont({
  src: './fonts/CactusJack.ttf',
  variable: '--font-display',
});

const body = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
});

export const metadata = {
  title: 'notfrommunich bookclub',
  description: 'A small book club — read together, meet up, talk about it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
