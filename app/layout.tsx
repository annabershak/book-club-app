import './globals.css';
import { Roboto_Mono } from 'next/font/google';

const body = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata = {
  title: 'notfrommunich bookclub',
  description: 'A small book club — read together, meet up, talk about it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={body.variable}>
      <body>{children}</body>
    </html>
  );
}
