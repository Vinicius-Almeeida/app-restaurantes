import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TabSync - Acesso Restaurante',
  description: 'Painel de acesso para equipe de restaurante',
};

export default function RestaurantAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
