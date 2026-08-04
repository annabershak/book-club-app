import './globals.css';
import localFont from 'next/font/local';

const display = localFont({
  src: './fonts/CactusJack.ttf',
  variable: '--font-display',
});

export const metadata = {
  title: 'notfrommunich bookclub',
  description: 'A small book club — read together, meet up, talk about it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
