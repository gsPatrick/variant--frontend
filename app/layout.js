import './globals.css';

export const metadata = {
  title: 'Variant — Mapas e Consultoria',
  description: 'Plataforma de análise de solo e histórico de safras por talhão.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
