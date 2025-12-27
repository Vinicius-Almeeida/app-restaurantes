import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight">
            Revolucione pedidos e pagamentos em{' '}
            <span className="text-orange-600">restaurantes</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Sistema completo com divisão inteligente de contas e pagamentos integrados
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/restaurants">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver Restaurantes
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">💳</div>
            <h3 className="mb-2 text-xl font-semibold">Rachar Conta Inteligente</h3>
            <p className="text-gray-600">
              Divida por item, igualmente ou customizado. Cada um paga sua parte!
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold">Pagamentos Integrados</h3>
            <p className="text-gray-600">
              PIX, cartão, carteiras digitais. Tudo em um só lugar.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">📊</div>
            <h3 className="mb-2 text-xl font-semibold">Analytics em Tempo Real</h3>
            <p className="text-gray-600">
              Acompanhe vendas, pedidos e insights instantaneamente.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 TabSync. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
