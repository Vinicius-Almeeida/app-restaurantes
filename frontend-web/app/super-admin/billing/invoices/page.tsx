'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  FileText,
  Store,
  Calendar,
  DollarSign,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

interface Invoice {
  id: string;
  number: string;
  restaurantId: string;
  restaurantName: string;
  planName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  periodStart: string;
  periodEnd: string;
  paymentMethod?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string; icon: React.ElementType }> = {
  paid: { label: 'Pago', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
  overdue: { label: 'Atrasado', className: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800', icon: XCircle },
};

function InvoicesPageContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-001',
      restaurantId: 'r1',
      restaurantName: 'Pizzaria Bella Italia',
      planName: 'Plano Pro',
      amount: 199.9,
      status: 'paid',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
      periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
      periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      paymentMethod: 'PIX',
      items: [
        { description: 'Assinatura Plano Pro - Mensal', quantity: 1, unitPrice: 199.9, total: 199.9 },
      ],
    },
    {
      id: '2',
      number: 'INV-2024-002',
      restaurantId: 'r2',
      restaurantName: 'Sushi Master',
      planName: 'Plano Premium',
      amount: 399.9,
      status: 'pending',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      periodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      items: [
        { description: 'Assinatura Plano Premium - Mensal', quantity: 1, unitPrice: 399.9, total: 399.9 },
      ],
    },
    {
      id: '3',
      number: 'INV-2024-003',
      restaurantId: 'r3',
      restaurantName: 'Burger House',
      planName: 'Plano Basico',
      amount: 99.9,
      status: 'overdue',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
      periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      items: [
        { description: 'Assinatura Plano Basico - Mensal', quantity: 1, unitPrice: 99.9, total: 99.9 },
      ],
    },
    {
      id: '4',
      number: 'INV-2024-004',
      restaurantId: 'r4',
      restaurantName: 'Cantina Italiana',
      planName: 'Plano Pro',
      amount: 199.9,
      status: 'paid',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
      periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      paymentMethod: 'Cartao de Credito',
      items: [
        { description: 'Assinatura Plano Pro - Mensal', quantity: 1, unitPrice: 199.9, total: 199.9 },
      ],
    },
    {
      id: '5',
      number: 'INV-2024-005',
      restaurantId: 'r5',
      restaurantName: 'Cafe Central',
      planName: 'Plano Basico',
      amount: 99.9,
      status: 'cancelled',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
      periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      items: [
        { description: 'Assinatura Plano Basico - Mensal', quantity: 1, unitPrice: 99.9, total: 99.9 },
      ],
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (
      searchQuery &&
      !inv.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inv.number.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const openInvoiceDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const getStats = () => ({
    totalReceived: invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0),
    totalPending: invoices.filter((i) => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0),
    totalOverdue: invoices.filter((i) => i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0),
    paidCount: invoices.filter((i) => i.status === 'paid').length,
    pendingCount: invoices.filter((i) => i.status === 'pending').length,
    overdueCount: invoices.filter((i) => i.status === 'overdue').length,
  });

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/billing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faturas</h1>
            <p className="text-gray-600">Gerencie as faturas e cobranças</p>
          </div>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalReceived)}</p>
                <p className="text-xs text-gray-500">{stats.paidCount} faturas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalPending)}</p>
                <p className="text-xs text-gray-500">{stats.pendingCount} faturas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.overdueCount > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.overdueCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <XCircle className={`h-5 w-5 ${stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Atrasado</p>
                <p className={`text-2xl font-bold ${stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatCurrency(stats.totalOverdue)}
                </p>
                <p className="text-xs text-gray-500">{stats.overdueCount} faturas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Faturas</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
                <p className="text-xs text-gray-500">este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por restaurante ou numero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma fatura encontrada</h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' || searchQuery
                  ? 'Tente ajustar os filtros.'
                  : 'Ainda nao ha faturas cadastradas.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Numero</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Restaurante</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Plano</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Valor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Vencimento</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => {
                      const statusConfig = STATUS_CONFIG[invoice.status];
                      const StatusIcon = statusConfig.icon;
                      const daysUntilDue = getDaysUntilDue(invoice.dueDate);

                      return (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <span className="font-mono font-medium">{invoice.number}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-gray-400" />
                              <span>{invoice.restaurantName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{invoice.planName}</Badge>
                          </td>
                          <td className="py-4 px-4 text-right font-medium">
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p>{formatDate(invoice.dueDate)}</p>
                                {invoice.status === 'pending' && daysUntilDue > 0 && (
                                  <p className="text-xs text-gray-500">em {daysUntilDue} dias</p>
                                )}
                                {invoice.status === 'overdue' && (
                                  <p className="text-xs text-red-600">
                                    {Math.abs(daysUntilDue)} dias atrasado
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openInvoiceDetail(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredInvoices.length} de {invoices.length} faturas
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Proxima <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold font-mono">{selectedInvoice.number}</p>
                  <p className="text-sm text-gray-500">{selectedInvoice.restaurantName}</p>
                </div>
                <Badge className={STATUS_CONFIG[selectedInvoice.status].className}>
                  {STATUS_CONFIG[selectedInvoice.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Periodo</p>
                  <p className="font-medium">
                    {formatDate(selectedInvoice.periodStart)} - {formatDate(selectedInvoice.periodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimento</p>
                  <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
                {selectedInvoice.paidAt && (
                  <div>
                    <p className="text-sm text-gray-500">Pago em</p>
                    <p className="font-medium">{formatDate(selectedInvoice.paidAt)}</p>
                  </div>
                )}
                {selectedInvoice.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-500">Forma de Pagamento</p>
                    <p className="font-medium flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {selectedInvoice.paymentMethod}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Itens</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium">Descricao</th>
                        <th className="text-center py-2 px-4 text-sm font-medium">Qtd</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Preco Unit.</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4 text-center">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t">
                        <td colSpan={3} className="py-3 px-4 text-right font-semibold">
                          Total
                        </td>
                        <td className="py-3 px-4 text-right text-lg font-bold">
                          {formatCurrency(selectedInvoice.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedInvoice.status === 'pending' && (
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Marcar como Pago
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <InvoicesPageContent />
    </ProtectedRoute>
  );
}
