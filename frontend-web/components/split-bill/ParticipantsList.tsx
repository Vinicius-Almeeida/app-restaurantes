import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Participant {
  userId: string;
  name: string;
  email: string;
  amount: number;
  paid: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  onRemove?: (userId: string) => void;
  showRemoveButton?: boolean;
}

export function ParticipantsList({
  participants,
  onRemove,
  showRemoveButton = false,
}: ParticipantsListProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <div
          key={participant.userId}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-700 font-semibold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{participant.name}</p>
              <p className="text-sm text-gray-500">{participant.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-orange-600">
                {formatPrice(participant.amount)}
              </p>
              {participant.paid && (
                <Badge className="bg-green-600 text-white mt-1">Pago</Badge>
              )}
            </div>

            {showRemoveButton && onRemove && !participant.paid && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(participant.userId)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remover
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
