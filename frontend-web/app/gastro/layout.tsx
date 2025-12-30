import type { Metadata } from 'next';
import './styles/gastro.css';

export const metadata: Metadata = {
  title: 'Gastro App - Bistrô Sabor & Arte',
  description: 'Sistema de pedidos para restaurantes',
};

export default function GastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gastro-app">
      {children}
    </div>
  );
}
