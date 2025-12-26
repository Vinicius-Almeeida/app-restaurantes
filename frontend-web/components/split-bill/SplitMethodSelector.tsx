import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SplitMethod = 'EQUAL' | 'BY_ITEM' | 'CUSTOM';

interface SplitMethodSelectorProps {
  selected: SplitMethod;
  onSelect: (method: SplitMethod) => void;
}

export function SplitMethodSelector({ selected, onSelect }: SplitMethodSelectorProps) {
  const methods = [
    {
      value: 'EQUAL' as SplitMethod,
      icon: '⚖️',
      title: 'Dividir Igualmente',
      description: 'Todos pagam o mesmo valor',
    },
    {
      value: 'BY_ITEM' as SplitMethod,
      icon: '🍽️',
      title: 'Por Item',
      description: 'Cada um paga o que consumiu',
    },
    {
      value: 'CUSTOM' as SplitMethod,
      icon: '✏️',
      title: 'Customizado',
      description: 'Defina os valores manualmente',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <Card
          key={method.value}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selected === method.value
              ? 'border-orange-600 border-2 bg-orange-50'
              : 'border-gray-200'
          )}
          onClick={() => onSelect(method.value)}
        >
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">{method.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{method.title}</h3>
            <p className="text-sm text-gray-600">{method.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
