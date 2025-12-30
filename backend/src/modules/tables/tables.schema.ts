import { z } from 'zod';

// Criar mesa
export const createTableSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    number: z.number().int().positive(),
    capacity: z.number().int().positive().default(4),
  }),
});

// Iniciar sessão (QR escaneado)
export const startSessionSchema = z.object({
  params: z.object({
    tableId: z.string().uuid(),
  }),
});

// Solicitar entrada na mesa
export const joinSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

// Aprovar/rejeitar membro
export const approveMemberSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
    memberId: z.string().uuid(),
  }),
  body: z.object({
    approved: z.boolean(),
  }),
});

// Atualizar status do membro (para pagamento)
export const updateMemberPaymentSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
    memberId: z.string().uuid(),
  }),
  body: z.object({
    paymentStatus: z.enum(['PENDING', 'PAID', 'CASH']),
    amountDue: z.number().nonnegative().optional(),
  }),
});

// Fechar sessão
export const closeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

// Types
export type CreateTableInput = z.infer<typeof createTableSchema>['body'];
export type StartSessionInput = z.infer<typeof startSessionSchema>['params'];
export type JoinSessionInput = z.infer<typeof joinSessionSchema>['params'];
export type ApproveMemberInput = z.infer<typeof approveMemberSchema>;
export type UpdateMemberPaymentInput = z.infer<typeof updateMemberPaymentSchema>;
export type CloseSessionInput = z.infer<typeof closeSessionSchema>['params'];
