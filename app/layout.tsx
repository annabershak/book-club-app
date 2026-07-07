import './globals.css';

export const metadata = {
  title: 'Книжный клуб',
  description: 'Запись на встречи книжного клуба',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
