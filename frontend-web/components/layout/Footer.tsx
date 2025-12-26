import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-orange-600">TabSync</span>
            </div>
            <p className="text-sm text-gray-600">
              Sincronize pedidos, pagamentos e experiências em restaurantes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Para Clientes</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/restaurants" className="text-sm text-gray-600 hover:text-orange-600">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-gray-600 hover:text-orange-600">
                  Meus Pedidos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Para Restaurantes</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-orange-600">
                  Cadastrar Restaurante
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-orange-600">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-orange-600">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-orange-600">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; {currentYear} TabSync. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
